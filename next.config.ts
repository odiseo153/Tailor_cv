import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true, // If you're using strict mode
  images: {
    unoptimized: true, // or remove the images block entirely to allow all domains by default
  },
  experimental: {
    // appDir flag removed as it's no longer needed in Next.js 15+
  },
  webpack: (config) => {
    // Handle canvas dependency issue by providing empty module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false, // Provides an empty module for the canvas dependency
    };
    return config;
  },
};

export default nextConfig;

