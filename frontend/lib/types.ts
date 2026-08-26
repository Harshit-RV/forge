export interface Project {
  projectId: string;
  userId: string;
  title: string | null;
  subtitle: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectInput = {
  /** Required. Saved as the first chat message and starts the agent run. */
  prompt: string;
  title?: string;
  subtitle?: string;
};

export type OkResponse = { ok: true };

export type SandboxState = "STOPPED" | "CREATING" | "RUNNING" | "FAILED";

export interface SandboxStatus {
  state: SandboxState;
  previewUrl: string | null;
}

export type MessageType = "TEXT_MESSAGE" | "RUN" | "RUN_EVENT";

export type TextRole = "user" | "agent";

export type RunStatus =
  | "QUEUED"
  | "PROVISIONING"
  | "WORKING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export type RunStopReason =
  | "COMPLETED"
  | "CANCELLED"
  | "TIMEOUT"
  | "MAX_ITERATIONS"
  | "MAX_TOKENS"
  | "REFUSAL"
  | "ERROR";

export type RunEventType = "tool_call" | "tool_result" | "error" | "done";

export type RunTokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
};

export type TextMessagePayload = {
  role: TextRole;
  content: string;
  runId?: string;
};

export type RunPayload = {
  runId: string;
  status: RunStatus;
  stopReason?: RunStopReason;
  triggerMessageId?: string;
  iterations: number;
  usage: RunTokenUsage;
  error?: string;
  startedAt?: string;
  endedAt?: string;
};

export type RunEventPayload = {
  runId: string;
  eventType: RunEventType;
  toolCallId?: string;
  toolName?: string;
  toolArgs?: unknown;
  toolResult?: string;
  content?: string;
  isError?: boolean;
  durationMs?: number;
  exitCode?: number;
};

type MessageBase = {
  _id: string;
  projectId: string;
  type: MessageType;
  createdAt: string;
  updatedAt?: string;
};

export type TextMessage = MessageBase & {
  type: "TEXT_MESSAGE";
  textMessage: TextMessagePayload;
};

export type RunMessage = MessageBase & {
  type: "RUN";
  run: RunPayload;
};

export type RunEventMessage = MessageBase & {
  type: "RUN_EVENT";
  runEvent: RunEventPayload;
};

export type Message = TextMessage | RunMessage | RunEventMessage;

export interface FileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
}

export interface FileContent {
  path: string;
  content: string;
  truncated: boolean;
}
