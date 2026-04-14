"use server";

import { signIn } from "@/lib/auth/config";

const SAFE_REDIRECTS = new Set([
  "/dashboard",
  "/onboarding",
  "/focus",
  "/metrics",
  "/social",
  "/workday",
  "/settings",
]);

function sanitizeRedirect(url: string): string {
  if (!url) return "/dashboard";
  // Block absolute URLs, protocol-relative, and unknown paths
  if (url.includes("://") || url.startsWith("//")) return "/dashboard";
  if (!url.startsWith("/")) return "/dashboard";
  return SAFE_REDIRECTS.has(url) ? url : "/dashboard";
}

export async function loginWithGoogle(callbackUrl: string = "/dashboard") {
  await signIn("google", { redirectTo: sanitizeRedirect(callbackUrl) });
}
