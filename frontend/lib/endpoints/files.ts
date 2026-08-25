import { request, type Token } from "@/lib/api";
import type { FileContent, FileEntry } from "@/lib/types";

export const filesApi = {
  list: (token: Token, projectId: string, path: string) =>
    request<FileEntry[]>(
      `/projects/${projectId}/files?path=${encodeURIComponent(path)}`,
      token
    ),

  read: (token: Token, projectId: string, path: string) =>
    request<FileContent>(
      `/projects/${projectId}/file?path=${encodeURIComponent(path)}`,
      token
    ),
};
