// Offers managed in Admin → Offers: the bar pinned to the top of the site and the home page offer cards.
// Backend: models/OfferBar.js, models/Offer.js, controllers/offerController.js.

export type OfferBarTheme = "sunset" | "ocean" | "emerald" | "royal" | "festive";

export interface OfferBarData {
  label: string;
  /** **bold** marks the highlighted part, e.g. "Save up to **40% off** on your trip" */
  message: string;
  linkUrl?: string;
  ctaText?: string;
  theme: OfferBarTheme;
  endsAt?: string | null;
  showCountdown?: boolean;
  /** Changes on every save (from the backend's updatedAt) */
  version: number;
}

export type OfferType = "package" | "hotel" | "general";

export interface OfferCard {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  type?: OfferType;
  discountText?: string;
  validUntil?: string | null;
  order: number;
  isActive: boolean;
}

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  package: "Package deal",
  hotel: "Hotel deal",
  general: "Special offer",
};

export const OFFER_BAR_THEMES: Record<OfferBarTheme, { name: string; background: string; chip: string }> = {
  sunset: {
    name: "Sunset (orange)",
    background: "linear-gradient(90deg, #fcd34d 0%, #fb923c 28%, #f97316 50%, #fb923c 72%, #fcd34d 100%)",
    chip: "rgba(124, 45, 18, 0.72)",
  },
  ocean: { name: "Ocean (blue)", background: "linear-gradient(90deg, #1e40af 0%, #2563eb 45%, #0ea5e9 100%)", chip: "rgba(15, 23, 42, 0.45)" },
  emerald: { name: "Emerald (green)", background: "linear-gradient(90deg, #065f46 0%, #059669 50%, #10b981 100%)", chip: "rgba(6, 42, 30, 0.5)" },
  royal: { name: "Royal (purple)", background: "linear-gradient(90deg, #4c1d95 0%, #7c3aed 55%, #db2777 100%)", chip: "rgba(30, 10, 60, 0.5)" },
  festive: { name: "Festive (red)", background: "linear-gradient(90deg, #991b1b 0%, #dc2626 50%, #f59e0b 100%)", chip: "rgba(69, 10, 10, 0.5)" },
};

/** Splits "Save **40% off** now" into plain and bold parts */
export const boldParts = (text: string) =>
  (text || "").split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part) => (/^\*\*[^*]+\*\*$/.test(part) ? { bold: true, text: part.slice(2, -2) } : { bold: false, text: part }));

/** Only site paths and web links are followed */
export const isSafeOfferLink = (url?: string) => !!url && (/^\/(?!\/)/.test(url) || /^https?:\/\//i.test(url));

/**
 * Runs before the bar is painted (inline in the root layout): hides it straight away when its end time
 * has already passed (a cached page can outlive the offer). Closing the bar is not remembered, so it
 * comes back on every page refresh. The header reads --offer-bar-h (globals.css), so it moves up with it.
 */
export const offerBarPrePaintScript = (bar: OfferBarData) =>
  bar.endsAt ? `if(Date.now()>=${new Date(bar.endsAt).getTime()})document.documentElement.classList.add("offer-bar-dismissed");` : "";
