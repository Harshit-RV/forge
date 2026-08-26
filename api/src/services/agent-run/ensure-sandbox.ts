import Helper from '../../utils/helper.util';
import ProjectService from '../project.service';

const SANDBOX_WAIT_MS = 5 * 60_000;
const SANDBOX_POLL_MS = 2_000;

const ensureSandboxRunning = async (
  projectId: string,
  signal: AbortSignal
): Promise<void> => {
  let status = await ProjectService.startSandbox(projectId);
  if (status.state === 'RUNNING') return;

  const deadline = Date.now() + SANDBOX_WAIT_MS;

  while (Date.now() < deadline) {
    if (signal.aborted) {
      throw new Error('Cancelled while waiting for sandbox');
    }

    if (status.state === 'FAILED' || status.state === 'STOPPED') {
      status = await ProjectService.startSandbox(projectId);
    } else {
      // still starting
      await Helper.sleep(SANDBOX_POLL_MS);
      status = await ProjectService.getStatus(projectId);
    }

    if (status.state === 'RUNNING') return;
  }

  throw new Error(`Sandbox did not become RUNNING (last state: ${status.state})`);
};

export default ensureSandboxRunning;
