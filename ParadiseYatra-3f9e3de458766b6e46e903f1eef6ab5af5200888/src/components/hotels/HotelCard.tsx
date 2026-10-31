"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, BedDouble } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { Hotel, StaySearch, nightsBetween } from "./types";

const HotelCard = ({ hotel, search, returnQuery }: { hotel: Hotel; search: StaySearch; returnQuery: string }) => {
  const img = getImageUrl(hotel.images?.[0] || null);
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const hasDiscount = !!hotel.originalPricePerNight && hotel.originalPricePerNight > hotel.pricePerNight;
  const discount = hasDiscount
    ? Math.round(((hotel.originalPricePerNight! - hotel.pricePerNight) / hotel.originalPricePerNight!) * 100)
    : 0;
  const total = nights > 0 ? hotel.pricePerNight * nights * search.rooms : 0;
  const amenities = hotel.amenities || [];
  return (
    <Link
      href={`/hotels/${hotel.slug}${returnQuery ? `?${returnQuery}` : ""}`}
      className="group flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-3 card-lift md:flex-row"
    >
      <div className="relative h-48 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-200 md:h-auto md:min-h-[11rem] md:w-60">
        {img ? (
          <Image
            src={img}
            alt={hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, 288px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <BedDouble className="h-10 w-10" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-badge-emerald px-3 py-1 text-xs font-bold text-white">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-1 md:flex-row md:p-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-0.5" aria-label={`${hotel.starRating} star hotel`}>
            {Array.from({ length: Math.max(0, hotel.starRating) }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-tertiary text-tertiary" />
            ))}
          </div>
          <h3 className="!text-base !font-bold !text-heading line-clamp-1">{hotel.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 !text-xs !text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            {[hotel.city, hotel.state].filter(Boolean).join(", ")}
          </p>
          <p className="mt-2 line-clamp-1 !text-xs !text-slate-600">{hotel.shortDescription}</p>
          {amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {amenities.slice(0, 3).map((a) => (
                <span key={a} className="rounded-full bg-surface-subtle px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-100">
                  {a}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                  +{amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-1 text-right md:w-44 md:flex-col md:items-end md:justify-center md:border-l md:border-slate-100 md:pl-4">
          <div>
            {hasDiscount && (
              <p className="!text-xs !text-slate-400 line-through">₹{hotel.originalPricePerNight!.toLocaleString("en-IN")}</p>
            )}
            <p className="!text-2xl !font-extrabold !text-primary">₹{hotel.pricePerNight.toLocaleString("en-IN")}</p>
            <p className="!text-[11px] !text-slate-400">per night + taxes</p>
            {total > 0 && (
              <p className="mt-1 !text-[11px] !font-semibold !text-slate-600">
                ₹{total.toLocaleString("en-IN")} for {nights} night{nights > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <span className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 transition-colors group-hover:bg-primary-hover">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;