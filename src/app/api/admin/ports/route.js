import { NextResponse } from 'next/server';
import { generatePortReport } from '@/utils/portScanner';

// Middleware to check admin authentication
export async function middleware(request) {
  const token = request.cookies.get('adminToken')?.value;
  
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // In a real app, verify the JWT token here
  // For now, we'll just check if the token exists
  return NextResponse.next();
}

export async function GET() {
  try {
    // In production, you might want to restrict this to admin users only
    const report = await generatePortReport();
    
    return new NextResponse(report, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename=port-scan-report.txt'
      }
    });
  } catch (error) {
    console.error('Error generating port scan report:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate port scan report' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Only allow GET requests
export async function HEAD() {}
export async function POST() { return new NextResponse(null, { status: 405 }); }
export async function PUT() { return new NextResponse(null, { status: 405 }); }
export async function DELETE() { return new NextResponse(null, { status: 405 }); }
export async function PATCH() { return new NextResponse(null, { status: 405 }); }
