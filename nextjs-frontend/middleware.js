import { NextResponse } from "next/server";

export function middleware(request) {
  // Clerk authentication removed due to Edge runtime incompatibility.
  // Add simple rewrites/redirects here if needed in the future.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // You can specify matchers here if you want to run middleware on specific routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};