import { Show, SignInButton } from "@clerk/nextjs";
import { HomeDashboard } from "@/components/home-dashboard";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 sm:px-8 sm:py-16">
        <Show
          when="signed-in"
          fallback={
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              <div className="space-y-3">
                <h1 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
                  An autonomous software engineer
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                  Describe a task. Forge plans it, writes the code, runs the
                  tests, debugs the failures, and verifies the result in a real
                  browser.
                </p>
              </div>
              <SignInButton>
                <Button size="lg">Sign in to start</Button>
              </SignInButton>
            </div>
          }
        >
          <HomeDashboard />
        </Show>
      </main>
    </>
  );
}
