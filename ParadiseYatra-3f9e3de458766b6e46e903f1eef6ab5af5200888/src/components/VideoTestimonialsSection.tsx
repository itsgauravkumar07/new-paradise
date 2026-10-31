"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Play, Star, Video } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { VIDEO_TESTIMONIALS, type VideoTestimonial } from "@/lib/videoTestimonials";

const AUTO_SLIDE_MS = 3500;

const formatDuration = (seconds: number) => {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")} min`;
};

const getInitials = (name: string) =>
  name
    .replace(/^the\s+/i, "")
    .split(/\s*&\s*|\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

interface VideoCardProps {
  testimonial: VideoTestimonial;
  featured: boolean;
  /** Narrow layout for the 5-up desktop row: fewer badges, no destination chip */
  compact?: boolean;
  duration?: number;
  onPlay: (testimonial: VideoTestimonial) => void;
  onDuration: (id: number, seconds: number) => void;
}

const VideoCard = ({ testimonial, featured, compact = false, duration, onPlay, onDuration }: VideoCardProps) => (
  <article
    className={`group flex h-full flex-col overflow-hidden rounded-3xl bg-white transition-shadow duration-500 ${
      featured
        ? "border-2 border-primary/30 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.22)]"
        : "border border-slate-200/80 shadow-md hover:shadow-xl"
    }`}
  >
    <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
      {/* First frame of the clip doubles as the thumbnail */}
      <video
        src={`${encodeURI(testimonial.video)}#t=0.5`}
        preload="metadata"
        muted
        playsInline
        tabIndex={-1}
        aria-hidden="true"
        onLoadedMetadata={(event) => onDuration(testimonial.id, event.currentTarget.duration)}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-black/20" />

      <div className={`pointer-events-none absolute flex items-center justify-between gap-2 ${compact ? "inset-x-3 top-3" : "inset-x-4 top-4"}`}>
        <div className="flex items-center gap-1.5">
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-sm">
              <Star className="h-3 w-3 fill-current" /> {compact ? "Featured" : "Featured story"}
            </span>
          )}
          {!(compact && featured) && testimonial.rating !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <Star className="h-3 w-3 fill-tertiary text-tertiary" /> {testimonial.rating.toFixed(1)}
            </span>
          )}
        </div>
        {duration ? (
          <span className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur-md">
            {compact ? formatDuration(duration).replace(" min", "") : formatDuration(duration)}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onPlay(testimonial);
        }}
        aria-label={`Play video testimonial from ${testimonial.name}`}
        className={`absolute inset-0 m-auto flex items-center justify-center rounded-full border border-white/40 bg-white/25 text-white shadow-[0_0_25px_rgba(255,255,255,0.45)] backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary cursor-pointer ${
          featured ? "h-16 w-16" : "h-14 w-14"
        }`}
      >
        <span className={`absolute rounded-full border animate-pulse ${featured ? "-inset-3 border-blue-300/50" : "-inset-2 border-white/25"}`} />
        <Play className={`translate-x-0.5 fill-current ${featured ? "h-7 w-7" : "h-6 w-6"}`} />
      </button>

      <p
        className={`absolute font-semibold leading-snug !text-white drop-shadow ${
          compact ? "inset-x-3 bottom-3" : "inset-x-4 bottom-4"
        } ${featured ? "line-clamp-3 text-sm" : "line-clamp-2 text-xs"}`}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </p>
    </div>

    <div className={`flex items-center justify-between gap-3 border-t border-slate-100 bg-white ${compact ? "p-3" : "p-4"}`}>
      <div className={`flex min-w-0 items-center ${compact ? "gap-2.5" : "gap-3"}`}>
        <span
          className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-xs font-bold text-white ring-2 ${
            compact ? "h-9 w-9" : "h-10 w-10"
          } ${featured ? "ring-primary/40" : "ring-blue-100"}`}
        >
          {getInitials(testimonial.name)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900">{testimonial.name}</h3>
          <p className="truncate text-xs font-medium text-slate-500">Trip to {testimonial.destination}</p>
        </div>
      </div>
      {!compact && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary-light px-2 py-1 text-[11px] font-semibold text-primary">
          <MapPin className="h-3 w-3" />
          {testimonial.destination}
        </span>
      )}
    </div>
  </article>
);

/** Video testimonials (desktop layout of the home "Traveller moments"; see moments/HomeTestimonials.tsx). */
const VideoTestimonialsSection = ({ testimonials = VIDEO_TESTIMONIALS }: { testimonials?: VideoTestimonial[] }) => {
  const count = testimonials.length;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0); // desktop spotlight
  const [mobileIndex, setMobileIndex] = useState(0);
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [playing, setPlaying] = useState<VideoTestimonial | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const handleDuration = useCallback((id: number, seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    setDurations((prev) => (prev[id] ? prev : { ...prev, [id]: seconds }));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const goToMobileSlide = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const target = (index + count) % count;
      setMobileIndex(target);
      track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
    },
    [count]
  );

  // Keep the indicator in sync with manual swipes
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (track.clientWidth > 0) setMobileIndex(Math.round(track.scrollLeft / track.clientWidth));
      }, 60);
    };
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  // Auto-advance the mobile carousel while it is visible and idle
  useEffect(() => {
    if (!isInView || isInteracting || playing || count < 2) return;
    const timer = setInterval(() => {
      if (window.innerWidth < 1024) goToMobileSlide(mobileIndex + 1);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [isInView, isInteracting, playing, count, mobileIndex, goToMobileSlide]);

  if (count === 0) return null;

  const stepDesktop = (direction: 1 | -1) => setActiveIndex((index) => (index + direction + count) % count);

  // Desktop shows up to 5 cards, fanned out around the active one
  const visibleCount = Math.min(count, 5);
  const firstOffset = -Math.floor(visibleCount / 2);
  const desktopSlots = Array.from({ length: visibleCount }, (_, slot) => {
    const offset = firstOffset + slot;
    return { index: (activeIndex + offset + count) % count, offset };
  });

  const slotTransform = (offset: number) => {
    if (offset === 0) return "translateY(-10px) scale(1.04)";
    const distance = Math.abs(offset);
    const angle = (offset < 0 ? 1 : -1) * (distance === 1 ? 8 : 14);
    return `rotateY(${angle}deg) scale(${distance === 1 ? 0.95 : 0.88})`;
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-surface-subtle py-12 sm:py-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
            <Video className="h-3.5 w-3.5" />
            Video stories
          </span>
          <h2 className="mt-3 !text-[24px] font-extrabold leading-tight tracking-tight text-slate-900 sm:!text-3xl">
            Watch Real Traveller Stories
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
            See how our travellers experienced unforgettable journeys, smooth arrangements and warm hospitality on their trips with Paradise Yatra.
          </p>
        </header>

        {/* Mobile carousel */}
        <div
          className="relative mx-auto max-w-sm lg:hidden"
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setTimeout(() => setIsInteracting(false), 2000)}
        >
          <button
            type="button"
            onClick={() => goToMobileSlide(mobileIndex - 1)}
            aria-label="Previous traveller video"
            className="absolute -left-3 top-[42%] z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-primary shadow-[0_4px_14px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goToMobileSlide(mobileIndex + 1)}
            aria-label="Next traveller video"
            className="absolute -right-3 top-[42%] z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-primary shadow-[0_4px_14px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div ref={trackRef} className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl pb-1 scrollbar-hide">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="w-full shrink-0 snap-center px-1">
                <VideoCard
                  testimonial={testimonial}
                  featured={index === mobileIndex}
                  duration={durations[testimonial.id]}
                  onPlay={setPlaying}
                  onDuration={handleDuration}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Video testimonials">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                role="tab"
                aria-selected={index === mobileIndex}
                aria-label={`Show video ${index + 1}`}
                onClick={() => goToMobileSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === mobileIndex ? "w-8 bg-primary shadow-sm" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop showcase */}
        <div className="mx-auto hidden max-w-6xl lg:block" style={{ perspective: "1400px" }}>
          <div
            className="grid items-center gap-3 lg:gap-4"
            style={{ gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))` }}
          >
            {desktopSlots.map(({ index, offset }) => {
              const testimonial = testimonials[index];
              const isCenter = offset === 0;
              return (
                <div
                  key={testimonial.id}
                  onClick={() => !isCenter && setActiveIndex(index)}
                  className={`relative transition-transform duration-500 ease-out ${isCenter ? "z-20" : "cursor-pointer"}`}
                  style={{ transform: slotTransform(offset), zIndex: 20 - Math.abs(offset) }}
                >
                  <VideoCard
                    testimonial={testimonial}
                    featured={isCenter}
                    compact={visibleCount > 3}
                    duration={durations[testimonial.id]}
                    onPlay={setPlaying}
                    onDuration={handleDuration}
                  />
                </div>
              );
            })}
          </div>

          {count > 1 && (
            <nav aria-label="Video testimonial controls" className="mt-8 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => stepDesktop(-1)}
                aria-label="Previous traveller video"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={testimonial.id}
                    type="button"
                    aria-label={`Show video ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      index === activeIndex ? "w-8 bg-primary" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => stepDesktop(1)}
                aria-label="Next traveller video"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          )}
        </div>
      </div>

      {/* Video player */}
      <Dialog open={playing !== null} onOpenChange={(open) => !open && setPlaying(null)}>
        {playing && (
          <DialogContent className="max-w-sm rounded-3xl border-0">
            <div className="py-4 pl-5 pr-12">
              <p className="text-sm font-bold text-slate-900">{playing.name}</p>
              <p className="text-xs font-medium text-slate-500">Trip to {playing.destination}</p>
            </div>
            <video
              key={playing.id}
              src={encodeURI(playing.video)}
              controls
              autoPlay
              playsInline
              className="max-h-[75vh] w-full bg-black object-contain"
            />
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
};

export default VideoTestimonialsSection;
