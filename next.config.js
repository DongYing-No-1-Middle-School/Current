/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://current.yzxgg.xyz/api/:path*', // 代理到目标地址
      },
    ];
  },
}

module.exports = nextConfig
