import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  experimental: {
    // serverActions moved to top level in newer Next.js, but keeping experimental empty if needed
  },
  serverActions: {
    bodySizeLimit: '10mb',
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
