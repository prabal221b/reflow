import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/connection";
import User from "@/lib/db/models/user";
import { Sidebar, BottomNav } from "@/components/layout/navigation";
import { UrgeFab } from "@/components/layout/urge-fab";
import { AppProviders } from "@/components/providers/app-providers";

export const unstable_instant = false;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const user = await User.findById(session.user.id).lean();

  if (user && !user.onboarding?.completed) {
    redirect("/onboarding");
  }

  return (
    <AppProviders>
      <div className="min-h-screen">
        <Sidebar />
        <main className="lg:pl-[var(--sidebar-width)]">
          <div className="mx-auto max-w-3xl px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">
            {children}
          </div>
        </main>
        <BottomNav />
        <UrgeFab />
      </div>
    </AppProviders>
  );
}
