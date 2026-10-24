import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.charitydraws.co.uk",
      },
      {
        protocol: "https",
        hostname: "charitydraws.co.uk",
      },
      {
        protocol: "https",
        hostname: "**.charitydraws.co.uk",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  async rewrites() {
    // We proxy /api/v1 to the backend to avoid cross-origin cookie & CORS issues.
    const isProd = process.env.NODE_ENV === 'production';
    const rawBackendUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (isProd ? 'https://api.charitydraws.co.uk/api/v1' : 'http://localhost:5000/api/v1');

    // In production, if backendUrl points to localhost/127.0.0.1, fallback to official production API
    const backendUrl =
      isProd && (rawBackendUrl.includes('localhost') || rawBackendUrl.includes('127.0.0.1'))
        ? 'https://api.charitydraws.co.uk/api/v1'
        : rawBackendUrl;

    // Ensure we don't end up with double slashes if backendUrl has a trailing slash
    const normalizedBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    const uploadsBaseUrl = normalizedBackendUrl.replace(/\/api\/v1\/?$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${normalizedBackendUrl}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${uploadsBaseUrl}/uploads/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/verified-charities',
        destination: '/verified-hosts',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
