import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  // Exclude health and debug routes from Clerk auth
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/health") || pathname.startsWith("/api/debug")) {
    return NextResponse.next();
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Only match API routes and app routes, but not static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/api/:path*",
  ],
};