import { NextRequest, NextResponse } from 'next/server';
import { validateApiParams } from '@/lib/validation';
import API_CONFIG from '@/config/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tourType = searchParams.get('tourType');
    const state = searchParams.get('state');
    const country = searchParams.get('country');
    const limit = searchParams.get('limit');
    const holidayType = searchParams.get('holidayType');

    // Validate parameters
    const validation = validateApiParams({ tourType, state: state || country, category, limit });
    if (!validation.isValid) {
      return NextResponse.json(
        {
          message: 'Invalid parameters',
          errors: validation.errors,
          packages: []
        },
        { status: 400 }
      );
    }

    // Clean and normalize state/country parameter
    let normalizedState = state;
    let normalizedCountry = country;
    if (state) {
      normalizedState = decodeURIComponent(state)
        .replace(/&/g, 'and')
        .replace(/\s+/g, ' ')
        .trim();
    }
    if (country) {
      normalizedCountry = decodeURIComponent(country)
        .replace(/&/g, 'and')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (tourType) params.append('tourType', tourType);
    if (normalizedCountry) {
      params.append('country', normalizedCountry);
    } else if (normalizedState) {
      params.append('state', normalizedState);
    }
    if (limit) params.append('limit', limit);
    if (holidayType) params.append('holidayType', holidayType);

    const queryString = params.toString();
    const url = API_CONFIG.getFullUrl(`${API_CONFIG.ENDPOINTS.PACKAGES.ALL}${queryString ? '?' + queryString : ''}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json({
          message: data.message || 'Failed to fetch packages',
          packages: []
        }, { status: response.status });
      }

      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({
          message: 'Request timeout - please try again',
          packages: []
        }, { status: 504 });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Packages API error:', error);
    return NextResponse.json({
      message: 'Internal server error',
      packages: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const url = API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.PACKAGES.ALL);

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json({ message: data.message || 'Failed to create package' }, { status: response.status });
      }
      return NextResponse.json(data, { status: 201 });
    } else {
      const body = await request.json();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json({ message: data.message || 'Failed to create package' }, { status: response.status });
      }
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Packages API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}