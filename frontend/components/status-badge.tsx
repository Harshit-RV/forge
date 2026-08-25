import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SandboxState } from "@/lib/types";

const STATUS_STYLES: Record<SandboxState, { label: string; dot: string }> = {
  CREATING: { label: "Starting", dot: "bg-amber-500 animate-pulse" },
  RUNNING: { label: "Running", dot: "bg-emerald-500" },
  FAILED: { label: "Failed", dot: "bg-destructive" },
  STOPPED: { label: "Stopped", dot: "bg-muted-foreground" },
};

export function StatusBadge({
  state,
  className,
}: {
  state: SandboxState;
  className?: string;
}) {
  const { label, dot } = STATUS_STYLES[state] ?? STATUS_STYLES.STOPPED;

  return (
    <Badge variant="outline" className={cn("gap-1.5 font-mono", className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </Badge>
  );
}
