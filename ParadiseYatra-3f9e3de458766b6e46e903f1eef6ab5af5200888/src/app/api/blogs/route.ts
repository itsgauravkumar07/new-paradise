import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5001';

// Cache blogs for 30 seconds
export const revalidate = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    const featured = searchParams.get('featured');
    const published = searchParams.get('published');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');
    const minimal = searchParams.get('minimal');

    const isAdminRequest = admin === 'true';

    if (isAdminRequest) {
      noStore();
    }

    // Validate featured parameter if provided
    if (featured && !['true', 'false'].includes(featured)) {
      return NextResponse.json(
        {
          message: 'Invalid featured parameter',
          error: `Featured '${featured}' is not valid. Must be 'true' or 'false'`
        },
        { status: 400 }
      );
    }

    // Use the dedicated featured endpoint if featured=true
    let url = featured === 'true'
      ? `${BACKEND_URL}/api/blogs/featured`
      : `${BACKEND_URL}/api/blogs`;

    // Add query parameters if provided
    const queryParams = new URLSearchParams();
    if (published) queryParams.append('published', published);
    if (category) queryParams.append('category', category);
    if (limit) queryParams.append('limit', limit);
    if (page) queryParams.append('page', page);
    if (featured && featured !== 'true') queryParams.append('featured', featured);
    if (minimal) queryParams.append('minimal', minimal);

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    // Add timeout to prevent hanging requests - reduced for faster fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    try {
      response = await fetch(
        url,
        isAdminRequest
          ? {
              signal: controller.signal,
              cache: 'no-store',
            }
          : {
              signal: controller.signal,
              next: { revalidate: 30 },
            }
      );
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { message: 'Request timeout - please try again', blogs: [] },
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
        errorData = { message: 'Failed to fetch blogs' };
      }
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch blogs' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const responseData = NextResponse.json(data);
    if (isAdminRequest) {
      responseData.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
    return responseData;
  } catch (error) {
    console.error('Blogs API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check Content-Type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';

    let response;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData requests (file uploads)
      const formData = await request.formData();

      response = await fetch(`${BACKEND_URL}/api/blogs`, {
        method: 'POST',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          // Don't set Content-Type header - let fetch set it with boundary
        },
        body: formData,
      });
    } else {
      // Handle JSON requests
      const body = await request.json();

      response = await fetch(`${BACKEND_URL}/api/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: JSON.stringify(body),
      });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to create blog' },
        { status: response.status }
      );
    }

    revalidatePath("/blog");
    const createdBlogSlug = data?.blog?.slug || data?.slug;
    if (createdBlogSlug) {
      revalidatePath(`/blog/${createdBlogSlug}`);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Blogs API error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
