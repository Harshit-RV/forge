"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileTree } from "@/components/workspace/file-tree";
import { FileViewer } from "@/components/workspace/file-viewer";
import type { SandboxState } from "@/lib/types";

export function CodePanel({
  projectId,
  state,
}: {
  projectId: string;
  state?: SandboxState;
}) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const running = state === "RUNNING";

  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel defaultSize="30%" minSize="18%">
        <div className="h-full overflow-y-auto">
          <FileTree
            projectId={projectId}
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
            enabled={running}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="70%" minSize="40%">
        <FileViewer
          projectId={projectId}
          path={selectedPath}
          enabled={running}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
