import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    // Forward the request to the backend
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const response = await fetch(`${API_BASE_URL}/api/faq/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch FAQ' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('FAQ API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    // Forward the request to the backend
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const response = await fetch(`${API_BASE_URL}/api/faq/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to update FAQ' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('FAQ API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    
    // Forward the request to the backend
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const response = await fetch(`${API_BASE_URL}/api/faq/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to delete FAQ' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('FAQ API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from 'next/server';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;
    
//     // Forward the request to the backend
//     const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
//     const response = await fetch(`${API_BASE_URL}/api/faq/${id}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json(
//         { message: data.message || 'Failed to fetch FAQ' },
//         { status: response.status }
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('FAQ API error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;
//     const body = await request.json();
//     const authHeader = request.headers.get('authorization');

//     // Forward the request to the backend
//     const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
//     const response = await fetch(`${API_BASE_URL}/api/faq/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         ...(authHeader && { 'Authorization': authHeader }),
//       },
//       body: JSON.stringify(body),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json(
//         { message: data.message || 'Failed to update FAQ' },
//         { status: response.status }
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('FAQ API error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;
//     const authHeader = request.headers.get('authorization');

//     // Forward the request to the backend
//     const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
//     const response = await fetch(`${API_BASE_URL}/api/faq/${id}`, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//         ...(authHeader && { 'Authorization': authHeader }),
//       },
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json(
//         { message: data.message || 'Failed to delete FAQ' },
//         { status: response.status }
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('FAQ API error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }