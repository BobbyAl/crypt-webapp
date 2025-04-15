/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/crypt-webapp',
  images: {
    unoptimized: true,
  },
  env: {
    FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        undici: false,
        'node-fetch': false,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://crypt-webapp.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
