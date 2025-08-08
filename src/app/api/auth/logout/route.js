import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a response that will clear the cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear the HTTP-only cookie
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Set to past date to clear the cookie
      path: '/',
    });

    // Clear any other relevant cookies
    response.cookies.set({
      name: 'adminRefreshToken',
      value: '',
      path: '/',
      expires: new Date(0)
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    );
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
