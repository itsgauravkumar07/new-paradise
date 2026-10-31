import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const backendUrl = `${BACKEND_URL}/api/destinations/${slug}`;

    console.log(`Fetching destination with slug: ${slug}`);
    console.log(`Backend URL: ${backendUrl}`);

    const response = await fetch(backendUrl);
    const data = await response.json();

    console.log(`Response status: ${response.status}`);
    console.log(`Response data:`, data);

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch destination' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Destinations API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
