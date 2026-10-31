import { NextRequest } from "next/server";

const MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-99JYJS0FSF";
const API_SECRET = process.env.GA_API_SECRET;

export async function POST(request: NextRequest) {
  if (!MEASUREMENT_ID || !API_SECRET) {
    return new Response(null, { status: 204 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Swallow errors to avoid client-side console noise.
  }

  return new Response(null, { status: 204 });
}
