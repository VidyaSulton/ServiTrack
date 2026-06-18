import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Middleware to protect dashboard routes and API routes.
 * - Unauthenticated users accessing /dashboard/* → redirect to /login
 * - Authenticated users accessing /login or /register → redirect to /dashboard
 * - Unauthenticated API requests (except /api/auth/*) → 401
 */
export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Authenticated users trying to access auth pages → redirect to dashboard
  if (sessionCookie && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated users trying to access dashboard → redirect to login
  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!sessionCookie && pathname.startsWith("/vehicles")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!sessionCookie && pathname.startsWith("/service-logs")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!sessionCookie && pathname.startsWith("/reports")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Unauthenticated API requests (except auth endpoints) → 401
  if (
    !sessionCookie &&
    pathname.startsWith("/api") &&
    !pathname.startsWith("/api/auth")
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please login first." },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vehicles/:path*",
    "/service-logs/:path*",
    "/reports/:path*",
    "/login",
    "/register",
    "/api/vehicles/:path*",
    "/api/service-logs/:path*",
    "/api/reports/:path*",
  ],
};
