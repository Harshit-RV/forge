"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    label: "01",
    title: "Describe the app",
    body: "A short prompt is enough. Forge turns it into a plan and starts coding.",
  },
  {
    label: "02",
    title: "Watch it build",
    body: "Code lands in an isolated sandbox with a live preview you can open anytime.",
  },
  {
    label: "03",
    title: "Iterate in chat",
    body: "Ask for changes, fixes, or polish. The same workspace keeps going.",
  },
] as const;

export function SignedOutHome() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 landing-atmosphere"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 landing-grid opacity-[0.35] dark:opacity-[0.22]"
      />

      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <div className="flex flex-col items-start text-left">
          <p className="landing-rise font-mono text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            forge
          </p>
          <h1 className="landing-rise landing-rise-delay-1 mt-5 max-w-lg font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            An autonomous software engineer
          </h1>
          <p className="landing-rise landing-rise-delay-2 mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
            Describe a task. Forge plans, writes, runs, and verifies the code in
            a live sandbox with a real preview.
          </p>
          <div className="landing-rise landing-rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <SignInButton>
              <Button size="lg">Sign in to start</Button>
            </SignInButton>
            <SignUpButton>
              <Button size="lg" variant="outline">
                Create account
              </Button>
            </SignUpButton>
          </div>
        </div>

        <div className="landing-rise landing-rise-delay-2 w-full lg:justify-self-end">
          <WorkspacePreview />
        </div>
      </section>

      <section className="relative border-t bg-background/60 backdrop-blur-[2px]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-3 md:gap-8">
          {STEPS.map((step) => (
            <div key={step.label} className="space-y-3">
              <p className="font-mono text-xs tracking-wider text-primary">
                {step.label}
              </p>
              <h2 className="font-heading text-lg font-medium tracking-tight">
                {step.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function WorkspacePreview() {
  return (
    <div
      aria-hidden
      className="relative overflow-hidden rounded-xl border border-foreground/10 bg-background/80 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.45)] ring-1 ring-foreground/5 backdrop-blur-sm dark:bg-background/50"
    >
      <div className="flex h-9 items-center gap-2 border-b border-foreground/8 px-3">
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
          app-demo.forge.harshitrv.com
        </span>
      </div>

      <div className="grid grid-cols-[42%_1fr]">
        <div className="flex flex-col gap-3 border-r border-foreground/8 bg-muted/30 p-3 sm:p-4">
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Chat
            </p>
            <div className="rounded-lg bg-foreground/4 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">
              Build a notes app with folders and markdown.
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-muted-foreground">Forge</p>
            <div className="space-y-1.5 text-[11px] leading-snug text-foreground/80">
              <p>Planning the workspace…</p>
              <p className="chat-shimmer-text font-mono text-[10px]">
                write_file · App.tsx
              </p>
              <p className="chat-shimmer-text font-mono text-[10px]">
                restart_dev_server
              </p>
            </div>
          </div>
          <div className="mt-auto rounded-md border border-foreground/8 bg-background/70 px-2 py-1.5 font-mono text-[10px] text-muted-foreground">
            Ask Forge to change something…
          </div>
        </div>

        <div className="relative flex flex-col bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_55%)] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Preview
            </p>
            <span className="font-mono text-[10px] text-primary">RUNNING</span>
          </div>
          <div className="flex flex-1 flex-col rounded-lg border border-foreground/10 bg-background/90 p-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-foreground/8 pb-2">
              <span className="text-xs font-medium tracking-tight">Notes</span>
              <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] text-primary">
                New
              </span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-2 w-3/4 rounded bg-foreground/10" />
              <div className="h-2 w-full rounded bg-foreground/8" />
              <div className="h-2 w-5/6 rounded bg-foreground/8" />
              <div className="mt-4 h-16 rounded-md border border-dashed border-foreground/12 bg-muted/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
