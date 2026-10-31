import React from 'react';
import FixedDeparturesClient from './FixedDeparturesClient';
import { Departure } from './data';
import { buildStaticMetadata } from "@/lib/seo";

export const dynamic = 'force-dynamic';

export const metadata = buildStaticMetadata("/fixed-departures");

async function getFixedDepartures() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/fixed-departures`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            console.error('Failed to fetch fixed departures:', res.statusText);
            return [];
        }

        const data = await res.json();
        return data.fixedDepartures || data || [];
    } catch (error) {
        console.error('Error fetching fixed departures:', error);
        return [];
    }
}

export default async function FixedDeparturesPage() {
    const rawDepartures = await getFixedDepartures();

    // Transform backend data to match Departure interface
    const departures: Departure[] = rawDepartures.map((item: any) => ({
        _id: item._id,
        title: item.title,
        slug: item.slug,
        subtitle: item.shortDescription || item.subtitle,
        destination: item.destination,
        departureDate: item.departureDate,
        returnDate: item.returnDate,
        duration: item.duration,
        price: item.price,
        originalPrice: item.originalPrice,
        availableSeats: item.availableSeats,
        totalSeats: item.totalSeats,
        // Use the first image from the array or a fallback
        image: Array.isArray(item.images) && item.images.length > 0
            ? (item.images[0].includes('char_dham_collage.png') ? '/images/char_dham_collage.png' : item.images[0].startsWith('http') || item.images[0].startsWith('/char_') ? item.images[0] : `/api/uploaded-images/uploads/${item.images[0].split('/').pop()}`)
            : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
        tag: item.category || 'Fixed Departure',
        typeColor: 'bg-blue-600',
        rating: 4.8, // Default rating as backend might not have it
        reviews: 120, // Default reviews
        location: item.destination, // Mapped to destination or specific location field if available
        transport: 'Tempo Traveller', // Default or mapped if available
        hotel: 'Star Category Hotels',
        meals: 'Breakfast & Dinner',
        nextDeparture: new Date(item.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        shortDescription: item.shortDescription || '',
        longDescription: item.description || '',
        highlights: item.highlights || [],
        suitableFor: [], // Populate if available in backend
        notSuitableFor: [], // Populate if available in backend
        itinerary: item.itinerary || [],
        inclusions: item.inclusions || [],
        exclusions: item.exclusions || [],
        hotels: [], // Populate if available
        paymentPolicy: item.terms || [],
        cancellationPolicy: [],
        departures: item.departures || [],
    }));

    return <FixedDeparturesClient departures={departures} />;
}
