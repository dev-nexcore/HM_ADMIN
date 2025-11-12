import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// List of protected routes (without /admin prefix since basePath handles it)
const protectedRoutes = [
  '/dashboard',
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

  // Login page - allow without auth
  if (pathname === '/' || pathname === '') {
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
    '/((?!_next/static|_next/image|favicon.ico|photos).*)',
  ],
};