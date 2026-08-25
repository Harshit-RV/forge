"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useFileContent } from "@/hooks/use-files";

export function FileViewer({
  projectId,
  path,
  enabled = true,
}: {
  projectId: string;
  path: string | null;
  enabled?: boolean;
}) {
  const { data, isLoading, error } = useFileContent(projectId, path, enabled);

  if (!enabled) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Start the sandbox to view files.
        </p>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Select a file to view its contents.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 12 }, (_, index) => (
          <Skeleton key={index} className="h-3" style={{ width: `${90 - index * 4}%` }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Could not read file."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b px-3">
        <span className="truncate font-mono text-xs text-muted-foreground">
          {path}
        </span>
        {data?.truncated ? (
          <span className="shrink-0 font-mono text-xs text-amber-600 dark:text-amber-500">
            truncated
          </span>
        ) : null}
      </div>
      <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {data?.content}
      </pre>
    </div>
  );
}
