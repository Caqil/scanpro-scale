/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  //output: 'standalone',
  async headers() {
    return [
      {
        source: "/conversions/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, no-cache" }],
      },
      {
        source: "/compressions/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, no-cache" }],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
}
module.exports = nextConfig;
