"use client";

import { signIn } from "next-auth/react";

export async function loginWithGoogle(callbackUrl: string = "/dashboard") {
  try {
    await signIn("google", { callbackUrl });
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
}
