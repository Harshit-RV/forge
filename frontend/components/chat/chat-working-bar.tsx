"use client";

import type { Message } from "@/lib/types";
import { ACTIVE_RUN_STATUSES } from "@/lib/chat-timeline";

function latestActivityHint(events: Message[]): string | null {
  for (let index = events.length - 1; index >= 0; index--) {
    const item = events[index];
    if (item.type !== "RUN_EVENT" || !item.runEvent) continue;

    const event = item.runEvent;
    if (event.eventType === "tool_call" && event.toolName) {
      return event.toolName;
    }
    if (event.eventType === "tool_result" && event.toolName) {
      return `${event.toolName} finished`;
    }
  }
  return null;
}

export function getActiveRunSnapshot(messages: Message[]) {
  const activeRunMessage = messages.find(
    (item) =>
      item.type === "RUN" &&
      item.run != null &&
      ACTIVE_RUN_STATUSES.has(item.run.status)
  );

  if (activeRunMessage?.type !== "RUN" || !activeRunMessage.run) {
    return null;
  }

  const run = activeRunMessage.run;
  const runEvents = messages.filter(
    (item) =>
      item.type === "RUN_EVENT" && item.runEvent?.runId === run.runId
  );
  const toolCalls = runEvents.filter(
    (item) =>
      item.type === "RUN_EVENT" && item.runEvent?.eventType === "tool_call"
  ).length;

  return {
    run,
    toolCalls,
    activityHint: latestActivityHint(runEvents),
  };
}

export function ChatWorkingBar({ messages }: { messages: Message[] }) {
  const snapshot = getActiveRunSnapshot(messages);
  if (!snapshot) return null;

  const { run, activityHint } = snapshot;
  const label =
    run.status === "QUEUED" || run.status === "PROVISIONING"
      ? "Starting sandbox…"
      : "Working…";

  return (
    <div className="mt-4 ml-1 mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 py-1 text-xs">
      <span className="chat-shimmer-text font-mono font-medium tracking-wide uppercase">
        {label}
      </span>
      {activityHint ? (
        <span className="chat-shimmer-text truncate font-mono">{activityHint}</span>
      ) : null}
    </div>
  );
}
