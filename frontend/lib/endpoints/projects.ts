import { request, requestNdjson, type Token } from "@/lib/api";
import type {
  CreateProjectInput,
  Message,
  OkResponse,
  Project,
  SandboxStatus,
} from "@/lib/types";

export const projectsApi = {
  create: (
    token: Token,
    input: CreateProjectInput,
    onMessage: (message: Message) => void
  ) =>
    requestNdjson<Message>("/projects/create", token, input, onMessage),

  list: (token: Token) => request<Project[]>("/projects/list/user", token),

  get: (token: Token, projectId: string) =>
    request<Project>(`/projects/${projectId}`, token),

  remove: (token: Token, projectId: string) =>
    request<OkResponse>(`/projects/${projectId}`, token, {
      method: "DELETE",
    }),

  heartbeat: (token: Token, projectId: string) =>
    request<OkResponse>(`/projects/${projectId}/heartbeat`, token, {
      method: "POST",
    }),

  status: (token: Token, projectId: string) =>
    request<SandboxStatus>(`/projects/${projectId}/status`, token),

  ensureSandbox: (token: Token, projectId: string) =>
    request<SandboxStatus>(`/projects/${projectId}/sandbox`, token, {
      method: "POST",
    }),

  start: (token: Token, projectId: string) =>
    request<SandboxStatus>(`/projects/${projectId}/start`, token, {
      method: "POST",
    }),

  stop: (token: Token, projectId: string) =>
    request<SandboxStatus>(`/projects/${projectId}/stop`, token, {
      method: "POST",
    }),
};
