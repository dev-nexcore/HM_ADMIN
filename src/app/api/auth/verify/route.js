import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Prevent caching of this endpoint
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the token from cookies (await is required)
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return new NextResponse(
        JSON.stringify({
          isAuthenticated: false,
          message: 'No authentication token found',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control':
              'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
            'Surrogate-Control': 'no-store',
          },
        }
      );
    }

    const secret = process.env.NEXT_SERVER_JWT_SECRET;
    if (!secret) {
      // Helpful guard to avoid jwt.verify throwing if secret missing
      return new NextResponse(
        JSON.stringify({
          isAuthenticated: false,
          message: 'Server misconfiguration: JWT secret missing',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, secret);

    // Check expiry (jwt.verify already throws on expired, but keeping your explicit check)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return new NextResponse(
        JSON.stringify({
          isAuthenticated: false,
          message: 'Token expired',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return user data if token is valid
    return new NextResponse(
      JSON.stringify({
        isAuthenticated: true,
        adminId: decoded.adminId,
        role: decoded.role || 'user',
        name: decoded.name,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Token verification failed:', error);

    const response = new NextResponse(
      JSON.stringify({
        isAuthenticated: false,
        message: 'Invalid or expired token',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    // Clear the invalid token
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });

    return response;
  }
}
