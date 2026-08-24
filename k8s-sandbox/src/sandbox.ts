import { podNameFor, previewUrl, serviceNameFor } from './config';
import { copyStarter } from './workspace/transfer';
import { runNpmInstall, startDevServer } from './workspace/process';
import K8Service from './kube/service';
import K8Pod from './kube/pod';

export type Sandbox = {
  projectId: string;
  previewUrl: string;
};

export async function destroy(projectId: string): Promise<void> {
  await K8Service.delete(serviceNameFor(projectId));
  await K8Pod.delete(podNameFor(projectId));
}

export async function create(projectId: string): Promise<Sandbox> {
  try {
    const name = await K8Pod.create(projectId);
    await K8Pod.waitForRunning(name);
    await copyStarter(name);
    await runNpmInstall(name);
    const port = await startDevServer(name);
    const svc = await K8Service.create(projectId, port);
    await K8Service.waitForEndpoints(svc);
    return { projectId, previewUrl: previewUrl(projectId) };
  } catch (error) {
    try {
      await destroy(projectId);
    } catch {
      // keep the original create error
    }
    throw error;
  }
}
