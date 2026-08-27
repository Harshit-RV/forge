"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatRunActivity } from "@/components/chat/chat-run-activity";
import { ChatWorkingBar } from "@/components/chat/chat-working-bar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ACTIVE_RUN_STATUSES,
  buildChatTimeline,
} from "@/lib/chat-timeline";
import { useMessages, useSendMessage } from "@/hooks/use-messages";

const SCROLL_THRESHOLD_PX = 96;

export function ChatPanel({
  projectId,
}: {
  projectId: string;
}) {
  const { data: messages, isPending, error } = useMessages(projectId);
  const sendMessage = useSendMessage(projectId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const forceScrollRef = useRef(false);
  const expandedRunIdsRef = useRef(new Set<string>());
  const items = messages ?? [];
  const timeline = useMemo(() => buildChatTimeline(items), [items]);

  const activeRunId = useMemo(() => {
    const runMessage = items.find(
      (item) =>
        item.type === "RUN" &&
        item.run != null &&
        ACTIVE_RUN_STATUSES.has(item.run.status)
    );
    return runMessage?.type === "RUN" ? runMessage.run!.runId : null;
  }, [items]);

  const activeRun = activeRunId != null;

  const textScrollKey = items
    .filter((item) => item.type === "TEXT_MESSAGE" || item.type === "RUN")
    .map((item) => `${item._id}:${item.updatedAt ?? item.createdAt}`)
    .join("|");

  const toolScrollKey = items
    .filter((item) => item.type === "RUN_EVENT")
    .map((item) => `${item._id}:${item.updatedAt ?? item.createdAt}`)
    .join("|");

  const isNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      SCROLL_THRESHOLD_PX
    );
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  const onScroll = useCallback(() => {
    stickToBottomRef.current = isNearBottom();
  }, [isNearBottom]);

  const onActivityOpenChange = useCallback((runId: string, open: boolean) => {
    if (open) expandedRunIdsRef.current.add(runId);
    else expandedRunIdsRef.current.delete(runId);
  }, []);

  useEffect(() => {
    if (!stickToBottomRef.current && !forceScrollRef.current) return;
    scrollToBottom(forceScrollRef.current ? "smooth" : "auto");
    forceScrollRef.current = false;
  }, [textScrollKey, sendMessage.isPending, scrollToBottom]);

  useEffect(() => {
    if (!activeRunId || !expandedRunIdsRef.current.has(activeRunId)) return;
    if (!stickToBottomRef.current) return;
    scrollToBottom("auto");
  }, [toolScrollKey, activeRunId, scrollToBottom]);

  async function onSend(content: string) {
    stickToBottomRef.current = true;
    forceScrollRef.current = true;
    try {
      await sendMessage.mutateAsync(content);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send message"
      );
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5"
      >
        {isPending ? (
          <div className="space-y-5">
            <Skeleton className="ml-auto h-12 w-3/4 rounded-2xl" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <p className="pt-8 text-center text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Could not load messages."}
          </p>
        ) : timeline.length ? (
          <div className="space-y-5">
            {timeline.map((entry) => {
              if (entry.kind === "text" && entry.message.textMessage) {
                return (
                  <ChatMessage
                    key={entry.message._id}
                    textMessage={entry.message.textMessage}
                  />
                );
              }
              if (entry.kind === "run-activity") {
                return (
                  <ChatRunActivity
                    key={`run-${entry.runId}`}
                    run={entry.run}
                    events={entry.events}
                    onOpenChange={(open) =>
                      onActivityOpenChange(entry.runId, open)
                    }
                  />
                );
              }
              return null;
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium text-foreground/80">
              No messages yet
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Ask Forge to build or change something in this project.
            </p>
          </div>
        )}
        {!isPending && !error ? <ChatWorkingBar messages={items} /> : null}
      </div>

      <ChatComposer
        onSend={(content) => void onSend(content)}
        pending={sendMessage.isPending}
        disabled={activeRun}
      />
    </div>
  );
}
