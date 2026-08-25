"use client";

import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-8">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
          forge
        </Link>
        {isSignedIn ? (
          <Link
            href="/projects"
            className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Projects
          </Link>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {isSignedIn ? (
          <UserButton />
        ) : (
          <SignInButton>
            <Button size="sm">Sign in</Button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}
