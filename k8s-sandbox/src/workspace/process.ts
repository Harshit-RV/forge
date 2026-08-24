import { WORKSPACE_DIR } from '../config';
import { shell } from '../kube/exec';

const DEV_LOG = `${WORKSPACE_DIR}/.forge/dev.log`;
const ANSI = /\u001B\[[0-9;]*[A-Za-z]/g;

export async function runNpmInstall(podName: string): Promise<void> {
  const result = await shell(
    podName,
    `cd ${WORKSPACE_DIR} && npm install --no-audit --no-fund --loglevel=error`
  );
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
}

function parseDevServerPort(logText: string): number | undefined {
  const clean = logText.replace(ANSI, '');
  const match = clean.match(/Local:\s*https?:\/\/[^\s/:]+:(\d{2,5})/i);
  if (match?.[1]) return Number.parseInt(match[1], 10);
  return undefined;
}

export async function startDevServer(podName: string): Promise<number> {
  const start = await shell(
    podName,
    [
      `mkdir -p ${WORKSPACE_DIR}/.forge`,
      `cd ${WORKSPACE_DIR}`,
      `: > ${DEV_LOG}`,
      `nohup npm run dev -- --host 0.0.0.0 > ${DEV_LOG} 2>&1 < /dev/null &`,
      'echo $!',
    ].join('\n')
  );
  if (start.exitCode !== 0) {
    throw new Error(start.stderr || start.stdout);
  }

  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const log = await shell(podName, `cat ${DEV_LOG} 2>/dev/null || true`);
    const port = parseDevServerPort(log.stdout);
    if (port) return port;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Vite did not print a port in time');
}
