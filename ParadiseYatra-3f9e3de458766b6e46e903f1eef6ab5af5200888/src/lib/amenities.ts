import { BedDouble, Camera, Car, Plane, Ship, TrainFront, User, Utensils, type LucideIcon } from "lucide-react";

// Package inclusions are usually full sentences ("Accommodation in 3-star hotel on twin sharing...").
// On cards each one becomes a short label with an icon, so they fit side by side.
// One inclusion can mention several things ("breakfast and dinner at the hotel"), so every rule is
// checked against every inclusion. "Airport/railway station pickup" is a transfer, not a flight or train.
const AMENITY_RULES: { pattern: RegExp; label: string; Icon: LucideIcon }[] = [
  { pattern: /\b(accommodation|hotel|stay|resort|camp|lodge|villa|room|houseboat|homestay)/i, label: "Hotel", Icon: BedDouble },
  { pattern: /\b(meal|breakfast|dinner|lunch|food)/i, label: "Meals", Icon: Utensils },
  { pattern: /\b(pick ?up|drop|cab|car|suv|transfer|transport|vehicle|bus|tempo|innova)/i, label: "Transfers", Icon: Car },
  { pattern: /\b(flights?\b|airfare|air ticket)/i, label: "Flights", Icon: Plane },
  { pattern: /\b(train (ticket|fare|journey)|rail ticket)/i, label: "Train", Icon: TrainFront },
  { pattern: /\b(cruise|ferry|boat ride|shikara)/i, label: "Cruise", Icon: Ship },
  { pattern: /\b(sightseeing|excursion)/i, label: "Sightseeing", Icon: Camera },
  { pattern: /\b(guide|escort|tour leader)/i, label: "Guide", Icon: User },
];

export type Amenity = { label: string; Icon: LucideIcon };

/** Short amenity labels (Hotel, Meals, Transfers...) found in a package's inclusions, in order. */
export const toAmenities = (inclusions: unknown[] = [], max = 4): Amenity[] => {
  const found: Amenity[] = [];
  for (const item of inclusions) {
    if (typeof item !== "string") continue;
    for (const rule of AMENITY_RULES) {
      if (found.length === max) return found;
      if (rule.pattern.test(item) && !found.some((f) => f.label === rule.label)) {
        found.push({ label: rule.label, Icon: rule.Icon });
      }
    }
  }
  return found;
};
