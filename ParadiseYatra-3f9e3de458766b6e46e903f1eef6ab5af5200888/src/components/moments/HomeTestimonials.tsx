"use client";

// Home page video testimonials (the "Watch Real Traveller Stories" layout on phones and desktop).
// Videos come from Admin → Customer Gallery (items marked "On home page"). The layout plays video files,
// so it uses the gallery's .mp4 videos, and keeps the original five until there are any.

import { useEffect, useState } from "react";
import VideoTestimonialsSection from "@/components/VideoTestimonialsSection";
import { parseVideo, type CustomerMoment } from "@/lib/customerMoments";
import { VIDEO_TESTIMONIALS, type VideoTestimonial } from "@/lib/videoTestimonials";

const toVideoTestimonials = (moments: CustomerMoment[]): VideoTestimonial[] =>
  moments.flatMap((m, i) => {
    const video = m.type === "video" ? parseVideo(m.videoUrl) : null;
    if (video?.kind !== "file") return [];
    return [{ id: i + 1, destination: m.location || "", video: video.src, quote: m.quote || "", name: m.customerName }];
  });

export default function HomeTestimonials() {
  const [videos, setVideos] = useState<VideoTestimonial[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/customer-moments?home=1&limit=12")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        const list = d?.success && Array.isArray(d.moments) ? toVideoTestimonials(d.moments) : [];
        setVideos(list.length ? list : VIDEO_TESTIMONIALS);
      })
      .catch(() => alive && setVideos(VIDEO_TESTIMONIALS));
    return () => {
      alive = false;
    };
  }, []);

  if (!videos) return <div className="min-h-[720px]" aria-hidden="true" />;
  return <VideoTestimonialsSection testimonials={videos} />;
}
