import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const imagePath = resolvedParams.path.join('/');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const fullUrl = `${backendUrl}/${imagePath}`;

    // Add request deduplication to prevent multiple simultaneous requests for the same image
    const cacheKey = `image-${imagePath}`;

    console.log('=== Uploaded Image Request ===');
    console.log('Image path:', imagePath);
    console.log('Full URL:', fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'public, max-age=31536000',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      console.error(`Failed to fetch uploaded image: ${response.status} ${response.statusText} for URL: ${fullUrl}`);

      // Return a fallback image with proper caching
      const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='16' font-family='Arial, sans-serif'%3EImage not available%3C/text%3E%3C/svg%3E`;

      return new NextResponse(fallbackImage, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600, immutable',
          'Access-Control-Allow-Origin': '*',
          'X-Image-Status': 'fallback',
        },
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    console.log(`Successfully served uploaded image: ${fullUrl} (${contentType}, ${imageBuffer.byteLength} bytes)`);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'X-Image-Status': 'success',
        'ETag': `"${Buffer.from(imageBuffer).toString('base64').slice(0, 8)}"`,
      },
    });
  } catch (error) {
    console.error('Error serving uploaded image:', error);

    // Return a fallback image for any error with proper caching
    const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='16' font-family='Arial, sans-serif'%3EImage not available%3C/text%3E%3C/svg%3E`;

    return new NextResponse(fallbackImage, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, immutable',
        'Access-Control-Allow-Origin': '*',
        'X-Image-Status': 'error',
      },
    });
  }
}
