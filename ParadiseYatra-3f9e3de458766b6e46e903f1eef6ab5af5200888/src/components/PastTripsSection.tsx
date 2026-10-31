"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, Camera, ChevronLeft, ChevronRight, Clock, MapPin, PlayCircle, Quote, Star, Users, X } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows";
import { averageRating, fetchPastTrips, youtubeId, type FDExperience, type FDReview } from "@/lib/fdExperiences";

const img = (src?: string) => (src ? getImageUrl(src) || src : "");

const Stars = ({ value, size = "h-3.5 w-3.5" }: { value: number; size?: string }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`${size} ${n <= Math.round(value) ? "fill-tertiary text-tertiary" : "fill-slate-200 text-slate-200"}`} />
    ))}
  </span>
);

const Avatar = ({ review }: { review: FDReview }) =>
  review.photo ? (
    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary-light">
      <Image src={img(review.photo)} alt={review.name} fill sizes="40px" className="object-cover" />
    </span>
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
      {review.name.charAt(0).toUpperCase()}
    </span>
  );

// ---------------------------------------------------------------- trip story modal

const TripModal = ({ trip, onClose }: { trip: FDExperience; onClose: () => void }) => {
  const photos = [trip.coverImage, ...trip.gallery].filter(Boolean);
  const [photo, setPhoto] = useState(0);
  const video = youtubeId(trip.videoUrl);
  const rating = averageRating(trip.reviews);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setPhoto((p) => (p + 1) % photos.length);
      if (e.key === "ArrowLeft") setPhoto((p) => (p - 1 + photos.length) % photos.length);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, photos.length]);

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={trip.title}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto">
          {/* Gallery */}
          <div className="relative aspect-[16/9] w-full bg-slate-100">
            {photos[photo] && (
              <Image src={img(photos[photo])} alt={`${trip.title} photo ${photo + 1}`} fill sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
            )}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPhoto((p) => (p - 1 + photos.length) % photos.length)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPhoto((p) => (p + 1) % photos.length)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/60 px-2.5 py-1 text-xs font-semibold text-white">
                  {photo + 1} / {photos.length}
                </span>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-5 pt-3 scrollbar-hide">
              {photos.map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  type="button"
                  onClick={() => setPhoto(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-2 transition ${i === photo ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100"}`}
                >
                  <Image src={img(p)} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-6 p-5 sm:p-7">
            {/* Title + meta */}
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <MapPin className="h-3.5 w-3.5" /> {trip.destination}
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-heading sm:text-2xl">{trip.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                {trip.tripDate && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" /> {trip.tripDate}
                  </span>
                )}
                {trip.duration && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                    <Clock className="h-3.5 w-3.5 text-primary" /> {trip.duration}
                  </span>
                )}
                {!!trip.groupSize && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                    <Users className="h-3.5 w-3.5 text-primary" /> {trip.groupSize} travellers
                  </span>
                )}
                {trip.reviews.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-tertiary text-tertiary" /> {rating.toFixed(1)} · {trip.reviews.length}{" "}
                    {trip.reviews.length === 1 ? "review" : "reviews"}
                  </span>
                )}
              </div>
            </div>

            {trip.story && (
              <div>
                <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">The trip</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 sm:text-base">{trip.story}</p>
              </div>
            )}

            {trip.highlights.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">Highlights</h4>
                <ul className="flex flex-wrap gap-2">
                  {trip.highlights.map((h) => (
                    <li key={h} className="rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {video && (
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video}?rel=0`}
                  title={`${trip.title} video`}
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            )}

            {trip.reviews.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">What the group said</h4>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {trip.reviews.map((r, i) => (
                    <li key={r._id || i} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                      <div className="flex items-center gap-3">
                        <Avatar review={r} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-heading">{r.name}</p>
                          {r.location && <p className="truncate text-xs text-slate-500">{r.location}</p>}
                        </div>
                        <span className="ml-auto">
                          <Stars value={r.rating} />
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">&ldquo;{r.text}&rdquo;</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ---------------------------------------------------------------- trip card

const TripCard = ({ trip, onOpen }: { trip: FDExperience; onOpen: () => void }) => {
  const rating = averageRating(trip.reviews);
  const firstReview = trip.reviews[0];
  const thumbs = trip.gallery.slice(0, 3);
  const morePhotos = trip.gallery.length - thumbs.length;

  return (
    <article className="group flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[320px]">
      <button type="button" onClick={onOpen} className="relative block h-48 cursor-pointer overflow-hidden bg-primary-light text-left">
        {trip.coverImage && (
          <Image
            src={img(trip.coverImage)}
            alt={trip.title}
            fill
            sizes="320px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/60 to-transparent" />
        {trip.tripDate && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-900 shadow-md">
            <CalendarDays className="h-3.5 w-3.5 text-primary" /> {trip.tripDate}
          </span>
        )}
        {!!trip.groupSize && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-900 shadow-md">
            <Users className="h-3.5 w-3.5 text-primary" /> {trip.groupSize}
          </span>
        )}
        <span className="absolute bottom-3 left-3 flex max-w-[85%] items-center gap-1 text-xs font-semibold text-white drop-shadow">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{trip.destination}</span>
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-heading">{trip.title}</h3>
        {trip.reviews.length > 0 && (
          <p className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Stars value={rating} /> {rating.toFixed(1)} · {trip.reviews.length} {trip.reviews.length === 1 ? "review" : "reviews"}
          </p>
        )}

        {firstReview ? (
          <blockquote className="mt-3 rounded-2xl bg-slate-50 p-3.5">
            <Quote className="h-4 w-4 text-primary/40" />
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-600">{firstReview.text}</p>
            <footer className="mt-2 text-xs font-bold text-heading">
              — {firstReview.name}
              {firstReview.location && <span className="font-medium text-slate-400">, {firstReview.location}</span>}
            </footer>
          </blockquote>
        ) : (
          trip.story && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{trip.story}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {thumbs.length > 0 ? (
            <div className="flex items-center">
              {thumbs.map((t, i) => (
                <span key={`${t}-${i}`} className="relative -ml-2 h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-slate-100 first:ml-0">
                  <Image src={img(t)} alt="" fill sizes="32px" className="object-cover" />
                </span>
              ))}
              {morePhotos > 0 && <span className="ml-1.5 text-xs font-semibold text-slate-500">+{morePhotos}</span>}
            </div>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
              <Camera className="h-3.5 w-3.5" /> Trip story
            </span>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover"
          >
            View trip <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};

// ---------------------------------------------------------------- full-width feature (detail page)

const MAX_FEATURE_REVIEWS = 3;

/** One trip across the full width: big gallery beside the story, the group's reviews below. */
const FeatureTrip = ({ trip, onOpen }: { trip: FDExperience; onOpen: () => void }) => {
  const photos = [trip.coverImage, ...trip.gallery].filter(Boolean);
  const [photo, setPhoto] = useState(0);
  const rating = averageRating(trip.reviews);
  const video = youtubeId(trip.videoUrl);
  const reviews = trip.reviews.slice(0, MAX_FEATURE_REVIEWS);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] lg:grid-cols-[1.15fr_1fr]">
        {/* Gallery */}
        <div className="relative aspect-[4/3] bg-primary-light lg:aspect-auto lg:min-h-[460px]">
          {photos[photo] && (
            <Image
              src={img(photos[photo])}
              alt={`${trip.title} photo ${photo + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />

          <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center gap-2">
            {trip.tripDate && (
              <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-md">
                <CalendarDays className="h-3.5 w-3.5 text-primary" /> {trip.tripDate}
              </span>
            )}
            {!!trip.groupSize && (
              <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-md">
                <Users className="h-3.5 w-3.5 text-primary" /> {trip.groupSize} travellers
              </span>
            )}
            {photos.length > 1 && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-slate-950/60 px-3 py-1 text-xs font-semibold text-white">
                <Camera className="h-3.5 w-3.5" /> {photo + 1} / {photos.length}
              </span>
            )}
          </div>

          {photos.length > 1 && (
            <div className="absolute inset-x-4 bottom-4 flex gap-2 overflow-x-auto scrollbar-hide">
              {photos.slice(0, 6).map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  type="button"
                  onClick={() => setPhoto(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-2 transition ${
                    i === photo ? "ring-white" : "ring-white/30 opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image src={img(p)} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
              {photos.length > 6 && (
                <button
                  type="button"
                  onClick={onOpen}
                  className="flex h-14 w-20 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-950/60 text-xs font-bold text-white ring-2 ring-white/30"
                >
                  +{photos.length - 6}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Story */}
        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <MapPin className="h-3.5 w-3.5" /> {trip.destination}
          </p>
          <h3 className="mt-2 text-2xl font-extrabold leading-tight text-heading sm:text-3xl">{trip.title}</h3>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            {trip.duration && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                <Clock className="h-3.5 w-3.5 text-primary" /> {trip.duration}
              </span>
            )}
            {trip.reviews.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                <Star className="h-3.5 w-3.5 fill-tertiary text-tertiary" /> {rating.toFixed(1)} · {trip.reviews.length}{" "}
                {trip.reviews.length === 1 ? "review" : "reviews"}
              </span>
            )}
          </div>

          {trip.story && <p className="mt-5 line-clamp-5 whitespace-pre-line text-[15px] leading-relaxed text-slate-600">{trip.story}</p>}

          {trip.highlights.length > 0 && (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {trip.highlights.slice(0, 4).map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {h}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto flex flex-wrap gap-3 pt-7">
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              Read the full story <ChevronRight className="h-4 w-4" />
            </button>
            {video && (
              <button
                type="button"
                onClick={onOpen}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-primary hover:text-primary"
              >
                <PlayCircle className="h-4 w-4" /> Watch the trip video
              </button>
            )}
          </div>
        </div>
      </div>

      {/* The group's reviews, across the full width */}
      {reviews.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={r._id || i} className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Quote className="h-6 w-6 text-primary/30" />
                <Stars value={r.rating} />
              </div>
              <blockquote className="mt-3 line-clamp-5 flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{r.text}&rdquo;</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <Avatar review={r} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-heading">{r.name}</p>
                  {r.location && <p className="truncate text-xs text-slate-500">{r.location}</p>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {trip.reviews.length > MAX_FEATURE_REVIEWS && (
        <div className="mt-4 text-center">
          <button type="button" onClick={onOpen} className="cursor-pointer text-sm font-bold text-primary hover:underline">
            See all {trip.reviews.length} reviews from this group
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ---------------------------------------------------------------- section

interface PastTripsSectionProps {
  /** Show trips to this destination first (detail page); falls back to all trips when there are none. */
  destination?: string;
  className?: string;
  /** "cards": a carousel of trip cards. "feature": one trip at a time across the full width. */
  variant?: "cards" | "feature";
}

/** "Past Group Journeys": past fixed-departure trips with photos, stories and traveller reviews. */
export default function PastTripsSection({ destination, className = "", variant = "cards" }: PastTripsSectionProps) {
  const [trips, setTrips] = useState<FDExperience[]>([]);
  const [matchedDestination, setMatchedDestination] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState<FDExperience | null>(null);
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let list = destination ? await fetchPastTrips({ destination, limit: 12 }) : [];
      const matched = list.length > 0;
      if (!matched) list = await fetchPastTrips({ limit: 12 });
      if (!mounted) return;
      setTrips(list);
      setMatchedDestination(matched);
      setLoaded(true);
    })().catch(() => mounted && setLoaded(true));
    return () => {
      mounted = false;
    };
  }, [destination]);

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
  }, [trips.length, updateScroll]);

  const scrollCards = (dir: 1 | -1) => {
    const el = railRef.current;
    const card = el?.querySelector("article");
    el?.scrollBy({ left: dir * ((card?.getBoundingClientRect().width ?? 320) + 24), behavior: "smooth" });
  };

  if (!loaded || trips.length === 0) return null;

  const allReviews = trips.flatMap((t) => t.reviews);
  const travellers = trips.reduce((sum, t) => sum + (t.groupSize || 0), 0);
  const overall = averageRating(allReviews);
  const stats = [
    { value: String(trips.length), label: trips.length === 1 ? "Group trip" : "Group trips" },
    travellers > 0 ? { value: `${travellers}+`, label: "Travellers" } : null,
    allReviews.length > 0 ? { value: overall.toFixed(1), label: `Avg. rating (${allReviews.length})` } : null,
  ].filter((s): s is { value: string; label: string } => s !== null);

  const feature = variant === "feature";
  const step = (dir: 1 | -1) => setActive((i) => (i + dir + trips.length) % trips.length);
  const current = trips[Math.min(active, trips.length - 1)];

  return (
    <section className={`py-14 ${feature ? "bg-gradient-to-b from-slate-50 to-white" : "bg-white"} ${className}`}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
          eyebrow="Real groups, real memories"
          eyebrowIcon={<Users />}
          titleClassName="!text-[24px] font-extrabold sm:!text-3xl"
          title={destination && matchedDestination ? `Past Group Trips to ${destination}` : "Past Group Journeys"}
          description="Photos, stories and reviews from travellers who joined our earlier fixed departures."
          action={
            // Arrows on tablet/desktop only: on phones the cards are swiped and the trips switched with the dots
            trips.length > 1 ? (
              feature ? (
                <div className="hidden items-center gap-3 md:flex">
                  <span className="text-sm font-semibold text-slate-500">
                    {active + 1} / {trips.length}
                  </span>
                  <CarouselArrows variant="compact" onPrevious={() => step(-1)} onNext={() => step(1)} canScrollLeft canScrollRight />
                </div>
              ) : (
                <div className="hidden md:block">
                  <CarouselArrows
                    variant="compact"
                    onPrevious={() => scrollCards(-1)}
                    onNext={() => scrollCards(1)}
                    canScrollLeft={canLeft}
                    canScrollRight={canRight}
                  />
                </div>
              )
            ) : null
          }
        />

        <div className="mb-6 flex flex-wrap gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-100 bg-primary-light/60 px-4 py-2.5">
              <span className="text-lg font-extrabold text-primary">{s.value}</span>
              <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>

        {feature ? (
          <>
            {current && <FeatureTrip key={current._id} trip={current} onOpen={() => setOpen(current)} />}
            {trips.length > 1 && (
              <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Past trips">
                {trips.map((trip, i) => (
                  <button
                    key={trip._id}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={trip.title}
                    onClick={() => setActive(i)}
                    className={`h-2 cursor-pointer rounded-full transition-all ${i === active ? "w-8 bg-primary" : "w-2 bg-slate-300 hover:bg-slate-400"}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div ref={railRef} className="-mx-1 flex snap-x gap-6 overflow-x-auto px-1 pb-6 pt-1 scrollbar-hide">
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} onOpen={() => setOpen(trip)} />
            ))}
          </div>
        )}
      </div>

      {open && <TripModal trip={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
