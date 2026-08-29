import { podNameFor, previewUrl, serviceNameFor } from './config';
import { runNpmInstall, startDevServer } from './workspace/process';
import K8Service from './kube/service';
import K8Pod from './kube/pod';
import { isAlreadyExists } from './kube/errors';

export type Sandbox = {
  projectId: string;
  previewUrl: string;
};

export type SandboxState = 'STOPPED' | 'CREATING' | 'RUNNING' | 'FAILED';

export type SandboxStatus = {
  state: SandboxState;
  previewUrl: string | null;
};

// Derived from the cluster, never stored.
export async function status(projectId: string): Promise<SandboxStatus> {
  const pod = await K8Pod.read(podNameFor(projectId));
  if (!pod) return { state: 'STOPPED', previewUrl: null };

  const phase = pod.status?.phase;

  if (phase === 'Failed') return { state: 'FAILED', previewUrl: null };
  if (phase === 'Succeeded') return { state: 'STOPPED', previewUrl: null };

  if (phase === 'Running') {
    const ready = await K8Service.hasReadyEndpoints(serviceNameFor(projectId));
    return ready
      ? { state: 'RUNNING', previewUrl: previewUrl(projectId) }
      : { state: 'CREATING', previewUrl: null };
  }

  return { state: 'CREATING', previewUrl: null };
}

export async function destroy(projectId: string): Promise<void> {
  await K8Service.delete(serviceNameFor(projectId));
  await K8Pod.delete(podNameFor(projectId));
}

export async function create(projectId: string): Promise<Sandbox> {
  try {
    const name = await K8Pod.create(projectId);
    await K8Pod.waitForRunning(name);

    await runNpmInstall(name);
    const port = await startDevServer(name);
    const svc = await K8Service.create(projectId, port);
    await K8Service.waitForEndpoints(svc);
    return { projectId, previewUrl: previewUrl(projectId) };
  } catch (error) {
    // A 409 means a concurrent caller already created the pod. Don't destroy theirs.
    if (!isAlreadyExists(error)) {
      try {
        await destroy(projectId);
      } catch {
        // keep the original create error
      }
    }
    throw error;
  }
}
