import { NextRequest, NextResponse } from 'next/server';

// This catch-all route ensures that if there's an issue with any API route,
// we at least return a proper JSON response instead of a default HTML error page

export async function GET(
  request: NextRequest,
  { params }: { params: { catchAll: string[] } }
) {
  return NextResponse.json(
    { error: `API route not found: ${params.catchAll.join('/')}` },
    { status: 404 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { catchAll: string[] } }
) {
  // Return a proper JSON response
  return NextResponse.json(
    { error: `API route not found: ${params.catchAll.join('/')}` },
    { status: 404 }
  );
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { catchAll: string[] } }
) {
  // Return CORS headers
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 