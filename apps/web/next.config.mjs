import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  experimental: {
    outputFileTracingRoot: path.resolve(__dirname, "../.."),
  },
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  ...(process.env.NODE_ENV === "production"
    ? {
        compiler: {
          removeConsole: { exclude: ["error", "warn"] },
        },
      }
    : {}),
};

export default nextConfig;
