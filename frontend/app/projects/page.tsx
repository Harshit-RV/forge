import { Show, SignInButton } from "@clerk/nextjs";
import { ProjectsBrowser } from "@/components/projects/projects-browser";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 sm:px-8">
        <Show
          when="signed-in"
          fallback={
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <p className="text-sm text-muted-foreground">
                Sign in to see your projects.
              </p>
              <SignInButton>
                <Button>Sign in</Button>
              </SignInButton>
            </div>
          }
        >
          <ProjectsBrowser />
        </Show>
      </main>
    </>
  );
}
