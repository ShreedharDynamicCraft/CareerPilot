import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  // Add any custom middleware logic here if needed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Exclude health check and debug routes from authentication
    "/((?!_next|api/health|api/debug|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(?!/health|/debug)(.*)",
  ],
};