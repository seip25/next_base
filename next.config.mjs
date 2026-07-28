/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  cacheComponents: true,
  serverExternalPackages: ["mysql2", "redis", "bcryptjs", "multer"],
};

export default nextConfig;
