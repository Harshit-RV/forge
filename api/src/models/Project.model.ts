import mongoose, { Schema, Document } from 'mongoose';

export interface Project {
  projectId: string;
  userId: string;
  title: string | null;
  subtitle: string | null;
};

export interface ProjectDoc extends Project, Document {
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema : Schema = new Schema<Project>(
  {
    projectId: { type: String, required: true, unique: true, default: () => new mongoose.Types.UUID().toString() },
    userId: { type: String, required: true },
    title: { type: String, default: null },
    subtitle: { type: String, default: null },
  },
  { timestamps: true }
);

const Project = mongoose.model<ProjectDoc>('Projects', projectSchema);

export default Project;
