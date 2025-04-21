// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/resume(.*)",
//   "/interview(.*)",
//   "/cover-letter(.*)",
//   "/resume-analyzer(.*)",    
//   "/careerform(.*)",  
// ]);

// export default clerkMiddleware(async (auth, req) => {
//   const { userId } = await auth();

//   if (!userId && isProtectedRoute(req)) {
//     const { redirectToSignIn } = await auth();
//     return redirectToSignIn();
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };




import { NextResponse } from "next/server";

// For Clerk's Edge compatibility
import { createMiddleware } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/api/job-scraper",
  "/job-search",
  "/api/cron/update-industries",
  "/signin",
  "/signup",
  "/sso-callback"
];

// Create a simple middleware function that doesn't rely on unsupported modules
export default function middleware(request) {
  // Check if the path is public
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // Skip auth check for static assets
  const isStaticAsset = request.nextUrl.pathname.match(/\.(jpg|png|svg|css|js|ico|woff|woff2)$/);
  
  // If it's a public route or static asset, allow access
  if (isPublicRoute || isStaticAsset) {
    return NextResponse.next();
  }
  
  // For auth routes, continue
  if (
    request.nextUrl.pathname.startsWith('/signin') || 
    request.nextUrl.pathname.startsWith('/signup')
  ) {
    return NextResponse.next();
  }
  
  // Get auth status from the request (Clerk adds this via Edge middleware)
  const { userId } = request.auth || {};
  
  // If not authenticated and trying to access a protected route, redirect to sign in
  if (!userId) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // Allow authenticated users to access protected routes
  return NextResponse.next();
}

// Keep your existing matcher configuration
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};