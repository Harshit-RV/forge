import Project, { ProjectDoc, ProjectProps } from "../models/Project.model";
import {
  create as createSandbox,
  destroy as destroySandbox,
  status as sandboxStatus,
  type SandboxStatus,
} from "k8s-sandbox";
import { touchSandbox } from "./sandbox-idle";

class ProjectService {
  static createProjectRecord = async ( args: ProjectProps ): Promise<ProjectDoc> => {
    return new Project({ ...args }).save();
  };

  static createNewProject = async (
    args: ProjectProps
  ): Promise<ProjectDoc> => {
    const project = await this.createProjectRecord(args);
    
    try {
      await createSandbox(project.projectId);
      await touchSandbox(project.projectId);
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

  static startSandbox = async (projectId: string): Promise<SandboxStatus> => {
    const current = await sandboxStatus(projectId);
    if (current.state === 'RUNNING' || current.state === 'CREATING') {
      return current;
    }

    if (current.state === 'FAILED') {
      await destroySandbox(projectId);
    }

    await createSandbox(projectId);
    await touchSandbox(projectId);
    return sandboxStatus(projectId);
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
}

export default ProjectService;
