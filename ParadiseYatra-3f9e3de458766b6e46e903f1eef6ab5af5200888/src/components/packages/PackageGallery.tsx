"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

interface PackageGalleryProps {
  images: string[];
  alt: string;
}

// Desktop mosaic: the first photo large on the left, up to four more on the right
const TILE_CLASSES: Record<number, string[]> = {
  1: ["col-span-4 row-span-2"],
  2: ["col-span-2 row-span-2", "col-span-2 row-span-2"],
  3: ["col-span-2 row-span-2", "col-span-2", "col-span-2"],
  4: ["col-span-2 row-span-2", "col-span-2", "col-span-1", "col-span-1"],
  5: ["col-span-2 row-span-2", "col-span-1", "col-span-1", "col-span-1", "col-span-1"],
};

function Lightbox({ images, alt, start, onClose }: { images: string[]; alt: string; start: number; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const step = useCallback((dir: number) => setIndex((i) => (i + dir + images.length) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, step]);

  return (
    <div className="fixed inset-0 z-[130] flex flex-col bg-slate-950/95" role="dialog" aria-modal="true" aria-label="Photo gallery">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-semibold">{index + 1} / {images.length}</span>
        <button type="button" onClick={onClose} aria-label="Close gallery" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        <Image src={images[index]} alt={`${alt} photo ${index + 1}`} fill sizes="100vw" className="object-contain" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-2 transition ${i === index ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Photo mosaic on desktop, swipeable strip on phones; any photo opens a full-screen viewer. */
export default function PackageGallery({ images, alt }: PackageGalleryProps) {
  const [open, setOpen] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(null), []);

  if (!images.length) return null;
  const tiles = images.slice(0, 5);
  const classes = TILE_CLASSES[tiles.length];

  const onStripScroll = () => {
    const el = stripRef.current;
    if (el) setCurrent(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <>
      {/* Phones: one photo at a time */}
      <div className="relative -mx-4 md:hidden">
        <div ref={stripRef} onScroll={onStripScroll} className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setOpen(i)}
              className="relative aspect-[4/3] w-full shrink-0 snap-center bg-slate-100"
              aria-label={`Open photo ${i + 1}`}
            >
              <Image src={src} alt={i === 0 ? alt : `${alt} photo ${i + 1}`} fill sizes="100vw" priority={i === 0} className="object-cover" />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <span className="pointer-events-none absolute bottom-3 right-4 flex items-center gap-1.5 rounded-full bg-slate-950/65 px-3 py-1 text-xs font-semibold text-white">
            <Images className="h-3.5 w-3.5" /> {current + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Tablet and desktop: mosaic */}
      <div className="hidden h-[380px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:grid lg:h-[440px]">
        {tiles.map((src, i) => {
          const last = i === tiles.length - 1;
          return (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setOpen(i)}
              className={`group relative cursor-pointer overflow-hidden bg-slate-100 ${classes[i]}`}
              aria-label={`Open photo ${i + 1}`}
            >
              <Image
                src={src}
                alt={i === 0 ? alt : `${alt} photo ${i + 1}`}
                fill
                sizes={i === 0 ? "(max-width: 1280px) 50vw, 640px" : "320px"}
                priority={i === 0}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {last && images.length > 1 && (
                <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-heading shadow-lg">
                  <Images className="h-4 w-4 text-primary" /> View all {images.length} photos
                </span>
              )}
            </button>
          );
        })}
      </div>

      {open !== null && <Lightbox images={images} alt={alt} start={open} onClose={close} />}
    </>
  );
}
