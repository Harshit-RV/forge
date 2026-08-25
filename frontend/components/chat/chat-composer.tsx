"use client";

import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatComposer({
  onSend,
  disabled,
  pending,
}: {
  onSend: (content: string) => void;
  disabled?: boolean;
  pending?: boolean;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const content = value.trim();
    if (!content || disabled || pending) return;
    onSend(content);
    setValue("");
  }

  return (
    <div className="shrink-0 border-t p-3">
      <div className="rounded-2xl border bg-card p-1.5 focus-within:border-ring">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Ask Forge to change something…"
          disabled={disabled}
          className="min-h-16 resize-none border-0 bg-transparent px-2.5 py-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <div className="flex justify-end px-1 pb-0.5">
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
