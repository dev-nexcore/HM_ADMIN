/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  assetPrefix: '/admin',
  trailingSlash: true,
  // This is important - tells Next.js to output standalone build
  output: 'standalone'
};

export default nextConfig;