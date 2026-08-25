import mongoose, { Schema, Document } from 'mongoose';

export interface Project {
  projectId: string;
  userId: string;
  title: string | null;
  subtitle: string | null;
  lastActivityAt: Date;
};

export interface ProjectDoc extends Project, Document {
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectProps = Pick<Project, 'userId' | 'title' | 'subtitle'>;

const projectSchema : Schema = new Schema<Project>(
  {
    projectId: { type: String, required: true, unique: true, default: () => new mongoose.Types.UUID().toString() },
    userId: { type: String, required: true, index: true },
    title: { type: String, default: null },
    subtitle: { type: String, default: null },
    lastActivityAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

const Project = mongoose.model<ProjectDoc>('Projects', projectSchema);

export default Project;
