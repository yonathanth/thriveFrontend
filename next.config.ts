import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root so a lockfile in a parent folder is not mistaken for it.
  turbopack: { root: __dirname },
};

export default nextConfig;
