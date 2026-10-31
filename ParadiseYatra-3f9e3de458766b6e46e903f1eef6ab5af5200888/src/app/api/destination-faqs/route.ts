import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const url = `${BACKEND_URL}/api/destination-faqs?${searchParams.toString()}`;
        console.log(`[PROXY GET] Fetching FAQs for: ${searchParams.toString()}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        const data = await response.json();
        console.log(`[PROXY GET] Backend status: ${response.status}`);

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to fetch destination FAQs' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Destination FAQs API error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        console.log(`[PROXY POST] Creating new FAQ for: ${body.destination}`);
        const response = await fetch(`${BACKEND_URL}/api/destination-faqs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader }),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log(`[PROXY POST] Backend status: ${response.status}`);

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to create destination FAQ' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Destination FAQs API error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
