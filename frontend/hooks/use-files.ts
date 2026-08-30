"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { useApi } from "./use-api";

export const fileKeys = {
  all: (projectId: string) => ["files", projectId] as const,
  list: (projectId: string, path: string) =>
    ["files", projectId, "list", path] as const,
  content: (projectId: string, path: string) =>
    ["files", projectId, "content", path] as const,
};

export function useFiles(projectId: string, path: string, enabled = true) {
  const client = useApi();

  return useQuery({
    queryKey: fileKeys.list(projectId, path),
    queryFn: () => client.files.list(projectId, path),
    enabled: enabled && !!projectId,
    retry: (count, error) =>
      error instanceof ApiError && error.status >= 400 && error.status < 500
        ? false
        : count < 1,
  });
}

export function useFileContent(
  projectId: string,
  path: string | null,
  enabled = true
) {
  const client = useApi();

  return useQuery({
    queryKey: fileKeys.content(projectId, path ?? ""),
    queryFn: () => client.files.read(projectId, path!),
    enabled: enabled && !!projectId && !!path,
    retry: (count, error) =>
      error instanceof ApiError && error.status >= 400 && error.status < 500
        ? false
        : count < 1,
  });
}
