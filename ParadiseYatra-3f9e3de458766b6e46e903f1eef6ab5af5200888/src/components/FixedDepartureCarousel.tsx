"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, Clock, MapPin, Users } from "lucide-react";
import CarouselArrows from "@/components/ui/CarouselArrows";
import { Button } from "@/components/ui/button";
import { fetchUpcomingDepartures, type Departure } from "@/lib/fixedDepartures";

// Seat counts at or below this show as "filling fast"
const LOW_SEATS = 10;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const formatShortDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const FixedDepartureCarousel = () => {
    const [items, setItems] = useState<Departure[]>([]);
    const [loading, setLoading] = useState(true);
    const railRef = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const mapped = await fetchUpcomingDepartures(6);
                if (mounted) setItems(mapped);
            } catch (e) {
                console.error("Error loading fixed departures:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
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
    }, [items.length, updateScroll]);

    const scrollCards = (dir: 1 | -1) => {
        const el = railRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: "smooth" });
    };

    if (!loading && items.length === 0) return null;

    return (
        <section className="bg-white py-10 md:py-14">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Fixed dates · Fixed prices
                        </span>
                        <h2 className="mt-3 !text-[24px] font-extrabold leading-tight tracking-tight text-slate-900 sm:!text-3xl">
                            Upcoming Fixed Departures
                        </h2>
                        <p className="mt-2 text-sm font-medium text-slate-600 sm:text-base">
                            Group journeys with confirmed dates and a fixed price. Pick a departure and reserve your seat before it fills up.
                        </p>
                    </div>
                    {items.length > 1 && (
                        <div className="hidden shrink-0 md:block">
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

                <div>
                    <div
                        ref={railRef}
                        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-1 pb-5 pt-1 scrollbar-hide"
                    >
                        {loading ? (
                            <div className="h-[340px] w-[82%] max-w-[320px] shrink-0 animate-pulse rounded-3xl bg-slate-100 sm:w-[300px] md:h-[420px] md:w-full md:max-w-none" />
                        ) : (
                            items.map((d) => {
                                const date = new Date(d.departureDate);
                                const hasSeats = typeof d.availableSeats === "number" && d.availableSeats > 0;
                                const lowSeats = hasSeats && d.availableSeats! <= LOW_SEATS;

                                return (
                                    <article
                                        key={d.id}
                                        // A lone departure fills the row; with more, the next card peeks in on phones
                                        className={`group flex shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-900/15 md:min-h-[440px] md:w-full md:max-w-none md:flex-row ${
                                            items.length === 1 ? "w-full" : "w-[82%] max-w-[320px] sm:w-[300px]"
                                        }`}
                                    >
                                        {/* Image */}
                                        <div className="relative h-40 shrink-0 overflow-hidden bg-slate-800 md:h-auto md:w-[42%]">
                                            <Image
                                                src={d.image}
                                                alt={d.title}
                                                fill
                                                sizes="(max-width: 767px) 82vw, 42vw"
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {/* Fades the photo into the navy card */}
                                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent md:inset-y-0 md:left-0 md:right-[-1px] md:h-auto md:bg-gradient-to-r md:from-transparent md:via-slate-900/40 md:to-slate-900" />

                                            {/* Calendar badge */}
                                            <span className="absolute left-3 top-3 flex w-14 flex-col items-center overflow-hidden rounded-xl bg-white text-center shadow-md md:left-5 md:top-5 md:w-16">
                                                <span className="w-full bg-primary py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                                    {date.toLocaleDateString("en-IN", { month: "short" })}
                                                </span>
                                                <span className="py-1 text-xl font-extrabold leading-none text-slate-900 md:text-2xl">
                                                    {date.getDate()}
                                                </span>
                                            </span>

                                            <span className="glass-pill absolute right-3 top-3 md:right-5 md:top-5">
                                                <Users className="h-3 w-3" /> Group tour
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="relative flex flex-1 flex-col gap-3 overflow-hidden p-4 md:justify-center md:gap-4 md:p-8 lg:px-10">
                                            <div className="pointer-events-none absolute -right-16 -top-16 hidden h-48 w-48 rounded-full bg-primary/20 blur-2xl md:block" />

                                            {d.destination && (
                                                <span className="relative flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/15">
                                                    <MapPin className="h-3.5 w-3.5 text-primary" /> {d.destination}
                                                </span>
                                            )}

                                            <div className="relative">
                                                <h3 className="line-clamp-2 text-lg font-bold leading-snug !text-white md:text-2xl lg:text-[28px]">{d.title}</h3>
                                                {d.description && (
                                                    <p className="mt-2 hidden text-sm leading-relaxed text-slate-300 md:block">
                                                        <span className="line-clamp-2">{d.description}</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Trip facts */}
                                            <dl className="relative grid grid-cols-3 gap-2 md:gap-3">
                                                <div className="rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10 md:rounded-2xl md:p-3">
                                                    <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        <CalendarDays className="h-3 w-3 text-primary" /> Departs
                                                    </dt>
                                                    <dd className="mt-1 text-xs font-bold text-white md:text-sm">
                                                        <span className="md:hidden">{formatShortDate(d.departureDate)}</span>
                                                        <span className="hidden md:inline">{formatDate(d.departureDate)}</span>
                                                    </dd>
                                                </div>
                                                <div className="rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10 md:rounded-2xl md:p-3">
                                                    <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        <Clock className="h-3 w-3 text-primary" /> Duration
                                                    </dt>
                                                    <dd className="mt-1 text-xs font-bold text-white md:text-sm">{d.duration || "On request"}</dd>
                                                </div>
                                                <div className="rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10 md:rounded-2xl md:p-3">
                                                    <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        <Users className="h-3 w-3 text-primary" /> Seats
                                                    </dt>
                                                    <dd className={`mt-1 text-xs font-bold md:text-sm ${lowSeats ? "text-amber-300" : "text-white"}`}>
                                                        {hasSeats ? `${d.availableSeats} left` : "Limited"}
                                                    </dd>
                                                </div>
                                            </dl>

                                            {d.points.length > 0 && (
                                                <ul className="relative hidden flex-wrap gap-2 md:flex">
                                                    {d.points.map((point, index) => (
                                                        <li
                                                            key={`${point}-${index}`}
                                                            className="flex max-w-full items-center gap-1.5 text-sm text-slate-200"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                                                            <span className="line-clamp-1">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* Price + actions */}
                                            <div className="relative mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-3 md:mt-1 md:pt-4">
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-medium text-slate-400">Starting from</p>
                                                    <p className="whitespace-nowrap text-lg font-extrabold text-amber-300 md:text-2xl">
                                                        {formatPrice(d.price)}
                                                        <span className="ml-1 text-xs font-medium text-slate-400">/ person</span>
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <Link
                                                        href={`/fixed-departures/${d.slug}`}
                                                        className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10 lg:inline-flex"
                                                    >
                                                        View details
                                                    </Link>
                                                    <Button asChild size="sm" className="whitespace-nowrap md:h-10 md:px-5">
                                                        <Link href={`/fixed-departures/${d.slug}`}>
                                                            Book Now <ArrowUpRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Button asChild size="lg">
                        <Link href="/fixed-departures">
                            Explore All Fixed Departures <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FixedDepartureCarousel;
