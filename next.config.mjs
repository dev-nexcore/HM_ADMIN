/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  assetPrefix: '/admin/',   // ensures static assets load correctly
  trailingSlash: true        // helps when deploying in subdirectories
};

export default nextConfig;
