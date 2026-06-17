import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: require('path').join(__dirname, '../..'),
  serverExternalPackages: [
    '@fixya/api-runtime',
    '@fixya/database',
    'supertest',
    '@nestjs/common',
    '@nestjs/config',
    '@nestjs/core',
    '@nestjs/cqrs',
    '@nestjs/jwt',
    '@nestjs/mapped-types',
    '@nestjs/passport',
    '@nestjs/platform-express',
    '@nestjs/swagger',
    '@nestjs/throttler',
    '@prisma/client',
    'bcrypt',
    'class-transformer',
    'class-validator',
    'express',
    'helmet',
    'passport',
    'passport-jwt',
    'reflect-metadata',
    'uuid',
  ],
  outputFileTracingIncludes: {
    '/api/v1/**': [
      './node_modules/@fixya/api-runtime/**',
      '../../node_modules/@prisma/**',
      '../../node_modules/.prisma/**',
      '../../node_modules/bcrypt/**',
    ],
  },
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
