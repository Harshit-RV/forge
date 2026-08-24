import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadYaml } from '@kubernetes/client-node';
import { PACKAGE_ROOT } from '../config';

export function manifestPath(...segments: string[]): string {
  return path.join(PACKAGE_ROOT, 'manifests', ...segments);
}

export async function loadManifest<T>(fileName: string, vars: Record<string, string> = {}): Promise<T> {
  let raw = await readFile(manifestPath(fileName), 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    raw = raw.replaceAll(`__${key}__`, value);
  }
  return loadYaml<T>(raw);
}
