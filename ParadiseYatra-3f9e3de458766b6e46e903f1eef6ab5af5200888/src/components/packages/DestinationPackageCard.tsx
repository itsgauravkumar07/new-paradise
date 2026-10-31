"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock, MapPin, Send } from "lucide-react";
import { getImageUrl, getPackagePriceLabel } from "@/lib/utils";
import { toAmenities } from "@/lib/amenities";

/** The package fields this card uses (as returned by /api/all-packages). */
export interface ListingPackage {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
  image?: string;
  imageAlt?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  priceType?: string;
  duration?: string;
  state?: string;
  country?: string;
  location?: string;
  highlights?: unknown[];
  inclusions?: unknown[];
  isFeatured?: boolean;
  visitCount?: number;
  tags?: unknown[];
}

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

/** Percentage saved, from the original price (or the stored discount), or 0 when there's no saving. */
export const savingPercent = (pkg: ListingPackage) => {
  const price = Number(pkg.price) || 0;
  const original = Number(pkg.originalPrice) || 0;
  if (original > price && price > 0) return Math.round(((original - price) / original) * 100);
  return Number(pkg.discount) > 0 ? Math.round(Number(pkg.discount)) : 0;
};

const plainHighlights = (pkg: ListingPackage) =>
  (pkg.highlights ?? [])
    .filter((h): h is string => typeof h === "string" && h.trim() !== "")
    .map((h) => h.replace(/<[^>]*>/g, "").trim())
    .slice(0, 3);

interface DestinationPackageCardProps {
  pkg: ListingPackage;
  onEnquire: (pkg: ListingPackage) => void;
  /** Show the state/country (useful when the list spans several destinations). */
  showLocation?: boolean;
}

/** Wide listing card for destination pages: photo | details | price and actions. */
export default function DestinationPackageCard({ pkg, onEnquire, showLocation = false }: DestinationPackageCardProps) {
  const title = pkg.name || pkg.title || "Tour package";
  const href = `/package/${pkg.slug || pkg._id}`;
  const image = getImageUrl(pkg.image || null) || pkg.image || "";
  const price = Number(pkg.price) || 0;
  const original = Number(pkg.originalPrice) || 0;
  const saving = savingPercent(pkg);
  const highlights = plainHighlights(pkg);
  const amenities = toAmenities(pkg.inclusions ?? [], 4);
  const location = pkg.state || pkg.location?.split(",")[0].trim() || pkg.country;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl md:flex-row">
      {/* Photo */}
      <Link href={href} className="relative block h-52 shrink-0 overflow-hidden bg-primary-light md:h-auto md:w-[280px] lg:w-[300px]">
        {image && (
          <Image
            src={image}
            alt={pkg.imageAlt || title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {pkg.duration && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-900 shadow-md">
            <Clock className="h-3.5 w-3.5 text-primary" /> {pkg.duration}
          </span>
        )}
        {saving > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-badge-emerald px-2.5 py-1 text-xs font-bold text-white shadow-md">
            {saving}% OFF
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
        {showLocation && location && (
          <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-primary">
            <MapPin className="h-3.5 w-3.5" /> {location}
          </p>
        )}
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-heading">
          <Link href={href} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h3>

        {highlights.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
        )}

        {amenities.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {amenities.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                <Icon className="h-3 w-3" /> {label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Price + actions */}
      <div className="flex flex-col justify-between gap-4 border-t border-slate-100 p-5 md:w-56 md:border-l md:border-t-0 md:p-6">
        <div>
          <p className="text-xs text-slate-500">Starting from</p>
          {original > price && <p className="text-sm text-slate-400 line-through">{inr(original)}</p>}
          <p className="text-2xl font-extrabold text-primary">
            {price > 0 ? inr(price) : "On request"}
          </p>
          {price > 0 && <p className="text-xs font-medium text-slate-500">{getPackagePriceLabel(pkg.priceType).toLowerCase()}</p>}
        </div>
        <div className="flex gap-2 md:flex-col">
          <button
            type="button"
            onClick={() => onEnquire(pkg)}
            className="flex h-10 flex-1 cursor-pointer md:flex-none items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            <Send className="h-4 w-4" /> Enquire now
          </button>
          <Link
            href={href}
            className="flex h-10 flex-1 md:flex-none items-center justify-center gap-1 rounded-full border border-slate-200 px-4 text-sm font-bold text-slate-700 transition-colors hover:border-primary hover:text-primary"
          >
            View details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
