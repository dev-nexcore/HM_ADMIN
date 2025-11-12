import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// These should NOT have /admin prefix since basePath is removed
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
  
  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decoded = jwt.verify(token, process.env.NEXT_SERVER_JWT_SECRET);
      
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId || '');
      requestHeaders.set('x-user-role', decoded.role || '');
      
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      return response;
      
    } catch (error) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('adminToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|photos).*)',
  ],
};