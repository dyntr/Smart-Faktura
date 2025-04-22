import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sjc.microlink.io',
      },
    ],
  },
};

export default nextConfig;
