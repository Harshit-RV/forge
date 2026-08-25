"use client";

import { useAuth } from "@clerk/nextjs";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { CreateProjectInput, Project } from "@/lib/types";
import { useApi } from "./use-api";

export const projectKeys = {
  all: ["projects"] as const,
  detail: (projectId: string) => ["projects", projectId] as const,
};

export function useProjects() {
  const client = useApi();
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => client.projects.list(),
    enabled: !!isSignedIn,
  });
}

export function useProject(projectId: string) {
  const client = useApi();
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => client.projects.get(projectId),
    enabled: !!isSignedIn && !!projectId,
  });
}

export function useCreateProject() {
  const client = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      client.projects.create(input),
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(project.projectId), project);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useDeleteProject() {
  const client = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => client.projects.remove(projectId),
    onSuccess: (_result, projectId) => {
      queryClient.setQueryData<Project[]>(projectKeys.all, (previous) =>
        previous?.filter((project) => project.projectId !== projectId)
      );
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}
