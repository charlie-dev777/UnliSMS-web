import { NextResponse, type NextRequest } from "next/server";
import { HOME_BY_ROLE, SESSION_COOKIE } from "@/lib/auth/constants";
import { unsealSession } from "@/lib/auth/session-cookie";

// Optimistic routing on the sealed session cookie. Layouts and pages re-check
// with `requireUser` / `requireAdmin`, and the OnSim API authorizes every
// data request with the bearer token, so this only saves a render.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const user = unsealSession(cookie)?.user ?? null;
  const to = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    if (cookie && !user) response.cookies.delete(SESSION_COOKIE); // expired or invalid
    return response;
  };

  if (pathname === "/login") return user ? to(HOME_BY_ROLE[user.role]) : NextResponse.next();
  if (!user) return to("/login");
  if (pathname.startsWith("/admin") && user.role !== "ADMIN") return to(HOME_BY_ROLE[user.role]);
  if (USER_ROUTES.some((route) => pathname.startsWith(route)) && user.role !== "USER") return to(HOME_BY_ROLE[user.role]);
  return NextResponse.next();
}

const USER_ROUTES = ["/dashboard", "/gateways", "/messages", "/webhooks", "/api-keys"];

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/gateways/:path*", "/messages/:path*", "/webhooks/:path*", "/api-keys/:path*", "/admin/:path*"],
};
