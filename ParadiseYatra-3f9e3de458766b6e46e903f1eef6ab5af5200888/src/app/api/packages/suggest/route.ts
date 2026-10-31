import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

  try {
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }
    
    // Make request to backend API
    const response = await fetch(`${backendUrl}/api/packages/suggest?q=${encodeURIComponent(query)}`, {
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
    console.error('Error in package suggestions API:', error);
    console.error('Backend URL:', backendUrl);
    console.error('Query:', query );
    
      return NextResponse.json(
      { 
        error: 'Failed to fetch package suggestions',
        suggestions: [],
        debug: {
          backendUrl,
          query,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
} 