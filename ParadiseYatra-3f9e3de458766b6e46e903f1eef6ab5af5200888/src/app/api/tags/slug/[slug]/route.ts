import { NextRequest, NextResponse } from 'next/server';
import API_CONFIG from '@/config/api';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const response = await fetch(
            API_CONFIG.getFullUrl(`/api/tags/slug/${encodeURIComponent(slug)}`),
            { cache: 'no-store' }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Tag not found', success: false },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Tag Slug API proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}
