import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/payment"];

// Routes that must NOT be accessible when authenticated
const AUTH_ONLY_ROUTES = ["/login", "/register", "/verify-email"];

// Role-to-dashboard prefix mapping
const ROLE_DASHBOARD_PREFIX: Record<string, string> = {
  CUSTOMER: "/dashboard/customer",
  COURIER: "/dashboard/courier",
  HUB_MANAGER: "/dashboard/hub",
  OPERATIONS_MANAGER: "/dashboard/operations",
  ADMIN: "/dashboard/admin",
};

// Dashboard sections each role may access
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  CUSTOMER: ["/dashboard/customer", "/payment"],
  COURIER: ["/dashboard/courier", "/dashboard/customer/notifications"],
  HUB_MANAGER: ["/dashboard/hub", "/dashboard/customer/notifications"],
  OPERATIONS_MANAGER: [
    "/dashboard/operations",
    "/dashboard/customer/notifications",
  ],
  ADMIN: [
    "/dashboard/admin",
    "/dashboard/customer/notifications",
    "/payment",
  ],
};

/**
 * Lightweight middleware: reads the access token from localStorage is not possible
 * in middleware (server-side). Instead we read from a cookie that we set on login.
 * 
 * The frontend sets a non-HttpOnly "logiflow_role" cookie purely for routing hints.
 * ACTUAL security enforcement is always done by the backend on every API call.
 * The middleware is a UX guard only — it prevents rendering protected page shells
 * before the API call completes.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get("logiflow_token")?.value;
  const role = request.cookies.get("logiflow_role")?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );
  const isAuthOnly = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !accessToken) {
    const returnTo = encodeURIComponent(pathname);
    const loginUrl = new URL(`/login?returnTo=${returnTo}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthOnly && accessToken && role) {
    const dashboardPath =
      ROLE_DASHBOARD_PREFIX[role] ?? "/dashboard";
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Role-based dashboard access guard
  if (pathname.startsWith("/dashboard") && role) {
    const allowed = ROLE_ALLOWED_PREFIXES[role] ?? [];
    const hasAccess = allowed.some((p) => pathname.startsWith(p));
    if (!hasAccess && pathname !== "/dashboard") {
      // Redirect to the user's own dashboard root
      const ownDashboard = ROLE_DASHBOARD_PREFIX[role] ?? "/dashboard";
      return NextResponse.redirect(new URL(ownDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)",
  ],
};
