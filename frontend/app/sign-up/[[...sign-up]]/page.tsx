import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell title="Create an account and start your first Forge build.">
      <div className="flex justify-center">
        <SignUp />
      </div>
    </AuthShell>
  );
}
