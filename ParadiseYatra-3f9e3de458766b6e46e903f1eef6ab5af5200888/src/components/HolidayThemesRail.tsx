"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Compass, Flame, Gem, Heart, Landmark, Sparkles, type LucideIcon } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { getThemeShortDescription } from "@/lib/theme-overview";

interface TrendingTheme {
  id: string;
  slug: string;
  title: string;
  image: string;
  description: string;
  packageCount: number;
}

interface ThemeConfig {
  slug: string;
  title: string;
}

const THEME_CONFIG: ThemeConfig[] = [
  {
    slug: "trending",
    title: "Trending Packages",
  },
  {
    slug: "honeymoon",
    title: "Honeymoon Packages",
  },
  {
    slug: "char-dham-yatra",
    title: "Char Dham Yatra",
  },
  {
    slug: "luxury",
    title: "Luxury Packages",
  },
  {
    slug: "spiritual",
    title: "Spiritual Packages",
  },
];

interface ThemeTagData {
  slug?: string;
  _id?: string;
  name?: string;
  image?: string;
  description?: string;
  packages?: TaggedPackage[];
}

interface TaggedPackage {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  image?: string;
  images?: string[];
  location?: string;
  destination?: string;
  duration?: string;
  shortDescription?: string;
  description?: string;
}

const THEME_ICONS: Record<string, LucideIcon> = {
  trending: Flame,
  honeymoon: Heart,
  "char-dham-yatra": Landmark,
  luxury: Gem,
  spiritual: Sparkles,
};
const themeIcon = (slug: string) => THEME_ICONS[slug] || Compass;

const getVisibleThemes = (themes: TrendingTheme[], start: number) =>
  Array.from(
    { length: Math.min(themes.length, 3) },
    (_, index) => themes[(start + index) % themes.length]
  );

const getPlainText = (value: string) => {
  const parsed = new DOMParser().parseFromString(value, "text/html");
  return parsed.body.textContent?.replace(/\s+/g, " ").trim() || "";
};

