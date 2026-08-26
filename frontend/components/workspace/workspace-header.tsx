"use client";

import { UserButton } from "@clerk/nextjs";
import { ChevronLeftIcon, PlayIcon, SquareIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project, SandboxState } from "@/lib/types";
import type { useSandboxControls } from "@/hooks/use-sandbox";

type SandboxControls = ReturnType<typeof useSandboxControls>;

export function WorkspaceHeader({
  project,
  state,
  controls,
  starting,
}: {
  project: Project;
  state?: SandboxState;
  controls: SandboxControls;
  starting?: boolean;
}) {
  const { start, stop } = controls;
  const isRunning = state === "RUNNING";

  async function toggle() {
    try {
      await (isRunning ? stop.mutateAsync() : start.mutateAsync());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update sandbox"
      );
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Back to projects"
          render={<Link href="/projects" />}
        >
          <ChevronLeftIcon />
        </Button>
        <span className="truncate font-mono text-sm font-medium">
          {project.title ?? "Untitled project"}
        </span>
        {starting ? (
          <StatusBadge state="CREATING" />
        ) : state ? (
          <StatusBadge state={state} />
        ) : (
          <Skeleton className="h-5 w-20 rounded-full" />
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={
            starting ||
            state === "CREATING" ||
            start.isPending ||
            stop.isPending
          }
          onClick={() => void toggle()}
        >
          {isRunning ? <SquareIcon /> : <PlayIcon />}
          {isRunning ? "Stop" : "Start"}
        </Button>
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  );
}
