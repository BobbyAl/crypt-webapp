/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Comment out for development
  images: {
    unoptimized: true,
  },
  basePath: '/crypt-webapp',
  assetPrefix: '/crypt-webapp/',
  trailingSlash: true,
}

module.exports = nextConfig
