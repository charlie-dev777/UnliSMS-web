import { NextResponse, type NextRequest } from "next/server";
import { HOME_BY_ROLE, MOCK_SESSION_COOKIE } from "@/lib/auth/constants";
import { findMockUserById } from "@/lib/mock-data/accounts";

// Optimistic routing for the Phase 1 mock session. Layouts re-check with
// `requireRole`, so this only saves a render on obvious redirects.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const id = request.cookies.get(MOCK_SESSION_COOKIE)?.value;
  const user = id ? findMockUserById(id) : null;
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (pathname === "/login") return user ? to(HOME_BY_ROLE[user.role]) : NextResponse.next();
  if (!user) return to("/login");
  if (pathname.startsWith("/admin") && user.role !== "ADMIN") return to(HOME_BY_ROLE[user.role]);
  if (pathname.startsWith("/dashboard") && user.role !== "USER") return to(HOME_BY_ROLE[user.role]);
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/admin/:path*"],
};
