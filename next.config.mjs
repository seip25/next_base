/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ["mysql2", "redis", "bcryptjs", "multer"],
};

export default nextConfig;
