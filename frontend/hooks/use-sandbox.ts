"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SandboxStatus } from "@/lib/types";
import { useApi } from "./use-api";

export const sandboxKeys = {
  status: (projectId: string) => ["sandbox", projectId, "status"] as const,
};

const POLL_MS = 3000;

/** Live cluster status only — never decide start/stop from stale cache alone. */
export function useSandboxStatus(projectId: string, enabled = true) {
  const client = useApi();

  return useQuery({
    queryKey: sandboxKeys.status(projectId),
    queryFn: () => client.projects.status(projectId),
    enabled: enabled && !!projectId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: (query) =>
      query.state.data?.state === "CREATING" ? POLL_MS : false,
  });
}

export function useSandboxControls(projectId: string) {
  const client = useApi();
  const queryClient = useQueryClient();

  const syncStatus = (status: SandboxStatus) => {
    queryClient.setQueryData(sandboxKeys.status(projectId), status);
  };

  return {
    start: useMutation({
      mutationFn: async () => {
        await queryClient.cancelQueries({
          queryKey: sandboxKeys.status(projectId),
        });
        return client.projects.ensureSandbox(projectId);
      },
      onSuccess: syncStatus,
      onError: () => {
        void queryClient.invalidateQueries({
          queryKey: sandboxKeys.status(projectId),
        });
      },
    }),
    stop: useMutation({
      mutationFn: () => client.projects.stop(projectId),
      onSuccess: syncStatus,
      onError: () => {
        void queryClient.invalidateQueries({
          queryKey: sandboxKeys.status(projectId),
        });
      },
    }),
  };
}
