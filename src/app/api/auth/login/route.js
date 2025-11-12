import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getBackendUrl = () => process.env.NEXT_PUBLIC_PROD_API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;

export async function POST(request) {
  try {
    const backendBase = getBackendUrl();
    if (!backendBase) {
      return NextResponse.json({ success: false, error: 'Backend URL not configured (set NEXT_PUBLIC_PROD_API_URL)' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    // Proxy login to backend
    const resp = await fetch(`${backendBase.replace(/\/$/, '')}/api/adminauth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => null);

    // Build response to client
    const clientRes = NextResponse.json(data || {}, { status: resp.status });

    // If backend returned tokens, set cookies similarly to original implementation
    if (data && data.token) {
      clientRes.cookies.set('adminToken', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    if (data && data.refreshToken) {
      clientRes.cookies.set('adminRefreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return clientRes;
  } catch (err) {
    console.error('Proxy login error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
