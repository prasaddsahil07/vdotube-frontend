import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
