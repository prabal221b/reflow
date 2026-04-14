import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-light text-[var(--muted-foreground)]">404</h1>
      <p className="mt-4 text-lg">Page not found</p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard" className="mt-8">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
