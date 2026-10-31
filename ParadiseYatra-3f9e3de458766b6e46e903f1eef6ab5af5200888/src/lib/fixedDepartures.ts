// Upcoming fixed departures, shared by the homepage carousel and the chat assistant.

export interface Departure {
    id: string;
    title: string;
    slug: string;
    destination: string;
    duration: string;
    price: number;
    departureDate: string;
    availableSeats?: number;
    image: string;
    description: string;
    points: string[];
}

interface RawDeparture {
    _id?: unknown;
    title?: string;
    slug?: string;
    destination?: string;
    duration?: string;
    price?: number;
    departureDate?: string;
    availableSeats?: unknown;
    images?: unknown;
    shortDescription?: string;
    description?: string;
    highlights?: unknown[];
    inclusions?: unknown[];
}

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80";

const resolveImage = (images: unknown): string => {
    const first = Array.isArray(images) && typeof images[0] === "string" ? images[0] : "";
    if (!first) return FALLBACK_IMAGE;
    if (first.startsWith("http") || first.startsWith("/")) return first;
    return `/api/uploaded-images/uploads/${first.split("/").pop()}`;
};

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

/** The next `limit` departures from today onwards, soonest first. */
export async function fetchUpcomingDepartures(limit = 6): Promise<Departure[]> {
    const res = await fetch("/api/fixed-departures?limit=100", { cache: "no-store" });
    // A failing server is an error (callers show "trouble connecting"), not "no departures"
    if (res.status >= 500) throw new Error(`Fixed departures request failed (${res.status})`);
    if (!res.ok) return [];
    const json = await res.json();
    const raw: RawDeparture[] = json.fixedDepartures || json.data || (Array.isArray(json) ? json : []);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return raw
        .filter((d) => d && d.slug && d.departureDate && new Date(d.departureDate) >= today)
        .sort((a, b) => new Date(a.departureDate!).getTime() - new Date(b.departureDate!).getTime())
        .slice(0, limit)
        .map((d) => ({
            id: String(d._id),
            title: d.title || "",
            slug: d.slug!,
            destination: d.destination || "",
            duration: d.duration || "",
            price: d.price || 0,
            departureDate: d.departureDate!,
            availableSeats: typeof d.availableSeats === "number" ? d.availableSeats : undefined,
            image: resolveImage(d.images),
            description: stripHtml(d.shortDescription || d.description || ""),
            points: (Array.isArray(d.highlights) && d.highlights.length ? d.highlights : d.inclusions || [])
                .filter((x): x is string => typeof x === "string")
                .slice(0, 2),
        }));
}
