"use client";

import { NoProjectsCard } from "@/components/projects/no-projects-card";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectCardSkeleton } from "@/components/projects/project-card-skeleton";
import type { Project } from "@/lib/types";

export function ProjectGrid({
  projects,
  isLoading,
  skeletonCount = 3,
  emptyMessage,
}: {
  projects?: Project[];
  isLoading: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        Array.from({ length: skeletonCount }, (_, index) => (
          <ProjectCardSkeleton key={index} />
        ))
      ) : projects?.length ? (
        projects.map((project) => (
          <ProjectCard key={project.projectId} project={project} />
        ))
      ) : (
        <NoProjectsCard message={emptyMessage} />
      )}
    </div>
  );
}
