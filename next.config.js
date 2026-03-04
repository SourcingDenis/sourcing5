/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    strict: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:8888',
        '*.netlify.app',
        '*.netlify.live',
      ],
    },
  },
  // Optimize for production builds
  swcMinify: true,
  compress: true,
  // Enable SWR for incremental static regeneration
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig
