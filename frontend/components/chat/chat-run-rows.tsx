import type { RunEventPayload, RunPayload } from "@/lib/types";

export function ChatRunRow({ run }: { run: RunPayload }) {
  const label =
    run.status === "WORKING"
      ? "Working…"
      : run.status === "QUEUED" || run.status === "PROVISIONING"
        ? "Starting…"
        : run.status === "SUCCESS"
          ? "Done"
          : run.status === "CANCELLED"
            ? "Cancelled"
            : "Failed";

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="rounded-md border border-border px-2 py-0.5 font-medium tracking-wide uppercase">
        {label}
      </span>
      {run.stopReason && run.status !== "SUCCESS" ? (
        <span>{run.stopReason}</span>
      ) : null}
      {run.iterations > 0 ? <span>{run.iterations} steps</span> : null}
    </div>
  );
}

export function ChatRunEventRow({ event }: { event: RunEventPayload }) {
  if (event.eventType === "tool_call") {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs">
        <div className="font-medium text-foreground/90">
          ▸ {event.toolName ?? "tool"}
        </div>
        {event.toolArgs != null ? (
          <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap text-muted-foreground">
            {typeof event.toolArgs === "string"
              ? event.toolArgs
              : JSON.stringify(event.toolArgs, null, 2)}
          </pre>
        ) : null}
      </div>
    );
  }

  if (event.eventType === "tool_result") {
    return (
      <div className="rounded-lg border border-border/40 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground/80">
            {event.toolName ?? "tool"}
          </span>
          <span>{event.isError ? "error" : "ok"}</span>
          {event.durationMs != null ? <span>{event.durationMs}ms</span> : null}
        </div>
        {event.toolResult ? (
          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap">
            {event.toolResult}
          </pre>
        ) : null}
      </div>
    );
  }

  if (event.eventType === "error") {
    return (
      <div className="rounded-lg border border-destructive/40 px-3 py-2 text-xs text-destructive">
        {event.content ?? "Run error"}
      </div>
    );
  }

  return null;
}
