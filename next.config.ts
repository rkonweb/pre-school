import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
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
  },
  async rewrites() {
    return [
      { source: '/',           destination: '/home.html' },
      { source: '/platform',   destination: '/platform.html' },
      { source: '/pricing',    destination: '/pricing.html' },
      { source: '/about',      destination: '/about.html' },
      { source: '/blog',       destination: '/blog.html' },
      { source: '/curriculum', destination: '/curriculum.html' },
      { source: '/signup',     destination: '/signup.html' },
      { source: '/apply',      destination: '/signup.html' },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ]
  }
};

export default nextConfig;
