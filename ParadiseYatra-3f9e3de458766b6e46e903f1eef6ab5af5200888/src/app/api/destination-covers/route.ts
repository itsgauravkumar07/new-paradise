import { NextRequest, NextResponse } from 'next/server';

let mockDestinations: { _id: string, name: string }[] = [
  { _id: "dest1", name: "Manali" },
  { _id: "dest2", name: "Shimla" }
];

export async function GET() {
  return NextResponse.json(mockDestinations);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newDest = {
    _id: "dest_" + Date.now(),
    name: body.name
  };
  mockDestinations.push(newDest);
  return NextResponse.json(newDest, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    mockDestinations = mockDestinations.filter(d => d._id !== id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 400 });
}
