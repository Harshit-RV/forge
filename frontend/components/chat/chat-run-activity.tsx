"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { isActiveRun } from "@/lib/chat-timeline";
import { formatDurationMs } from "@/lib/format";
import type { RunEventPayload, RunPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

function runLabel(run: RunPayload | null): string {
  if (!run) return "Starting…";
  if (run.status === "WORKING") return "Working…";
  if (run.status === "QUEUED" || run.status === "PROVISIONING") return "Starting…";
  if (run.status === "SUCCESS") return "Done";
  if (run.status === "CANCELLED") return "Cancelled";
  return "Failed";
}

function summarizeEvents(events: RunEventPayload[]): string {
  const toolCalls = events.filter((event) => event.eventType === "tool_call");
  const errors = events.filter((event) => event.eventType === "error");
  const parts: string[] = [];

  if (toolCalls.length > 0) {
    parts.push(`${toolCalls.length} tool${toolCalls.length === 1 ? "" : "s"}`);
  }
  if (errors.length > 0) {
    parts.push(`${errors.length} error${errors.length === 1 ? "" : "s"}`);
  }

  return parts.join(" · ");
}

function toolPathHint(args: unknown): string | null {
  if (args == null || typeof args !== "object") return null;
  const path = (args as { path?: unknown }).path;
  return typeof path === "string" ? path : null;
}

function formatToolArgs(args: unknown): string | null {
  if (args == null) return null;
  return typeof args === "string" ? args : JSON.stringify(args, null, 2);
}

function CollapsibleToolRow({
  label,
  meta,
  detail,
  tone = "default",
}: {
  label: string;
  meta?: string;
  detail: string | null;
  tone?: "default" | "error";
}) {
  const [open, setOpen] = useState(false);

  if (!detail) {
    return (
      <div
        className={cn(
          "rounded-md px-2.5 py-2 text-[11px]",
          tone === "error" ? "chat-tool-row-error" : "chat-tool-row"
        )}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-mono font-medium text-foreground/80">{label}</span>
          {meta ? <span>{meta}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[11px] transition-colors",
          tone === "error" ? "chat-tool-row-error" : "chat-tool-row"
        )}
      >
        <span className="font-mono font-medium text-foreground/80">{label}</span>
        {meta ? <span className="truncate">{meta}</span> : null}
        <ChevronDownIcon
          className={cn(
            "ml-auto size-3 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre
          className={cn(
            "mt-1 max-h-32 overflow-auto rounded-md px-2.5 py-1.5 font-mono text-[10px] leading-relaxed whitespace-pre-wrap",
            tone === "error" ? "chat-tool-detail-error" : "chat-tool-detail"
          )}
        >
          {detail}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ToolEventRow({ event }: { event: RunEventPayload }) {
  if (event.eventType === "tool_call") {
    const path = toolPathHint(event.toolArgs);
    return (
      <CollapsibleToolRow
        label={event.toolName ?? "tool"}
        meta={path ?? "input"}
        detail={formatToolArgs(event.toolArgs)}
      />
    );
  }

  if (event.eventType === "tool_result") {
    const meta = [
      event.isError ? "error" : "ok",
      event.durationMs != null ? formatDurationMs(event.durationMs) : null,
    ]
      .filter(Boolean)
      .join(" · ");

    return (
      <CollapsibleToolRow
        label={event.toolName ?? "tool"}
        meta={meta}
        detail={event.toolResult ?? null}
      />
    );
  }

  if (event.eventType === "error") {
    return (
      <CollapsibleToolRow
        label="error"
        tone="error"
        detail={event.content ?? "Run error"}
      />
    );
  }

  return null;
}

export function ChatRunActivity({
  run,
  events,
  onOpenChange,
}: {
  run: RunPayload | null;
  events: RunEventPayload[];
  onOpenChange?: (open: boolean) => void;
}) {
  const active = isActiveRun(run);
  const [open, setOpen] = useState(false);

  const summary = summarizeEvents(events);
  const label = active ? "Activity" : runLabel(run);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger className="chat-run-block flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors">
        <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
        <span className="font-medium tracking-wide uppercase">{label}</span>
        {summary ? <span className="truncate">{summary}</span> : null}
        {run?.iterations ? (
          <span className="ml-auto shrink-0">{run.iterations} steps</span>
        ) : null}
        <ChevronDownIcon
          className={cn(
            "size-3.5 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-1.5 rounded-lg bg-black/[0.015] p-1.5 dark:bg-white/[0.02]">
        {run?.stopReason && run.status !== "SUCCESS" ? (
          <p className="px-1 text-[11px] text-muted-foreground">{run.stopReason}</p>
        ) : null}
        {events.length ? (
          events.map((event, index) => (
            <ToolEventRow
              key={`${event.eventType}-${event.toolCallId ?? event.toolName ?? index}`}
              event={event}
            />
          ))
        ) : (
          <p className="px-1 text-[11px] text-muted-foreground">
            {active ? "Waiting for tool activity…" : "No tool activity recorded."}
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
