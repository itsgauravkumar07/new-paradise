import React from 'react';
import FixedDepartureDetailClient from '../FixedDepartureDetailClient';
import { notFound } from 'next/navigation';
import { dummyFixedDepartures } from '../data';
import { buildMetadata, SITE_URL, truncateText } from '@/lib/seo';

const stripHtmlTags = (value: string = "") =>
    value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

async function getFixedDeparture(slug: string) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
        const dataSlug = slug === 'manali-group-tour-3n-4d' ? 'deployment-package' : slug;
        console.log(`Fetching from: ${backendUrl}/api/fixed-departures/slug/${dataSlug}`);

        const res = await fetch(`${backendUrl}/api/fixed-departures/slug/${dataSlug}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`);
            if (res.status === 404) return null;
            throw new Error('Failed to fetch departure');
        }

        const data = await res.json();
        return data.fixedDeparture || data;
    } catch (error) {
        console.error('Error fetching fixed departure from API:', error);
        // Fallback to dummy data if API fails to avoid 404 during dev
        return dummyFixedDepartures.find(d => d.slug === slug) || null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const departure = await getFixedDeparture(slug);
        if (!departure) return { title: 'Not Found' };

        const description = stripHtmlTags(departure.shortDescription || departure.subtitle || "");
        // buildMetadata fits the title without "...", and adds the canonical link and social preview
        return buildMetadata({
            title: /fixed departure/i.test(departure.title)
                ? `${departure.title} | Paradise Yatra`
                : `${departure.title} | Fixed Departure | Paradise Yatra`,
            description: description.length > 160 ? truncateText(description, 157) : description,
            path: `/fixed-departures/${slug}`,
            keywords: [departure.title, `${departure.destination || ''} group tour`.trim(), 'fixed departure', 'Paradise Yatra'].filter(Boolean),
        });
    } catch (e) {
        return { title: 'Paradise Yatra' };
    }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    if (!slug) {
        notFound();
    }

    const rawDeparture = await getFixedDeparture(slug);

    if (!rawDeparture) {
        notFound();
    }

    // Transform data safely
    const departure = {
        _id: rawDeparture._id || rawDeparture.id || String(Math.random()),
        title: rawDeparture.title || '',
        slug: rawDeparture.slug || slug,
        subtitle: rawDeparture.subtitle || rawDeparture.shortDescription || '',
        destination: rawDeparture.destination || '',
        departureDate: rawDeparture.departureDate || new Date().toISOString(),
        returnDate: rawDeparture.returnDate || new Date().toISOString(),
        duration: rawDeparture.duration || '',
        price: rawDeparture.price || 0,
        originalPrice: rawDeparture.originalPrice || null,
        availableSeats: rawDeparture.availableSeats || 0,
        totalSeats: rawDeparture.totalSeats || 0,
        image: Array.isArray(rawDeparture.images) && rawDeparture.images.length > 0
            ? (rawDeparture.images[0].includes('char_dham_collage.png') ? '/images/char_dham_collage.png?v=1' : rawDeparture.images[0].startsWith('http') || rawDeparture.images[0].startsWith('/char_') ? rawDeparture.images[0] : `/api/uploaded-images/uploads/${rawDeparture.images[0].split('/').pop()}`)
            : (rawDeparture.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80'),
        tag: rawDeparture.tag || rawDeparture.category || 'Fixed Departure',
        typeColor: 'bg-blue-600',
        rating: rawDeparture.rating || 4.8,
        reviews: typeof rawDeparture.reviews === 'number' ? rawDeparture.reviews : 120,
        location: rawDeparture.location || rawDeparture.destination || '',
        transport: rawDeparture.transport || 'Tempo Traveller',
        hotel: rawDeparture.hotel || 'Star Category Hotels',
        meals: rawDeparture.meals || 'Breakfast & Dinner',
        nextDeparture: rawDeparture.departureDate ? new Date(rawDeparture.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
        shortDescription: rawDeparture.shortDescription || '',
        longDescription: rawDeparture.longDescription || rawDeparture.description || '',
        highlights: rawDeparture.highlights || [],
        suitableFor: rawDeparture.suitableFor || [],
        notSuitableFor: rawDeparture.notSuitableFor || [],
        itinerary: (rawDeparture.itinerary || []).map((item: any) => ({
            day: item.day,
            title: item.title,
            description: Array.isArray(item.activities)
                ? item.activities.filter(Boolean).join('<br />')
                : (item.description || ''),
            meals: item.meals || '',
            hotel: item.accommodation || item.hotel || '',
        })),
        inclusions: rawDeparture.inclusions || [],
        exclusions: rawDeparture.exclusions || [],
        hotels: rawDeparture.hotels || [],
        paymentPolicy: rawDeparture.paymentPolicy || rawDeparture.terms || [],
        cancellationPolicy: rawDeparture.cancellationPolicy || [],
        departures: (rawDeparture.departures || []).map((d: any) => ({
            date: d.date,
            price: d.price,
            seats: d.seats,
            status: d.status || 'available'
        })),
    };

    console.log("DETAIL PAGE IMAGE URL:", departure.image);

    const departureUrl = `${SITE_URL}/fixed-departures/${encodeURIComponent(slug)}`;
    const departureSchema = {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        name: departure.title,
        description: stripHtmlTags(departure.shortDescription),
        url: departureUrl,
        image: departure.image,
        ...(departure.price > 0
            ? {
                offers: {
                    "@type": "Offer",
                    price: departure.price,
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                },
            }
            : {}),
        ...(departure.rating > 0 && departure.reviews > 0
            ? {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: departure.rating,
                    reviewCount: departure.reviews,
                },
            }
            : {}),
    };
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Fixed Departures", item: `${SITE_URL}/fixed-departures` },
            { "@type": "ListItem", position: 3, name: departure.title, item: departureUrl },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([departureSchema, breadcrumbSchema]).replace(/</g, "\\u003c"),
                }}
            />
            <FixedDepartureDetailClient departure={departure as any} />
        </>
    );
}
