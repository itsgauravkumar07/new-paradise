import { Metadata } from "next";
import { notFound } from "next/navigation";
import PackageDetailClient from "@/app/package/[slug]/PackageDetailClient";
import { fitTitle, SITE_URL, truncateText } from "@/lib/seo";
import { backendJson } from "@/lib/server/backend";

// Enable ISR with 60 second revalidation
export const revalidate = 60;

interface DayItinerary {
    day: number;
    title: string;
    activities: string[];
    accommodation: string;
    meals: string;
    image: string;
}

// Unified interface that can handle both packages and destinations
interface PackageOrDestination {
    _id: string;
    // Common fields - handle both package and destination naming
    title?: string;
    name?: string; // For destinations
    slug: string;
    description?: string;
    shortDescription?: string;
    price?: number;
    priceType?: "per_person" | "per_couple";
    originalPrice?: number;
    discount?: number;
    duration?: string;
    destination?: string; // For packages
    location?: string; // For destinations
    category?: string;
    images?: string[];
    image?: string; // For destinations (single image)
    gallery?: string[];
    highlights?: string[];
    itinerary: DayItinerary[];
    inclusions?: string[];
    exclusions?: string[];
    rating?: number;
    reviews?: unknown[];
    isActive?: boolean;
    isFeatured?: boolean;
    // SEO fields
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    seoOgTitle?: string;
    seoOgDescription?: string;
    seoOgImage?: string;
    seoTwitterTitle?: string;
    seoTwitterDescription?: string;
    seoTwitterImage?: string;
    seoCanonicalUrl?: string;
    seoRobotsIndex?: boolean;
    seoRobotsFollow?: boolean;
    seoAuthor?: string;
    seoPublisher?: string;
}

const stripHtmlTags = (value: string = "") =>
    value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

// The backend wraps records differently ({ package }, { destination }, { data }, { packages: [...] }): find the record
const unwrap = (obj: any): any => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    for (const key of ['package', 'destination', 'data', 'result', 'item']) {
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) return unwrap(obj[key]);
    }
    for (const key of ['packages', 'destinations', 'items', 'results']) {
        if (Array.isArray(obj[key]) && obj[key].length > 0) return unwrap(obj[key][0]);
    }
    return obj;
};

// A package can live in the current "all packages" collection or the older packages / destinations ones.
// Returns null only when every source says 404 (the page then returns a real 404). A backend error is
// thrown instead, so an outage shows a temporary error rather than telling Google the page is gone.
async function getPackage(slug: string): Promise<PackageOrDestination | null> {
    const id = encodeURIComponent(slug);
    for (const path of [`/api/packages/slug/${id}`, `/api/all-packages/${id}`, `/api/destinations/${id}`]) {
        const data = await backendJson<unknown>(path, { revalidate: 60 });
        if (!data) continue;
        const record = unwrap(data);
        // Packages switched off in admin are not public: same as not found
        return record?.isActive === false ? null : record;
    }
    return null;
}

