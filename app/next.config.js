/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  basePath: '',
  //assetPrefix: 'https://mega-pdf.com/',
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
}
module.exports = nextConfig;
