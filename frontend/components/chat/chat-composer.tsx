"use client";

import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatComposer({
  onSend,
  disabled,
  pending,
  hint,
}: {
  onSend: (content: string) => void;
  disabled?: boolean;
  pending?: boolean;
  hint?: string;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const content = value.trim();
    if (!content || disabled || pending) return;
    onSend(content);
    setValue("");
  }

  const placeholder = disabled
    ? "Forge is working on the current task…"
    : "Ask Forge to change something…";

  return (
    <div className="shrink-0 border-t bg-background/80 p-3 backdrop-blur-sm">
      <div className="rounded-3xl border bg-card p-1.5 shadow-sm ring-1 ring-foreground/5 focus-within:border-ring">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          disabled={disabled || pending}
          className="min-h-16 resize-none border-0 bg-transparent px-2.5 py-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <div className="flex items-center justify-between px-1 pb-0.5">
          <span className="font-mono text-[11px] text-muted-foreground">
            {hint ?? "Enter to send · Shift+Enter for a new line"}
          </span>
          <Button
            size="icon-sm"
            aria-label="Send message"
            disabled={!value.trim() || disabled || pending}
            onClick={submit}
          >
            {pending ? <Loader2Icon className="animate-spin" /> : <ArrowUpIcon />}
          </Button>
        </div>
      </div>
    </div>
  );
}
