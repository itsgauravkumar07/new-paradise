import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        console.log(`[PROXY PUT] Updating FAQ with ID: ${id}`);
        const response = await fetch(`${BACKEND_URL}/api/destination-faqs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json().catch(() => ({}));
        console.log(`[PROXY PUT] Backend responded with status: ${response.status}`);

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to update destination FAQ' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Destination FAQ update error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        console.log(`[PROXY DELETE] Sending delete request for document: ${id}`);
        const response = await fetch(`${BACKEND_URL}/api/destination-faqs/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        const data = await response.json().catch(() => ({}));
        console.log(`[PROXY DELETE] Backend responded with status: ${response.status}`);

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to delete destination FAQ' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Destination FAQ delete error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
