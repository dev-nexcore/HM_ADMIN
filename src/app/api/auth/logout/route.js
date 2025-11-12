import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getBackendUrl = () => process.env.NEXT_PUBLIC_PROD_API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;

export async function POST(request) {
  try {
    const backendBase = getBackendUrl();
    if (!backendBase) {
      // still clear local cookie
      const res = NextResponse.json({ success: true, message: 'Logged out (no backend configured)' }, { status: 200 });
      res.cookies.set('adminToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0), path: '/' });
      res.cookies.set('adminRefreshToken', '', { path: '/', expires: new Date(0) });
      return res;
    }

    // Forward logout to backend if it exists
    const resp = await fetch(`${backendBase.replace(/\/$/, '')}/api/adminauth/logout`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: await request.text().catch(() => null),
    }).catch(() => null);

    // Clear cookies locally regardless of backend response
    const res = NextResponse.json({ success: true, message: 'Logged out' }, { status: 200 });
    res.cookies.set('adminToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0), path: '/' });
    res.cookies.set('adminRefreshToken', '', { path: '/', expires: new Date(0) });

    return res;
  } catch (err) {
    console.error('Proxy logout error:', err);
    const res = NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
    res.cookies.set('adminToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0), path: '/' });
    res.cookies.set('adminRefreshToken', '', { path: '/', expires: new Date(0) });
    return res;
  }
}
