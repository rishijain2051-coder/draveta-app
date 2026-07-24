import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Private /b2b areas. /b2b/apply is a public marketing/application page and is
// intentionally NOT listed here.
const B2B_PROTECTED = ["/b2b/dashboard", "/b2b/cart", "/b2b/orders"];

export default auth((request) => {
  const { nextUrl } = request;
  const { pathname } = nextUrl;
  const role = request.auth?.user?.role;

  // Route guards. The custom-function form of `auth()` does NOT apply the
  // `authorized` callback, so protection is enforced here explicitly.
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (B2B_PROTECTED.some((p) => pathname.startsWith(p)) && role !== "B2B") {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Next.js removed request.geo; on Vercel the country arrives as a request header.
  const response = NextResponse.next();
  response.headers.set(
    "x-user-country",
    request.headers.get("x-vercel-ip-country") || "IN"
  );
  return response;
});

export const config = {
  // Apply to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
