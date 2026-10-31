"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import React from "react";
import { getImageUrl } from "@/lib/utils";
import { toAmenities } from "@/lib/amenities";

interface PackageCardProps {
    id: string | number;
    destination: string;
    duration: string;
    title: string;
    price: number;
    /** Price before discount; shown struck through, with a "% OFF" ribbon, when higher than price */
    originalPrice?: number;
    image: string;
    imageAlt?: string;
    slug: string;
    hrefPrefix: string;
    priceLabel: string; // e.g., "Per Couple" or "Per Person"
    showDestination?: boolean;
    itinerary?: any[];
    /** No longer used by the design. Kept optional so existing callers still compile. */
    themeColor?: string;
    /** Optional extras (pass them when the data is available) */
    rating?: number;
    reviewCount?: number;
    badge?: string;
    /** Up to 4 short strings, e.g. ["3★ Hotels", "Daily Meals", "Private Cab", "Tour Guide"] */
    inclusions?: string[];
    /** Optional short description (plain text or HTML), shown as two lines under the title */
    description?: string;
    className?: string;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// "Himachal Pradesh , India" -> "Himachal Pradesh, India"
const tidyPlace = (value: string) => value.replace(/\s+,/g, ",").replace(/\s{2,}/g, " ").trim();

const PackageCard: React.FC<PackageCardProps> = ({
    destination,
    duration,
    title,
    price,
    originalPrice,
    image,
    imageAlt,
    slug,
    hrefPrefix,
    priceLabel,
    showDestination = true,
    rating,
    reviewCount,
    badge,
    inclusions,
    description,
    className = "",
}) => {
    const summary = description
        ? description.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim()
        : "";
    const optimizedImage =
        getImageUrl(image, {
            width: "auto",
            height: 600,
            crop: "fill",
            gravity: "auto",
            quality: "good",
        }) || image;
    const altText = imageAlt?.trim() || title || destination || "Package image";
    const href = `${hrefPrefix}/${slug}`;
    const perks = toAmenities((inclusions ?? []).filter((i): i is string => typeof i === "string"));
    const unit = priceLabel?.replace(/^per\s+/i, "") || "Person";
    const place = tidyPlace(destination || "");

    const hasRating = typeof rating === "number" && rating > 0;
    const was = Number(originalPrice) || 0;
    const saving = was > price && price > 0 ? Math.round(((was - price) / was) * 100) : 0;
    const ribbon = badge || (saving >= 5 ? `${saving}% OFF` : "");

    // Same layout as the hotel cards in LuxuryHotelsSection
    return (
        <article
            className={`group flex w-[290px] shrink-0 flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[0_24px_50px_-24px_rgba(37,99,235,0.45)] ${className}`}
        >
            <Link href={href} className="relative block h-52 overflow-hidden bg-primary-light">
                <Image
                    src={optimizedImage}
                    alt={altText}
                    fill
                    sizes="(max-width: 768px) 80vw, 340px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-slate-950/20" />

                {ribbon && (
                    <span className="absolute left-3 top-3 rounded-full bg-badge-emerald px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-md">
                        {ribbon}
                    </span>
                )}
                {duration && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-md">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {duration}
                    </span>
                )}
                {showDestination && place && (
                    <span className="absolute bottom-3 left-3 flex max-w-[70%] items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{place}</span>
                    </span>
                )}
                {hasRating && (
                    <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-900 shadow-md">
                        <Star className="h-3.5 w-3.5 fill-tertiary text-tertiary" />
                        {rating!.toFixed(1)}
                        {reviewCount ? <span className="font-medium text-muted-foreground">({reviewCount})</span> : null}
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 text-[17px] font-extrabold leading-snug text-heading">
                    <Link href={href} className="transition-colors hover:text-primary">
                        {title}
                    </Link>
                </h3>

                {summary && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{summary}</p>}

                {perks.length > 0 && (
                    <ul className="mt-3.5 flex flex-wrap gap-x-3 gap-y-1.5">
                        {perks.map(({ label, Icon }) => (
                            <li key={label} className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light text-primary">
                                    <Icon className="h-3.5 w-3.5" />
                                </span>
                                {label}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-slate-200 pt-4">
                    <div className="leading-tight">
                        <p className="text-[11px] font-medium text-slate-400">
                            Starting from {saving > 0 && <span className="ml-0.5 text-slate-400 line-through">{inr(was)}</span>}
                        </p>
                        <p className="mt-0.5 whitespace-nowrap text-xl !font-black text-primary">
                            {inr(price)}
                            <span className="ml-1 text-xs font-medium text-muted-foreground">/ {unit.toLowerCase()}</span>
                        </p>
                    </div>
                    <Link
                        href={href}
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-primary px-3.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover"
                    >
                        View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default PackageCard;
