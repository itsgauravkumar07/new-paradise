import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${BACKEND_URL}/api/destination-faqs/admin/destinations`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader }),
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to fetch destinations' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Destination FAQs destinations API error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
