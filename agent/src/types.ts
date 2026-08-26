export type FileEntry = {
  name: string;
  path: string;
  type: 'file' | 'directory';
};

export type ExecResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut?: boolean;
};


export interface AgentSandbox {
  listFiles(path: string): Promise<FileEntry[]>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  editFile(path: string, oldString: string, newString: string): Promise<void>;
  searchCode(pattern: string): Promise<string>;
  exec(cmd: string, timeoutMs: number): Promise<ExecResult>;
  restartDevServer(): Promise<void>;
  devLogs(lines: number): Promise<string>;
}


export type ToolCall = {
  // Anthropic tool_use id
  id: string;
  name: string;
  args: unknown;
};

export type ToolResult = {
  // Matches ToolCall's ID
  id: string;
  name: string;
  content: string;
  isError: boolean;
  durationMs: number;
  exitCode?: number;
};


export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
};

export type StopReason =
  | 'SUCCESS'
  | 'CANCELLED'
  | 'MAX_ITERATIONS'
  | 'TIMEOUT'
  | 'MAX_TOKENS'
  | 'REFUSAL';

  
export type AgentEvents = {
  onText?(delta: string): void | Promise<void>;
  onAssistantMessage?(text: string): void | Promise<void>;
  onToolCall?(call: ToolCall): void | Promise<void>;
  onToolResult?(result: ToolResult): void | Promise<void>;
  onUsage?(usage: TokenUsage): void | Promise<void>;
  onDone?(summary: AgentRunSummary): void | Promise<void>;
  onError?(error: Error): void | Promise<void>;
};


export type AgentBounds = {
  maxIterations: number;
  maxWallClockMs: number;
  maxTokens: number;
  commandTimeoutMs: number;
};

export type AgentRunSummary = {
  stopReason: StopReason;
  iterations: number;
  usage: TokenUsage;
  durationMs: number;
  finalText: string;
};

export type AgentChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};