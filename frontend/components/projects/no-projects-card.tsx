import { HammerIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function NoProjectsCard({ message }: { message?: string }) {
  return (
    <Card className="col-span-full border-dashed bg-transparent shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <HammerIcon className="size-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-heading text-base font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground">
            {message ?? "Describe a task above and Forge will start building."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
