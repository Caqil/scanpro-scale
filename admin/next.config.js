/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enables React Strict Mode for better development experience
  swcMinify: true, // Uses SWC for faster minification
  eslint: {
    ignoreDuringBuilds: true,
  },
 
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'], // Enables SVG imports as React components
    });
    return config;
  },
};

module.exports = nextConfig;