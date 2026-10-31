import { NextRequest, NextResponse } from 'next/server';
import API_CONFIG from '@/config/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Registration failed' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Registration API error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
