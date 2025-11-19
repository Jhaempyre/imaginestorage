import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',  // Export as static HTML
  images: {
    unoptimized: true  // Required for static export
  }
};

export default nextConfig;
