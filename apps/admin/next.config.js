require('dotenv').config({ path: '../../.env' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    // Handle canvas.node binary files
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    });
    
    // For server-side builds, provide a fallback for canvas
    if (isServer) {
      config.externals = [
        ...config.externals,
        {
          canvas: 'commonjs canvas',
        },
      ];
    }
    
    return config;
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Admin-Authorization, Vendor-Authorization" },
        ]
      }
    ]
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
        hostname: 'v2winonline.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
  }
};

module.exports = nextConfig;