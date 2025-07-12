import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'ycateewdtuuajwqvjrwu.supabase.co',
    ],
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  /* config options here */
};

export default nextConfig;
