/** @type {import('next').NextConfig} */
const webpack = require("webpack");

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle tesseract.js polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
        encoding: false,
      };
    }

    // Ignore the specific test file that pdf-parse tries to access
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test\/data\/05-versions-space\.pdf$/,
        contextRegExp: /node_modules\/pdf-parse/,
      })
    );

    return config;
  },
};

module.exports = nextConfig;
