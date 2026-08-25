import type { Message } from "@/lib/types";

export function ChatMessage({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-muted px-3.5 py-2 text-sm whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
      <p className="flex-1 text-sm whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}
