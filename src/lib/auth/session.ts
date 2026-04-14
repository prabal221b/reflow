import { auth } from "./config";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated session, or redirect to login
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

/**
 * Get the current session without redirecting (for optional auth)
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user ID or throw
 */
export async function requireUserId(): Promise<string> {
  const session = await requireAuth();
  return session.user.id;
}
