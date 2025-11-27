import type { NextConfig } from "next";
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  // Clean configuration without MDX for now
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactCompiler: true,
  output: 'export',  // Export as static HTML
  images: {
    unoptimized: true  // Required for static export
  }
};

// export default nextConfig;

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})
 
// Merge MDX config with Next.js config
export default withMDX(nextConfig)
