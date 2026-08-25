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
  title?: string;
  subtitle?: string;
};

export type OkResponse = { ok: true };

export type SandboxState = "STOPPED" | "CREATING" | "RUNNING" | "FAILED";

export interface SandboxStatus {
  state: SandboxState;
  previewUrl: string | null;
}

export interface Message {
  _id: string;
  projectId: string;
  role: "user" | "agent";
  content: string;
  createdAt: string;
}

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
