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
  i18n: {
    // Configuración de i18n
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'zh'],
    // No configuramos localeDetection a true para gestionarlo manualmente
    localeDetection: false,
  },
  experimental: {
    // No experimental flags needed currently
  },
  webpack: (config: { resolve: { fallback: any; }; }) => {
    // Handle canvas dependency issue by providing empty module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false, // Provides an empty module for the canvas dependency
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

