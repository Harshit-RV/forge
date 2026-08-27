import Link from "next/link";
import { PageAtmosphere } from "@/components/page-atmosphere";

export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <PageAtmosphere intensity="full" />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="forge-rise w-full space-y-3 text-center">
          <Link
            href="/"
            className="inline-block font-mono text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            forge
          </Link>
          <p className="forge-rise forge-rise-delay-1 text-sm text-muted-foreground">
            {title}
          </p>
        </div>
        <div className="forge-rise forge-rise-delay-2 w-full">{children}</div>
      </div>
    </main>
  );
}
