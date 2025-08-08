import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Prevent caching of this endpoint
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get the token from cookies
    const token = cookies().get('adminToken')?.value;
    
    if (!token) {
      return new NextResponse(
        JSON.stringify({ 
          isAuthenticated: false,
          message: 'No authentication token found' 
        }),
        { 
          status: 200, // Return 200 to handle the response in the client
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          }
        }
      );
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.NEXT_SERVER_JWT_SECRET);
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return new NextResponse(
        JSON.stringify({ 
          isAuthenticated: false,
          message: 'Token expired' 
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Return user data if token is valid
    return new NextResponse(
      JSON.stringify({
        isAuthenticated: true,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user',
        name: decoded.name
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
    
  } catch (error) {
    console.error('Token verification failed:', error);
    
    // Clear the invalid token
    const response = new NextResponse(
      JSON.stringify({ 
        isAuthenticated: false,
        message: 'Invalid or expired token' 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    // Clear the cookie if it's invalid
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
