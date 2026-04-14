import { NextResponse } from "next/server";
import { auth } from "./lib/auth/config";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/api/auth"];
const authRoutes = ["/login", "/register"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Redirect legacy auth paths to new locations
  if (pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname === "/auth/register") {
    return NextResponse.redirect(new URL("/register", req.url));
  }
  
  // Skip static files, internal next routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // req.auth is populated by the auth() wrapper
  const isAuthenticated = !!req.auth;
  
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  console.log(`MW: ${pathname} | Auth: ${isAuthenticated}`);
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect non-public routes
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
