import { Writable } from 'node:stream';
import type { V1Status } from '@kubernetes/client-node';
import { NAMESPACE, REACT_CONTAINER_NAME } from '../config';
import { getExec } from './client';

export type ExecResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

function exitCodeFromStatus(status: V1Status): number {
  if (status.status === 'Success') return 0;
  const cause = status.details?.causes?.find((c) => c.reason === 'ExitCode');
  if (cause?.message) {
    const parsed = Number.parseInt(cause.message, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 1;
}

function collector() {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk.toString());
      cb();
    },
  });
  return { stream, read: () => chunks.join('') };
}

export async function exec(
  podName: string,
  command: string[],
  container = REACT_CONTAINER_NAME
): Promise<ExecResult> {
  const stdout = collector();
  const stderr = collector();

  return await new Promise((resolve, reject) => {
    let status: V1Status | undefined;

    getExec()
      .exec(
        NAMESPACE,
        podName,
        container,
        command,
        stdout.stream,
        stderr.stream,
        null,
        false,
        (received) => {
          status = received;
        }
      )
      .then((ws) => {
        ws.on('close', () => {
          resolve({
            exitCode: status ? exitCodeFromStatus(status) : 1,
            stdout: stdout.read(),
            stderr: stderr.read(),
          });
        });
        ws.on('error', reject);
      })
      .catch(reject);
  });
}

export async function shell(
  podName: string,
  script: string,
  container = REACT_CONTAINER_NAME
): Promise<ExecResult> {
  return exec(podName, ['sh', '-c', script], container);
}
