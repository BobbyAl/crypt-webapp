/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static exports
  images: {
    unoptimized: true, // Required for static export
  },
  basePath: '/crypt-webapp', // Will be the name of your GitHub repository
  assetPrefix: '/crypt-webapp/', // Will be the name of your GitHub repository
}

module.exports = nextConfig 