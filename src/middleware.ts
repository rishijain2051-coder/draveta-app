import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default async function middleware(request: NextRequest) {
  // Wrap NextAuth middleware
  const authResponse = await auth()(request as any, {} as any);
  
  // Create a response to manipulate headers
  // If auth middleware returned a redirect or error, use it. Otherwise, proceed.
  const response = authResponse || NextResponse.next();

  // On Vercel, the country is available in the geo object or headers
  const country = request.geo?.country || request.headers.get("x-vercel-ip-country") || "IN";
  
  // Set the country header for the server components to read
  response.headers.set("x-user-country", country);

  return response;
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
