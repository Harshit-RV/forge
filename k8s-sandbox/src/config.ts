import path from 'node:path';

export const PACKAGE_ROOT = path.join(__dirname, '..');
export const NAMESPACE = 'forge';
export const REACT_CONTAINER_NAME = 'react-app-container';
export const WORKSPACE_DIR = '/workspace';
export const PREVIEW_BASE_HOST = 'forge.harshitrv.com';

export function appNameFor(projectId: string): string {
  return `app-${projectId}`;
}

export const podNameFor = appNameFor;
export const serviceNameFor = appNameFor;

export function previewUrl(projectId: string): string {
  return `http://${appNameFor(projectId)}.${PREVIEW_BASE_HOST}`;
}
