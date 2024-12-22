const flask_backend = 'http://localhost:5000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${flask_backend}/api/:path*`,
      },
      // Compatible Layer
      {
        source: '/sudo',
        destination: `${flask_backend}/sudo`,
      },
      {
        source: '/static/:path*',
        destination: `${flask_backend}/static/:path*`,
      },
      {
        source: '/management/:path*',
        destination: `${flask_backend}/management/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
