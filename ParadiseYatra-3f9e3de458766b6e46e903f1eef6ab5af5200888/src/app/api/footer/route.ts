import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/footer`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Footer API error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch footer content' },
      { status: 500 }
    );
  }
}
