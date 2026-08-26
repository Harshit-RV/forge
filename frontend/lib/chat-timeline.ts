import type {
  Message,
  RunEventPayload,
  RunPayload,
  TextMessage,
} from "@/lib/types";

export type TextTimelineEntry = {
  kind: "text";
  message: TextMessage;
};

export type RunActivityTimelineEntry = {
  kind: "run-activity";
  runId: string;
  run: RunPayload | null;
  events: RunEventPayload[];
};

export type TimelineEntry = TextTimelineEntry | RunActivityTimelineEntry;

/** Fold RUN + RUN_EVENT rows into grouped activity blocks while keeping text in order. */
export function buildChatTimeline(messages: Message[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const activityByRunId = new Map<string, RunActivityTimelineEntry>();

  for (const message of messages) {
    if (message.type === "TEXT_MESSAGE") {
      entries.push({ kind: "text", message });
      continue;
    }

    const runId =
      message.type === "RUN"
        ? message.run?.runId
        : message.type === "RUN_EVENT"
          ? message.runEvent?.runId
          : undefined;
    if (!runId) continue;

    let activity = activityByRunId.get(runId);
    if (!activity) {
      activity = { kind: "run-activity", runId, run: null, events: [] };
      activityByRunId.set(runId, activity);
      entries.push(activity);
    }

    if (message.type === "RUN" && message.run) {
      activity.run = message.run;
    }
    if (message.type === "RUN_EVENT" && message.runEvent) {
      activity.events.push(message.runEvent);
    }
  }

  return entries.filter(
    (entry) =>
      entry.kind !== "run-activity" ||
      entry.events.some((event) => event.eventType === "tool_call")
  );
}

export const ACTIVE_RUN_STATUSES = new Set([
  "QUEUED",
  "PROVISIONING",
  "WORKING",
]);

export function isActiveRun(run: RunPayload | null | undefined): boolean {
  return run != null && ACTIVE_RUN_STATUSES.has(run.status);
}
