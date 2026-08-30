import type { ExecResult } from 'agent';
import { shell, WORKSPACE_DIR } from 'k8s-sandbox';
import { shQuote } from './paths';

export { restartDevServer, devLogs } from 'k8s-sandbox';

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
