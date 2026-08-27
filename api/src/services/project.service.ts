import Project, { ProjectDoc, ProjectProps } from "../models/Project.model";
import {
  create as createSandbox,
  destroy as destroySandbox,
  isAlreadyExists,
  status as sandboxStatus,
  type SandboxStatus,
} from "k8s-sandbox";
import { touchSandbox } from "./sandbox-idle";
import Helper from "../utils/helper.util";

const PEER_WAIT_MS = 5 * 60_000;
const PEER_POLL_MS = 2_000;

// Someone else is provisioning this sandbox. Poll until it settles.
// RUNNING means the peer won; STOPPED/FAILED means the peer died and we should retry.
const waitForPeerProvision = async (projectId: string): Promise<SandboxStatus> => {
  const deadline = Date.now() + PEER_WAIT_MS;

  while (Date.now() < deadline) {
    await Helper.sleep(PEER_POLL_MS);
    const status = await sandboxStatus(projectId);
    if (status.state !== 'CREATING') return status;
  }

  throw new Error(`Sandbox ${projectId} did not settle while joining a peer provision`);
};

class ProjectService {
  static createProjectRecord = async ( args: ProjectProps ): Promise<ProjectDoc> => {
    return new Project({ ...args }).save();
  };

  static createNewProject = async (
    args: ProjectProps
  ): Promise<ProjectDoc> => {
    const project = await this.createProjectRecord(args);
    
    try {
      await this.startSandbox(project.projectId);
      return project;
    } catch (error) {
      await Project.findByIdAndDelete(project._id);
      throw error;
    }
  };

  static heartbeat = async (projectId: string): Promise<void> => {
    await touchSandbox(projectId);
  };

  static getStatus = async (projectId: string): Promise<SandboxStatus> => {
    return sandboxStatus(projectId);
  };

  // The single idempotent start path. Safe to call concurrently:
  static startSandbox = async (projectId: string): Promise<SandboxStatus> => {
    let status = await sandboxStatus(projectId);
    let retried = false;

    for (;;) {
      if (status.state === 'RUNNING') {
        await touchSandbox(projectId);
        return status;
      }

      if (status.state === 'CREATING') {
        status = await waitForPeerProvision(projectId);
        // Peer failed. Retry the provision ourselves, 
        // but only once, so two concurrent losers can't bounce off each other forever.
        if (status.state !== 'RUNNING') {
          if (retried) {
            throw new Error(
              `Sandbox ${projectId} failed to start (last state: ${status.state})`
            );
          }
          retried = true;
        }
        continue;
      }

      if (status.state === 'FAILED') {
        await destroySandbox(projectId);
      }

      try {
        await createSandbox(projectId);
      } catch (error) {
        if (!isAlreadyExists(error)) throw error;
        // A peer created the pod between our status read and our create.
        status = { state: 'CREATING', previewUrl: null };
        continue;
      }

      await touchSandbox(projectId);
      return sandboxStatus(projectId);
    }
  };

  static stopSandbox = async (projectId: string): Promise<SandboxStatus> => {
    await destroySandbox(projectId);
    return sandboxStatus(projectId);
  };

  static deleteProject = async (projectId: string): Promise<void> => {
    try {
      await destroySandbox(projectId);
    } catch (error) {
      console.error("sandbox destroy failed on project delete", projectId, error);
    }

    await Project.deleteOne({ projectId });
  };

  static getProjectsByUserId = async (userId: string): Promise<ProjectDoc[]> => {
    return Project.find({ userId }).sort({ createdAt: -1 });
  };

  static getOwnedProject = async (
    projectId: string,
    userId: string,
  ): Promise<ProjectDoc | null> => {
    return Project.findOne({ projectId, userId });
  };

  static updateOwnedProject = async (
    projectId: string,
    userId: string,
    patch: { title: string | null },
  ): Promise<ProjectDoc | null> => {
    return Project.findOneAndUpdate(
      { projectId, userId },
      { $set: patch },
      { new: true },
    );
  };
}

export default ProjectService;
