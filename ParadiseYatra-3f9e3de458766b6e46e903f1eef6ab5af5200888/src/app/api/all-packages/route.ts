import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5001';

// Disable caching for this route to ensure fresh data for admin and public
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');
        const page = searchParams.get('page');
        const tourType = searchParams.get('tourType');
        const country = searchParams.get('country');
        const state = searchParams.get('state');
        const isActive = searchParams.get('isActive');
        const q = searchParams.get('q');
        const minimal = searchParams.get('minimal');

        let url = `${BACKEND_URL}/api/all-packages`;

        // Add query parameters if provided
        const queryParams = new URLSearchParams();
        if (limit) queryParams.append('limit', limit);
        if (page) queryParams.append('page', page);
        if (tourType) queryParams.append('tourType', tourType);
        if (country) queryParams.append('country', country);
        if (state) queryParams.append('state', state);
        if (isActive) queryParams.append('isActive', isActive);
        if (q) queryParams.append('q', q);
        if (minimal) queryParams.append('minimal', minimal);

        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }

        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response;
        try {
            response = await fetch(url, {
                signal: controller.signal,
                cache: 'no-store',
            });
            clearTimeout(timeoutId);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json(
                    { message: 'Request timeout - please try again', packages: [] },
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
                errorData = { message: 'Failed to fetch packages' };
            }
            return NextResponse.json(
                { message: errorData.message || 'Failed to fetch packages' },
                { status: response.status }
            );
        }

    // old code 
    //     const data = await response.json();
    //     return NextResponse.json(data);
    // } catch (error) {
    //     console.error('All Packages API error:', error);
    //     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    // }
    // }

    // New code start here

        const data = await response.json();
        const res = NextResponse.json(data);
        // Public package data doesn't need to be instant-fresh - a short cache lets the
        // browser reuse an identical request (e.g. Hero + IndiaTourPackagesSection both
        // fetching tourType=india) instead of hitting the backend/DB twice for the same data.
        res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        return res;
    } catch (error) {
        console.error('All Packages API error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

    // New code end here


export async function POST(request: NextRequest) {
    try {
        // Check Content-Type to determine how to parse the request
        const contentType = request.headers.get('content-type') || '';

        let response;

        if (contentType.includes('multipart/form-data')) {
            // Handle FormData requests (file uploads)
            const formData = await request.formData();

            response = await fetch(`${BACKEND_URL}/api/all-packages`, {
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

            response = await fetch(`${BACKEND_URL}/api/all-packages`, {
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
                { message: data.message || 'Failed to create package' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('All Packages API error:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
