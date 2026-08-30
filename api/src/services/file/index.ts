import type { FileEntry } from 'agent';
import { isNotFound, WORKSPACE_DIR } from 'k8s-sandbox';
import { createSandboxAdapter } from '../../adapters/sandbox';
import { isHiddenWorkspacePath } from '../../adapters/sandbox/paths';
import ProjectService from '../project.service';
import { FileServiceError } from './errors';
import type { FileContent } from './types';

export { FileServiceError } from './errors';

const MAX_FILE_CHARS = 256 * 1024;

class FileService {
  private static mapAdapterError = (err: unknown): never => {
    if (err instanceof FileServiceError) throw err;
    if (isNotFound(err)) {
      throw new FileServiceError('Sandbox is not running', 409);
    }
  
    const message = err instanceof Error ? err.message : 'File operation failed';
    if (message.includes('Path escapes') || message.includes('not a directory')) {
      throw new FileServiceError(message, 400);
    }
    if (message.startsWith('File not found')) {
      throw new FileServiceError(message, 404);
    }
  
    throw err;
  }

  private static rejectHiddenPath = (path: string): void => {
    if (isHiddenWorkspacePath(path)) {
      throw new FileServiceError('Path not found', 404);
    }
  }

  // If path is empty, use /workspace; otherwise use the given path.
  private static resolvePath = (path: string | undefined): string => {
    if (!path?.trim()) return WORKSPACE_DIR;
    return path.trim();
  }
  
  private static async openAdapter(projectId: string, userId: string) {
    const project = await ProjectService.getOwnedProject(projectId, userId);
    if (!project) {
      throw new FileServiceError('Project not found', 404);
    }

    const status = await ProjectService.getStatus(projectId);
    if (status.state !== 'RUNNING') {
      throw new FileServiceError('Sandbox is not running', 409);
    }

    await ProjectService.heartbeat(projectId);
    return createSandboxAdapter(projectId);
  }

  static listFiles = async (projectId: string, userId: string, path?: string): Promise<FileEntry[]> => {
    const adapter = await this.openAdapter(projectId, userId);
    try {
      const resolved = this.resolvePath(path);
      this.rejectHiddenPath(resolved);
      
      return await adapter.listFiles(resolved);
    } catch (err) {
      return this.mapAdapterError(err);
    }
  };

  static readFile = async (projectId: string, userId: string, path?: string): Promise<FileContent> => {
    const adapter = await this.openAdapter(projectId, userId);
    try {
      const resolved = this.resolvePath(path);
      this.rejectHiddenPath(resolved);
      const content = await adapter.readFile(resolved);
      
      if (content.length <= MAX_FILE_CHARS) {
        return { path: resolved, content, truncated: false };
      }
      
      return {
        path: resolved,
        content: content.slice(0, MAX_FILE_CHARS),
        truncated: true,
      };
    } catch (err) {
      return this.mapAdapterError(err);
    }
  };
}

export default FileService;
