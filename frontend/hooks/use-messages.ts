"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";

export const messageKeys = {
  list: (projectId: string) => ["messages", projectId] as const,
};

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
    mutationFn: (content: string) => client.messages.send(projectId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: messageKeys.list(projectId),
      });
    },
  });
}
