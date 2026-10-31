"use client";

import { BadgeCheck, BedDouble, Briefcase, CalendarCheck, MapPin, Search, ShieldCheck, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getDestinationWebp } from "@/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";
import { COMPANY } from "@/lib/chat/company";

const HotelSearchBar = dynamic(() => import("./hotels/HotelSearchBar"), { ssr: false });

interface FeaturedDestinationCard {
  name: string;
  image: string | null;
  size: "normal" | "tall";
  href: string;
}

const slugifyLocation = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  // Every state / country we have packages for (lower-case name -> its destination page)
  const [places, setPlaces] = useState<Record<string, string>>({});
  const [typingText, setTypingText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [featuredDestinations, setFeaturedDestinations] = useState<FeaturedDestinationCard[]>([]);
  const [mode, setMode] = useState<"packages" | "hotels">("packages");
  const [packageCount, setPackageCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.trim() || isSearchFocused) {
      setTypingText("");
      setIsDeleting(false);
      return;
    }

    const targets = featuredDestinations.length > 0
      ? featuredDestinations.map((destination) => destination.name)
      : ["Ladakh", "Kerala", "Kashmir", "Himachal Pradesh"];
    const currentText = targets[currentTextIndex % targets.length];
    let timer: number;

    if (!isDeleting && typingText.length < currentText.length) {
      timer = window.setTimeout(() => {
        setTypingText(currentText.slice(0, typingText.length + 1));
      }, 58);
    } else if (!isDeleting) {
      timer = window.setTimeout(() => setIsDeleting(true), 700);
    } else if (typingText.length > 0) {
      timer = window.setTimeout(() => {
        setTypingText(currentText.slice(0, typingText.length - 1));
      }, 26);
    } else {
      timer = window.setTimeout(() => {
        setIsDeleting(false);
        setCurrentTextIndex((index) => (index + 1) % targets.length);
      }, 24);
    }

    return () => window.clearTimeout(timer);
  }, [featuredDestinations, searchQuery, isSearchFocused, currentTextIndex, isDeleting, typingText]);

  useEffect(() => {
    let isMounted = true;

    const buildFeaturedDestinations = async () => {
      try {
        const [indiaResponse, internationalResponse] = await Promise.all([
          fetch("/api/all-packages?tourType=india&limit=200&isActive=true&minimal=true"),
          fetch("/api/all-packages?tourType=international&limit=200&isActive=true&minimal=true"),
        ]);

        const indiaPackages = indiaResponse.ok ? ((await indiaResponse.json()).packages || []) : [];
        const internationalPackages = internationalResponse.ok ? ((await internationalResponse.json()).packages || []) : [];

        const mapPackagesToCards = (
          packages: any[],
          key: "state" | "country",
          tourType: "india" | "international"
        ) => {
          const uniqueCards = new Map<string, FeaturedDestinationCard>();

          packages.forEach((pkg: any) => {
            const locationName = typeof pkg[key] === "string" ? pkg[key].trim() : "";
            if (!locationName || uniqueCards.has(locationName)) return;

            const image = getDestinationWebp(locationName);
            if (!image) return;

            uniqueCards.set(locationName, {
              name: locationName,
              image,
              size: "normal",
              href: `/package/${tourType}/${slugifyLocation(locationName)}`,
            });
          });

          return Array.from(uniqueCards.values());
        };

        if (isMounted) setPackageCount(indiaPackages.length + internationalPackages.length);

        const placeIndex: Record<string, string> = {};
        const addPlaces = (list: { state?: string; country?: string }[], key: "state" | "country", tourType: "india" | "international") =>
          list.forEach((pkg) => {
            const name = typeof pkg[key] === "string" ? pkg[key]!.trim() : "";
            if (name) placeIndex[name.toLowerCase()] = `/package/${tourType}/${slugifyLocation(name)}`;
          });
        addPlaces(indiaPackages, "state", "india");
        addPlaces(internationalPackages, "country", "international");
        if (isMounted) setPlaces(placeIndex);

        const indiaCards = mapPackagesToCards(indiaPackages, "state", "india");
        const internationalCards = mapPackagesToCards(internationalPackages, "country", "international");

        const mixedCards: FeaturedDestinationCard[] = [];
        const maxCards = Math.min(10, indiaCards.length + internationalCards.length);

        for (let i = 0; mixedCards.length < maxCards; i += 1) {
          if (i < indiaCards.length) mixedCards.push(indiaCards[i]);
          if (mixedCards.length >= maxCards) break;
          if (i < internationalCards.length) mixedCards.push(internationalCards[i]);
        }

        const sizedCards = mixedCards.map((card) => ({
          ...card,
          size: "normal" as const,
        }));

        if (isMounted) {
          setFeaturedDestinations(sizedCards);
        }
      } catch (error) {
        console.error("Error preloading featured destinations:", error);
      }
    };

    buildFeaturedDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Search straight from the hero bar: a place we sell opens its destination page; anything else
  // ("honeymoon", "char dham", "7 days") opens the search results page.
  const runSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      router.push("/package");
      return;
    }
    const lower = query.toLowerCase();
    const exact = places[lower];
    const partial = lower.length >= 3 ? Object.keys(places).filter((name) => name.includes(lower)) : [];
    const target = exact || (partial.length === 1 ? places[partial[0]] : "");
    router.push(target || `/search?q=${encodeURIComponent(query)}`);
  };

    // "https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    // "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    // "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    // "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    // "https://images.unsplash.com/photo-1513326738677-b964603b136d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    // "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    // "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",

  const BACKGROUND_IMAGES = [
  
    "https://images.unsplash.com/photo-1585086814044-71b3843c05e8?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1674164969153-9585afeef473?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1727622765649-1af1d87ee018?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1614088459293-5669fadc3448?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [slideCycle, setSlideCycle] = useState(0);

  // Next photo every 6 seconds (matches the progress line in globals.css); a click on an indicator restarts the wait
  useEffect(() => {
    const bgTimer = window.setTimeout(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
      setSlideCycle((n) => n + 1);
    }, 6000);
    return () => window.clearTimeout(bgTimer);
  }, [currentBgIndex, slideCycle, BACKGROUND_IMAGES.length]);

  return (
    <div className="relative flex flex-col font-plus-jakarta-sans">
      {/* Hero background: photo slideshow with a slow zoom on the current slide */}
      <div className="absolute inset-0 overflow-hidden bg-slate-900">
        {BACKGROUND_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              index === currentBgIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={src}
              alt={`Travel destination ${index + 1}`}
              fill
              priority={index === 0}
              // On phones the tall hero crops a wide photo, so it is drawn ~2.4x the screen width
              sizes="(max-width: 767px) 240vw, 100vw"
              className={`object-cover object-center md:object-[center_20%] ${index === currentBgIndex ? "hero-kenburns" : ""}`}
            />
          </div>
        ))}
        {/* Darker at the top (header) and bottom (text), lighter in the middle so the photo shows */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/35 to-slate-950/85" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,6,23,0.55)_100%)]" />
      </div>

      {/* Hero content */}
      <main className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-4 pb-14 pt-[calc(var(--offer-bar-h,0px)+5.5rem)] text-center sm:px-6 md:min-h-screen md:pb-24">
        <div className="w-full max-w-5xl">
          <div className="mx-auto w-full max-w-3xl lg:max-w-4xl">
            {/* Announcement pill */}
            <span className="hero-rise inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1 pl-1 pr-3 text-[11px] font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-md">
              <span className="shrink-0 rounded-full bg-tertiary px-2 py-0.5 text-[10px] font-extrabold text-slate-950">New 2026</span>
              <span className="truncate sm:hidden">Explore curated trips</span>
              <span className="hidden truncate sm:inline">
                {packageCount > 0 ? `Explore ${packageCount}+ Curated Packages & Expeditions` : "Explore Curated Packages & Expeditions"}
              </span>
            </span>

            {/* One copy of the heading text (search engines read it once); on phones it breaks into two lines */}
            <h1
              className="hero-rise mt-4 text-balance !text-[1.55rem] font-extrabold !leading-[1.1] tracking-tight !text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)] max-[380px]:!text-[1.35rem] sm:!text-[2.5rem] lg:!text-[3.25rem]"
              style={{ animationDelay: "80ms" }}
            >
              <span className="whitespace-nowrap sm:whitespace-normal">Discover The World&apos;s</span>{" "}
              <br className="sm:hidden" />
              <span className="whitespace-nowrap sm:whitespace-normal">
                Most{" "}
                <span className="bg-gradient-to-r from-amber-200 via-white to-sky-200 bg-clip-text text-transparent">
                  Extraordinary Places
                </span>
              </span>
            </h1>
          </div>

          {/* Search panel: Packages / Hotels switch + search bar, on frosted glass */}
          <div
            className={`hero-rise relative z-20 mx-auto mt-6 w-full rounded-[1.5rem] border border-white/20 bg-white/10 p-1.5 text-left shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-2 ${
              mode === "hotels" ? "max-w-5xl" : "max-w-2xl"
            }`}
            style={{ animationDelay: "240ms" }}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
              <div className="inline-flex rounded-full bg-black/25 p-1" role="tablist" aria-label="What are you looking for?">
                {([
                  { key: "packages", label: "Holiday packages", short: "Packages", Icon: Briefcase },
                  { key: "hotels", label: "Hotels", short: "Hotels", Icon: BedDouble },
                ] as const).map(({ key, label, short, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={mode === key}
                    onClick={() => setMode(key)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all sm:px-3.5 sm:text-[13px] ${
                      mode === key ? "bg-white text-primary shadow-md" : "text-white/85 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
              <span className="hidden items-center gap-1 pr-2 text-[11px] font-semibold text-white/80 sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Free trip planning
              </span>
            </div>

            {mode === "packages" ? (
              <form
                onSubmit={runSearch}
                role="search"
                className="relative flex h-12 w-full items-center gap-2 rounded-2xl bg-white py-1 pl-2.5 pr-1 shadow-lg md:rounded-full lg:h-[3.25rem] lg:pl-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary lg:h-8 lg:w-8">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <label className="relative flex min-w-0 flex-1 flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 lg:text-[10px]">Where to?</span>
                  <input
                    type="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    aria-label="Search destinations or packages"
                    placeholder={isSearchFocused ? "Destination, package or theme" : ""}
                    className="w-full min-w-0 bg-transparent text-[16px] font-semibold leading-tight text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 sm:text-[15px] [&::-webkit-search-cancel-button]:hidden"
                  />
                  {/* Typing suggestion shown while the field is empty and not in use */}
                  {!searchQuery && !isSearchFocused && (
                    <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 flex max-w-full items-center text-[16px] font-semibold leading-tight text-slate-500 sm:text-[15px]">
                      <span className="truncate">{typingText}</span>
                      {typingText && <span className="ml-0.5 inline-block h-4 w-[2px] shrink-0 animate-pulse rounded-full bg-slate-500" />}
                    </span>
                  )}
                </label>
                <button
                  type="submit"
                  className="flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/30 transition-colors hover:bg-primary-hover md:rounded-full lg:h-[2.75rem] lg:px-5"
                >
                  <Search className="h-4 w-4" /> <span className="hidden min-[380px]:inline">Search</span>
                </button>
              </form>
            ) : (
              <div className="rounded-2xl bg-white p-1.5 text-slate-900 shadow-lg md:rounded-full">
                <HotelSearchBar variant="hero-compact" />
              </div>
            )}

            {/* Quick destination chips (from real destinations), with a small photo of each */}
            {mode === "packages" && featuredDestinations.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 px-0.5 sm:justify-start">
                <span className="mr-1 hidden text-[11px] font-bold uppercase tracking-wider text-white/70 sm:inline">Popular:</span>
                {/* One line on phones: 2 chips on narrow ones, 3 on most; larger screens show all 5 */}
                {featuredDestinations.slice(0, 5).map((d, i) => (
                  <Link
                    key={d.name}
                    href={d.href}
                    className={`${i >= 3 ? "hidden sm:inline-flex" : i === 2 ? "hidden min-[380px]:inline-flex" : "inline-flex"} items-center gap-1.5 rounded-full border border-white/20 bg-white/15 py-0.5 pl-0.5 pr-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-white hover:text-heading sm:text-xs`}
                  >
                    {d.image && (
                      <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full sm:h-6 sm:w-6">
                        <Image src={d.image} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                    )}
                    {d.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Trust strip: facts published on the About page and footer */}
          <ul className="hero-rise mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-white/80 sm:gap-x-6" style={{ animationDelay: "320ms" }}>
            {[
              { Icon: CalendarCheck, value: COMPANY.yearsOfExperience, label: "years planning trips" },
              { Icon: Users, value: COMPANY.clients, label: "travellers" },
              { Icon: BadgeCheck, value: "Govt.", label: "registered" },
              { Icon: Briefcase, value: packageCount > 0 ? `${packageCount}+` : "90+", label: "packages" },
            ].map(({ Icon, value, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-tertiary" />
                <span>
                  <strong className="font-extrabold text-white">{value}</strong> {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Slide indicators (click to jump) with a progress line on the current one */}
      <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2 md:bottom-8">
        {BACKGROUND_IMAGES.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setCurrentBgIndex(index);
              setSlideCycle((n) => n + 1);
            }}
            aria-label={`Show photo ${index + 1}`}
            aria-current={index === currentBgIndex}
            className="relative h-1.5 w-8 cursor-pointer overflow-hidden rounded-full bg-white/30 transition-all hover:bg-white/50 md:w-10"
          >
            {index === currentBgIndex && <span key={`${index}-${slideCycle}`} className="hero-slide-progress absolute inset-y-0 left-0 rounded-full bg-white" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
