"use client";

import { FileTreeNode } from "@/components/workspace/file-tree-node";
import { Skeleton } from "@/components/ui/skeleton";
import { useFiles } from "@/hooks/use-files";

const ROOT_PATH = "/workspace";

export function FileTree({
  projectId,
  selectedPath,
  onSelect,
  enabled = true,
}: {
  projectId: string;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  enabled?: boolean;
}) {
  const { data: entries, isPending, error } = useFiles(
    projectId,
    ROOT_PATH,
    enabled
  );

  if (!enabled) {
    return (
      <p className="p-3 font-mono text-xs text-muted-foreground">
        Start the sandbox to browse files.
      </p>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-3 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="p-3 font-mono text-xs text-muted-foreground">
        {error instanceof Error ? error.message : "Could not load files."}
      </p>
    );
  }

  if (!entries?.length) {
    return (
      <p className="p-3 font-mono text-xs text-muted-foreground">
        Workspace is empty.
      </p>
    );
  }

  return (
    <div className="py-1">
      {entries.map((entry) => (
        <FileTreeNode
          key={entry.path}
          projectId={projectId}
          entry={entry}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
