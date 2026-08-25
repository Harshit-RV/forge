"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SandboxStatus } from "@/lib/types";
import { useApi } from "./use-api";

export const sandboxKeys = {
  status: (projectId: string) => ["sandbox", projectId, "status"] as const,
};

const POLL_MS = 3000;

export function useSandboxStatus(projectId: string, enabled = true) {
  const client = useApi();

  return useQuery({
    queryKey: sandboxKeys.status(projectId),
    queryFn: () => client.projects.status(projectId),
    enabled: enabled && !!projectId,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.state === "CREATING" ? POLL_MS : false,
  });
}

export function useSandboxControls(projectId: string) {
  const client = useApi();
  const queryClient = useQueryClient();

  const onSuccess = (status: SandboxStatus) => {
    queryClient.setQueryData(sandboxKeys.status(projectId), status);
  };

  return {
    start: useMutation({
      mutationFn: () => client.projects.start(projectId),
      onMutate: () => {
        queryClient.setQueryData<SandboxStatus>(sandboxKeys.status(projectId), {
          state: "CREATING",
          previewUrl: null,
        });
      },
      onSuccess,
      onError: () => {
        void queryClient.invalidateQueries({
          queryKey: sandboxKeys.status(projectId),
        });
      },
    }),
    stop: useMutation({
      mutationFn: () => client.projects.stop(projectId),
      onSuccess,
    }),
  };
}
