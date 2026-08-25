"use client";

import {
  ExternalLinkIcon,
  Loader2Icon,
  RotateCwIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SandboxState } from "@/lib/types";

export function PreviewPanel({
  previewUrl,
  state,
  isLoading,
  error,
}: {
  previewUrl: string | null;
  state?: SandboxState;
  isLoading?: boolean;
  error?: Error | null;
}) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
        <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
          {previewUrl ?? "no preview url"}
        </span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Reload preview"
                disabled={!previewUrl}
                onClick={() => setReloadKey((key) => key + 1)}
              />
            }
          >
            <RotateCwIcon />
          </TooltipTrigger>
          <TooltipContent>Reload</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Open preview in a new tab"
                disabled={!previewUrl}
                onClick={() => {
                  if (previewUrl) {
                    window.open(previewUrl, "_blank", "noopener,noreferrer");
                  }
                }}
              />
            }
          >
            <ExternalLinkIcon />
          </TooltipTrigger>
          <TooltipContent>Open in new tab</TooltipContent>
        </Tooltip>
      </div>

      <div className="min-h-0 flex-1 bg-muted/30">
        <PreviewBody
          previewUrl={previewUrl}
          state={state}
          isLoading={isLoading}
          error={error}
          reloadKey={reloadKey}
        />
      </div>
    </div>
  );
}

function PreviewBody({
  previewUrl,
  state,
  isLoading,
  error,
  reloadKey,
}: {
  previewUrl: string | null;
  state?: SandboxState;
  isLoading?: boolean;
  error?: Error | null;
  reloadKey: number;
}) {
  if (error) {
    return (
      <PreviewNotice
        icon={<TriangleAlertIcon className="size-5 text-destructive" />}
        title="Could not reach the cluster"
        detail={
          error instanceof Error
            ? error.message
            : "Sandbox status is derived from Kubernetes and is unavailable."
        }
      />
    );
  }

  if (isLoading || !state || state === "CREATING") {
    return (
      <PreviewNotice
        icon={<Loader2Icon className="size-5 animate-spin" />}
        title="Starting sandbox"
        detail="Waiting for the pod and dev server to come up."
      />
    );
  }

  if (state === "STOPPED") {
    return (
      <PreviewNotice
        icon={<TriangleAlertIcon className="size-5" />}
        title="Sandbox is not running"
        detail="Idle sandboxes are reclaimed. Starting again builds a fresh sandbox — the previous workspace is not kept."
      />
    );
  }

  if (state === "FAILED") {
    return (
      <PreviewNotice
        icon={<TriangleAlertIcon className="size-5 text-destructive" />}
        title="Sandbox failed"
        detail="Provisioning did not complete. Use Start to try again."
      />
    );
  }

  if (!previewUrl) {
    return (
      <PreviewNotice
        icon={<TriangleAlertIcon className="size-5" />}
        title="No preview available"
        detail="No dev server port has been exposed for this project yet."
      />
    );
  }

  return (
    <iframe
      key={reloadKey}
      src={previewUrl}
      title="Project preview"
      className="size-full border-0 bg-white"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}

function PreviewNotice({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
      {icon}
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-xs">{detail}</p>
    </div>
  );
}
