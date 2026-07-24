import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  // Next.js removed request.geo; on Vercel the country arrives as a request header.
  const country = request.headers.get("x-vercel-ip-country") || "IN";
  
  // Set the country header for the server components to read
  const response = NextResponse.next();
  response.headers.set("x-user-country", country);

  return response;
});

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