// "Sikkim Hills Explorer" exists as 5N/6D and 7N/8D: adding the trip length keeps their titles unique.
// Skipped when the name already says how long the trip is ("The Best of Gangtok 3N/4D", "2 Nights / 3 Days").
const withDuration = (name: string, duration?: string) =>
    duration && duration !== 'N/A' && !/\d+\s*(?:n|nights?|d|days?)\b/i.test(name) ? `${name} ${duration}` : name;

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const packageData = await getPackage(resolvedParams.slug);

    if (!packageData) {
        return {
            title: 'Package Not Found | Paradise Yatra',
            description: 'The requested travel package could not be found.',
        };
    }

    const displayTitle = packageData.title || packageData.name || 'Travel Package';
    const displayDestination = packageData.destination || packageData.location || 'Travel Destination';
    const titleValue = packageData.seoTitle || `${withDuration(displayTitle, packageData.duration)} | Paradise Yatra Travel Package`;
    const title = fitTitle(titleValue);
    const fallbackDescriptionSource = stripHtmlTags(packageData.shortDescription || packageData.description || "");
    const descriptionValue = packageData.seoDescription || fallbackDescriptionSource;
    const description = descriptionValue.length > 160
        ? truncateText(descriptionValue, 157)
        : descriptionValue;
    const openGraphTitle = fitTitle(packageData.seoOgTitle || displayTitle, 90);
    const openGraphDescriptionValue = packageData.seoOgDescription || description;
    const openGraphDescription = openGraphDescriptionValue.length > 160
        ? truncateText(openGraphDescriptionValue, 157)
        : openGraphDescriptionValue;
    const twitterTitle = fitTitle(packageData.seoTwitterTitle || displayTitle, 90);
    const twitterDescriptionValue = packageData.seoTwitterDescription || description;
    const twitterDescription = twitterDescriptionValue.length > 160
        ? truncateText(twitterDescriptionValue, 157)
        : twitterDescriptionValue;
    const canonical = packageData.seoCanonicalUrl?.replace(
        /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i,
        ""
    ) || `/package/${resolvedParams.slug}`;
    const keywords = packageData.seoKeywords || [
        'travel package',
        'travel tour',
        displayDestination.toLowerCase(),
        packageData.category?.toLowerCase() || 'travel',
        'adventure travel',
        'vacation package',
        'Paradise Yatra'
    ];

    return {
        title: title,
        description: description,
        keywords: keywords,
        authors: [{ name: packageData.seoAuthor || 'Paradise Yatra' }],
        creator: packageData.seoAuthor || 'Paradise Yatra',
        publisher: packageData.seoAuthor || 'Paradise Yatra',
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        metadataBase: new URL(SITE_URL),
        alternates: {
            canonical,
        },
        openGraph: {
            title: openGraphTitle,
            description: openGraphDescription,
            url: canonical,
            siteName: 'Paradise Yatra',
            images: [
                {
                    url: packageData.seoOgImage || packageData.images?.[0] || packageData.image || '/banner.jpeg',
                    width: 1200,
                    height: 630,
                    alt: displayTitle,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: twitterTitle,
            description: twitterDescription,
            images: [packageData.seoTwitterImage || packageData.images?.[0] || packageData.image || '/banner.jpeg'],
            creator: '@paradiseyatra',
            site: '@paradiseyatra',
        },
        robots: {
            index: packageData.seoRobotsIndex !== false,
            follow: packageData.seoRobotsFollow !== false,
            googleBot: {
                index: packageData.seoRobotsIndex !== false,
                follow: packageData.seoRobotsFollow !== false,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
        },
    };
}

const PackageDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const resolvedParams = await params;
    const packageData = await getPackage(resolvedParams.slug);

    if (!packageData) {
        // Real 404 status (with the site's not-found page), not a "not found" message on a 200 page
        notFound();
    }

    // Normalize the data structure for the client component
    const normalizedData = {
        ...packageData,
        title: packageData.title || packageData.name || 'Travel Package',
        description: packageData.description || packageData.shortDescription || 'No description available.',
        shortDescription: packageData.shortDescription || packageData.description || 'Tour details coming soon.',
        destination: packageData.destination || packageData.location || 'Travel Destination',
        images: Array.isArray(packageData.images) && packageData.images.length > 0 ? packageData.images : (packageData.image ? [packageData.image] : []),
        price: packageData.price || 0,
        priceType: packageData.priceType || "per_person",
        originalPrice: packageData.originalPrice || 0,
        discount: packageData.discount || 0,
        duration: packageData.duration || 'N/A',
        category: packageData.category || 'Travel',
        highlights: Array.isArray(packageData.highlights) ? packageData.highlights : (typeof packageData.highlights === 'string' ? (packageData.highlights as string).split(',').map(h => h.trim()) : []),
        inclusions: Array.isArray(packageData.inclusions) ? packageData.inclusions : (packageData.inclusions ? [packageData.inclusions] : []),
        exclusions: Array.isArray(packageData.exclusions) ? packageData.exclusions : (packageData.exclusions ? [packageData.exclusions] : []),
        rating: packageData.rating || 0,
        reviews: packageData.reviews || [],
        isActive: packageData.isActive !== false,
        isFeatured: packageData.isFeatured || false,
        itinerary: Array.isArray(packageData.itinerary) ? packageData.itinerary : [],
    };

    const packageSchema = {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        name: normalizedData.title,
        description: stripHtmlTags(normalizedData.shortDescription),
        url: `${SITE_URL}/package/${encodeURIComponent(resolvedParams.slug)}`,
        image: [...normalizedData.images, ...(packageData.gallery || [])],
        ...(normalizedData.price > 0
            ? {
                offers: {
                    "@type": "Offer",
                    price: normalizedData.price,
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                },
            }
            : {}),
        ...(normalizedData.rating > 0 && normalizedData.reviews.length > 0
            ? {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: normalizedData.rating,
                    reviewCount: normalizedData.reviews.length,
                },
            }
            : {}),
    };
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Packages", item: `${SITE_URL}/package` },
            { "@type": "ListItem", position: 3, name: normalizedData.title, item: `${SITE_URL}/package/${encodeURIComponent(resolvedParams.slug)}` },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([packageSchema, breadcrumbSchema]).replace(/</g, "\\u003c"),
                }}
            />
            <PackageDetailClient packageData={normalizedData} slug={resolvedParams.slug} />
        </>
    );
};

export default PackageDetailPage;
