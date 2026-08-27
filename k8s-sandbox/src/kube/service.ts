import type { V1Service } from '@kubernetes/client-node';
import { NAMESPACE, serviceNameFor } from '../config';
import { isNotFound } from './errors';
import { getCore } from './client';
import { loadManifest } from './manifest';

class K8Service {
  static async create(projectId: string, targetPort: number): Promise<string> {
    const core = getCore();
    const name = serviceNameFor(projectId);
    const body = await loadManifest<V1Service>('app-service.yml', {
      PROJECT_ID: projectId,
      TARGET_PORT: String(targetPort),
    });
    await core.createNamespacedService({ namespace: NAMESPACE, body });
    return name;
  }
  
  static async hasReadyEndpoints(name: string): Promise<boolean> {
    const core = getCore();
    try {
      const endpoints = await core.readNamespacedEndpoints({ name, namespace: NAMESPACE });
      return endpoints.subsets?.some((subset) => (subset.addresses?.length ?? 0) > 0) ?? false;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  }

  static async waitForEndpoints(name: string, timeoutMs = 30_000): Promise<void> {
    const core = getCore();
    const deadline = Date.now() + timeoutMs;
  
    while (Date.now() < deadline) {
      try {
        const endpoints = await core.readNamespacedEndpoints({ name, namespace: NAMESPACE });
        const ready = endpoints.subsets?.some((subset) => (subset.addresses?.length ?? 0) > 0);
        if (ready) return;
      } catch (error) {
        // Same as hasReadyEndpoints: NotFound means not ready yet (or briefly gone).
        if (!isNotFound(error)) throw error;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  
    throw new Error(`Service ${name} has no ready endpoints`);
  }
  
  static async delete(name: string): Promise<void> {
    const core = getCore();
    try {
      await core.deleteNamespacedService({ name, namespace: NAMESPACE });
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }
}

export default K8Service