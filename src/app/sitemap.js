import { proxyConfig } from "../proxy.js";

/**
 * @returns {import('next').MetadataRoute.Sitemap}
 */
export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const publicRoutes = proxyConfig.publicRoutes
    .filter(route => !route.includes("("))
    .map(route => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...publicRoutes
  ];
}
