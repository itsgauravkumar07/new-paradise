"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, Building2, CalendarClock, Plane, Sparkles, Tag } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { OFFER_TYPE_LABELS, type OfferCard } from "@/lib/offers";
import CarouselArrows from "@/components/ui/CarouselArrows";

// Ticket notches are cut out of the card with masks, so they show whatever background is behind them
const NOTCH = "12px";
const TICKET_TOP_MASK = `radial-gradient(circle at 0 100%, transparent ${NOTCH}, #000 calc(${NOTCH} + 0.5px)) left / 51% 100% no-repeat, radial-gradient(circle at 100% 100%, transparent ${NOTCH}, #000 calc(${NOTCH} + 0.5px)) right / 51% 100% no-repeat`;
const TICKET_STUB_MASK = `radial-gradient(circle at 0 0, transparent ${NOTCH}, #000 calc(${NOTCH} + 0.5px)) left / 51% 100% no-repeat, radial-gradient(circle at 100% 0, transparent ${NOTCH}, #000 calc(${NOTCH} + 0.5px)) right / 51% 100% no-repeat`;

const TYPE_ICONS = { package: Plane, hotel: Building2, general: Tag };

const validLabel = (iso?: string | null) =>
  iso ? `Valid till ${new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}` : null;

const Card = ({ banner }: { banner: OfferCard }) => {
  const src = getImageUrl(banner.imageUrl);
  const type = banner.type && banner.type in OFFER_TYPE_LABELS ? banner.type : "package";
  const TypeIcon = TYPE_ICONS[type];
  const valid = validLabel(banner.validUntil);

  const inner = (
    // drop-shadow (not box-shadow) so the shadow follows the notched outline
    <div className="flex h-full flex-col [filter:drop-shadow(0_8px_20px_rgba(37,99,235,0.10))]">
      <div
        className="flex flex-1 flex-col overflow-hidden rounded-t-3xl bg-white"
        style={{ mask: TICKET_TOP_MASK, WebkitMask: TICKET_TOP_MASK }}
      >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-primary-light">
        {src && (
          <Image
            src={src}
            alt={banner.title}
            fill
            sizes="(max-width: 768px) 90vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute left-0 top-4 flex items-center gap-1.5 rounded-r-full bg-tertiary py-1.5 pl-4 pr-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-900 shadow-lg">
          <TypeIcon className="h-3.5 w-3.5" />
          {OFFER_TYPE_LABELS[type]}
        </span>
        {banner.discountText && (
          <span className="absolute bottom-3 right-3 rounded-xl bg-white/95 px-3 py-1.5 text-sm font-extrabold text-primary shadow-lg">
            {banner.discountText}
          </span>
        )}
      </div>

      {/* Offer details */}
      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
          <BadgePercent className="h-4 w-4" />
          Exclusive offer
        </span>
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-heading">{banner.title}</h3>
        {banner.subtitle && <p className="line-clamp-2 text-sm leading-snug text-slate-500">{banner.subtitle}</p>}
      </div>
      </div>

      {/* Stub, below the tear line */}
      <div
        className="rounded-b-3xl bg-white"
        style={{ mask: TICKET_STUB_MASK, WebkitMask: TICKET_STUB_MASK }}
      >
        <div className="mx-6 border-t-2 border-dashed border-slate-200" aria-hidden="true" />
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          {banner.linkUrl ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/25 transition-colors group-hover:bg-primary-hover">
              Grab this deal
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          ) : (
            <span className="text-sm font-bold text-slate-700">Ask our team for details</span>
          )}
          <span className="flex flex-col items-end text-right text-[11px] font-medium text-slate-400">
            {valid && (
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <CalendarClock className="h-3 w-3" /> {valid}
              </span>
            )}
            T&amp;C apply
          </span>
        </div>
      </div>
    </div>
  );

  const cls = "group block w-[85%] shrink-0 snap-start rounded-3xl transition-transform duration-300 hover:-translate-y-1.5 md:w-[calc((100%-3rem)/3)]";
  if (!banner.linkUrl) return <div className={cls}>{inner}</div>;
  if (banner.linkUrl.startsWith("/")) return <Link href={banner.linkUrl} className={cls}>{inner}</Link>;
  return (
    <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  );
};

/** "Discounts & Offers": offer cards managed in Admin → Offers. */
const OffersSection = () => {
  const [banners, setBanners] = useState<OfferCard[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/offers")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        // Expiry is re-checked here because the list can be cached for a minute
        const now = Date.now();
        if (mounted && d?.success && Array.isArray(d.offers)) {
          setBanners((d.offers as OfferCard[]).filter((o) => !o.validUntil || new Date(o.validUntil).getTime() > now).slice(0, 9));
        }
      })
      .catch(() => {});
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
  }, [banners.length, updateScroll]);

  const scrollCards = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.firstElementChild;
    const gap = 24;
    const step = (card?.getBoundingClientRect().width ?? rail.clientWidth / 3) + gap;
    rail.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  if (banners.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-white py-16">
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Exclusive deals
            </span>
            <h2 className="mt-3 !text-[24px] font-extrabold leading-tight text-slate-900 sm:!text-3xl">
              Discounts &amp; <span className="text-primary">Offers</span>
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600 md:text-base">
              <span className="md:hidden">Save on handpicked travel deals.</span>
              <span className="hidden md:inline">
                A curated list of the most popular travel deals, updated by our team.
              </span>
            </p>
          </div>

          {banners.length > 1 && (
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

        <div ref={railRef} className="flex gap-5 overflow-x-auto px-1 pb-6 pt-2 snap-x scrollbar-hide md:gap-6">
          {banners.map((b) => (
            <Card key={b._id} banner={b} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
