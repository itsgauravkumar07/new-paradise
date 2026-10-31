import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import HotelDetailClient from "./HotelDetailClient";
import type { Hotel } from "@/components/hotels/types";
import { backendJson } from "@/lib/server/backend";
import { buildMetadata, isSampleContent, SITE_URL, stripHtml, truncateText } from "@/lib/seo";
import { getImageUrl } from "@/lib/utils";

type HotelRecord = Hotel & { isActive?: boolean; updatedAt?: string };
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// One backend call per request, shared by generateMetadata and the page
const getHotel = cache(async (slug: string): Promise<HotelRecord | null> => {
  const data = await backendJson<{ hotel?: HotelRecord }>(`/api/hotels/slug/${encodeURIComponent(slug)}`, { revalidate: 300 });
  const hotel = data?.hotel ?? null;
  return hotel && hotel.isActive !== false ? hotel : null;
});

const placeOf = (hotel: Hotel) => [hotel.city, hotel.state || hotel.country].filter(Boolean).join(", ");
const inr = (value: number) => `₹${Number(value).toLocaleString("en-IN")}`;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotel(slug);
  if (!hotel) return { title: "Hotel not found | Paradise Yatra" };

  const place = placeOf(hotel);
  const summary = stripHtml(hotel.shortDescription || hotel.description || "");
  const facts = [
    hotel.starRating ? `${hotel.starRating}-star hotel` : "Hotel",
    place ? `in ${place}` : "",
    hotel.pricePerNight ? `from ${inr(hotel.pricePerNight)} a night` : "",
  ].filter(Boolean).join(" ");

  return buildMetadata({
    title: `${hotel.name}${hotel.city ? `, ${hotel.city}` : ""} | Hotels | Paradise Yatra`,
    description: truncateText(`${facts}. ${summary}`.trim(), 157),
    path: `/hotels/${slug}`,
    image: hotel.images?.[0] ? getImageUrl(hotel.images[0]) || hotel.images[0] : undefined,
    keywords: [hotel.name, `hotels in ${hotel.city}`, `${hotel.city} hotels`, place, "Paradise Yatra hotels"].filter(Boolean),
    // Demo hotels ("... (Sample)") stay out of search results until they're removed in admin
    index: !isSampleContent(hotel.name, hotel.slug),
  });
}

export default async function HotelDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();

  // Keep the search the visitor came from (city, dates, guests) for the booking box and the back link
  const query = new URLSearchParams(
    Object.entries(await searchParams).flatMap(([key, value]) =>
      value === undefined ? [] : (Array.isArray(value) ? value : [value]).map((v) => [key, v] as [string, string])
    )
  ).toString();

  const url = `${SITE_URL}/hotels/${slug}`;
  const hotelSchema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: stripHtml(hotel.shortDescription || hotel.description || ""),
    url,
    image: (hotel.images || []).slice(0, 5).map((src) => getImageUrl(src) || src),
    address: {
      "@type": "PostalAddress",
      ...(hotel.address ? { streetAddress: hotel.address } : {}),
      addressLocality: hotel.city,
      ...(hotel.state ? { addressRegion: hotel.state } : {}),
      ...(hotel.country ? { addressCountry: hotel.country } : {}),
    },
    ...(hotel.starRating ? { starRating: { "@type": "Rating", ratingValue: hotel.starRating } } : {}),
    ...(hotel.pricePerNight ? { priceRange: `From ${inr(hotel.pricePerNight)} per night` } : {}),
    ...(hotel.amenities?.length
      ? { amenityFeature: hotel.amenities.slice(0, 15).map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })) }
      : {}),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Hotels", item: `${SITE_URL}/hotels` },
      { "@type": "ListItem", position: 3, name: hotel.name, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([hotelSchema, breadcrumbSchema]).replace(/</g, "\\u003c") }}
      />
      <HotelDetailClient slug={slug} initialHotel={hotel} query={query} />
    </>
  );
}
