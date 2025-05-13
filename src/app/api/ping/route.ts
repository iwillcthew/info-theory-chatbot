import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'success', 
    message: 'API is working' 
  });
}

export async function POST() {
  return NextResponse.json({ 
    status: 'success', 
    message: 'POST API is working' 
  });
} 