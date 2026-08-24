import mongoose, { Schema, Document } from 'mongoose';

export interface Message {
  projectId: string;
  role: 'user' | 'agent';
  content: string;
}

export interface MessageDoc extends Message, Document {
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema: Schema = new Schema(
  {
    projectId: { type: String, required: true },
    role: { type: String, required: true, enum: ['user', 'agent'] },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

messageSchema.index({ projectId: 1, createdAt: 1 });

const Message = mongoose.model<MessageDoc>('Message', messageSchema);

export default Message;
