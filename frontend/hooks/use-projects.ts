"use client";

import { useAuth } from "@clerk/nextjs";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateProjectInput, Message, Project } from "@/lib/types";
import { messageKeys } from "./use-messages";
import { useApi } from "./use-api";

export const projectKeys = {
  all: ["projects"] as const,
  detail: (projectId: string) => ["projects", projectId] as const,
};

function upsertMessage(list: Message[], message: Message): Message[] {
  const index = list.findIndex((item) => item._id === message._id);
  if (index < 0) return [...list, message];
  const next = list.slice();
  next[index] = message;
  return next;
}

export function useProjects() {
  const client = useApi();
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => client.projects.list(),
    enabled: isLoaded && !!isSignedIn,
  });
}

export function useProject(projectId: string) {
  const client = useApi();
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => client.projects.get(projectId),
    enabled: isLoaded && !!isSignedIn && !!projectId,
  });
}

export function useCreateProject() {
  const client = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    // Resolves with projectId from the first streamed message so the UI can
    // navigate; the rest of the NDJSON stream keeps upserting into the cache.
    mutationFn: (input: CreateProjectInput) =>
      new Promise<string>((resolve, reject) => {
        let projectId: string | undefined;

        void client.projects
          .create(input, (message) => {
            queryClient.setQueryData<Message[]>(
              messageKeys.list(message.projectId),
              (current) => upsertMessage(current ?? [], message)
            );

            if (projectId) return;
            projectId = message.projectId;

            void queryClient.invalidateQueries({ queryKey: projectKeys.all });
            resolve(projectId);
          })
          .then(() => {
            if (!projectId) {
              reject(new Error("Create stream produced no messages"));
            }
          })
          .catch((error) => {
            if (!projectId) {
              reject(error);
              return;
            }
            toast.error(
              error instanceof Error
                ? error.message
                : "Agent run failed after create"
            );
          });
      }),
  });
}

export function useUpdateProject() {
  const client = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      title,
    }: {
      projectId: string;
      title: string | null;
    }) => client.projects.update(projectId, { title }),
    onMutate: async ({ projectId, title }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) });
      await queryClient.cancelQueries({ queryKey: projectKeys.all });

      const previousDetail = queryClient.getQueryData<Project>(
        projectKeys.detail(projectId)
      );
      const previousList = queryClient.getQueryData<Project[]>(projectKeys.all);

      queryClient.setQueryData<Project>(projectKeys.detail(projectId), (current) =>
        current ? { ...current, title } : current
      );
      queryClient.setQueryData<Project[]>(projectKeys.all, (current) =>
        current?.map((project) =>
          project.projectId === projectId ? { ...project, title } : project
        )
      );

      return { previousDetail, previousList };
    },
    onError: (error, { projectId }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          projectKeys.detail(projectId),
          context.previousDetail
        );
      }
      if (context?.previousList) {
        queryClient.setQueryData(projectKeys.all, context.previousList);
      }
      toast.error(
        error instanceof Error ? error.message : "Could not update title"
      );
    },
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(project.projectId), project);
      queryClient.setQueryData<Project[]>(projectKeys.all, (current) =>
        current?.map((item) =>
          item.projectId === project.projectId ? project : item
        )
      );
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
