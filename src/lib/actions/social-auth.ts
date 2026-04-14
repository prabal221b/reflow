"use server";

import { signIn } from "@/lib/auth/config";

export async function loginWithGoogle(callbackUrl: string = "/dashboard") {
  await signIn("google", { redirectTo: callbackUrl });
}
