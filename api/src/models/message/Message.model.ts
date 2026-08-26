import mongoose, { Schema, Document } from 'mongoose';
import {
  textMessageSchema,
  type TextMessagePayload,
} from './textMessage.schema';
import { runSchema, type RunPayload } from './run.schema';
import { runEventSchema, type RunEventPayload } from './runEvent.schema';

export const MESSAGE_TYPES = ['TEXT_MESSAGE', 'RUN', 'RUN_EVENT'] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

export type Message = {
  projectId: string;
  type: MessageType;
  textMessage?: TextMessagePayload;
  run?: RunPayload;
  runEvent?: RunEventPayload;
};

export interface MessageDoc extends Message, Document {
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema(
  {
    projectId: { type: String, required: true },
    type: { type: String, required: true, enum: MESSAGE_TYPES },
    textMessage: { type: textMessageSchema, required: false },
    run: { type: runSchema, required: false },
    runEvent: { type: runEventSchema, required: false },
  },
  { timestamps: true }
);

messageSchema.index({ projectId: 1, createdAt: 1 });
messageSchema.index(
  { 'run.runId': 1 },
  { unique: true, partialFilterExpression: { type: 'RUN' } }
);
messageSchema.index(
  { projectId: 1, 'run.status': 1 },
  { partialFilterExpression: { type: 'RUN' } }
);

const MessageModel = mongoose.model<MessageDoc>('Message', messageSchema);

export default MessageModel;

export * from './textMessage.schema';
export * from './run.schema';
export * from './runEvent.schema';
