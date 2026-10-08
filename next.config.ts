import type { NextConfig } from "next";

// Set in the GitHub Pages workflow: static export served under /<repo-name>.
const basePath = process.env.PAGES_BASE_PATH;

const nextConfig: NextConfig = {
  ...(basePath !== undefined && { output: "export", basePath, images: { unoptimized: true } }),
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
