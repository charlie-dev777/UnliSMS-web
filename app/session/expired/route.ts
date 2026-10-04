import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Ends a web session the OnSim API has rejected (HTTP 401). See `SESSION_EXPIRED_PATH`.
 * The redirect target has no session cookie, so /login renders instead of bouncing back.
 */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login?expired=1", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
