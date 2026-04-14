"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

/**
 * Calm error display — never shows stack traces or raw errors.
 */
export function ErrorDisplay({
  title = "Something went wrong",
  message = "We couldn't load this. Please try again.",
  retry,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 rounded-2xl bg-[color:var(--color-rose-50)] p-4 dark:bg-[color:var(--color-rose-500)]/10">
        <AlertCircle
          className="h-8 w-8 text-[var(--destructive)]"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--muted-foreground)]">
        {message}
      </p>
      {retry && (
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="mt-6 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
