import { Schema } from 'mongoose';

export const RUN_EVENT_TYPES = [
  'tool_call',
  'tool_result',
  'error',
  'done',
] as const;

export type RunEventType = (typeof RUN_EVENT_TYPES)[number];

// tool call inputs/outputs can be huge (example: reading a large file), so we have these caps in place
export const RUN_EVENT_TOOL_ARGS_MAX_CHARS = 16_000;
export const RUN_EVENT_TOOL_RESULT_MAX_CHARS = 32_000;

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

export const runEventSchema = new Schema(
  {
    runId: { type: String, required: true },
    eventType: { type: String, required: true, enum: RUN_EVENT_TYPES },
    toolCallId: { type: String, required: false },
    toolName: { type: String, required: false },
    toolArgs: { type: Schema.Types.Mixed, required: false },
    toolResult: { type: String, required: false },
    content: { type: String, required: false },
    isError: { type: Boolean, required: false },
    durationMs: { type: Number, required: false },
    exitCode: { type: Number, required: false },
  },
  { _id: false }
);
