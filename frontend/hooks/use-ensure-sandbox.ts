"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SandboxStatus } from "@/lib/types";
import { sandboxKeys } from "./use-sandbox";
import { useApi } from "./use-api";

const POLL_MS = 2000;
const READY_TIMEOUT_MS = 5 * 60_000;

/**
 * Always ensure a live sandbox when the project page opens.
 * Stays pending until cluster status is RUNNING (or a hard failure).
 */
export function useEnsureSandbox(projectId: string, enabled = true) {
  const client = useApi();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(enabled);

  useEffect(() => {
    if (!enabled || !projectId) {
      setIsPending(false);
      return;
    }

    let cancelled = false;
    setIsPending(true);

    const sync = (status: SandboxStatus) => {
      queryClient.setQueryData(sandboxKeys.status(projectId), status);
    };

    void (async () => {
      try {
        // Drop any in-flight GET /status so a stale STOPPED cannot overwrite us.
        await queryClient.cancelQueries({
          queryKey: sandboxKeys.status(projectId),
        });

        const status = await client.projects.ensureSandbox(projectId);
        if (cancelled) return;
        sync(status);

        if (status.state === "RUNNING") {
          setIsPending(false);
          return;
        }

        if (status.state === "FAILED") {
          setIsPending(false);
          toast.error("Sandbox failed to start");
          return;
        }

        const deadline = Date.now() + READY_TIMEOUT_MS;
        while (Date.now() < deadline) {
          if (cancelled) return;
          await new Promise((resolve) => setTimeout(resolve, POLL_MS));
          if (cancelled) return;

          const next = await client.projects.status(projectId);
          if (cancelled) return;
          sync(next);

          if (next.state === "RUNNING") {
            setIsPending(false);
            return;
          }
          if (next.state === "FAILED") {
            setIsPending(false);
            toast.error("Sandbox failed to start");
            return;
          }
        }

        if (!cancelled) {
          setIsPending(false);
          toast.error("Sandbox did not become ready in time");
        }
      } catch (error) {
        if (cancelled) return;
        setIsPending(false);
        void queryClient.invalidateQueries({
          queryKey: sandboxKeys.status(projectId),
        });
        toast.error(
          error instanceof Error ? error.message : "Could not start sandbox"
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, enabled, client, queryClient]);

  return { isPending };
}
