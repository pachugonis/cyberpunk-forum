import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-avatar', '@radix-ui/react-dialog'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // User uploads must never execute as active content on our origin
        source: '/uploads/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'none'; sandbox" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
