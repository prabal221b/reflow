import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/forgot-password"]);
const AUTH_ONLY_PATHS = new Set(["/login", "/register"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Always allow auth callback endpoints to pass through
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Redirect logged-in users away from auth pages
  if (AUTH_ONLY_PATHS.has(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect all non-public routes
  if (!PUBLIC_PATHS.has(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    if (!pathname.startsWith("/api/")) {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
