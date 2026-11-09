import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@mini-otl/contracts'],
  devIndicators: false,
};

export default config;
