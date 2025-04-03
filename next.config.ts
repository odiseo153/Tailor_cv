import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true, // If you're using strict mode
  images: {
    unoptimized: true, // or remove the images block entirely to allow all domains by default
  },
  experimental: {
    appDir: true,
  }
};



export default nextConfig;

