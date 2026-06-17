import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: require('path').join(__dirname, '../..'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/registro', destination: '/register', permanent: true },
      { source: '/ingresar', destination: '/login', permanent: true },
      { source: '/mis-solicitudes', destination: '/dashboard/solicitudes', permanent: true },
    ];
  },
};

export default nextConfig;
