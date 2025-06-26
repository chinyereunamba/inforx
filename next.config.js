/** @type {import('next').NextConfig} */
const webpack = require("webpack");

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
  optimizeFonts: false, // disables automatic font fetching
},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        "utf-8-validate": false,
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.ignoreWarnings = [
      {
        module: /@supabase\/realtime-js/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(bufferutil|utf-8-validate)$/,
      })
    );

    return config;
  },
};

module.exports = nextConfig;
