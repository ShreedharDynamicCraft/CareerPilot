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





import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

// Use the authMiddleware from Clerk's server package
export default authMiddleware({
  publicRoutes,
  
  // Custom logic after authentication check
  afterAuth(auth, req) {
    // If the user is not signed in and the route requires authentication
    const isPublicRoute = publicRoutes.some(route => 
      req.nextUrl.pathname === route || 
      req.nextUrl.pathname.startsWith(route)
    );
    
    // Skip auth check for static assets
    const isStaticAsset = req.nextUrl.pathname.match(/\.(jpg|png|svg|css|js|ico|woff|woff2)$/);
    
    if (!auth.userId && !isPublicRoute && !isStaticAsset) {
      return auth.redirectToSignIn({ returnBackUrl: req.url });
    }
    
    return NextResponse.next();
  }
});

// Keep your existing matcher configuration
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};



