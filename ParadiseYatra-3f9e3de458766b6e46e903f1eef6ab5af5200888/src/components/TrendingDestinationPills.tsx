"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Flame, Globe2, MapPin, TrendingUp } from "lucide-react";
import { getDestinationWebp } from "@/lib/utils";
import CarouselArrows from "@/components/ui/CarouselArrows";

type TourType = "international" | "india";

interface DestinationPill {
  name: string;
  count: number;
  /** Lowest package price there (0 when unknown) */
  from: number;
  image: string | null;
  href: string;
}

// India first: most of our trips are domestic
const TABS = [
  { key: "india", label: "India", Icon: MapPin, all: "/package/india", allLabel: "View all India tours" },
  { key: "international", label: "International", Icon: Globe2, all: "/package/international", allLabel: "View all international tours" },
] as const;

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const buildPills = (packages: { state?: string; country?: string; price?: number }[], key: "state" | "country", tourType: TourType): DestinationPill[] => {
  const byName = new Map<string, { count: number; from: number }>();
  packages.forEach((pkg) => {
    const name = typeof pkg[key] === "string" ? pkg[key]!.trim() : "";
    if (!name) return;
    const entry = byName.get(name) || { count: 0, from: 0 };
    const price = Number(pkg.price) || 0;
    entry.count += 1;
    if (price > 0 && (!entry.from || price < entry.from)) entry.from = price;
    byName.set(name, entry);
  });
  return Array.from(byName.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12)
    .map(([name, { count, from }]) => ({
      name,
      count,
      from,
      image: getDestinationWebp(name),
      href: `/package/${tourType}/${slugify(name)}`,
    }));
};

const TrendingDestinationPills = () => {
  const [tab, setTab] = useState<TourType>("india");
  const [data, setData] = useState<Record<TourType, DestinationPill[]>>({ international: [], india: [] });
  const [loading, setLoading] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [intl, india] = await Promise.all([
          fetch("/api/all-packages?tourType=international&limit=200&isActive=true&minimal=true"),
          fetch("/api/all-packages?tourType=india&limit=200&isActive=true&minimal=true"),
        ]);
        const intlPkgs = intl.ok ? (await intl.json()).packages || [] : [];
        const indiaPkgs = india.ok ? (await india.json()).packages || [] : [];
        if (!mounted) return;
        const next = {
          international: buildPills(intlPkgs, "country", "international"),
          india: buildPills(indiaPkgs, "state", "india"),
        };
        setData(next);
        // If there are no India packages, open on International instead of an empty rail
        if (next.india.length === 0 && next.international.length > 0) setTab("international");
      } catch (e) {
        console.error("Error loading trending destinations:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const pills = data[tab];
  const activeTab = TABS.find((t) => t.key === tab)!;

  const updateScroll = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    updateScroll();
    el.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      el.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [tab, pills.length, updateScroll]);

  const scrollByCards = (dir: 1 | -1) => railRef.current?.scrollBy({ left: dir * 520, behavior: "smooth" });

  if (!loading && data.international.length === 0 && data.india.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/60 via-background to-background py-14 md:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 md:mb-9 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary shadow-sm ring-1 ring-primary/10">
              <TrendingUp className="h-3.5 w-3.5" /> Top picks this season
            </span>
            <h2 className="mt-3 !text-[26px] font-extrabold leading-tight tracking-tight sm:!text-3xl">
              Trending <span className="text-primary">Destinations</span>
            </h2>
            <p className="mt-2 text-sm text-slate-600 md:text-base">The places our travellers are booking most right now.</p>
          </div>

          <div className="inline-flex w-fit rounded-full border border-slate-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Destination type">
            {TABS.map(({ key, label, Icon }) => {
              const active = tab === key;
              const count = data[key].length;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(key)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    active ? "bg-primary text-white shadow-md shadow-primary/25" : "text-slate-500 hover:text-heading"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {!loading && count > 0 && (
                    <span className={`rounded-full px-1.5 py-px text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Capsules */}
        <div className="group/carousel relative">
          <div className="hidden md:block">
            <CarouselArrows onPrevious={() => scrollByCards(-1)} onNext={() => scrollByCards(1)} canScrollLeft={canLeft} canScrollRight={canRight} />
          </div>
          <div
            ref={railRef}
            role="tabpanel"
            className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3.5 overflow-x-auto scroll-smooth px-4 pb-6 pt-2 scrollbar-hide md:mx-0 md:scroll-px-1 md:gap-5 md:px-1"
          >
            {loading
              ? [1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="h-64 w-[8.5rem] shrink-0 animate-pulse rounded-full bg-slate-200 md:h-80 md:w-40" />)
              : pills.map((pill, i) => (
                  <Link
                    key={pill.name}
                    href={pill.href}
                    aria-label={`${pill.name}: ${pill.count} ${pill.count === 1 ? "tour" : "tours"}${pill.from ? `, from ${inr(pill.from)}` : ""}`}
                    className="group relative h-64 w-[8.5rem] shrink-0 snap-start overflow-hidden rounded-full bg-slate-800 shadow-lg shadow-slate-900/15 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/20 md:h-80 md:w-40"
                  >
                    {pill.image ? (
                      <Image
                        src={pill.image}
                        alt=""
                        fill
                        // The capsule crops a landscape photo to its height, so the photo is drawn ~3.5x the capsule width
                        sizes="(max-width: 767px) 460px, 580px"
                        quality={80}
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-strong" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-transparent via-40% to-slate-950/90" />
                    {/* Inner glass rim */}
                    <div aria-hidden="true" className="absolute inset-1.5 rounded-full border border-white/15" />

                    {/* Rank */}
                    <span
                      className={`absolute left-1/2 top-5 flex h-9 min-w-9 -translate-x-1/2 items-center justify-center gap-0.5 rounded-full px-2 text-xs font-extrabold shadow-md md:top-6 ${
                        i < 3 ? "bg-tertiary text-slate-950" : "bg-slate-950/40 text-white ring-1 ring-white/30"
                      }`}
                    >
                      {i < 3 && <Flame className="h-3.5 w-3.5 fill-current" />}#{i + 1}
                    </span>

                    {/* Name, price and tours */}
                    <div className="absolute inset-x-2 bottom-7 flex flex-col items-center text-center md:bottom-9">
                      <h3 className="line-clamp-2 px-1 text-[15px] font-extrabold leading-tight !text-white drop-shadow md:text-lg">{pill.name}</h3>
                      {pill.from > 0 && (
                        <p className="mt-1 text-[11px] font-medium text-white/80">
                          from <span className="font-bold text-white">{inr(pill.from)}</span>
                        </p>
                      )}
                      <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-slate-950/45 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/25 transition-colors group-hover:bg-white group-hover:text-primary">
                        {pill.count} {pill.count === 1 ? "tour" : "tours"}
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
          </div>
        </div>

        <div className="mt-3 flex justify-center">
          <Link
            href={activeTab.all}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover"
          >
            {activeTab.allLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingDestinationPills;
