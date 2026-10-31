import { NextRequest, NextResponse } from 'next/server';
import { validateLimit } from '@/lib/validation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '6';

    // Validate limit parameter
    if (!validateLimit(limit)) {
      return NextResponse.json(
        {
          message: 'Invalid limit parameter',
          error: `Limit '${limit}' is not valid. Must be a number between 1 and 100`
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/packages?category=adventure&limit=${limit}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Failed to fetch adventure packages' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Adventure Packages API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({ ...body, category: 'adventure' }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Failed to create adventure package' }, { status: response.status });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Adventure Packages API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 