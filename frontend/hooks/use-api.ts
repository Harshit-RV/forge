"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { filesApi } from "@/lib/endpoints/files";
import { messagesApi } from "@/lib/endpoints/messages";
import { projectsApi } from "@/lib/endpoints/projects";
import type { CreateProjectInput } from "@/lib/types";

export function useApi() {
  const { getToken } = useAuth();

  return useMemo(
    () => ({
      projects: {
        create: async (input: CreateProjectInput) =>
          projectsApi.create(await getToken(), input),
        list: async () => projectsApi.list(await getToken()),
        get: async (projectId: string) =>
          projectsApi.get(await getToken(), projectId),
        remove: async (projectId: string) =>
          projectsApi.remove(await getToken(), projectId),
        heartbeat: async (projectId: string) =>
          projectsApi.heartbeat(await getToken(), projectId),
        status: async (projectId: string) =>
          projectsApi.status(await getToken(), projectId),
        start: async (projectId: string) =>
          projectsApi.start(await getToken(), projectId),
        stop: async (projectId: string) =>
          projectsApi.stop(await getToken(), projectId),
      },
      messages: {
        list: async (projectId: string) =>
          messagesApi.list(await getToken(), projectId),
        send: async (projectId: string, content: string) =>
          messagesApi.send(await getToken(), projectId, content),
      },
      files: {
        list: async (projectId: string, path: string) =>
          filesApi.list(await getToken(), projectId, path),
        read: async (projectId: string, path: string) =>
          filesApi.read(await getToken(), projectId, path),
      },
    }),
    [getToken]
  );
}
