"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/lib/types";
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

export function useMessages(projectId: string) {
  const client = useApi();

  return useQuery({
    queryKey: messageKeys.list(projectId),
    queryFn: () => client.messages.list(projectId),
    enabled: !!projectId,
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
    },
  });
}
