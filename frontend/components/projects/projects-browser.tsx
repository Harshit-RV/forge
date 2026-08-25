"use client";

import { SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { ProjectGrid } from "@/components/projects/project-grid";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/use-projects";

export function ProjectsBrowser() {
  const { data: projects, isLoading } = useProjects();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const sorted = projects
      ?.slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const term = query.trim().toLowerCase();
    if (!term) return sorted;

    return sorted?.filter((project) =>
      `${project.title ?? ""} ${project.subtitle ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [projects, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          Projects
        </h1>
        <div className="relative sm:w-72">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects"
            className="pl-9"
          />
        </div>
      </div>

      <ProjectGrid
        projects={filtered}
        isLoading={isLoading}
        skeletonCount={6}
        emptyMessage={
          query.trim()
            ? "No projects match that search."
            : "Start a project from the home page."
        }
      />
    </div>
  );
}
