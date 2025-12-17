import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/lib", "@repo/store"],
  webpack: (config) => {
    config.resolve.alias['@repo/lib'] = path.resolve(__dirname, '../packages/lib/src');
    config.resolve.alias['@repo/store'] = path.resolve(__dirname, '../packages/store/src');
    return config;
  },
};

export default nextConfig;