const path = require('path');
require('dotenv').config({ path: '../../.env' });
const libPackageJson = require('../../packages/lib/package.json');
const storePackageJson = require('../../packages/store/package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/store", "@repo/lib", "@repo/config", "@repo/utils"],
  output: 'standalone',
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    config.resolve.alias['@repo/config'] = path.resolve(__dirname, '../../packages/config');

    // Dynamic aliases from @repo/lib exports
    if (libPackageJson.exports) {
      Object.keys(libPackageJson.exports).forEach(key => {
        if (key.startsWith('./')) {
          const aliasKey = key.replace('.', '@repo/lib') + '$';
          const targetPath = path.resolve(__dirname, '../../packages/lib', libPackageJson.exports[key]);
          config.resolve.alias[aliasKey] = targetPath;
        }
      });
    }

    // Dynamic aliases from @repo/store exports
    if (storePackageJson.exports) {
      Object.keys(storePackageJson.exports).forEach(key => {
        if (key.startsWith('./')) {
          const aliasKey = key.replace('.', '@repo/store') + '$';
          const targetPath = path.resolve(__dirname, '../../packages/store', storePackageJson.exports[key]);
          config.resolve.alias[aliasKey] = targetPath;
        }
      });
    }

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

  env: {
    NEXT_PUBLIC_MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  }
};

module.exports = nextConfig;