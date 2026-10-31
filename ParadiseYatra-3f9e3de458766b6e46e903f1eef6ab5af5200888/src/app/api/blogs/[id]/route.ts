import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    try {
      response = await fetch(`${BACKEND_URL}/api/blogs/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { message: 'Request timeout - please try again' },
          { status: 504 }
        );
      }
      throw fetchError;
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Blog not found' };
      }
      return NextResponse.json(
        { message: errorData.message || 'Blog not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Blogs API error:', error);
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
    const { searchParams } = new URL(request.url);

    // Check Content-Type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';

    let response;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData requests (file uploads)
      const formData = await request.formData();

      response = await fetch(`${BACKEND_URL}/api/blogs/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`, {
        method: 'PUT',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          // Don't set Content-Type header - let fetch set it with boundary
        },
        body: formData,
      });
    } else {
      // Handle JSON requests
      const body = await request.json();

      response = await fetch(`${BACKEND_URL}/api/blogs/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: JSON.stringify(body),
      });
    }

    const data = await response.json();
    revalidatePath("/blog");
    const updatedBlogSlug = data?.blog?.slug || id;
    revalidatePath(`/blog/${updatedBlogSlug}`);

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to update blog' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Blogs API error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
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
    const { searchParams } = new URL(request.url);
    const response = await fetch(`${BACKEND_URL}/api/blogs/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to delete blog' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Blogs API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
