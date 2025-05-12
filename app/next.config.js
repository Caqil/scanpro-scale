/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  basePath: '',
  assetPrefix: process.env.NEXT_PUBLIC_APP_URL,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
}
module.exports = nextConfig;
