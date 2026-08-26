import type { AgentSandbox } from 'agent';
import { podNameFor } from 'k8s-sandbox';
import * as files from './files';
import * as processOps from './process';

// Implements AgentSandbox against a project's k8s pod via shell exec
export function createSandboxAdapter(projectId: string): AgentSandbox {
  const pod = podNameFor(projectId);

  return {
    listFiles: (dirPath) => files.listFiles(pod, dirPath),
    readFile: (filePath) => files.readFile(pod, filePath),
    writeFile: (filePath, content) => files.writeFile(pod, filePath, content),
    editFile: (filePath, oldString, newString) => files.editFile(pod, filePath, oldString, newString),
    searchCode: (pattern) => files.searchCode(pod, pattern),
    exec: (cmd, timeoutMs) => processOps.exec(pod, cmd, timeoutMs),
    restartDevServer: () => processOps.restartDevServer(pod),
    devLogs: (lines) => processOps.devLogs(pod, lines),
  };
}
