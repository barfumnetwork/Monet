/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  // Cloudflare Pages serves static files — no Next.js server available.
  // This project has no API routes / server components that need one,
  // so a static export is the simplest correct target.
  output: "export",
};

module.exports = nextConfig;
