import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // i18n configuration removed as it's not supported in App Router
  // Use app/[locale] pattern instead for internationalization
};

if (process.env.NODE_ENV === 'development') {
  nextConfig.outputFileTracingRoot = path.join(__dirname, '../../')
}

export default nextConfig;
