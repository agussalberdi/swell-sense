import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables the 'use cache' directive and cacheLife() API.
    // Renamed from dynamicIO in Next.js 16.
    useCache: true,
  },
  images: {
    remotePatterns: [
      {
        // Google profile pictures (OAuth avatars)
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
