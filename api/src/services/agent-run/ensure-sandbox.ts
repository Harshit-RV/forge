import ProjectService from '../project.service';

const ensureSandboxRunning = async (
  projectId: string,
  signal: AbortSignal
): Promise<void> => {
  if (signal.aborted) {
    throw new Error('Cancelled while waiting for sandbox');
  }

  const status = await ProjectService.startSandbox(projectId);

  if (signal.aborted) {
    throw new Error('Cancelled while waiting for sandbox');
  }

  if (status.state !== 'RUNNING') {
    throw new Error(`Sandbox did not become RUNNING (last state: ${status.state})`);
  }
};

export default ensureSandboxRunning;
