import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";

export default function SignInPage() {
  return (
    <AuthShell title="Sign in to plan, build, and preview in a live sandbox.">
      <div className="flex justify-center">
        <SignIn />
      </div>
    </AuthShell>
  );
}
