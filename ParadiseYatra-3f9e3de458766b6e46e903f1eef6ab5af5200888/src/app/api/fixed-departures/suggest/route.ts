import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

  try {
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }
    
    // Make request to backend API
    const response = await fetch(`${backendUrl}/api/fixed-departures/search?q=${encodeURIComponent(query)}`, {
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
    const suggestions = data.map((departure: {
      _id: string;
      title: string;
      destination: string;
      price: number;
      originalPrice: number;
      discount: number;
      duration: string;
      departureDate: string;
      returnDate: string;
      availableSeats: number;
      totalSeats: number;
      images?: string[];
      slug: string;
      status: string;
      isFeatured: boolean;
    }) => ({
      id: departure._id,
      title: departure.title || 'Untitled Departure',
      destination: departure.destination || 'Unknown Destination',
      price: departure.price || 0,
      duration: departure.duration || 'N/A',
      category: 'fixed-departure',
      slug: departure.slug || '',
      image: departure.images && Array.isArray(departure.images) && departure.images.length > 0 ? departure.images[0] : null,
      departureDate: departure.departureDate,
      returnDate: departure.returnDate,
      availableSeats: departure.availableSeats,
      totalSeats: departure.totalSeats,
      status: departure.status
    }));
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error in fixed departure suggestions API:', error);
    console.error('Backend URL:', backendUrl);
    console.error('Query:', query);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch fixed departure suggestions',
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
