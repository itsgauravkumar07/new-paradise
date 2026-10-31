"use client";

import Image from "next/image";
import { Camera, MapPin, Play, Quote } from "lucide-react";
import { momentThumb, parseVideo, type CustomerMoment } from "@/lib/customerMoments";

// Only our own files, Cloudinary and YouTube thumbnails go through the image optimiser (next.config remotePatterns)
const canOptimize = (src: string) => /^\/(?!\/)/.test(src) || /^https:\/\/(res\.cloudinary\.com|img\.youtube\.com)\//i.test(src);

interface Props {
  moment: CustomerMoment;
  onOpen: () => void;
  className?: string;
  /** Larger text for the big tile in the home grid */
  large?: boolean;
  sizes?: string;
}

/** One customer photo or video. Opens the full-screen viewer when clicked. */
export default function MomentTile({ moment, onOpen, className = "", large = false, sizes = "(max-width: 768px) 70vw, 25vw" }: Props) {
  const isVideo = moment.type === "video";
  const thumb = momentThumb(moment);
  const video = parseVideo(moment.videoUrl);
  const place = [moment.location, moment.tripDate].filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${isVideo ? "Play video" : "View photo"} from ${moment.customerName}${moment.location ? ` in ${moment.location}` : ""}`}
      className={`group relative block cursor-pointer overflow-hidden rounded-3xl bg-slate-900 text-left shadow-sm ring-1 ring-slate-900/5 transition-shadow duration-300 hover:shadow-xl ${className}`}
    >
      {thumb ? (
        <Image
          src={thumb}
          alt=""
          fill
          sizes={sizes}
          unoptimized={!canOptimize(thumb)}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : video?.kind === "file" ? (
        // First frame of the clip as its thumbnail
        <video
          src={`${encodeURI(video.src)}#t=0.5`}
          preload="metadata"
          muted
          playsInline
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-strong to-slate-900" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
        {isVideo ? <Play className="h-3 w-3 fill-current" /> : <Camera className="h-3 w-3" />}
        {isVideo ? "Video" : "Photo"}
      </span>

      {isVideo && (
        <span
          className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white shadow-[0_0_25px_rgba(255,255,255,0.35)] backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary ${
            large ? "h-16 w-16" : "h-12 w-12"
          }`}
        >
          <Play className={`translate-x-0.5 fill-current ${large ? "h-7 w-7" : "h-5 w-5"}`} />
        </span>
      )}

      <div className={`absolute inset-x-0 bottom-0 ${large ? "p-5" : "p-3.5"}`}>
        {moment.quote && (
          <p className={`mb-2 flex gap-1.5 font-medium leading-snug text-white/95 ${large ? "line-clamp-3 text-base" : "line-clamp-2 text-[13px]"}`}>
            <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 rotate-180 fill-white/30 text-white/60" />
            {moment.quote}
          </p>
        )}
        <p className={`truncate font-bold text-white ${large ? "text-base" : "text-sm"}`}>{moment.customerName}</p>
        {place && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/75">
            <MapPin className="h-3 w-3 shrink-0" /> {place}
          </p>
        )}
      </div>
    </button>
  );
}
