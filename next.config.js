/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      // Compatible Layer
      {
        source: '/sudo',
        destination: 'http://localhost:5000/sudo',
      },
      {
        source: '/static/:path*',
        destination: 'http://localhost:5000/static/:path*',
      },
      {
        source: '/management/:path*',
        destination: 'http://localhost:5000/management/:path*',
      },
    ];
  },
}

module.exports = nextConfig
