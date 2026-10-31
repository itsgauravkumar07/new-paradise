import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET() {
  try {
    // Fetch featured fixed departures
    const featuredResponse = await fetch(`${BACKEND_URL}/api/fixed-departures/featured`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Fetch upcoming fixed departures (status: upcoming)
    const upcomingResponse = await fetch(`${BACKEND_URL}/api/fixed-departures?status=upcoming&limit=6`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Fetch special offers (departures with discount > 0)
    const specialOffersResponse = await fetch(`${BACKEND_URL}/api/fixed-departures?limit=6`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let featuredData = [];
    let upcomingData = [];
    let specialOffersData = [];

    if (featuredResponse.ok) {
      const featured = await featuredResponse.json();
      featuredData = featured || [];
    }

    if (upcomingResponse.ok) {
      const upcoming = await upcomingResponse.json();
      upcomingData = upcoming.fixedDepartures || [];
    }

    if (specialOffersResponse.ok) {
      const specialOffers = await specialOffersResponse.json();
      // Filter for departures with discount > 0
      specialOffersData = (specialOffers.fixedDepartures || []).filter((departure: { discount: number }) => departure.discount > 0);
    }

    // Transform the data for navigation
    const transformDeparture = (departure: {
      _id: string;
      title: string;
      destination: string;
      price: number;
      originalPrice: number;
      discount: number;
      duration: string;
      departureDate: string;
      returnDate: string;
      availableSeats: number;
      totalSeats: number;
      images?: string[];
      slug: string;
      status: string;
      isFeatured: boolean;
    }) => ({
      id: departure._id,
      title: departure.title,
      destination: departure.destination,
      price: departure.price,
      originalPrice: departure.originalPrice,
      discount: departure.discount,
      duration: departure.duration,
      departureDate: departure.departureDate,
      returnDate: departure.returnDate,
      availableSeats: departure.availableSeats,
      totalSeats: departure.totalSeats,
      image: departure.images && departure.images.length > 0 ? departure.images[0] : null,
      slug: departure.slug,
      status: departure.status,
      isFeatured: departure.isFeatured
    });

    const navigationData = {
      upcoming: upcomingData.map(transformDeparture),
      featured: featuredData.map(transformDeparture),
      specialOffers: specialOffersData.map(transformDeparture)
    };

    return NextResponse.json(navigationData);
  } catch (error) {
    console.error('Error fetching fixed departures for navigation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch fixed departures for navigation',
        upcoming: [],
        featured: [],
        specialOffers: []
      },
      { status: 500 }
    );
  }
}
