"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Check,
  Coffee,
  Dumbbell,
  MapPin,
  Mountain,
  ParkingCircle,
  Snowflake,
  Sparkles,
  Star,
  Users,
  Utensils,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { isSampleContent } from "@/lib/seo";
import { Hotel } from "@/components/hotels/types";
import SectionHeader from "@/components/ui/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// Icons for the amenity wording hotels use most
const AMENITY_ICONS: [RegExp, LucideIcon][] = [
  [/wi-?fi|internet/i, Wifi],
  [/pool/i, Waves],
  [/breakfast|coffee/i, Coffee],
  [/meal|dinner|lunch|restaurant|dining/i, Utensils],
  [/parking/i, ParkingCircle],
  [/spa|wellness/i, Sparkles],
  [/gym|fitness/i, Dumbbell],
  [/\bac\b|air.?condition/i, Snowflake],
  [/view|mountain|valley|lake|river|ganga/i, Mountain],
  [/family|kids/i, Users],
];
const amenityIcon = (label: string) => AMENITY_ICONS.find(([re]) => re.test(label))?.[1] || Check;

const LuxuryHotelsSection = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/hotels?sort=recommended&limit=20", { cache: "no-store", signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        // Placeholder "(Sample)" hotels never appear on the home page
        if (d?.success && Array.isArray(d.hotels)) setHotels((d.hotels as Hotel[]).filter((h) => !isSampleContent(h.name, h.slug)).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const updateScroll = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      el.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [hotels.length, updateScroll]);

  const scrollCards = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("article");
    rail.scrollBy({ left: dir * ((card?.getBoundingClientRect().width ?? 290) + 24), behavior: "smooth" });
  };

  // Hide the whole section if the hotels API has nothing to show
  if (!loading && hotels.length === 0) return null;

  const cardWidth = "w-[82%] max-w-[320px] sm:w-[300px] lg:w-[calc((100%-4.5rem-4px)/4)] lg:max-w-none";

  return (
    <section className="bg-gradient-to-b from-white via-primary-light/40 to-white py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
          eyebrow="Handpicked stays"
          eyebrowIcon={<BedDouble />}
          titleClassName="!text-[24px] leading-tight tracking-tight sm:!text-3xl md:!text-3xl"
          title="Relax in Luxury Hotels"
          description={
            <>
              <span className="md:hidden">Handpicked stays for a relaxing getaway.</span>
              <span className="hidden md:inline">
                World-class hospitality, breathtaking views and real comfort, handpicked by our team for unforgettable stays.
              </span>
            </>
          }
          action={
            <div className="flex items-center gap-4">
              {hotels.length > 1 && (
                <div className="hidden md:block">
                  <CarouselArrows
                    variant="compact"
                    onPrevious={() => scrollCards(-1)}
                    onNext={() => scrollCards(1)}
                    canScrollLeft={canLeft}
                    canScrollRight={canRight}
                  />
                </div>
              )}
            </div>
          }
        />

        <div ref={railRef} className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-8 pt-2 scrollbar-hide md:mx-0 md:scroll-px-1 md:gap-6 md:px-1">
          {loading
            ? [1, 2, 3, 4].map((i) => <div key={i} className={`h-[440px] shrink-0 animate-pulse rounded-3xl bg-slate-100 ${cardWidth}`} />)
            : hotels.map((hotel) => {
                const img = getImageUrl(hotel.images?.[0] || null);
                const hasDiscount = !!hotel.originalPricePerNight && hotel.originalPricePerNight > hotel.pricePerNight;
                const discount = hasDiscount
                  ? Math.round(((hotel.originalPricePerNight! - hotel.pricePerNight) / hotel.originalPricePerNight!) * 100)
                  : 0;
                const perks = (hotel.amenities?.length ? hotel.amenities : hotel.features || []).slice(0, 3);
                // "Goa, Goa" -> "Goa"
                const location = [hotel.city, hotel.state].filter((v, i, all) => v && all.indexOf(v) === i).join(", ");
                const stars = Math.max(0, Math.min(5, Math.round(hotel.starRating || 0)));
                return (
                  <article
                    key={hotel._id}
                    className={`group flex shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[0_24px_50px_-24px_rgba(37,99,235,0.45)] ${cardWidth}`}
                  >
                    <Link href={`/hotels/${hotel.slug}`} className="relative block h-52 overflow-hidden bg-primary-light">
                      {img ? (
                        <Image src={img} alt={hotel.name} fill sizes="(max-width: 768px) 80vw, 340px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-primary/30">
                          <BedDouble className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-slate-950/20" />

                      {discount >= 5 && (
                        <span className="absolute left-3 top-3 rounded-full bg-badge-emerald px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-md">
                          {discount}% OFF
                        </span>
                      )}
                      {stars > 0 && (
                        <span className="absolute right-3 top-3 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-1 shadow-md" aria-label={`${stars} star hotel`}>
                          {Array.from({ length: stars }, (_, i) => (
                            <Star key={i} className="h-3 w-3 fill-tertiary text-tertiary" />
                          ))}
                        </span>
                      )}
                      {location && (
                        <span className="absolute bottom-3 left-3 flex max-w-[85%] items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{location}</span>
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-2 text-[17px] font-extrabold leading-snug text-heading">
                        <Link href={`/hotels/${hotel.slug}`} className="transition-colors hover:text-primary">
                          {hotel.name}
                        </Link>
                      </h3>
                      {hotel.shortDescription && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{hotel.shortDescription}</p>}

                      {perks.length > 0 && (
                        <ul className="mt-3.5 flex flex-wrap gap-x-3 gap-y-1.5">
                          {perks.map((perk) => {
                            const Icon = amenityIcon(perk);
                            return (
                              <li key={perk} className="flex max-w-full items-center gap-1 text-xs font-semibold text-slate-600">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                                  <Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="truncate">{perk}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-slate-200 pt-4">
                        <div className="leading-tight">
                          <p className="text-[11px] font-medium text-slate-400">
                            Per night {hasDiscount && <span className="ml-0.5 line-through">{inr(hotel.originalPricePerNight!)}</span>}
                          </p>
                          <p className="mt-0.5 whitespace-nowrap text-xl !font-black text-primary">{inr(hotel.pricePerNight)}</p>
                        </div>
                        <Link
                          href={`/hotels/${hotel.slug}`}
                          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-primary px-3.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover"
                        >
                          View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default LuxuryHotelsSection;
