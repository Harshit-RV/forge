import { Schema } from 'mongoose';

export const RUN_STATUSES = [
  'QUEUED',
  'PROVISIONING',
  'WORKING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
] as const;

export type RunStatus = (typeof RUN_STATUSES)[number];


export const RUN_STOP_REASONS = [
  'COMPLETED',
  'CANCELLED',
  'TIMEOUT',
  'MAX_ITERATIONS',
  'MAX_TOKENS',
  'REFUSAL',
  'ERROR',
] as const;

export type RunStopReason = (typeof RUN_STOP_REASONS)[number];


export type RunTokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
};


export type RunPayload = {
  runId: string;
  status: RunStatus;
  stopReason?: RunStopReason;
  triggerMessageId?: string;
  iterations: number;
  usage: RunTokenUsage;
  error?: string;
  startedAt?: Date;
  endedAt?: Date;
};

export const runSchema = new Schema(
  {
    runId: { type: String, required: true },
    status: { type: String, required: true, enum: RUN_STATUSES },
    stopReason: { type: String, required: false, enum: RUN_STOP_REASONS },
    triggerMessageId: { type: String, required: false },
    iterations: { type: Number, required: true, default: 0 },
    usage: {
      type: {
        inputTokens: { type: Number, default: 0 },
        outputTokens: { type: Number, default: 0 },
        cacheCreationInputTokens: { type: Number, default: 0 },
        cacheReadInputTokens: { type: Number, default: 0 },
      },
      required: true,
      default: () => ({
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 0,
      }),
    },
    error: { type: String, required: false },
    startedAt: { type: Date, required: false },
    endedAt: { type: Date, required: false },
  },
  { _id: false }
);
