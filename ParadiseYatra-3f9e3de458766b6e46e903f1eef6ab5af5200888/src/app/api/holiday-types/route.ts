import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/holiday-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      return NextResponse.json(
        { error: errorData.message || `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching holiday types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holiday types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }
    
    console.log('Making request to backend with token:', token ? 'Present' : 'Missing');
    console.log('Request body:', body);
    
    const response = await fetch(`${API_BASE_URL}/api/holiday-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.log('Backend error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to create holiday type' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating holiday type:', error);
    return NextResponse.json(
      { error: 'Failed to create holiday type' },
      { status: 500 }
    );
  }
} 