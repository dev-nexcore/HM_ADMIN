import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// List of public routes that don't require authentication
const publicRoutes = ['/', '/forget-password', '/unauthorized'];

// List of protected routes that require authentication
const protectedRoutes = [
  '/admin/dashboard',
  '/management',
  '/inventory',
  '/inspection',
  '/invoices',
  '/leave-requests',
  '/notices',
  '/profile',
  '/refunds',
  '/staffallotment',
  '/staffsalary',
  '/tickets',
  '/api/admin'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('adminToken')?.value;

  // Skip middleware for public routes
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Handle protected routes
  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.NEXT_SERVER_JWT_SECRET);
      
      // Check if user has required role (if needed)
      // if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
      //   return NextResponse.redirect(new URL('/unauthorized', request.url));
      // }
      
      // Clone the request headers and add user info
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId || '');
      requestHeaders.set('x-user-role', decoded.role || '');
      
      // Add security headers to all responses
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
      // Security Headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      // Add CSP header
    response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' kokanglobal.org; style-src 'self' 'unsafe-inline' kokanglobal.org; img-src 'self' data: blob: kokanglobal.org; font-src 'self' kokanglobal.org; connect-src 'self' " + 
  `${process.env.NEXT_PUBLIC_PROD_API_URL || ''}; frame-ancestors 'none'; form-action 'self'; base-uri 'self';`
);


      return response;
      
    } catch (error) {
      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('adminToken');
      return response;
    }
  }

  // For all other routes, continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};