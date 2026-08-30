import path from 'node:path';
import { WORKSPACE_DIR } from 'k8s-sandbox';

// Directories never shown in the user file tree, and skipped by list/search
export const HIDDEN_DIR_NAMES = ['node_modules', '.git', '.forge', '.vite'];

export function isHiddenWorkspacePath(input: string): boolean {
  const abs = resolveWorkspacePath(input);
  
  if (abs === WORKSPACE_DIR) return false;
  
  return abs
    .slice(WORKSPACE_DIR.length + 1)
    .split('/')
    .some((segment) => HIDDEN_DIR_NAMES.includes(segment));
}

/**
  Safely quotes a value for use as a single shell argument.

  Examples:
    shQuote("hello world") → "'hello world'"
    shQuote("it's working") → "'it'\\''s working'"
    shQuote("$(rm -rf /)") → "'$(rm -rf /)'"

  This prevents spaces, quotes, or shell metacharacters in a value
  from being interpreted as shell syntax.
*/
export function shQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/**
  Resolve a user/agent path under /workspace; reject traversal.

  Examples:
    resolveWorkspacePath("src/App.tsx") → "/workspace/src/App.tsx"
    resolveWorkspacePath("/workspace/package.json") → "/workspace/package.json"
    resolveWorkspacePath(".")  → "/workspace"
    resolveWorkspacePath("../../etc/passwd") → throws (path escapes /workspace)

  Normalizes the path and rejects any attempt to traverse outside the sandbox workspace.
*/
export function resolveWorkspacePath(input: string): string {
  const raw =
    input === '.' || input === '' || input === '/'
      ? WORKSPACE_DIR
      : input;

  const abs = path.posix.isAbsolute(raw)
    ? path.posix.normalize(raw)
    : path.posix.normalize(path.posix.join(WORKSPACE_DIR, raw));

  if (abs !== WORKSPACE_DIR && !abs.startsWith(`${WORKSPACE_DIR}/`)) {
    throw new Error(`Path escapes ${WORKSPACE_DIR}: ${input}`);
  }

  return abs;
}


/**
  Joins a directory and filename while avoiding duplicate slashes.
  Examples:
    pathJoin("/workspace/src", "App.tsx") → "/workspace/src/App.tsx"
    pathJoin("/workspace/src/", "App.tsx") → "/workspace/src/App.tsx"

  This is only a string join helper; it does not normalize paths
  or prevent path traversal. Use resolveWorkspacePath() for untrusted paths.
*/
export function pathJoin(dir: string, name: string): string {
  return dir.endsWith('/') ? `${dir}${name}` : `${dir}/${name}`;
}
