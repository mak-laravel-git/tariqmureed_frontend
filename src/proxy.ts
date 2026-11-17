import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "tmn_admin_token";

/**
 * Keeps /admin/* behind the Laravel Sanctum session cookie. The token itself is validated
 * by the API on every request; this only avoids rendering admin pages for anonymous visitors.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!request.cookies.get(SESSION_COOKIE)) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);

    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
