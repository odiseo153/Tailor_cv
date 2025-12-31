import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // If you're using strict mode
  images: {
    unoptimized: true, // or remove the images block entirely to allow all domains by default
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  experimental: {
    // No experimental flags needed currently
  },
  webpack: (config: { resolve: { fallback: any; alias?: Record<string, any> }; }) => {
    // Handle Node.js dependencies in browser environment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false, // Provides an empty module for the canvas dependency
      fs: false, // Disable fs module for browser compatibility
      path: false, // Disable path module for browser compatibility
      os: false, // Disable os module for browser compatibility
      'path2d-polyfill': false, // Ignore path2d-polyfill for browser compatibility
    };

    // Force browser-safe builds and stub node-only modules
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: require('path').resolve(__dirname, 'src/shims/canvas-shim.js'),
      'pdfjs-dist/build/pdf': 'pdfjs-dist/legacy/build/pdf',
      'pdfjs-dist': 'pdfjs-dist/legacy/build/pdf',
    };
    return config;
  },
  // Add a custom header for security
  headers: async () => {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

