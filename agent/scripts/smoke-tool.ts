import 'dotenv/config';
import config from '../src/config';
import { runAgent } from '../src/run-agent';
import type { AgentSandbox, ExecResult, FileEntry } from '../src/types';

/** In-memory sandbox — full AgentSandbox surface for local smokes. */
function createFakeSandbox(initial: Map<string, string>): AgentSandbox {
  const files = new Map(initial);
  let restarted = 0;
  const logs: string[] = ['Vite ready'];

  return {
    async listFiles(path: string): Promise<FileEntry[]> {
      const prefix =
        path === '.' || path === '/workspace'
          ? '/workspace/'
          : path.endsWith('/')
            ? path
            : `${path}/`;

      const names = new Set<string>();
      const entries: FileEntry[] = [];

      for (const filePath of files.keys()) {
        if (!filePath.startsWith(prefix)) continue;
        const rest = filePath.slice(prefix.length);
        const [name, ...more] = rest.split('/');
        if (!name || names.has(name)) continue;
        names.add(name);
        entries.push({
          name,
          path: `${prefix}${name}`,
          type: more.length > 0 ? 'directory' : 'file',
        });
      }

      return entries.sort((a, b) => a.name.localeCompare(b.name));
    },

    async readFile(path: string): Promise<string> {
      const content = files.get(path);
      if (content === undefined) throw new Error(`File not found: ${path}`);
      return content;
    },

    async writeFile(path: string, content: string): Promise<void> {
      files.set(path, content);
    },

    async editFile(
      path: string,
      oldString: string,
      newString: string
    ): Promise<void> {
      const content = files.get(path);
      if (content === undefined) throw new Error(`File not found: ${path}`);
      const count = content.split(oldString).length - 1;
      if (count === 0) throw new Error('old_string not found');
      if (count > 1) {
        throw new Error('old_string is ambiguous (multiple matches)');
      }
      files.set(path, content.replace(oldString, newString));
    },

    async searchCode(pattern: string): Promise<string> {
      const re = new RegExp(pattern);
      const hits: string[] = [];
      for (const [path, content] of files) {
        content.split('\n').forEach((line, i) => {
          if (re.test(line)) hits.push(`${path}:${i + 1}: ${line}`);
        });
      }
      return hits.join('\n');
    },

    async exec(cmd: string, _timeoutMs: number): Promise<ExecResult> {
      return { exitCode: 0, stdout: `fake: ${cmd}\nok`, stderr: '' };
    },

    async restartDevServer(): Promise<void> {
      restarted += 1;
      logs.push(`restart #${restarted}`);
    },

    async devLogs(lines: number): Promise<string> {
      return logs.slice(-lines).join('\n');
    },
  };
}

async function main() {
  if (!config.claudeApiKey) {
    throw new Error('CLAUDE_API_KEY is missing');
  }

  const sandbox = createFakeSandbox(
    new Map([
      [
        '/workspace/package.json',
        JSON.stringify({ name: 'forge-starter', version: '0.1.0' }, null, 2),
      ],
      [
        '/workspace/src/App.tsx',
        `export default function App() {\n  return <h1>Hello</h1>;\n}\n`,
      ],
    ])
  );

  console.log('--- Phase 4 step 2: minimal runAgent ---');
  // const ac = new AbortController();
  // setTimeout(() => ac.abort(), 2000); // abort mid-run
  const summary = await runAgent({
    sandbox,
    messages: [
      {
        role: 'user',
        content:
          'In /workspace/src/App.tsx, change the heading from Hello to Hello Forge using edit_file (read the file first). Then run_command with "npm test". Summarize what you did.',
      },
    ],
    bounds: { maxIterations: 10 },
    on: {
      onToolCall: (c) => console.log('[tool_call]', c.name, c.args),
      onToolResult: (r) =>
        console.log('[tool_result]', r.name, r.isError ? 'ERR' : 'ok', r.content.slice(0, 120)),
      onAssistantMessage: (t) => console.log('[assistant]', t),
      onDone: (s) => console.log('[done]', s.stopReason, s.iterations),
    },
    // signal: ac.signal
  });

  console.log('\n--- summary ---');
  console.log(summary);

  const app = await sandbox.readFile('/workspace/src/App.tsx');
  console.log('\n--- App.tsx after run ---');
  console.log(app);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
