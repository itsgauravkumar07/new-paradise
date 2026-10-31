"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Check, ArrowLeft, CalendarDays, Users, BedDouble } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HotelEnquiryForm from "@/components/hotels/HotelEnquiryForm";
import { getImageUrl } from "@/lib/utils";
import { Hotel, nightsBetween, queryToSearch } from "@/components/hotels/types";
import { HOTEL_FEATURES } from "@/components/hotels/hotelFeatures";

const fmtDate = (iso: string) => {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

interface HotelDetailClientProps {
  slug: string;
  /** Hotel loaded on the server, so its details are in the page HTML (fetched in the browser only if missing) */
  initialHotel?: Hotel | null;
  /** The page's query string (city, dates, guests from the search), passed from the server */
  query?: string;
}

const HotelDetailClient = ({ slug, initialHotel = null, query = "" }: HotelDetailClientProps) => {
  const params = new URLSearchParams(query);
  const search = queryToSearch(params);
  const nights = nightsBetween(search.checkIn, search.checkOut);

  const [hotel, setHotel] = useState<Hotel | null>(initialHotel);
  const [loading, setLoading] = useState(!initialHotel);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    if (initialHotel) return; // already rendered from the server
    setLoading(true);
    fetch(`/api/hotels/slug/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.success) throw new Error("not found");
        setHotel(d.hotel);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, initialHotel]);

  const backHref = params.get("city")?.trim()
    ? `/hotels/search?${params.toString()}`
    : "/hotels";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
          <div className="h-[420px] bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !hotel) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-xl mx-auto px-4 pt-40 text-center">
          <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="!text-2xl !font-black !text-slate-900">Hotel not found</h1>
          <p className="!text-slate-500 mt-2">This hotel may have been removed or is no longer available.</p>
          <Link href="/hotels" className="inline-block mt-6 bg-[#155dfc] text-white font-bold px-6 py-3 rounded-xl">
            Back to hotels
          </Link>
        </div>
      </div>
    );
  }

  const images = (hotel.images || []).map((i) => getImageUrl(i)).filter(Boolean) as string[];
  const selectedFeatures = HOTEL_FEATURES.filter((feature) => hotel.features?.includes(feature.value));
  const hasDiscount = !!hotel.originalPricePerNight && hotel.originalPricePerNight > hotel.pricePerNight;
  const total = nights > 0 ? hotel.pricePerNight * nights * search.rooms : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

        <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-16">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>›</span>
          <Link href="/hotels" className="hover:text-primary">Hotels</Link>
          {hotel.city && (
            <>
              <span>›</span>
              <span>{hotel.city}</span>
            </>
          )}
          <span>›</span>
          <span className="font-semibold text-heading">{hotel.name}</span>
        </nav>
        
        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="relative md:col-span-3 h-72 md:h-[420px] rounded-3xl overflow-hidden bg-slate-200">
            {images[activeImg] ? (
              <Image src={images[activeImg]} alt={hotel.name} fill priority sizes="(max-width: 768px) 100vw, 75vw" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300"><BedDouble className="w-12 h-12" /></div>
            )}
            <Link
              href={backHref}
              aria-label="Back to hotel search results"
              title="Back to results"
              className="group absolute left-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-800 shadow-lg backdrop-blur transition-colors hover:bg-white hover:text-[#155dfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155dfc] focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </Link>
          </div>
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {images.slice(0, 4).map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`relative flex-shrink-0 w-28 md:w-full h-20 md:h-[98px] rounded-2xl overflow-hidden border-2 ${i === activeImg ? "border-[#155dfc]" : "border-transparent"}`}
                >
                  <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Info */}
          <div>
            <div className="flex items-center gap-0.5 mb-2" aria-label={`${hotel.starRating} star hotel`}>
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-tertiary text-tertiary" />
              ))}
            </div>
            <h1 className="!text-2xl md:!text-4xl !font-black !text-[#000945]">{hotel.name}</h1>
            <p className="flex items-center gap-1.5 !text-slate-500 mt-2">
              <MapPin className="w-4 h-4 text-[#155dfc]" />
              {[hotel.address, hotel.city, hotel.state, hotel.country].filter(Boolean).join(", ")}
            </p>

            <h2 className="!text-lg !font-bold !text-slate-900 mt-8 mb-3">About this stay</h2>
            <p className="!text-slate-600 leading-relaxed whitespace-pre-line">{hotel.description || hotel.shortDescription}</p>

            {selectedFeatures.length > 0 && (
              <>
                <h2 className="!text-lg !font-bold !text-slate-900 mt-8 mb-4">Included with your stay</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedFeatures.map((feature) => (
                    <div key={feature.value} className="flex items-center gap-2.5 bg-primary-light border border-blue-100 rounded-2xl px-3.5 py-3">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {(hotel.amenities?.length ?? 0) > 0 && (
              <>
                <h2 className="!text-lg !font-bold !text-slate-900 mt-8 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hotel.amenities!.map((a) => (
                    <div key={a} className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-3 py-2.5">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">{a}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Price / enquire card */}
          <aside>
            <div className="lg:sticky lg:top-28 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              {hasDiscount && (
                <p className="!text-sm !text-slate-400 line-through">₹{hotel.originalPricePerNight!.toLocaleString("en-IN")}</p>
              )}
              <p className="!text-3xl !font-extrabold !text-primary">
                ₹{hotel.pricePerNight.toLocaleString("en-IN")}
                <span className="!text-sm !font-medium !text-slate-400"> / night + taxes</span>
              </p>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarDays className="w-4 h-4 text-[#155dfc]" />
                  {search.checkIn && search.checkOut
                    ? `${fmtDate(search.checkIn)} → ${fmtDate(search.checkOut)} (${nights} night${nights > 1 ? "s" : ""})`
                    : "Dates not selected"}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 text-[#155dfc]" />
                  {search.adults + search.children} guests, {search.rooms} room{search.rooms > 1 ? "s" : ""}
                </div>
              </div>

              {total > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-slate-600">Estimated room subtotal</span>
                  <span className="text-xl font-black text-slate-900">₹{total.toLocaleString("en-IN")}</span>
                </div>
              )}
              {total > 0 && (
                <p className="!text-xs !text-slate-400 mt-2">
                  Before taxes and fees; final price is confirmed after availability is checked.
                </p>
              )}

              <Button
                onClick={() => setEnquiryOpen(true)}
                className="w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-[#155dfc] to-[#0b3fc4] text-white font-bold text-base hover:brightness-110"
              >
                Request availability
              </Button>
              <p className="!text-xs !text-slate-400 text-center mt-3">No payment now. Our travel expert will contact you to confirm availability and the final price.</p>
            </div>
          </aside>
        </div>
      </main>

      <Dialog open={enquiryOpen} onOpenChange={setEnquiryOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="!text-lg !font-bold !text-[#000945]">Enquire about {hotel.name}</DialogTitle>
          </DialogHeader>
          <HotelEnquiryForm hotel={hotel} initial={search} onDone={() => setEnquiryOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelDetailClient;
