import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const MAX_IMAGE_SIZE_BYTES = 220 * 1024;
    const formData = await request.formData();
    const image = formData.get("image");
    const token = request.headers.get('authorization');

    if (image && typeof image !== "string" && image.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "File size must be 220KB or less" },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const response = await fetch(`${backendUrl}/api/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      
      try {
        const errorData = await response.json();
        console.error('❌ Backend upload error:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || response.statusText || `Server returned ${response.status} status`;
        } catch (textError) {
          errorMessage = response.statusText || `Server returned ${response.status} status`;
        }
        console.error('❌ Failed to parse error response:', jsonError);
      }
      
      return NextResponse.json(
        { message: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
