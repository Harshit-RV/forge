"use client";

import Link from "next/link";
import { PromptComposer } from "@/components/prompt-composer";
import { ProjectGrid } from "@/components/projects/project-grid";
import { useProjects } from "@/hooks/use-projects";

const RECENT_LIMIT = 6;

export function HomeDashboard() {
  const { data: projects, isLoading } = useProjects();

  const recent = projects
    ?.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RECENT_LIMIT);

  return (
    <div className="w-full space-y-12">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-medium tracking-tight sm:text-3xl">
            What should Forge build?
          </h1>
          <p className="text-sm text-muted-foreground">
            Forge plans, writes, runs and verifies the code in an isolated
            sandbox.
          </p>
        </div>
        <PromptComposer />
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-mono text-sm font-medium text-muted-foreground">
            Recent projects
          </h2>
          {projects && projects.length > RECENT_LIMIT ? (
            <Link
              href="/projects"
              className="font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          ) : null}
        </div>
        <ProjectGrid projects={recent} isLoading={isLoading} />
      </section>
    </div>
  );
}
