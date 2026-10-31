"use client";

// The /traveller-stories page: every customer photo and video, filterable by type and destination.

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Camera, ChevronRight, MapPin, Play, Sparkles } from "lucide-react";
import MomentTile from "./MomentTile";
import MomentViewer from "./MomentViewer";
import type { CustomerMoment } from "@/lib/customerMoments";

const LeadCaptureForm = dynamic(() => import("@/components/LeadCaptureForm"), { ssr: false });

type Kind = "all" | "photo" | "video";

// Varying heights make the masonry columns feel natural
const ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[4/5]", "aspect-[5/6]"];

export default function MomentsGallery({ moments, initialPlace }: { moments: CustomerMoment[]; initialPlace: string }) {
  const places = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of moments) if (m.location) counts.set(m.location, (counts.get(m.location) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [moments]);

  const [kind, setKind] = useState<Kind>("all");
  const [place, setPlace] = useState(() => places.find((p) => p.toLowerCase() === initialPlace.toLowerCase()) || "");
  const [viewing, setViewing] = useState<number | null>(null);
  const [planOpen, setPlanOpen] = useState(false);

  const shown = moments.filter((m) => (kind === "all" || m.type === kind) && (!place || m.location === place));
  const photos = moments.filter((m) => m.type === "photo").length;
  const videos = moments.length - photos;

  const chip = (active: boolean) =>
    `inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active ? "border-primary bg-primary text-white shadow-sm shadow-primary/25" : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary"
    }`;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-light via-primary-light/40 to-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-heading">Traveller stories</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary shadow-sm">
            <Camera className="h-3.5 w-3.5" /> Traveller moments
          </span>
          <h1 className="mt-4 max-w-3xl text-[2.25rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            Real trips, shared by <span className="text-primary">our travellers</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
            Photos and videos from people who explored India and the world with Paradise Yatra.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5 text-[13px] font-semibold text-heading">
            {photos > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 shadow-sm ring-1 ring-slate-200/70">
                <Camera className="h-4 w-4 text-primary" /> {photos} photo{photos === 1 ? "" : "s"}
              </span>
            )}
            {videos > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 shadow-sm ring-1 ring-slate-200/70">
                <Play className="h-4 w-4 text-primary" /> {videos} video{videos === 1 ? "" : "s"}
              </span>
            )}
            {places.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 shadow-sm ring-1 ring-slate-200/70">
                <MapPin className="h-4 w-4 text-primary" /> {places.length} destination{places.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        {/* Filters */}
        <div className="mb-6 space-y-2.5 py-3">
          <div className="flex gap-2">
            {(["all", "photo", "video"] as Kind[]).map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} className={chip(kind === k)}>
                {k === "photo" ? <Camera className="h-4 w-4" /> : k === "video" ? <Play className="h-4 w-4" /> : null}
                {k === "all" ? "All" : k === "photo" ? "Photos" : "Videos"}
              </button>
            ))}
          </div>
          {places.length > 1 && (
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-hide md:mx-0 md:flex-wrap md:px-0">
              <button type="button" onClick={() => setPlace("")} className={chip(!place)}>
                All destinations
              </button>
              {places.map((p) => (
                <button key={p} type="button" onClick={() => setPlace(place === p ? "" : p)} className={chip(place === p)}>
                  <MapPin className="h-3.5 w-3.5" /> {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {shown.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <p className="font-semibold text-heading">Nothing here yet</p>
            <p className="mt-1 text-sm text-slate-500">Try another destination, or see all traveller moments.</p>
            <button
              type="button"
              onClick={() => {
                setKind("all");
                setPlace("");
              }}
              className="mt-4 cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              Show everything
            </button>
          </div>
        ) : (
          <div className="columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
            {shown.map((m, i) => (
              <MomentTile
                key={m._id}
                moment={m}
                onOpen={() => setViewing(i)}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`mb-3 w-full break-inside-avoid md:mb-4 ${ASPECTS[i % ASPECTS.length]}`}
              />
            ))}
          </div>
        )}

        {/* Call to action */}
        <div className="mt-14 flex flex-col items-start gap-5 rounded-[2rem] bg-gradient-to-br from-primary-strong to-primary p-7 text-white shadow-xl shadow-blue-900/15 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" /> Your story next
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">Ready to make your own memories?</h2>
            <p className="mt-1 text-white/85">Tell us where you want to go. Our travel expert will plan it around you.</p>
          </div>
          <button
            type="button"
            onClick={() => setPlanOpen(true)}
            className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-primary hover:bg-primary-light"
          >
            Plan my trip <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewing !== null && <MomentViewer moments={shown} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />}
      {planOpen && <LeadCaptureForm isOpen={planOpen} onClose={() => setPlanOpen(false)} />}
    </main>
  );
}
