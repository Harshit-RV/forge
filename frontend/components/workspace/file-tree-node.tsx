"use client";

import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFiles } from "@/hooks/use-files";
import { cn } from "@/lib/utils";
import type { FileEntry } from "@/lib/types";

export function FileTreeNode({
  projectId,
  entry,
  depth,
  selectedPath,
  onSelect,
}: {
  projectId: string;
  entry: FileEntry;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDirectory = entry.type === "directory";
  const { data: children, isPending } = useFiles(
    projectId,
    entry.path,
    isDirectory && expanded
  );

  return (
    <>
      <button
        type="button"
        onClick={() =>
          isDirectory ? setExpanded((open) => !open) : onSelect(entry.path)
        }
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={cn(
          "flex w-full items-center gap-1.5 py-1 pr-2 text-left font-mono text-xs transition-colors hover:bg-muted",
          selectedPath === entry.path && "bg-muted text-foreground"
        )}
      >
        {isDirectory ? (
          <ChevronRightIcon
            className={cn(
              "size-3 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-90"
            )}
          />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        {isDirectory ? (
          <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{entry.name}</span>
      </button>

      {isDirectory && expanded && !isPending
        ? children?.map((child) => (
            <FileTreeNode
              key={child.path}
              projectId={projectId}
              entry={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))
        : null}

      {isDirectory && expanded && isPending ? (
        <Skeleton
          className="my-1 h-3"
          style={{ marginLeft: `${(depth + 1) * 12 + 22}px`, width: "50%" }}
        />
      ) : null}
    </>
  );
}
