"use client";

import { CodeIcon, MonitorIcon } from "lucide-react";
import Link from "next/link";
import { ChatPanel } from "@/components/chat/chat-panel";
import { PreviewPanel } from "@/components/preview/preview-panel";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodePanel } from "@/components/workspace/code-panel";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { useEnsureSandbox } from "@/hooks/use-ensure-sandbox";
import { useHeartbeat } from "@/hooks/use-heartbeat";
import { useProject } from "@/hooks/use-projects";
import { useSandboxControls, useSandboxStatus } from "@/hooks/use-sandbox";

export function Workspace({ projectId }: { projectId: string }) {
  const { data: project, isPending, error } = useProject(projectId);
  const controls = useSandboxControls(projectId);
  const { isPending: ensuringSandbox } = useEnsureSandbox(projectId, !!project);
  const startingSandbox = ensuringSandbox || controls.start.isPending;
  const {
    data: sandbox,
    isPending: sandboxPending,
    error: sandboxError,
  } = useSandboxStatus(projectId, !!project && !startingSandbox);

  useHeartbeat(projectId, sandbox?.state === "RUNNING");

  if (isPending) {
    return <WorkspaceSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="space-y-1">
          <p className="font-heading text-base font-medium">
            Project not found
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "This project does not exist or is not yours."}
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/projects" />}>
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <WorkspaceHeader
        project={project}
        state={sandbox?.state}
        controls={controls}
        starting={startingSandbox}
      />

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="38%" minSize="25%">
          <ChatPanel projectId={projectId} />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize="62%" minSize="35%">
          <Tabs defaultValue="preview" className="h-full gap-0">
            <div className="flex h-10 shrink-0 items-center border-b px-3">
              <TabsList variant="line">
                <TabsTrigger value="preview">
                  <MonitorIcon />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code">
                  <CodeIcon />
                  Code
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="min-h-0">
              <PreviewPanel
                previewUrl={sandbox?.previewUrl ?? null}
                state={sandbox?.state}
                isLoading={startingSandbox || (sandboxPending && !sandbox)}
                error={startingSandbox ? null : sandboxError}
              />
            </TabsContent>
            <TabsContent value="code" className="min-h-0">
              <CodePanel projectId={projectId} state={sandbox?.state} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b px-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="w-[38%] space-y-4 border-r p-4">
          <Skeleton className="ml-auto h-12 w-3/4 rounded-2xl" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
