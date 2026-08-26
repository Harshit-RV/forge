import type { FileEntry } from 'agent';
import { shell, WORKSPACE_DIR } from 'k8s-sandbox';
import { pathJoin, resolveWorkspacePath, shQuote } from './paths';

const LIST_SKIP = new Set(['node_modules', '.git']);

export const listFiles = async (pod: string, dirPath: string): Promise<FileEntry[]> => {
  const abs = resolveWorkspacePath(dirPath);
  
  const script = [
    `target=${shQuote(abs)}`,
    'if [ ! -d "$target" ]; then echo "not a directory: $target" >&2; exit 1; fi',
    'find "$target" -maxdepth 1 -mindepth 1 \\( -type f -o -type d -o -type l \\) -printf "%f\\t%y\\n"',
  ].join('\n');

  const result = await shell(pod, script);
  
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || 'listFiles failed');
  }

  const entries: FileEntry[] = [];
  
  for (const line of result.stdout.split('\n')) {
    if (!line.trim()) continue;
    const tab = line.indexOf('\t');
    if (tab < 0) continue;
    const name = line.slice(0, tab);
    const kind = line.slice(tab + 1);
    if (LIST_SKIP.has(name)) continue;
    entries.push({
      name,
      path: pathJoin(abs, name),
      type: kind === 'd' ? 'directory' : 'file',
    });
  }

  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return entries;
}

export const readFile = async (pod: string, filePath: string): Promise<string> => {
  const abs = resolveWorkspacePath(filePath);
  
  const script = [
    `target=${shQuote(abs)}`,
    'if [ ! -f "$target" ]; then echo "File not found: $target" >&2; exit 1; fi',
    'base64 -w 0 "$target"',
  ].join('\n');

  const result = await shell(pod, script);
  
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || 'readFile failed');
  }

  return Buffer.from(result.stdout.trim(), 'base64').toString('utf8');
}

export const writeFile = async (pod: string, filePath: string, content: string): Promise<void> => {
  const abs = resolveWorkspacePath(filePath);
  const b64 = Buffer.from(content, 'utf8').toString('base64');
  
  const script = [
    `target=${shQuote(abs)}`,
    `payload=${shQuote(b64)}`,
    'mkdir -p "$(dirname "$target")"',
    'printf "%s" "$payload" | base64 -d > "$target"',
  ].join('\n');

  const result = await shell(pod, script);
  
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || 'writeFile failed');
  }
}

export const editFile = async (pod: string, filePath: string, oldString: string, newString: string): Promise<void> => {
  const content = await readFile(pod, filePath);
  const count = content.split(oldString).length - 1;
  
  if (count === 0) throw new Error('old_string not found');
  if (count > 1) {
    throw new Error('old_string is ambiguous (multiple matches)');
  }

  await writeFile(pod, filePath, content.replace(oldString, newString));
}

export const searchCode = async (pod: string, pattern: string): Promise<string> => {
  const patternB64 = Buffer.from(pattern, 'utf8').toString('base64');
  const script = [
    `pattern=$(printf "%s" ${shQuote(patternB64)} | base64 -d)`,
    `cd ${shQuote(WORKSPACE_DIR)}`,
    'grep -RInE --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.forge --exclude-dir=.vite -e "$pattern" . 2>/dev/null || true',
  ].join('\n');

  const result = await shell(pod, script);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.trim() || 'searchCode failed');
  }

  return result.stdout
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      if (line.startsWith('./')) return `${WORKSPACE_DIR}/${line.slice(2)}`;
      if (line.startsWith('/')) return line;
      return `${WORKSPACE_DIR}/${line}`;
    })
    .join('\n');
}
