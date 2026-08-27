import { Show } from "@clerk/nextjs";
import { HomeDashboard } from "@/components/home-dashboard";
import { SignedOutHome } from "@/components/signed-out-home";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <Show when="signed-in" fallback={<SignedOutHome />}>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 sm:px-8 sm:py-16">
          <HomeDashboard />
        </main>
      </Show>
    </>
  );
}
