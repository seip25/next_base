import { NextResponse } from "next/server";
import { Auth } from "./auth.js";

/**
 * Authentication proxy helper class for Next.js proxy.js handler.
 */
export class AuthProxy {
  /**
   * Higher order proxy wrapper for route protection and session redirects.
   * @param {Object} [config]
   * @param {Array<string>} [config.publicRoutes=["/login", "/register", "/public"]]
   * @param {Array<string>} [config.protectedRoutes=["/dashboard"]]
   * @param {string} [config.loginUrl="/login"]
   * @param {string} [config.dashboardUrl="/dashboard"]
   * @param {string} [config.cookieName="session"]
   * @returns {function(import('next/server').NextRequest): Promise<import('next/server').NextResponse>}
   */
  static withAuth(config = {}) {
    const {
      publicRoutes = ["/login", "/register"],
      protectedRoutes = ["/dashboard"],
      loginUrl = "/login",
      dashboardUrl = "/dashboard",
      cookieName = process.env.COOKIE_NAME || "session",
    } = config;

    return async function proxy(request) {
      const { pathname } = request.nextUrl;
      const token = request.cookies.get(cookieName)?.value;
      const session = token ? await Auth.verifyJWT(token) : null;

      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      const isAuthPage = publicRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isProtectedRoute && !session) {
        const redirectUrl = new URL(loginUrl, request.url);
        redirectUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      if (isAuthPage && session) {
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }

      return NextResponse.next();
    };
  }
}

export const withAuth = AuthProxy.withAuth;
