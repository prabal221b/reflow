import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary)]">
            <Zap className="h-4 w-4 text-[var(--primary-foreground)]" strokeWidth={2} />
          </div>
          <span className="text-lg font-semibold">Reflow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="mx-auto max-w-xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-4 py-1.5 text-sm text-[var(--muted-foreground)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--success)]" />
            Free and private
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Rebuild your
            <span className="block text-[var(--primary)]">attention span</span>
          </h1>

          <p className="mt-6 text-lg text-[var(--muted-foreground)] leading-relaxed">
            A calm, practical tool for reducing compulsive checking,
            protecting deep work, and recovering focus — without quitting 
            social media completely.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="xl">Start your recovery</Button>
            </Link>
            <p className="text-xs text-[var(--muted-foreground)]">
              No credit card · No tracking · Your data stays yours
            </p>
          </div>

          {/* Features grid */}
          <div className="mt-16 grid grid-cols-2 gap-4 text-left md:grid-cols-3">
            {[
              { title: "Tiny focus blocks", desc: "Start with 5 minutes. Build from there." },
              { title: "Social windows", desc: "Use social media on your terms." },
              { title: "Urge capture", desc: "Log urges in 1 tap. See patterns." },
              { title: "No shame", desc: "Relapse recovery, not punishment." },
              { title: "Real progress", desc: "Calm metrics that show trends." },
              { title: "Work protection", desc: "Stop the open-laptop-scroll cycle." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <h3 className="text-sm font-medium">{f.title}</h3>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[var(--muted-foreground)]">
        Built for focus, not engagement.
      </footer>
    </div>
  );
}
