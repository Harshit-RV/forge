import { shell } from '../kube/exec';
import { DEV_SERVER_PORT, WORKSPACE_DIR } from '../config';
import { DEV_LOG, DEV_PID, START_TIMEOUT_MS } from './config';
import { ANSI, FATAL, STARTED } from './util';

class WorkspaceService {

  private static spawn = async (podName: string): Promise<void> => {
    const start = await shell(
      podName,
      [
        `mkdir -p ${WORKSPACE_DIR}/.forge`,
        `cd ${WORKSPACE_DIR}`,
        `: > ${DEV_LOG}`,
        `nohup npm run dev -- --host 0.0.0.0 --port ${DEV_SERVER_PORT} --strictPort > ${DEV_LOG} 2>&1 < /dev/null &`,
        `echo $! > ${DEV_PID}`,
      ].join('\n')
    );
    
    if (start.exitCode !== 0) {
      throw new Error(start.stderr || start.stdout || 'could not spawn dev server');
    }
  }

  private static waitUntilListening = async (podName: string, context = ''): Promise<void> => {
    const suffix = context ? ` ${context}` : '';
    const deadline = Date.now() + START_TIMEOUT_MS;
  
    while (Date.now() < deadline) {
      const log = await shell(podName, `cat ${DEV_LOG} 2>/dev/null || true`);
      const clean = log.stdout.replace(ANSI, '');
      
      if (STARTED.test(clean)) return;
      if (FATAL.test(clean)) {
        throw new Error(`Vite failed to start${suffix}:\n${clean}`);
      }

      await new Promise((r) => setTimeout(r, 1000));
    }
  
    throw new Error(
      `Vite did not start on port ${DEV_SERVER_PORT} in time${suffix}`
    );
  }
  
  
  static runNpmInstall = async (podName: string): Promise<void> => {
    const result = await shell(
      podName,
      `cd ${WORKSPACE_DIR} && npm install --no-audit --no-fund --loglevel=error`
    );
    if (result.exitCode !== 0) {
      throw new Error(result.stderr || result.stdout);
    }
  }

  static startDevServer = async (podName: string): Promise<void> => {
    await this.spawn(podName);
    await this.waitUntilListening(podName);
  }
  
  static restartDevServer = async (podName: string): Promise<void> => {
    await shell(
      podName,
      [
        `if [ -f ${DEV_PID} ]; then kill "$(cat ${DEV_PID})" 2>/dev/null || true; fi`,
        `pkill -f "vite" 2>/dev/null || true`,
        'sleep 1',
      ].join('\n')
    );
  
    await this.spawn(podName);
    await this.waitUntilListening(podName, 'after restart');
  }

  static devLogs = async (podName: string, lines: number): Promise<string> => {
    const n = Math.max(1, Math.min(Math.floor(lines), 5000));
    
    const result = await shell(
      podName,
      `tail -n ${n} ${DEV_LOG} 2>/dev/null || true`
    );

    return result.stdout;
  }
}

export default WorkspaceService;