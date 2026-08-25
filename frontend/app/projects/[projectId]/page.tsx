import { RedirectToSignIn, Show } from "@clerk/nextjs";
import { Workspace } from "@/components/workspace/workspace";

export default async function ProjectWorkspacePage({
  params,
}: PageProps<"/projects/[projectId]">) {
  const { projectId } = await params;

  return (
    <Show when="signed-in" fallback={<RedirectToSignIn />}>
      <Workspace projectId={projectId} />
    </Show>
  );
}
