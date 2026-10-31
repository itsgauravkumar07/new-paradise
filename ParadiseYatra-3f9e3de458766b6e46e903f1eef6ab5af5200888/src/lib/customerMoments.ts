// Customer photos and videos ("Traveller moments"), managed in Admin → Customer Gallery.
// Backend: models/CustomerMoment.js, controllers/customerMomentController.js.
import { VIDEO_TESTIMONIALS } from "@/lib/videoTestimonials";

export interface CustomerMoment {
  _id: string;
  type: "photo" | "video";
  imageUrl?: string;
  videoUrl?: string;
  customerName: string;
  /** State or country as written on packages ("Kerala", "Jammu and Kashmir") */
  location?: string;
  tripDate?: string;
  quote?: string;
  showOnHome?: boolean;
  order?: number;
  isActive?: boolean;
  consent?: boolean;
}

export type ParsedVideo =
  | { kind: "youtube"; id: string; embed: string; thumb: string }
  | { kind: "instagram"; embed: string }
  | { kind: "file"; src: string };

/** Works out how to play a video link (YouTube, Instagram reel/post, or a video file). */
export function parseVideo(url?: string): ParsedVideo | null {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([A-Za-z0-9_-]{6,15})/i);
  if (yt) {
    return {
      kind: "youtube",
      id: yt[1],
      embed: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&playsinline=1`,
      thumb: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
    };
  }
  const ig = url.match(/instagram\.com\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (ig) return { kind: "instagram", embed: `https://www.instagram.com/${ig[1] === "reels" ? "reel" : ig[1]}/${ig[2]}/embed` };
  if (/\.(mp4|webm|mov)(?:[?#].*)?$/i.test(url) && (/^\/(?!\/)/.test(url) || /^https:\/\//i.test(url))) return { kind: "file", src: url };
  return null;
}

/** Image to show on the card: the photo, the video's cover, or YouTube's own thumbnail. Null = use the video's first frame. */
export function momentThumb(m: CustomerMoment): string | null {
  if (m.imageUrl) return m.imageUrl;
  const video = parseVideo(m.videoUrl);
  return video?.kind === "youtube" ? video.thumb : null;
}

/** Until the team adds moments, the home page keeps showing the original traveller videos. */
export const BUILT_IN_MOMENTS: CustomerMoment[] = VIDEO_TESTIMONIALS.map((v) => ({
  _id: `built-in-${v.id}`,
  type: "video",
  videoUrl: v.video,
  customerName: v.name,
  location: v.destination,
  quote: v.quote,
}));

export const TRAVELLER_STORIES_PATH = "/traveller-stories";
