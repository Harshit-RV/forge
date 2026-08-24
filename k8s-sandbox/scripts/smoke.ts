import { create, destroy } from '../src';

async function main() {
  const sandbox = await create('smoke');
  const preview = await fetch(sandbox.previewUrl);
  console.log('via preview', preview.status, sandbox.previewUrl);
  await destroy(sandbox.projectId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
