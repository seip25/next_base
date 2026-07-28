import { withAuth } from "../services/middleware.js";

/**
 * Next.js proxy configuration matcher to exclude static assets.
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)",
  ],
};

/**
 * Next.js proxy function enforcing access rules for /dashboard and /login.
 */
export const proxy = withAuth({
  publicRoutes: ["/login"],
  protectedRoutes: ["/dashboard"],
  loginUrl: "/login",
  dashboardUrl: "/dashboard",
});

export default proxy;
