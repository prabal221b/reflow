"use client";

import { ThemeProvider, useTheme } from "./theme-provider";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ToasterProvider />
    </ThemeProvider>
  );
}

function ToasterProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-center"
      theme={resolvedTheme}
      expand={true}
      richColors
      closeButton
      visibleToasts={3}
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          backdropFilter: "blur(8px)",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 500,
        },
      }}
    />
  );
}
