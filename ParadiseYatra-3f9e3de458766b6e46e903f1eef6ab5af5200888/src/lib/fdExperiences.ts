// Past fixed-departure trips ("group experiences") managed in Admin > Past Group Trips.

export interface FDReview {
  _id?: string;
  name: string;
  location?: string;
  rating: number;
  text: string;
  photo?: string;
}

export interface FDExperience {
  _id: string;
  title: string;
  destination: string;
  tripDate?: string;
  duration?: string;
  groupSize?: number;
  coverImage: string;
  gallery: string[];
  story?: string;
  highlights: string[];
  videoUrl?: string;
  reviews: FDReview[];
  fixedDeparture?: string | { _id: string; title: string; slug: string } | null;
  isActive: boolean;
  order: number;
}

export const averageRating = (reviews: FDReview[]) =>
  reviews.length ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length : 0;

/** The YouTube video id from a watch, share, shorts or embed link; null for anything else. */
export const youtubeId = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
};

export async function fetchPastTrips(params: { destination?: string; limit?: number } = {}): Promise<FDExperience[]> {
  const query = new URLSearchParams();
  if (params.destination) query.set("destination", params.destination);
  if (params.limit) query.set("limit", String(params.limit));
  const res = await fetch(`/api/fd-experiences?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data?.experiences) ? data.experiences : [];
}
