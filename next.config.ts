import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Updated for Next.js 16
  serverExternalPackages: ['mongoose'],
  
  // Configure Turbopack (Next.js 16 default)
  turbopack: {},
  
  // Skip build-time static generation for API routes
  async generateBuildId() {
    return 'build-' + Date.now();
  },
  
  // Environment variables with fallback for build time
  env: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/placeholder',
  },
};

export default nextConfig;
