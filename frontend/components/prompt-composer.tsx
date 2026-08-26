"use client";

import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject } from "@/hooks/use-projects";

const SUGGESTIONS = [
  "Build a markdown notes app with local storage",
  "Create a REST API for a task tracker",
  "Make a landing page with a pricing table",
];

export function PromptComposer() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const createProject = useCreateProject();

  async function submit() {
    const task = prompt.trim();
    if (!task || createProject.isPending) return;

    try {
      const projectId = await createProject.mutateAsync({
        prompt: task,
      });
      router.push(`/projects/${projectId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create project"
      );
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-3xl border bg-card p-2 shadow-sm ring-1 ring-foreground/5 focus-within:border-ring">
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder="Describe what Forge should build…"
          disabled={createProject.isPending}
          className="min-h-24 resize-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="font-mono text-xs text-muted-foreground">
            Enter to start · Shift+Enter for a new line
          </span>
          <Button
            size="icon"
            aria-label="Start build"
            disabled={!prompt.trim() || createProject.isPending}
            onClick={() => void submit()}
          >
            {createProject.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="xs"
            className="rounded-full font-mono text-muted-foreground"
            disabled={createProject.isPending}
            onClick={() => setPrompt(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
