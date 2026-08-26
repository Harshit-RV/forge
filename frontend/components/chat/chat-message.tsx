import type { TextMessagePayload } from "@/lib/types";
import { MarkdownContent } from "@/components/chat/markdown-content";

export function ChatMessage({
  textMessage,
}: {
  textMessage: TextMessagePayload;
}) {
  if (textMessage.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="chat-user-bubble max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
          {textMessage.content}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Forge
      </p>
      <MarkdownContent content={textMessage.content} />
    </div>
  );
}
