/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/lib", "@repo/store"],
  webpack: (config) => {
    config.resolve.alias['@repo/lib'] = require('path').resolve(__dirname, '../packages/lib/src');
    config.resolve.alias['@repo/store'] = require('path').resolve(__dirname, '../packages/store/src');
    return config;
  },
};

export default nextConfig;
