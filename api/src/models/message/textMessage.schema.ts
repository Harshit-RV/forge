import { Schema } from 'mongoose';

export const TEXT_ROLES = [ 'user', 'agent' ] as const;
export type TextRole = (typeof TEXT_ROLES)[number];

export type TextMessagePayload = {
  role: TextRole;
  content: string;
  runId?: string;
};

export const textMessageSchema = new Schema(
  {
    role: { type: String, required: true, enum: TEXT_ROLES },
    content: { type: String, required: true },
    runId: { type: String, required: false },
  },
  { _id: false }
);
