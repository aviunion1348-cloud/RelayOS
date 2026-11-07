import type { NextConfig } from 'next';
const apiOrigin = process.env.RELAYOS_API_ORIGIN || 'http://127.0.0.1:3001';
const config: NextConfig = { allowedDevOrigins: ['127.0.0.1', 'localhost', '*.e2b.app'], async rewrites() { return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }]; } };
export default config;
