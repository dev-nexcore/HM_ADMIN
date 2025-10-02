/** @type {import('next').NextConfig} */

// Security headers configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Apply security headers specifically to the Admin panel routes
        source: '/admin/:path*', // Adjust the admin panel base path if needed
        headers: securityHeaders,
      },
    ];
  },
  
  // Disable source maps in production for security
  productionBrowserSourceMaps: false,

  // Enable React Strict Mode for additional development warnings
  reactStrictMode: true,

  // Disable ETag generation for security
  generateEtags: false,

  // Security headers for API routes (adjust if needed for admin)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  
  // BasePath and assetPrefix for Admin Panel
  basePath: '/admin', // Adjust the base path for the Admin Panel
  assetPrefix: '/admin/', // Static assets for the Admin Panel
  
  trailingSlash: true, // Ensures that the URLs have trailing slashes
};

export default nextConfig;
