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
  
  // Environment variables with fallbacks for build time
  env: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/placeholder',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'placeholder-project',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || 'placeholder@placeholder.iam.gserviceaccount.com',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nplaceholder\n-----END PRIVATE KEY-----\n',
  },
};

export default nextConfig;
