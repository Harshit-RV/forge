"use client";

import { MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteProject } from "@/hooks/use-projects";
import { relativeTime } from "@/lib/format";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  const deleteProject = useDeleteProject();

  async function onDelete() {
    try {
      await deleteProject.mutateAsync(project.projectId);
      toast.success("Project deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete project"
      );
    }
  }

  return (
    <Card
      size="sm"
      className="group relative transition-colors hover:bg-muted/40"
    >
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <Link
            href={`/projects/${project.projectId}`}
            className="line-clamp-1 flex-1 hover:underline"
          >
            {project.title ?? "Untitled project"}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Project options"
                />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                disabled={deleteProject.isPending}
                onClick={() => void onDelete()}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.subtitle ?? "No description"}
        </p>
      </CardContent>

      <CardFooter>
        <span className="font-mono text-xs text-muted-foreground">
          {relativeTime(project.createdAt)}
        </span>
      </CardFooter>
    </Card>
  );
}
