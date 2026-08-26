import type { ExecResult } from 'agent';
import { shell, WORKSPACE_DIR } from 'k8s-sandbox';
import { shQuote } from './paths';

const DEV_LOG = `${WORKSPACE_DIR}/.forge/dev.log`;
const DEV_PID = `${WORKSPACE_DIR}/.forge/dev.pid`;

export async function exec(
  pod: string,
  cmd: string,
  timeoutMs: number
): Promise<ExecResult> {
  const seconds = Math.max(1, Math.ceil(timeoutMs / 1000));
  const cmdB64 = Buffer.from(cmd, 'utf8').toString('base64');
  
  const script = [
    `cmd=$(printf "%s" ${shQuote(cmdB64)} | base64 -d)`,
    `cd ${shQuote(WORKSPACE_DIR)}`,
    `timeout --kill-after=2s ${seconds}s sh -c -- "$cmd"`,
  ].join('\n');

  const result = await shell(pod, script);
  const timedOut = result.exitCode === 124;

  return {
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    timedOut: timedOut || undefined,
  };
}

export async function restartDevServer(pod: string): Promise<void> {
  await shell(
    pod,
    [
      `if [ -f ${DEV_PID} ]; then kill "$(cat ${DEV_PID})" 2>/dev/null || true; fi`,
      `pkill -f "vite" 2>/dev/null || true`,
      'sleep 1',
    ].join('\n')
  );

  const start = await shell(
    pod,
    [
      `mkdir -p ${WORKSPACE_DIR}/.forge`,
      `cd ${WORKSPACE_DIR}`,
      `: > ${DEV_LOG}`,
      `nohup npm run dev -- --host 0.0.0.0 > ${DEV_LOG} 2>&1 < /dev/null &`,
      `echo $! > ${DEV_PID}`,
    ].join('\n')
  );
  
  if (start.exitCode !== 0) {
    throw new Error(start.stderr || start.stdout || 'restartDevServer failed');
  }

  const deadline = Date.now() + 90_000;
  const ansi = /\u001B\[[0-9;]*[A-Za-z]/g;
  
  while (Date.now() < deadline) {
    const log = await shell(pod, `cat ${DEV_LOG} 2>/dev/null || true`);
    const clean = log.stdout.replace(ansi, '');
    if (/Local:\s*https?:\/\/[^\s/:]+:\d{2,5}/i.test(clean)) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  
  throw new Error('Vite did not print a port in time after restart');
}

export async function devLogs(pod: string, lines: number): Promise<string> {
  const n = Math.max(1, Math.min(Math.floor(lines), 5000));
  const result = await shell(pod, `tail -n ${n} ${DEV_LOG} 2>/dev/null || true`);
  return result.stdout;
}
