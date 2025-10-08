require('dotenv').config({ path: '../../.env' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_SECRET_USER: process.env.JWT_SECRET_USER,
    JWT_SECRET_ADMIN: process.env.JWT_SECRET_ADMIN,
    JWT_SECRET_VENDOR: process.env.JWT_SECRET_VENDOR,
    JWT_SECRET_DOCTOR: process.env.JWT_SECRET_DOCTOR,
    JWT_SECRET_SUPPLIER: process.env.JWT_SECRET_SUPPLIER,
    // Add other environment variables as needed
  },
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;