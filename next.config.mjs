/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  assetPrefix: '/admin',  // Remove the trailing slash
  trailingSlash: true
};

export default nextConfig;