import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // If you're using strict mode
  images: {
    unoptimized: true, // or remove the images block entirely to allow all domains by default
  },
};



export default nextConfig;
