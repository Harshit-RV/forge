import type { V1Pod } from '@kubernetes/client-node';
import { NAMESPACE, podNameFor } from '../config';
import { isNotFound } from './errors';
import { getCore } from './client';
import { loadManifest } from './manifest';

class K8Pod {
  static async create(projectId: string): Promise<string> {
    const core = getCore();
    const name = podNameFor(projectId);
    const body = await loadManifest<V1Pod>('app-pod.yml', { PROJECT_ID: projectId });
    await core.createNamespacedPod({ namespace: NAMESPACE, body });
    return name;
  }
  
  static async waitForRunning(name: string, timeoutMs = 180_000): Promise<void> {
    const core = getCore();
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const pod = await core.readNamespacedPod({ name, namespace: NAMESPACE });
      if (pod.status?.phase === 'Running') return;
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error(`Pod ${name} did not become Running in time`);
  }
  
  static async delete(name: string): Promise<void> {
    const core = getCore();
    try {
      await core.deleteNamespacedPod({
        name,
        namespace: NAMESPACE,
        gracePeriodSeconds: 0,
      });
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }
}

export default K8Pod
