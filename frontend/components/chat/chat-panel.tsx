"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatRunEventRow, ChatRunRow } from "@/components/chat/chat-run-rows";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessages, useSendMessage } from "@/hooks/use-messages";

export function ChatPanel({
  projectId,
}: {
  projectId: string;
}) {
  const { data: messages, isLoading, error } = useMessages(projectId);
  const sendMessage = useSendMessage(projectId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const items = messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [items.length]);

  async function onSend(content: string) {
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
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="ml-auto h-12 w-3/4 rounded-2xl" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <p className="pt-8 text-center text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Could not load messages."}
          </p>
        ) : items.length ? (
          <div className="space-y-4">
            {items.map((item) => {
              if (item.type === "TEXT_MESSAGE" && item.textMessage) {
                return (
                  <ChatMessage key={item._id} textMessage={item.textMessage} />
                );
              }
              if (item.type === "RUN" && item.run) {
                return <ChatRunRow key={item._id} run={item.run} />;
              }
              if (item.type === "RUN_EVENT" && item.runEvent) {
                return (
                  <ChatRunEventRow key={item._id} event={item.runEvent} />
                );
              }
              return null;
            })}
            <div ref={bottomRef} />
          </div>
        ) : (
          <p className="pt-8 text-center text-sm text-muted-foreground">
            No messages yet.
          </p>
        )}
      </div>

      <ChatComposer
        onSend={(content) => void onSend(content)}
        pending={sendMessage.isPending}
      />
    </div>
  );
}
