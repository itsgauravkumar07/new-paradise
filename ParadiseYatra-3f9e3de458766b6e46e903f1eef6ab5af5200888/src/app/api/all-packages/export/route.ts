import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        const body = await request.json().catch(() => ({}));

        const response = await fetch(`${BACKEND_URL}/api/all-packages/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader }),
            },
            body: JSON.stringify(body),
            signal: controller.signal,
            cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || 'Failed to export packages' },
                { status: response.status }
            );
        }

        const fileBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const contentDisposition = response.headers.get('content-disposition') || 'attachment; filename="packages-export.xlsx"';

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': contentDisposition,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json(
                { message: 'Request timeout while exporting packages' },
                { status: 504 }
            );
        }

        console.error('All Packages export proxy error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
