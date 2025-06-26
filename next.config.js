/** @type {import('next').NextConfig} */

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;