const HolidayThemesRail = ({ isHomePage = false }: { isHomePage?: boolean }) => {
  const [themes, setThemes] = useState<TrendingTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowStart, setWindowStart] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadThemes = async () => {
      let tags: ThemeTagData[] = [];

      try {
        const response = await fetch("/api/tags", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to fetch holiday theme tags (${response.status})`);
        }

        const payload: unknown = await response.json();
        if (Array.isArray(payload)) {
          tags = payload as ThemeTagData[];
        } else if (
          payload &&
          typeof payload === "object" &&
          "success" in payload &&
          payload.success === true &&
          "data" in payload &&
          Array.isArray(payload.data)
        ) {
          tags = payload.data as ThemeTagData[];
        } else {
          throw new Error("Invalid response for holiday theme tags");
        }
      } catch (error) {
        console.error("Error loading holiday theme tags:", error);
      }

      const normalize = (value: string | undefined) =>
        value?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const results = THEME_CONFIG.map((config): TrendingTheme => {
        const tag = tags.find(
          (item) =>
            normalize(item.slug) === config.slug ||
            normalize(item.name) === config.slug
        );
        const firstPackage = tag?.packages?.[0];
        const destination = firstPackage?.location || firstPackage?.destination;
        const packageDetails = [destination, firstPackage?.duration]
          .filter(Boolean)
          .join(" · ");
        const description = getThemeShortDescription(
          config.slug,
          getPlainText(
            tag?.description ||
              firstPackage?.shortDescription ||
              firstPackage?.description ||
              packageDetails
          ),
          tag?.name || config.title
        );

        return {
          id: config.slug,
          slug: config.slug,
          title: config.title,
          image:
            tag?.image ||
            firstPackage?.image ||
            firstPackage?.images?.[0] ||
            "",
          description,
          packageCount: tag?.packages?.length || 0,
        };
      });

      if (mounted) {
        setThemes(results);
        setLoading(false);
      }
    };

    loadThemes();
    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && themes.length === 0) return null;

  const navigate = (direction: 1 | -1) => {
    if (themes.length < 2) return;

    const nextActive =
      (activeCategory + direction + themes.length) % themes.length;
    const maxWindowStart = Math.max(0, themes.length - 3);
    let nextWindowStart = windowStart;

    if (direction === 1 && nextActive < activeCategory) {
      nextWindowStart = 0;
    } else if (direction === -1 && nextActive > activeCategory) {
      nextWindowStart = maxWindowStart;
    } else if (nextActive > windowStart + 2) {
      nextWindowStart = Math.min(windowStart + 1, maxWindowStart);
    } else if (nextActive < windowStart) {
      nextWindowStart = Math.max(windowStart - 1, 0);
    }

    setActiveCategory(nextActive);
    setWindowStart(nextWindowStart);
  };

  const visibleThemes = getVisibleThemes(themes, windowStart);
  const tripsLabel = (count: number) => `${count} ${count === 1 ? "trip" : "trips"}`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-primary-light/50 to-white py-14 px-4 text-gray-900 md:px-8 md:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary shadow-sm ring-1 ring-primary/10">
              <Compass className="h-3.5 w-3.5" />
              Holidays by theme
            </span>
            <h2
              className={`mt-3 font-extrabold leading-tight tracking-tight text-slate-900 ${
                isHomePage ? "!text-[24px] sm:!text-3xl" : "!text-2xl md:!text-3xl"
              }`}
            >
              Explore Holidays by <span className="text-primary">Theme</span>
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600 sm:text-base">
              From romantic honeymoons and sacred yatras to luxury escapes, pick the kind of trip you are dreaming of.
            </p>
          </div>
          {themes.length > 1 && (
            <div className="hidden items-center gap-3 md:flex">
                <span className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-heading shadow-sm">
                  {String(activeCategory + 1).padStart(2, "0")}
                  <span className="relative h-1 w-14 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${((activeCategory + 1) / themes.length) * 100}%` }}
                    />
                  </span>
                  <span className="text-slate-400">{String(themes.length).padStart(2, "0")}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    aria-label="Previous holiday themes"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xl hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => navigate(1)}
                    aria-label="Next holiday themes"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-blue-600/25 hover:bg-primary-hover"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-[460px] animate-pulse rounded-3xl bg-slate-200" />
        ) : (
          <>
            <div className="hidden h-[440px] gap-3 md:flex">
                {visibleThemes.map((theme) => {
                const index = themes.indexOf(theme);
                const isActive = index === activeCategory;
                const image = theme.image ? getImageUrl(theme.image) : "";

                return (
                  <motion.article
                    key={theme.id}
                    onMouseEnter={() => setActiveCategory(index)}
                    onClick={() => setActiveCategory(index)}
                    animate={{ flex: isActive ? 6 : 1 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative min-h-0 min-w-0 cursor-pointer overflow-hidden rounded-3xl bg-slate-900 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.6)] ring-1 ring-black/5"
                  >
                    {image && (
                      <Image
                        src={image}
                        alt={theme.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        isActive
                          ? "bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/10"
                          : "bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-950/30"
                      }`}
                    />
                    <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-extrabold text-white ring-1 ring-white/25">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {!isActive && (() => {
                      const Icon = themeIcon(theme.slug);
                      return (
                        <span className="absolute left-1/2 top-16 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white text-primary shadow-lg">
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                      );
                    })()}
                    {!isActive ? (
                      <p
                        className="absolute bottom-6 left-1/2 whitespace-nowrap text-[15px] font-extrabold tracking-wide !text-white"
                        style={{ writingMode: "vertical-rl", transform: "translateX(-50%) rotate(180deg)" }}
                      >
                        {theme.title}
                      </p>
                    ) : (
                      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 md:p-8">
                        {(() => {
                          const Icon = themeIcon(theme.slug);
                          return (
                            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-lg">
                                <Icon className="h-4 w-4" />
                              </span>
                              Theme {String(index + 1).padStart(2, "0")}
                            </span>
                          );
                        })()}
                        <h3 className="text-2xl font-extrabold !text-white md:text-[2rem] md:leading-tight">{theme.title}</h3>
                        <p className="line-clamp-2 max-w-md text-sm leading-relaxed text-slate-200 md:text-[15px]">
                          {theme.description}
                        </p>
                        <Link
                          href={`/package/theme/${theme.slug}`}
                          className="mt-1 inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-heading shadow-lg transition-colors hover:bg-primary hover:text-white"
                        >
                          {theme.packageCount > 0 ? `View ${tripsLabel(theme.packageCount)}` : "See packages"}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </div>

            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide md:hidden">
              {themes.map((theme) => {
                const image = theme.image ? getImageUrl(theme.image) : "";
                return (
                  <article
                    key={theme.id}
                    className="group relative h-[300px] w-[min(84vw,360px)] shrink-0 snap-center overflow-hidden rounded-3xl bg-slate-900 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.6)] ring-1 ring-black/5"
                  >
                    {image && (
                      <Image
                        src={image}
                        alt={theme.title}
                        fill
                        sizes="(max-width: 768px) 84vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-slate-950/10" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2.5 p-5">
                      {(() => {
                        const Icon = themeIcon(theme.slug);
                        return (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-lg">
                            <Icon className="h-4 w-4" />
                          </span>
                        );
                      })()}
                      <h3 className="line-clamp-2 text-xl font-extrabold !text-white">
                        {theme.title}
                      </h3>
                      {theme.description && (
                        <p className="line-clamp-2 text-sm text-slate-200">
                          {theme.description}
                        </p>
                      )}
                      <Link
                        href={`/package/theme/${theme.slug}`}
                        className="mt-0.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-heading shadow-lg"
                      >
                        {theme.packageCount > 0 ? `View ${tripsLabel(theme.packageCount)}` : "See packages"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HolidayThemesRail;
