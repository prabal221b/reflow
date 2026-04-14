import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Reusable empty state with icon, message, and optional CTA.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-2xl bg-[var(--muted)] p-4">
          <Icon className="h-8 w-8 text-[var(--muted-foreground)]" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-lg font-medium text-[var(--foreground)]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-[var(--muted-foreground)]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
