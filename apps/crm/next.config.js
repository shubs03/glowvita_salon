const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const libPackageJson = require('../../packages/lib/package.json');
const storePackageJson = require('../../packages/store/package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    instrumentationHook: true,
  },
  serverExternalPackages: ['html-pdf-node', 'inline-css'],
  transpilePackages: ["@repo/ui", "@repo/store", "@repo/lib", "@repo/config"],

  // ─── Proxy /uploads/* to the admin app (port 3002) ───────────────────────
  // All uploaded images (templates, etc.) are stored in apps/admin/public/uploads
  // and served by the admin dev server on port 3002.
  // Existing DB records may have the URL saved as http://localhost:3001/uploads/…
  // (the wrong port). The TemplateCanvasThumbnail rewrites absolute URLs to the
  // current origin, so requests land here on port 3001. These rewrites forward
  // them to the admin server so images display without any file copy/move.
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3002/uploads/:path*',
      },
    ];
  },

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
          'html-pdf': 'commonjs html-pdf',
          'node-cron': 'commonjs node-cron',
        },
      ];
    }

    return config;
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
        hostname: 'glowvitasalon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'v2winonline.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
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
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
  },
};

module.exports = nextConfig;