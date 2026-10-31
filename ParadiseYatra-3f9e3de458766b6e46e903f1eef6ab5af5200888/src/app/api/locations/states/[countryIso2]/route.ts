import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ countryIso2: string }> }
) {
  try {
    const { countryIso2 } = await params;
    
    if (!countryIso2) {
      return NextResponse.json(
        { message: 'Country ISO2 code is required' }, 
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/locations/countries/${countryIso2}/states`);
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch states' }, 
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('States API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
