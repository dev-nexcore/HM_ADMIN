import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const getBackendUrl = () => process.env.NEXT_PUBLIC_PROD_API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;

export async function GET(request) {
  try {
    const backendBase = getBackendUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!backendBase) {
      // If no backend configured, fallback: treat presence of cookie as authenticated (best-effort)
      if (!token) return NextResponse.json({ isAuthenticated: false }, { status: 200 });
      return NextResponse.json({ isAuthenticated: true, adminId: 'local-stub', role: 'admin', name: 'Local Stub' }, { status: 200 });
    }

    // Proxy verify to backend. Forward the cookie header if present.
    const headers = {};
    if (token) headers['cookie'] = `adminToken=${token}`;

    const resp = await fetch(`${backendBase.replace(/\/$/, '')}/api/adminauth/verify`, {
      method: 'GET',
      headers: { Accept: 'application/json', ...headers },
    }).catch(() => null);

    if (!resp) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    const data = await resp.json().catch(() => null);

    // If backend returned a token or user info, pass it through
    return NextResponse.json(data || { isAuthenticated: false }, { status: resp.status || 200 });
  } catch (err) {
    console.error('Proxy verify error:', err);
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }
}
