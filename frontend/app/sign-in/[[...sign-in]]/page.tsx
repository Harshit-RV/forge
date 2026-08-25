import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4">
      <span className="font-mono text-sm font-semibold tracking-tight">
        forge
      </span>
      <SignIn />
    </div>
  );
}
