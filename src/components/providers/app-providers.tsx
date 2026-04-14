"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      // Disable polling — server components handle auth for data fetching.
      // SessionProvider is only needed for client-side signOut().
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  );
}
