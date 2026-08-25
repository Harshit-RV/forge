import { tool } from 'ai';
import { z } from 'zod';
import type { AgentSandbox } from '../types';
import { formatExecResult, formatFileList } from './format';
import { AGENT_DEFAULT_BOUNDS } from '../config';

const WORKSPACE = '/workspace';

export function createTools(sandbox: AgentSandbox) {
  return {
    list_files: tool({
      description: `List files and directories under ${WORKSPACE}. Use "." for the project root.`,
      inputSchema: z.object({
        path: z.string().min(1).describe('Directory to list.'),
      }),
      execute: async ({ path }) => formatFileList(await sandbox.listFiles(path)),
    }),

    read_file: tool({
      description:
        'Read a file in full. Always read before editing — edit_file needs an exact match.',
      inputSchema: z.object({
        path: z.string().min(1).describe('File path.'),
      }),
      execute: async ({ path }) => {
        const content = await sandbox.readFile(path);
        return content === '' ? '(file is empty)' : content;
      },
    }),

    write_file: tool({
      description:
        'Create a new file or replace an entire file. Prefer edit_file for small changes.',
      inputSchema: z.object({
        path: z.string().min(1),
        content: z.string(),
      }),
      execute: async ({ path, content }) => {
        await sandbox.writeFile(path, content);
        return `Wrote ${path}.`;
      },
    }),

    edit_file: tool({
      description:
        'Replace exactly one occurrence of old_string with new_string. Fails if missing or ambiguous.',
      inputSchema: z.object({
        path: z.string().min(1),
        old_string: z.string().min(1),
        new_string: z.string(),
      }),
      execute: async ({ path, old_string, new_string }) => {
        await sandbox.editFile(path, old_string, new_string);
        return `Edited ${path}.`;
      },
    }),

    search_code: tool({
      description:
        'Search the project with a regex. Returns matching lines with file and line number.',
      inputSchema: z.object({
        pattern: z.string().min(1),
      }),
      execute: async ({ pattern }) => {
        const output = await sandbox.searchCode(pattern);
        return output.trim() === '' ? 'No matches.' : output;
      },
    }),

    run_command: tool({
      description: `Run a non-interactive shell command in ${WORKSPACE}. Do not start long-lived processes. Prefer file tools for edits.`,
      inputSchema: z.object({
        command: z.string().min(1),
      }),
      execute: async ({ command }) => {
        const result = await sandbox.exec(command, AGENT_DEFAULT_BOUNDS.commandTimeoutMs);
        return formatExecResult(result);
      },
    }),

    restart_dev_server: tool({
      description:
        'Restart the Vite dev server. Needed after installing deps or changing vite.config.',
      inputSchema: z.object({}),
      execute: async () => {
        await sandbox.restartDevServer();
        return 'Dev server restarted.';
      },
    }),

    get_dev_logs: tool({
      description:
        'Read recent Vite output (compile errors, failed imports).',
      inputSchema: z.object({
        lines: z.number().int().positive().optional().default(100),
      }),
      execute: async ({ lines }) => {
        const logs = await sandbox.devLogs(lines);
        return logs.trim() === '' ? '(no dev server output)' : logs;
      },
    }),
  };
}

export type AgentTools = ReturnType<typeof createTools>;
