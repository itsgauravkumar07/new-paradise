"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, MapPin, TrendingUp } from "lucide-react";
import { getDestinationWebp, getImageUrl } from "@/lib/utils";
import { TOUR_MENUS, toLocationSlug, type TourMenuKey } from "@/lib/tourMenus";

interface DestinationStat {
  name: string;
  count: number;
  minPrice: number | null;
  image: string | null;
  href: string;
}

interface MinimalPackage {
  state?: string;
  country?: string;
  image?: string;
  price?: number;
}

// One large tile + three small tiles + the "view all" tile
const TILE_COUNT = 4;

const buildStats = (packages: MinimalPackage[], tourType: TourMenuKey): DestinationStat[] => {
  const field = tourType === "india" ? "state" : "country";
  const groups = new Map<string, { count: number; minPrice: number | null; packageImage: string | null }>();

  packages.forEach((pkg) => {
    const name = pkg[field]?.trim();
    if (!name) return;
    const group = groups.get(name) || { count: 0, minPrice: null, packageImage: null };
    group.count += 1;
    const price = Number(pkg.price) || 0;
    if (price > 0 && (group.minPrice === null || price < group.minPrice)) group.minPrice = price;
    if (!group.packageImage && pkg.image) group.packageImage = getImageUrl(pkg.image) || null;
    groups.set(name, group);
  });

  return Array.from(groups, ([name, group]) => ({
    name,
    count: group.count,
    minPrice: group.minPrice,
    image: getDestinationWebp(name) || group.packageImage,
    href: `${TOUR_MENUS[tourType].basePath}/${toLocationSlug(name)}`,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const DestinationTile = ({ stat, rank, large }: { stat: DestinationStat; rank: number; large: boolean }) => (
  <Link
    href={stat.href}
    className={`group relative h-80 w-[72vw] max-w-xs shrink-0 snap-start overflow-hidden rounded-3xl bg-slate-900 shadow-lg shadow-slate-900/10 md:h-60 md:w-auto md:max-w-none lg:h-auto ${
      large ? "md:col-span-2 md:h-80 lg:row-span-2 lg:h-auto" : ""
    }`}
  >
    {stat.image ? (
      <Image
        src={stat.image}
        alt={stat.name}
        fill
        sizes={large ? "(max-width: 768px) 72vw, 50vw" : "(max-width: 768px) 72vw, 25vw"}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-strong to-slate-900">
        <MapPin className="h-16 w-16 text-white/10" />
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

    <span
      className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-extrabold ${
        rank === 1 ? "bg-tertiary text-slate-950 shadow-md" : "glass-pill"
      }`}
    >
      #{rank}
    </span>
    <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-primary">
      <ArrowUpRight className="h-4 w-4" />
    </span>

    <div className={`absolute inset-x-0 bottom-0 ${large ? "p-6 lg:p-8" : "p-5"}`}>
      {large && (
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-300">
          <TrendingUp className="h-3.5 w-3.5" />
          Top pick right now
        </p>
      )}
      <h3 className={`font-extrabold leading-tight !text-white drop-shadow ${large ? "text-2xl lg:text-4xl" : "text-xl"}`}>
        {stat.name}
      </h3>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-white ring-1 ring-white/20 backdrop-blur-md">
          {stat.count} {stat.count === 1 ? "tour" : "tours"}
        </span>
        {stat.minPrice !== null && (
          <span className="rounded-full bg-white px-2.5 py-1 text-slate-900">
            From <span className="font-extrabold text-primary">{formatPrice(stat.minPrice)}</span>
          </span>
        )}
      </div>
    </div>
  </Link>
);

/** Ranked mosaic of the destinations with the most active packages, per tour type. */
const TrendingDestinationsShowcase = () => {
  const [tab, setTab] = useState<TourMenuKey>("international");
  const [data, setData] = useState<Record<TourMenuKey, DestinationStat[]>>({ international: [], india: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [intl, india] = await Promise.all([
          fetch("/api/all-packages?tourType=international&limit=200&isActive=true&minimal=true"),
          fetch("/api/all-packages?tourType=india&limit=200&isActive=true&minimal=true"),
        ]);
        const intlPackages: MinimalPackage[] = intl.ok ? (await intl.json()).packages || [] : [];
        const indiaPackages: MinimalPackage[] = india.ok ? (await india.json()).packages || [] : [];
        if (!mounted) return;
        const next = {
          international: buildStats(intlPackages, "international"),
          india: buildStats(indiaPackages, "india"),
        };
        setData(next);
        if (next.international.length === 0 && next.india.length > 0) setTab("india");
      } catch (error) {
        console.error("Error loading trending destinations:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && data.international.length === 0 && data.india.length === 0) return null;

  const menu = TOUR_MENUS[tab];
  const stats = data[tab];
  const tiles = stats.slice(0, TILE_COUNT);

  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
              Where travellers are heading
            </span>
            <h2 className="mt-3 !text-[24px] font-extrabold leading-tight tracking-tight text-slate-900 sm:!text-3xl">
              Trending Destinations
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600 sm:text-base">
              Our most-loved destinations, ranked by the number of tours on offer. Pick one and start planning.
            </p>
          </div>

          <div className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-100 p-1" role="tablist">
            {(Object.keys(TOUR_MENUS) as TourMenuKey[]).map((key) => {
              const { Icon, shortLabel } = TOUR_MENUS[key];
              const active = tab === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                    active ? "bg-primary text-white shadow-md" : "text-slate-500 hover:text-heading"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-2 lg:h-[480px] lg:grid-cols-4 lg:grid-rows-2">
            {Array.from({ length: TILE_COUNT + 1 }).map((_, index) => (
              <div
                key={index}
                className={`h-80 w-[72vw] max-w-xs shrink-0 animate-pulse rounded-3xl bg-slate-200 md:h-60 md:w-auto md:max-w-none lg:h-auto ${
                  index === 0 ? "md:col-span-2 md:h-80 lg:row-span-2 lg:h-auto" : ""
                }`}
              />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:h-[480px] lg:grid-cols-4 lg:grid-rows-2"
            >
              {tiles.map((stat, index) => (
                <DestinationTile key={stat.name} stat={stat} rank={index + 1} large={index === 0} />
              ))}

              {/* View all */}
              <Link
                href={menu.basePath}
                className="group relative flex h-80 w-[72vw] max-w-xs shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-strong p-6 text-white shadow-lg shadow-primary/20 md:h-60 md:w-auto md:max-w-none lg:h-auto"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/5" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  <menu.Icon className="h-5 w-5" />
                </span>
                <div className="relative">
                  <p className="text-3xl font-extrabold !text-white">{stats.length}</p>
                  <p className="text-sm font-medium text-white/80">
                    {menu.noun} to explore
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary transition-colors group-hover:bg-primary-light">
                    View all {menu.shortLabel.toLowerCase()}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

export default TrendingDestinationsShowcase;
