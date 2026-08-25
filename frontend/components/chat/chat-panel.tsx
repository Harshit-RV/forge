"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessage } from "@/components/chat/chat-message";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import type { SandboxState } from "@/lib/types";

export function ChatPanel({
  projectId,
  state,
}: {
  projectId: string;
  state?: SandboxState;
}) {
  const { data: messages, isLoading, error } = useMessages(projectId);
  const sendMessage = useSendMessage(projectId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  async function onSend(content: string) {
    try {
      await sendMessage.mutateAsync(content);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send message"
      );
    }
  }

  const unavailable = state !== "RUNNING";

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
        ) : messages?.length ? (
          <div className="space-y-5">
            {messages.map((message) => (
              <ChatMessage key={message._id} message={message} />
            ))}
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
        disabled={unavailable}
        pending={sendMessage.isPending}
      />
    </div>
  );
}
