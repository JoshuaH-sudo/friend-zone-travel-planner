import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

const nextConfig: NextConfig = {};

if (process.env.NODE_ENV === 'development') {
  nextConfig.outputFileTracingRoot = path.join(__dirname, '../../')
}

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
