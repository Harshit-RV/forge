"use client";

import { UserButton } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeftIcon, PlayIcon, SquareIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { projectKeys, useUpdateProject } from "@/hooks/use-projects";
import type { useSandboxControls } from "@/hooks/use-sandbox";
import type { Project, SandboxState } from "@/lib/types";

type SandboxControls = ReturnType<typeof useSandboxControls>;

const TITLE_SAVE_MS = 600;

function normalizeTitle(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

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
        <ProjectTitleInput project={project} />
      </div>

      <div className="flex items-center gap-2">
        {starting ? (
          <StatusBadge state="CREATING" />
        ) : state ? (
          <StatusBadge state={state} />
        ) : (
          <Skeleton className="h-5 w-20 rounded-full" />
        )}
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

function ProjectTitleInput({ project }: { project: Project }) {
  const queryClient = useQueryClient();
  const updateProject = useUpdateProject();
  const [value, setValue] = useState(project.title ?? "");
  const valueRef = useRef(value);
  const savedRef = useRef(normalizeTitle(project.title ?? ""));
  const persistRef = useRef(() => {});
  const projectIdRef = useRef(project.projectId);
  const focusedRef = useRef(false);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    projectIdRef.current = project.projectId;
  }, [project.projectId]);

  useEffect(() => {
    if (focusedRef.current) return;
    setValue(project.title ?? "");
    savedRef.current = normalizeTitle(project.title ?? "");
  }, [project.projectId, project.title]);

  useEffect(() => {
    persistRef.current = () => {
      const next = normalizeTitle(valueRef.current);
      if (next === savedRef.current) return;
      savedRef.current = next;
      updateProject.mutate(
        {
          projectId: projectIdRef.current,
          title: next,
        },
        {
          onError: () => {
            const cached = queryClient.getQueryData<Project>(
              projectKeys.detail(projectIdRef.current)
            );
            savedRef.current = normalizeTitle(cached?.title ?? "");
          },
        }
      );
    };
  }, [queryClient, updateProject]);

  useEffect(() => {
    const timer = window.setTimeout(() => persistRef.current(), TITLE_SAVE_MS);
    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => () => persistRef.current(), []);

  return (
    <Input
      value={value}
      maxLength={120}
      aria-label="Project title"
      placeholder="Untitled project"
      onChange={(event) => {
        const next = event.target.value;
        valueRef.current = next;
        setValue(next);
      }}
      onFocus={() => {
        focusedRef.current = true;
      }}
      onBlur={() => {
        focusedRef.current = false;
        persistRef.current();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          const original = project.title ?? "";
          valueRef.current = original;
          setValue(original);
          event.currentTarget.blur();
        }
      }}
      className="h-7 min-w-0 flex-1 rounded-md border-transparent bg-transparent px-1.5 font-mono text-sm font-medium shadow-none hover:bg-muted/50 focus-visible:border-border focus-visible:bg-muted/50 focus-visible:ring-0"
    />
  );
}
