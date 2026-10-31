import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 });
  }

  // Log the requested URL for debugging
  console.log('Proxy image request:', imageUrl);

  try {
    // Check if the URL is already a full URL (should be the case now)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'public, max-age=31536000',
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        console.error(`Failed to fetch image: ${response.status} ${response.statusText} for URL: ${imageUrl}`);
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      console.log(`Successfully proxied image: ${imageUrl} (${contentType})`);

      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
          'ETag': `"${Buffer.from(imageBuffer).toString('base64').slice(0, 8)}"`,
        },
      });
    } else {
      // Handle relative URLs by redirecting to the backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
      const fullUrl = `${backendUrl}${imageUrl}`;
      
      console.log(`Redirecting relative URL to: ${fullUrl}`);
      
      return NextResponse.redirect(fullUrl);
    }
  } catch (error) {
    console.error('Error proxying image:', error, 'URL:', imageUrl);
    
    // Return a fallback image for any error with proper caching
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
} 