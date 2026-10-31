"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, BadgePercent, Headphones, BedDouble } from "lucide-react";
import Header from "@/components/Header";
import HotelSearchBar from "@/components/hotels/HotelSearchBar";
import { cachedGet } from "@/components/hotels/cachedGet";
import { getImageUrl } from "@/lib/utils";
import { OFFER_TYPE_LABELS, type OfferCard } from "@/lib/offers";

const HERO_BG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=70";

const perks = [
  { icon: BadgePercent, title: "Best price promise", text: "Handpicked rates, often below what you see online." },
  { icon: ShieldCheck, title: "Verified stays", text: "Every hotel is checked by our team before it is listed." },
  { icon: Headphones, title: "Human support", text: "Talk to a real travel expert before and during your stay." },
];

const BannerCard = ({ banner }: { banner: OfferCard }) => {
  const src = getImageUrl(banner.imageUrl);
  const type = banner.type && banner.type in OFFER_TYPE_LABELS ? banner.type : "package";
  const isHotel = type === "hotel";

  const inner = (
    <>
      <div className="relative aspect-[12/5] bg-slate-200 overflow-hidden">
        {src && (
          <Image
            src={src}
            alt={banner.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span
          className={`absolute top-4 left-4 text-xs font-extrabold px-3 py-1.5 rounded-full shadow ${
            isHotel ? "bg-white text-[#155dfc]" : "bg-amber-400 text-slate-900"
          }`}
        >
          {OFFER_TYPE_LABELS[type]}
        </span>
        {banner.discountText && (
          <span className="absolute top-4 right-4 rounded-xl bg-white/95 px-3 py-1.5 text-sm font-extrabold text-[#155dfc] shadow">
            {banner.discountText}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3">
          <h3 className="!text-lg md:!text-xl !font-bold !text-white leading-snug drop-shadow">{banner.title}</h3>
          {banner.linkUrl && (
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-[#155dfc] group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  const cls = "group block md:[&:last-child:nth-child(odd)]:col-span-2 rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white";
  if (!banner.linkUrl) return <div className={cls}>{inner}</div>;
  if (banner.linkUrl.startsWith("/")) return <Link href={banner.linkUrl} className={cls}>{inner}</Link>;
  return (
    <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  );
};

const HotelsPageClient = () => {
  const [banners, setBanners] = useState<OfferCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The same offers as the home page (Admin → Offers), hotel deals first
    cachedGet("/api/offers")
      .then((b) => {
        if (!b?.success || !Array.isArray(b.offers)) return;
        const now = Date.now();
        const live = (b.offers as OfferCard[]).filter((o) => !o.validUntil || new Date(o.validUntil).getTime() > now);
        setBanners([...live.filter((o) => o.type === "hotel"), ...live.filter((o) => o.type !== "hotel")]);
      })
      .catch((e) => console.error("Error loading hotel promotions:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header transparentOnTop />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 px-4 pb-16 pt-28 md:flex md:min-h-[600px] md:items-center md:pb-20 md:pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${HERO_BG})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/90" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <BedDouble className="h-3.5 w-3.5 text-tertiary" /> Handpicked stays across every destination
          </span>
          <h1 className="mt-5 !text-4xl font-extrabold leading-tight !text-white md:!text-6xl">
            Find your{" "}
            <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">perfect stay</span>
          </h1>
          <p className="mx-auto mb-10 mt-4 max-w-xl text-base text-white/85 md:text-lg">
            Handpicked hotels across every destination we cover, at prices you will like.
          </p>
          <HotelSearchBar variant="hero" />

          <ul className="mt-8 flex flex-wrap justify-center gap-3">
            {perks.map(({ icon: Icon, title }) => (
              <li key={title} className="glass-pill !px-4 !py-2 !text-xs">
                <Icon className="h-3.5 w-3.5" /> {title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Offers (managed from Admin → Offers, shared with the home page) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="!text-xs !font-black uppercase tracking-widest !text-[#155dfc]">Deals & offers</p>
            <h2 className="!text-2xl md:!text-3xl !font-black !text-[#000945] mt-1">Offers made for you</h2>
          </div>
          <Link href="/hotels/search" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[#155dfc] hover:underline">
            Browse all hotels <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => <div key={i} className="aspect-[12/5] bg-slate-100 rounded-3xl animate-pulse" />)}
          </div>
        ) : banners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((b) => <BannerCard key={b._id} banner={b} />)}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
            <p className="!text-slate-500">No offers right now. New deals are added regularly, so check back soon.</p>
            <Link href="/hotels/search" className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-[#155dfc] hover:underline">
              Browse all hotels <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Perks */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white rounded-3xl border border-slate-100 p-6 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-[#155dfc]" />
              </div>
              <div>
                <h3 className="!text-base !font-bold !text-slate-900">{title}</h3>
                <p className="!text-sm !text-slate-500 mt-1">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HotelsPageClient;
