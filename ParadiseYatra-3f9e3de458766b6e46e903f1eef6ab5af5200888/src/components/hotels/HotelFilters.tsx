"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { HOTEL_FEATURE_GROUPS, type HotelFeature } from "./hotelFeatures";

export interface HotelFilterState {
  price: string; // "all" | "0-3000" | "3000-6000" | "6000-10000" | "10000+"
  stars: number[];
  amenities: string[];
  features: HotelFeature[];
}

export const defaultHotelFilters: HotelFilterState = { price: "all", stars: [], amenities: [], features: [] };

export const PRICE_OPTIONS = [
  { value: "all", label: "Any price" },
  { value: "0-3000", label: "Under ₹3,000" },
  { value: "3000-6000", label: "₹3,000 – ₹6,000" },
  { value: "6000-10000", label: "₹6,000 – ₹10,000" },
  { value: "10000+", label: "₹10,000 & above" },
];

export const priceToRange = (price: string): { min?: number; max?: number } => {
  if (price === "all") return {};
  if (price.endsWith("+")) return { min: Number(price.slice(0, -1)) };
  const [min, max] = price.split("-").map(Number);
  return { min, max };
};

interface Props {
  filters: HotelFilterState;
  setFilters: (f: HotelFilterState) => void;
  amenityOptions: string[];
  onClear: () => void;
  onApply?: () => void; // mobile dialog only
}

const Title = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-3 text-sm font-bold text-heading">{children}</h3>
);

// Checkbox-style row used for price, features and amenities (design.md filter sidebar)
const CheckRow = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
      active ? "bg-primary-light font-semibold text-primary" : "text-slate-600 hover:bg-slate-50"
    }`}
  >
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
        active ? "border-primary bg-primary text-white" : "border-slate-300 bg-white"
      }`}
    >
      {active && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
    <span className="flex-1">{label}</span>
  </button>
);

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
const dedicatedAmenities = new Set([
  "breakfastincluded", "freebreakfast", "breakfast",
  "dinnerincluded", "freedinner", "dinner",
  "allmealsincluded", "allinclusive",
  "freewifi", "freewi-fi", "wifi", "wi-fi",
  "parking", "freeparking",
  "swimmingpool", "pool",
  "airporttransfer", "airportshuttle",
  "familyrooms", "familyroom",
  "petfriendly", "petsallowed",
  "airconditioning", "air-conditioned", "ac",
  "roomheater", "heater", "spa", "wellness",
  "flexiblecancellation", "freecancellation",
]);

const HotelFilters = ({ filters, setFilters, amenityOptions, onClear, onApply }: Props) => {
  const moreAmenities = amenityOptions.filter((amenity) =>
    !dedicatedAmenities.has(amenity.toLowerCase().replace(/\s+/g, ""))
  );

  return (
    <div className="flex flex-col">
      <div className={`flex items-center justify-between p-6 pb-2 ${onApply ? "pr-14" : ""}`}>
        <h2 className="text-lg font-bold text-heading">Filter by</h2>
        <button type="button" onClick={onClear} className="cursor-pointer text-xs font-bold text-primary hover:underline">
          Reset all
        </button>
      </div>

      <div className="space-y-6 px-6 pb-6 pt-3">
        {/* Price */}
        <div>
          <Title>Price per night</Title>
          <div className="flex flex-col gap-1">
            {PRICE_OPTIONS.map((opt) => (
              <CheckRow
                key={opt.value}
                active={filters.price === opt.value}
                label={opt.label}
                onClick={() => setFilters({ ...filters, price: opt.value })}
              />
            ))}
          </div>
        </div>

        {/* Star rating */}
        <div>
          <Title>Star rating</Title>
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3, 2].map((s) => {
              const active = filters.stars.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilters({ ...filters, stars: toggle(filters.stars, s) })}
                  className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    active ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-primary-light text-primary hover:bg-primary/15"
                  }`}
                >
                  {s} ★
                </button>
              );
            })}
          </div>
        </div>

        {HOTEL_FEATURE_GROUPS.map((group) => (
          <div key={group.title}>
            <Title>{group.title}</Title>
            <div className="flex flex-col gap-1">
              {group.features.map((feature) => (
                <CheckRow
                  key={feature.value}
                  active={filters.features.includes(feature.value)}
                  label={feature.label}
                  onClick={() => setFilters({ ...filters, features: toggle(filters.features, feature.value) })}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Amenities */}
        {moreAmenities.length > 0 && (
          <div>
            <Title>More amenities</Title>
            <div className="flex flex-col gap-1">
              {moreAmenities.map((a) => (
                <CheckRow
                  key={a}
                  active={filters.amenities.includes(a)}
                  label={a}
                  onClick={() => setFilters({ ...filters, amenities: toggle(filters.amenities, a) })}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {onApply && (
        <div className="border-t border-slate-200 p-6 pt-4">
          <Button className="w-full" onClick={onApply}>
            Show results
          </Button>
        </div>
      )}
    </div>
  );
};

export default HotelFilters;