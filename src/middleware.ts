import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/forgotpassword", "/resetpassword"];

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  const isAuthenticated = token && !isJwtExpired(token);

  if (!isAuthenticated && !isPublicRoute) {
    const response = NextResponse.redirect(new URL("/", request.url));
    if (token) response.cookies.delete("auth_token");
    return response;
  }

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)" ],
};
