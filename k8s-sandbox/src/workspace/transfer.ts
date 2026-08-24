import path from 'node:path';
import * as tar from 'tar';
import { PACKAGE_ROOT, WORKSPACE_DIR } from '../config';
import { shell } from '../kube/exec';

const STARTER_DIR = path.join(PACKAGE_ROOT, 'templates', 'starter-react-app');
const CHUNK = 32 * 1024;
const SKIP = new Set(['node_modules', 'dist', '.git', '.vite']);

async function archiveStarter(): Promise<string> {
  const stream = tar.create(
    {
      gzip: true,
      cwd: STARTER_DIR,
      portable: true,
      filter: (p) => !p.split('/').some((part) => SKIP.has(part)),
    },
    ['.']
  );
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk as Uint8Array));
  }
  return Buffer.concat(chunks).toString('base64');
}

export async function copyStarter(podName: string): Promise<void> {
  const payload = await archiveStarter();
  const remote = '/tmp/starter.b64';

  const prep = await shell(podName, `mkdir -p ${WORKSPACE_DIR} && rm -f ${remote}`);
  if (prep.exitCode !== 0) throw new Error(prep.stderr);

  for (let i = 0; i < payload.length; i += CHUNK) {
    const piece = payload.slice(i, i + CHUNK);
    const wrote = await shell(podName, `printf '%s' '${piece}' >> ${remote}`);
    if (wrote.exitCode !== 0) throw new Error(wrote.stderr);
  }

  const unpack = await shell(
    podName,
    `base64 -d ${remote} | tar -xzf - -C ${WORKSPACE_DIR} && rm -f ${remote}`
  );
  if (unpack.exitCode !== 0) throw new Error(unpack.stderr);
}
