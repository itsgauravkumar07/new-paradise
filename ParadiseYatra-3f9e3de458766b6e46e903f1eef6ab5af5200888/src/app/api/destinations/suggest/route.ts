import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

  try {
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }
    
    // Make request to backend API for destinations
    const response = await fetch(`${backendUrl}/api/destinations/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match the expected format
    // The backend search endpoint returns destinations directly, not wrapped in a destinations array
    const destinations = Array.isArray(data) ? data : (data.destinations || []);
    
    const suggestions = destinations.map((destination: {
      _id: string;
      name?: string;
      title?: string;
      price?: number;
      duration?: string;
      slug?: string;
      image?: string;
      images?: string[];
      description?: string;
      shortDescription?: string;
      country?: string;
      region?: string;
    }) => ({
      id: destination._id,
      title: destination.name || destination.title || 'Unknown Destination',
      destination: destination.name || destination.title || 'Unknown Destination',
      price: destination.price || 0,
      duration: destination.duration || 'N/A',
      category: 'destination',
      slug: destination.slug || '',
      image: destination.image || destination.images?.[0] || null,
      description: destination.description || destination.shortDescription || '',
      country: destination.country || '',
      region: destination.region || ''
    }));
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error in destination suggestions API:', error);
    console.error('Backend URL:', backendUrl);
    console.error('Query:', query);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch destination suggestions',
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
