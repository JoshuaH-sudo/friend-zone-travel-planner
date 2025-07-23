import type { NextConfig } from 'next';
import path from 'node:path';

const { i18n } = require('./next-i18next.config');

const nextConfig: NextConfig = {
  i18n,
};

if (process.env.NODE_ENV === 'development') {
  nextConfig.outputFileTracingRoot = path.join(__dirname, '../../')
}

export default nextConfig;
