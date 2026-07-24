import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  // On Vercel, the country is available in the geo object or headers
  const country = request.geo?.country || request.headers.get("x-vercel-ip-country") || "IN";
  
  // Set the country header for the server components to read
  const response = NextResponse.next();
  response.headers.set("x-user-country", country);

  return response;
});

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
