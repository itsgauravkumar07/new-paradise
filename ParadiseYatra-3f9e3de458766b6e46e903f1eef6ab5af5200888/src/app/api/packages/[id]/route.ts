import { NextRequest, NextResponse } from 'next/server';
import API_CONFIG from '@/config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(API_CONFIG.getFullUrl(`${API_CONFIG.ENDPOINTS.PACKAGES.ALL}/${id}`), {
      cache: 'no-store'
    });

    const data = await response.json();

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    const url = API_CONFIG.getFullUrl(`${API_CONFIG.ENDPOINTS.PACKAGES.ALL}/${id}`);

    // Check if it's FormData (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { message: data.message || 'Failed to update package' },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } else {
      const body = await request.json();
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { message: data.message || 'Failed to update package' },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Packages API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(API_CONFIG.getFullUrl(`${API_CONFIG.ENDPOINTS.PACKAGES.ALL}/${id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to delete package' },
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