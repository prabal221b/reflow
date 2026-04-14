import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Reflow — Rebuild Your Focus",
    template: "%s | Reflow",
  },
  description:
    "Rebuild attention span, reduce compulsive checking, and take back control of your focus. A calm, practical tool for digital attention recovery.",
  keywords: [
    "focus",
    "attention",
    "digital wellbeing",
    "social media",
    "productivity",
    "attention span",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
