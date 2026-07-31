import { proxyConfig } from "../proxy.js";

/**
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
  const disallowed = proxyConfig.protectedRoutes.map(route => 
    route.replace(/\(.*?\)/g, "").replace(/\?/g, "")
  );
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallowed,
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sitemap.xml`,
  };
}
