"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/lib/types";
import { fileKeys } from "./use-files";
import { useApi } from "./use-api";

export const messageKeys = {
  list: (projectId: string) => ["messages", projectId] as const,
};

function upsertMessage(list: Message[], message: Message): Message[] {
  const index = list.findIndex((item) => item._id === message._id);
  if (index < 0) return [...list, message];
  const next = list.slice();
  next[index] = message;
  return next;
}

const ACTIVE_RUN_STATUSES = new Set([
  "QUEUED",
  "PROVISIONING",
  "WORKING",
]);

const POLL_MS = 2000;

function hasActiveRun(messages: Message[] | undefined): boolean {
  return (
    messages?.some(
      (message) =>
        message.type === "RUN" &&
        message.run != null &&
        ACTIVE_RUN_STATUSES.has(message.run.status)
    ) ?? false
  );
}

export function useMessages(projectId: string) {
  const client = useApi();

  return useQuery({
    queryKey: messageKeys.list(projectId),
    queryFn: () => client.messages.list(projectId),
    enabled: !!projectId,
    // Backup if the create NDJSON stream is interrupted by navigation quirks.
    refetchInterval: (query) =>
      hasActiveRun(query.state.data) ? POLL_MS : false,
  });
}

export function useSendMessage(projectId: string) {
  const client = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      client.messages.send(projectId, content, (message) => {
        queryClient.setQueryData<Message[]>(
          messageKeys.list(projectId),
          (current) => upsertMessage(current ?? [], message)
        );
      }),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: messageKeys.list(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: fileKeys.all(projectId),
      });
    },
  });
}
