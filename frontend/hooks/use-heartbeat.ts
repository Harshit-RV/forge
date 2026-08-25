"use client";

import { useEffect } from "react";
import { useApi } from "./use-api";

const HEARTBEAT_MS = 20_000;

export function useHeartbeat(projectId: string | null, active = true) {
  const client = useApi();

  useEffect(() => {
    if (!projectId || !active) return;

    let stopped = false;

    const ping = async () => {
      try {
        await client.projects.heartbeat(projectId);
      } catch {
        // a missed heartbeat is not actionable; the next tick retries
      }
    };

    void ping();
    const timer = setInterval(() => {
      if (!stopped) void ping();
    }, HEARTBEAT_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [projectId, active, client]);
}
