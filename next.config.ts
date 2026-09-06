import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Note: /uploads/* → /api/uploads/* is handled by src/middleware.ts
  // (more reliable in standalone mode than next.config rewrites)
};

export default nextConfig;
