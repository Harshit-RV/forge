import { ExecResult, FileEntry } from "../types";

export function formatFileList(entries: FileEntry[]): string {
  if (entries.length === 0) return '(empty directory)';
  return entries
    .map((e) => (e.type === 'directory' ? `${e.name}/` : e.name))
    .join('\n');
}

export function formatExecResult(result: ExecResult): string {
  const parts: string[] = [];
  if (result.timedOut) parts.push('Command timed out and was killed.');
  parts.push(`exit code: ${result.exitCode}`);
  if (result.stdout.trim()) parts.push(`stdout:\n${result.stdout.trimEnd()}`);
  if (result.stderr.trim()) parts.push(`stderr:\n${result.stderr.trimEnd()}`);
  if (!result.stdout.trim() && !result.stderr.trim()) parts.push('(no output)');
  return parts.join('\n');
}