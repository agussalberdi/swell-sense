import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables the 'use cache' directive and cacheLife() API.
    // Renamed from dynamicIO in Next.js 16.
    useCache: true,
  },
};

export default nextConfig;
