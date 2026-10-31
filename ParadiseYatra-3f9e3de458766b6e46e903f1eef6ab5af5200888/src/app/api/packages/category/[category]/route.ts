import { NextRequest, NextResponse } from 'next/server';
import { validateCategory } from '@/lib/validation';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const { category } = await params;
    
    // Validate category parameter
    if (!validateCategory(category)) {
      return NextResponse.json(
        { 
          message: 'Invalid category parameter', 
          error: `Category '${category}' is not valid. Must be one of: Beach Holidays, Adventure Tours, Trending Destinations, Premium Packages, Popular Packages, Fixed Departure, Mountain Treks, Wildlife Safaris, Pilgrimage Tours, Honeymoon Packages, Family Tours, Luxury Tours, Budget Tours`
        }, 
        { status: 400 }
      );
    }
    
    // Build the backend URL with category and any additional query parameters
    const backendUrl = new URL(`${BACKEND_URL}/api/packages/category/${encodeURIComponent(category)}`);
    
    // Copy all query parameters from the request to the backend
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });
    
    console.log(`Fetching packages for category: ${category}`);
    console.log(`Backend URL: ${backendUrl.toString()}`);
    console.log(`BACKEND_URL env var: ${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'not set'}`);
    
    const response = await fetch(backendUrl.toString());
    const data = await response.json();
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response data length: ${Array.isArray(data) ? data.length : 'not array'}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch packages by category' }, 
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Packages by category API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
