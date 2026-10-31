import { NextRequest, NextResponse } from 'next/server';
import API_CONFIG from '@/config/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to verify OTP' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Verify OTP API error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
