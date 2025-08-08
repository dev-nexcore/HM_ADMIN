import { NextResponse } from 'next/server';
import { rateLimiter, checkAccountLockout, recordFailedAttempt, resetFailedAttempts } from '@/utils/rateLimit';

// Mock user data - In production, replace with database queries
const users = [
  {
    id: 'admin',
    password: process.env.ADMIN_PASSWORD_HASH, // This should be a hashed password in production
    role: 'admin',
    name: 'Administrator'
  }
  // Add more users as needed
];

export async function POST(request) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitResponse = await rateLimiter.limit('login', 5, ip);
    
    if (!rateLimitResponse.success) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil(rateLimitResponse.reset / 1000),
        }),
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimitResponse.reset / 1000).toString(),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Validate credentials
    const user = await validateCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.NEXT_SERVER_JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response with user data
    const response = NextResponse.json(
      { 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 200 }
    );
    
    // Set secure HTTP-only cookie
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'An error occurred during login' 
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS method for CORS preflight
// This is needed for the frontend to make requests to this API
// from a different domain
// In production, you should configure CORS more strictly
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
