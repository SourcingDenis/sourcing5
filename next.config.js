/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/sourcing5' : '',
  assetPrefix: isProd ? '/sourcing5/' : '',
  reactStrictMode: true,
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
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
