import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }
    
    // Make request to backend API for holiday types
    const response = await fetch(`${API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.HOLIDAY_TYPES.SUGGEST)}?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Ensure data is an array before mapping
    const holidayTypes = Array.isArray(data) ? data : (data.holidayTypes || data.data || []);
    
    // Transform the data to match the expected format
    const suggestions = holidayTypes.map((holidayType: {
      _id: string;
      title: string;
      description?: string;
      shortDescription?: string;
      slug: string;
      image?: string;
      price: string;
      duration: string;
      country?: string;
      state?: string;
      isActive: boolean;
      isFeatured: boolean;
    }) => ({
      id: holidayType._id,
      title: holidayType.title || 'Unknown Holiday Type',
      destination: holidayType.country || holidayType.state || holidayType.title || 'Unknown Destination',
      price: holidayType.price || '0',
      duration: holidayType.duration || 'N/A',
      category: 'holiday-type',
      slug: holidayType.slug || '',
      image: holidayType.image || null,
      description: holidayType.description || holidayType.shortDescription || '',
      isFeatured: holidayType.isFeatured || false
    }));
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error in holiday type suggestions API:', error);
    console.error('Backend URL:', API_CONFIG.BACKEND_URL);
    console.error('Query:', query);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch holiday type suggestions',
        suggestions: [],
        debug: {
          backendUrl: API_CONFIG.BACKEND_URL,
          query,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
