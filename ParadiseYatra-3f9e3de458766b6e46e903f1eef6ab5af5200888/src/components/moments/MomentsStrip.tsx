"use client";

// "Our travellers in Kerala": customer photos and videos tagged with this state/country, for destination
// and package pages. Renders nothing when there are none for the place.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";
import MomentTile from "./MomentTile";
import MomentViewer from "./MomentViewer";
import { TRAVELLER_STORIES_PATH, type CustomerMoment } from "@/lib/customerMoments";

export default function MomentsStrip({ location, className = "" }: { location?: string; className?: string }) {
  const [moments, setMoments] = useState<CustomerMoment[]>([]);
  const [viewing, setViewing] = useState<number | null>(null);
  const place = (location || "").trim();

  useEffect(() => {
    if (!place) return;
    let alive = true;
    fetch(`/api/customer-moments?location=${encodeURIComponent(place)}&limit=10`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d?.success && Array.isArray(d.moments) && setMoments(d.moments))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [place]);

  if (!place || moments.length === 0) return null;

  return (
    <section className={className}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
            <Camera className="h-3.5 w-3.5" /> Traveller moments
          </span>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight">Our travellers in {place}</h2>
        </div>
        <Link href={`${TRAVELLER_STORIES_PATH}?place=${encodeURIComponent(place)}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          See all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:scroll-px-0 md:gap-4 md:px-0">
        {moments.map((m, i) => (
          <MomentTile key={m._id} moment={m} onOpen={() => setViewing(i)} className="aspect-[4/5] w-[62%] shrink-0 snap-start sm:w-[40%] md:w-[calc((100%-3rem)/4)]" />
        ))}
      </div>
      {viewing !== null && <MomentViewer moments={moments} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />}
    </section>
  );
}
