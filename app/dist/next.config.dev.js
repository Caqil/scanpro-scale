"use strict";

/** @type {import('next').NextConfig} */
var nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  basePath: '',
  assetPrefix: 'https://mega-pdf.com/',
  headers: function headers() {
    return regeneratorRuntime.async(function headers$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", [{
              source: "/conversions/:path*",
              headers: [{
                key: "Cache-Control",
                value: "no-store, no-cache"
              }]
            }, {
              source: "/compressions/:path*",
              headers: [{
                key: "Cache-Control",
                value: "no-store, no-cache"
              }]
            }]);

          case 1:
          case "end":
            return _context.stop();
        }
      }
    });
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: function webpack(config) {
    config.resolve.alias.canvas = false;
    return config;
  }
};
module.exports = nextConfig;