// import { NextRequest, NextResponse } from 'next/server';

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const response = await fetch(`${BACKEND_URL}/api/destinations/${id}`);

//     if (!response.ok) {
//       return NextResponse.json(
//         { message: 'Destination not found' },
//         { status: 404 }
//       );
//     }

//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Destinations API error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const body = await request.json();
//     const response = await fetch(`${BACKEND_URL}/api/destinations/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': request.headers.get('Authorization') || '',
//       },
//       body: JSON.stringify(body),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json(
//         { message: data.message || 'Failed to update destination' },
//         { status: response.status }
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Destinations API error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const response = await fetch(`${BACKEND_URL}/api/destinations/${id}`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': request.headers.get('Authorization') || '',
//       },
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json(
//         { message: data.message || 'Failed to delete destination' },
//         { status: response.status }
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Destinations API error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// } 

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/api/destinations/${id}`, {
      cache: 'no-store',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Destination not found' },
        { status: 404 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Destinations API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ✅ PUT - Handle FormData for file uploads
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const formData = await request.formData();
    
//     const response = await fetch(`${BACKEND_URL}/api/destinations/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': request.headers.get('Authorization') || '',
//       },
//       body: formData, // Send FormData directly for file upload
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json(
//         { message: data.message || 'Failed to update destination' },
//         { status: response.status }
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Destinations API error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check Content-Type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';
    
    let body;
    
    if (contentType.includes('application/json')) {
      // Handle JSON requests (like status toggle)
      const jsonData = await request.json();
      body = JSON.stringify(jsonData);
      
      const response = await fetch(`${BACKEND_URL}/api/destinations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: body,
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { message: data.message || 'Failed to update destination' },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } else {
      // Handle FormData requests (like file uploads)
      const formData = await request.formData();
      
      const response = await fetch(`${BACKEND_URL}/api/destinations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { message: data.message || 'Failed to update destination' },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Destinations API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/api/destinations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to delete destination' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Destinations API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}