import { cn } from "@/lib/utils/cn";

interface CalmLoadingProps {
  className?: string;
  lines?: number;
}

/**
 * A gentle loading skeleton — single calm pulse, not multiple flashing rectangles.
 */
export function CalmLoading({ className, lines = 3 }: CalmLoadingProps) {
  return (
    <div className={cn("space-y-4 p-1", className)} role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="calm-skeleton h-4 rounded-lg"
          style={{
            width: `${85 - i * 15}%`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Card-shaped loading skeleton
 */
export function CalmCardLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5",
        className
      )}
    >
      <CalmLoading lines={2} />
    </div>
  );
}

/**
 * Full page loading state
 */
export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <CalmLoading lines={4} />
      </div>
    </div>
  );
}
