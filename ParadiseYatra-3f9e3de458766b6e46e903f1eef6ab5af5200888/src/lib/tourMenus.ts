import { MapPin, Plane, type LucideIcon } from "lucide-react";

export type TourMenuKey = "international" | "india";

export type TourMenuConfig = {
  key: TourMenuKey;
  label: string;
  shortLabel: string;
  title: string;
  blurb: string;
  basePath: string;
  searchPlaceholder: string;
  noun: string;
  Icon: LucideIcon;
};

// Shared by the desktop nav dropdowns, the mobile sidebar and the region listing pages.
export const TOUR_MENUS: Record<TourMenuKey, TourMenuConfig> = {
  international: {
    key: "international",
    label: "International Packages",
    shortLabel: "International",
    title: "International Tour Packages",
    blurb: "Handpicked itineraries across Asia, Europe, the Middle East and beyond, planned end to end by our travel experts.",
    basePath: "/package/international",
    searchPlaceholder: "Search countries",
    noun: "countries",
    Icon: Plane,
  },
  india: {
    key: "india",
    label: "Domestic Packages",
    shortLabel: "Domestic",
    title: "India Tour Packages",
    blurb: "From the Himalayas to Kerala's backwaters, curated holidays across every corner of India.",
    basePath: "/package/india",
    searchPlaceholder: "Search states",
    noun: "states",
    Icon: MapPin,
  },
};

export const toLocationSlug = (value: string) => value.toLowerCase().replace(/\s+/g, "-");
