import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const backendUrl = `${BACKEND_URL}/api/packages/slug/${slug}`;
    
    console.log(`Fetching package with slug: ${slug}`);
    console.log(`Backend URL: ${backendUrl}`);
    console.log(`BACKEND_URL env var: ${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'not set'}`);
    
    const response = await fetch(backendUrl);
    const data = await response.json();

    console.log(`Response status: ${response.status}`);
    console.log(`Response data:`, data);

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch package' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Packages API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 