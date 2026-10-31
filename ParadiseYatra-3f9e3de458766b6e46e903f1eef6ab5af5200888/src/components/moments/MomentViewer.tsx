"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, Quote, X } from "lucide-react";
import { parseVideo, type CustomerMoment } from "@/lib/customerMoments";

interface Props {
  moments: CustomerMoment[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}

/** Full-screen photo / video viewer with previous and next. */
export default function MomentViewer({ moments, index, onIndex, onClose }: Props) {
  const moment = moments[index];
  const count = moments.length;
  const go = (step: number) => onIndex((index + step + count) % count);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && count > 1) onIndex((index + 1) % count);
      else if (e.key === "ArrowLeft" && count > 1) onIndex((index - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [index, count, onIndex, onClose]);

  if (!moment) return null;
  const video = moment.type === "video" ? parseVideo(moment.videoUrl) : null;
  const vertical = video?.kind === "instagram" || /\/shorts\//i.test(moment.videoUrl || "");
  const place = [moment.location, moment.tripDate].filter(Boolean).join(" · ");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${moment.type === "video" ? "Video" : "Photo"} from ${moment.customerName}`}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-slate-950/95 p-3 sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6 sm:top-6"
      >
        <X className="h-5 w-5" />
      </button>

      <div key={moment._id} className="flex max-h-full w-full max-w-5xl flex-col items-center gap-4">
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          {moment.type === "photo" && moment.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={moment.imageUrl} alt={`${moment.customerName}${moment.location ? ` in ${moment.location}` : ""}`} className="max-h-[78vh] max-w-full rounded-2xl object-contain" />
          ) : video?.kind === "file" ? (
            <video src={encodeURI(video.src)} controls autoPlay playsInline className="max-h-[78vh] max-w-full rounded-2xl bg-black" />
          ) : video ? (
            <iframe
              src={video.embed}
              title={`Video from ${moment.customerName}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className={`rounded-2xl bg-black ${vertical ? "h-[78vh] max-h-[720px] w-auto aspect-[9/16] max-w-full" : "aspect-video w-full max-w-4xl"}`}
            />
          ) : (
            <p className="text-sm text-white/70">This video can&apos;t be played here.</p>
          )}
        </div>

        <div className="w-full max-w-2xl text-center text-white">
          {moment.quote && (
            <p className="flex justify-center gap-2 text-base font-medium leading-relaxed text-white/90 sm:text-lg">
              <Quote className="mt-1 h-4 w-4 shrink-0 rotate-180 text-white/50" />
              {moment.quote}
            </p>
          )}
          <p className="mt-2 font-bold">{moment.customerName}</p>
          {place && (
            <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-white/65">
              <MapPin className="h-3.5 w-3.5" /> {place}
            </p>
          )}
          {count > 1 && <p className="mt-2 text-xs text-white/40">{index + 1} / {count}</p>}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
}
