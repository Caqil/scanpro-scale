"use strict";

/** @type {import('next').NextConfig} */
var nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  basePath: '',
  //assetPrefix: 'https://mega-pdf.com/',
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: function webpack(config) {
    config.resolve.alias.canvas = false;
    return config;
  }
};
module.exports = nextConfig;