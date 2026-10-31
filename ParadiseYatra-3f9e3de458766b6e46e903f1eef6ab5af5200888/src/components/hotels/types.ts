export interface Hotel {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description?: string;
  city: string;
  state?: string;
  country?: string;
  address?: string;
  pricePerNight: number;
  originalPricePerNight?: number;
  starRating: number;
  features?: string[];
  amenities?: string[];
  images: string[];
  contactPhone?: string;
}

export interface StaySearch {
  city: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export const HOTEL_GUEST_LIMITS = {
  adults: 10,
  children: 12,
  rooms: 6,
} as const;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const nightsBetween = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return diff > 0 ? Math.round(diff / 86400000) : 0;
};

export const searchToQuery = (s: Partial<StaySearch>) => {
  const p = new URLSearchParams();
  if (s.city) p.set("city", s.city);
  if (s.checkIn) p.set("checkIn", s.checkIn);
  if (s.checkOut) p.set("checkOut", s.checkOut);
  if (s.adults) p.set("adults", String(s.adults));
  if (s.children) p.set("children", String(s.children));
  if (s.rooms) p.set("rooms", String(s.rooms));
  return p.toString();
};

export const queryToSearch = (p: URLSearchParams): StaySearch => ({
  city: p.get("city") || "",
  checkIn: p.get("checkIn") || "",
  checkOut: p.get("checkOut") || "",
  adults: Math.min(HOTEL_GUEST_LIMITS.adults, Math.max(1, Number(p.get("adults")) || 2)),
  children: Math.min(HOTEL_GUEST_LIMITS.children, Math.max(0, Number(p.get("children")) || 0)),
  rooms: Math.min(HOTEL_GUEST_LIMITS.rooms, Math.max(1, Number(p.get("rooms")) || 1)),
});
