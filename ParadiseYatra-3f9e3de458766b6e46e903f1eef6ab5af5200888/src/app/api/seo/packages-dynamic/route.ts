import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tourType = searchParams.get('tourType');
    const location = searchParams.get('location');
    
    if (!tourType || !location) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'tourType and location parameters are required' 
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/seo/packages-dynamic?tourType=${tourType}&location=${encodeURIComponent(location)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.headers.get('authorization')?.replace('Bearer ', '')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dynamic packages SEO data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch SEO data' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tourType, location } = body;
    
    if (!tourType || !location) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'tourType and location are required in request body' 
        },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_BASE_URL}/api/seo/packages-dynamic`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.headers.get('authorization')?.replace('Bearer ', '')}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating dynamic packages SEO data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update SEO data' 
      },
      { status: 500 }
    );
  }
}
