import { destroy, status } from "k8s-sandbox";
import config from "../config";
import Project from "../models/Project.model";

export async function touchSandbox(projectId: string): Promise<void> {
  await Project.updateOne({ projectId }, { lastActivityAt: new Date() });
}

async function reapIdleSandboxes(): Promise<void> {
  const cutoff = new Date(Date.now() - config.sandboxIdleMs);
  const idle = await Project.find({ lastActivityAt: { $lt: cutoff } });

  for (const project of idle) {
    try {
      const { state } = await status(project.projectId);
      if (state === 'STOPPED') continue;

      await destroy(project.projectId);
      console.log("idle sandbox destroyed", project.projectId);
    } catch (error) {
      console.error("idle sandbox destroy failed", project.projectId, error);
    }
  }
}

export function startSandboxReaper(): void {
  setInterval(() => {
    void reapIdleSandboxes().catch((error) => {
      console.error("sandbox reaper sweep failed", error);
    });
  }, config.sandboxSweepMs);
}
