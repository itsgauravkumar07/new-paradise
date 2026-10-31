"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Image from "next/image";

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readTime: number;
  createdAt?: string;
  publishDate?: string;
  updatedAt?: string;
}

interface BlogLandingHeroProps {
  post: BlogPost | null;
  imageSrc: string;
  searchQuery: string;
  searchResults: Array<{
    id: string;
    href: string;
    title: string;
    excerpt: string;
  }>;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onImageError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export default function BlogLandingHero({
  post,
  imageSrc,
  searchQuery,
  searchResults,
  resultCount,
  onSearchChange,
  onSearchSubmit,
  onImageError,
}: BlogLandingHeroProps) {
  const title = "Find Your Next Travel Inspiration";
  const excerpt =
    "Inspiring destinations, local insights and practical guides for your next unforgettable journey.";
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <section className="relative z-20 overflow-visible bg-slate-900 text-white">
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={post?.title || "Travel blog hero background"}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          onError={onImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/65 to-slate-900/30" />
      </div>

      <div className="relative mx-auto flex min-h-[360px] w-full max-w-7xl flex-col justify-center px-4 py-12 md:min-h-[400px] md:px-8 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            Travel inspiration
          </span>
          <h1 className="!text-[28px] font-extrabold leading-tight !text-white drop-shadow-lg sm:!text-4xl md:!text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/90 md:text-base">
            {excerpt}
          </p>

          <div className="relative mt-5 w-full max-w-2xl">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSearchSubmit();
              }}
            >
              <div className="group relative">
                <Search className="pointer-events-none absolute left-5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search destinations, travel guides & inspiration..."
                  className={`min-h-[56px] w-full rounded-full border border-slate-200 bg-white py-3 pl-14 ${
                    hasQuery ? "pr-32" : "pr-5"
                  } text-sm font-semibold text-slate-900 shadow-lg placeholder:text-slate-400 transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15`}
                />
                {hasQuery && (
                  <span className="pointer-events-none absolute right-4 top-1/2 inline-flex -translate-y-1/2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                    {resultCount} result{resultCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
