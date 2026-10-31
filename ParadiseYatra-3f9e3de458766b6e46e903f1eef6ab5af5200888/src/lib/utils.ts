import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_CONFIG } from "@/config/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CLOUDINARY_HOST = "res.cloudinary.com";
const CLOUDINARY_DEFAULT_VIDEO_WIDTH = 1280;

type CloudinaryQuality = "auto" | "good" | "eco";
type CloudinaryCrop = "fill" | "fit" | "limit" | "scale" | "pad" | "thumb";

export interface CloudinaryImageOptions {
  width?: number | "auto";
  height?: number;
  crop?: CloudinaryCrop;
  gravity?: string;
  quality?: CloudinaryQuality;
  formatAuto?: boolean;
  dprAuto?: boolean;
}

export interface CloudinaryVideoOptions {
  width?: number;
  height?: number;
  crop?: CloudinaryCrop;
  gravity?: string;
  quality?: CloudinaryQuality;
  formatAuto?: boolean;
  codecAuto?: boolean;
}

function hasTransformationSegment(segment: string): boolean {
  return /(^|,)(f_|q_|w_|h_|c_|g_|dpr_|vc_|br_|ar_|fl_)/.test(segment);
}

function getTokenGroup(token: string): string {
  if (token.startsWith("f_")) return "f";
  if (token.startsWith("q_")) return "q";
  if (token.startsWith("w_")) return "w";
  if (token.startsWith("h_")) return "h";
  if (token.startsWith("c_")) return "c";
  if (token.startsWith("g_")) return "g";
  if (token.startsWith("dpr_")) return "dpr";
  if (token.startsWith("vc_")) return "vc";
  if (token.startsWith("br_")) return "br";
  if (token.startsWith("ar_")) return "ar";
  return token;
}

function mergeTransformation(existing: string, desired: string): string {
  const existingTokens = existing.split(",").map((token) => token.trim()).filter(Boolean);
  const desiredTokens = desired.split(",").map((token) => token.trim()).filter(Boolean);

  for (const desiredToken of desiredTokens) {
    const group = getTokenGroup(desiredToken);
    const alreadyExists = existingTokens.some((existingToken) => getTokenGroup(existingToken) === group);
    if (!alreadyExists) {
      existingTokens.push(desiredToken);
    }
  }

  return existingTokens.join(",");
}

function buildImageTransformation(options: CloudinaryImageOptions = {}): string {
  const tokens: string[] = [];
  const quality = options.quality ?? "good";
  const width = options.width ?? "auto";

  if (options.formatAuto !== false) tokens.push("f_auto");
  tokens.push(quality === "auto" ? "q_auto" : `q_auto:${quality}`);
  if (options.dprAuto !== false) tokens.push("dpr_auto");
  if (typeof width === "number" && width > 0) {
    tokens.push(`w_${Math.round(width)}`);
  } else if (width === "auto") {
    tokens.push("w_auto");
  }

  if (typeof options.height === "number" && options.height > 0) {
    tokens.push(`h_${Math.round(options.height)}`);
  }

  if (options.crop) {
    tokens.push(`c_${options.crop}`);
    if (options.gravity) {
      tokens.push(`g_${options.gravity}`);
    } else if (options.crop === "fill") {
      tokens.push("g_auto");
    }
  }

  return tokens.join(",");
}

function buildVideoTransformation(options: CloudinaryVideoOptions = {}): string {
  const tokens: string[] = [];
  const quality = options.quality ?? "eco";
  const width = options.width ?? CLOUDINARY_DEFAULT_VIDEO_WIDTH;

  tokens.push(quality === "auto" ? "q_auto" : `q_auto:${quality}`);
  if (options.formatAuto !== false) tokens.push("f_auto");
  if (options.codecAuto !== false) tokens.push("vc_auto");
  if (typeof width === "number" && width > 0) {
    tokens.push(`w_${Math.round(width)}`);
  }

  if (typeof options.height === "number" && options.height > 0) {
    tokens.push(`h_${Math.round(options.height)}`);
  }

  if (options.crop) {
    tokens.push(`c_${options.crop}`);
    if (options.gravity) {
      tokens.push(`g_${options.gravity}`);
    } else if (options.crop === "fill") {
      tokens.push("g_auto");
    }
  }

  return tokens.join(",");
}

function optimizeCloudinaryUrl(
  url: string,
  assetType: "image" | "video",
  options: CloudinaryImageOptions | CloudinaryVideoOptions = {}
): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== CLOUDINARY_HOST) return url;

    const marker = `/${assetType}/upload/`;
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return url;

    const prefix = parsed.pathname.slice(0, markerIndex + marker.length);
    const rest = parsed.pathname.slice(markerIndex + marker.length).replace(/^\/+/, "");
    const pathSegments = rest.split("/").filter(Boolean);
    if (pathSegments.length === 0) return url;

    const versionIndex = pathSegments.findIndex((segment) => /^v\d+$/.test(segment));
    let transformSegments: string[] = [];
    let publicSegments: string[] = [];

    if (versionIndex > 0) {
      transformSegments = pathSegments.slice(0, versionIndex);
      publicSegments = pathSegments.slice(versionIndex);
    } else if (versionIndex === 0) {
      publicSegments = pathSegments;
    } else if (hasTransformationSegment(pathSegments[0])) {
      transformSegments = [pathSegments[0]];
      publicSegments = pathSegments.slice(1);
    } else {
      publicSegments = pathSegments;
    }

    const desiredTransformation =
      assetType === "image"
        ? buildImageTransformation(options as CloudinaryImageOptions)
        : buildVideoTransformation(options as CloudinaryVideoOptions);

    if (!desiredTransformation) return url;

    if (transformSegments.length > 0) {
      const lastIndex = transformSegments.length - 1;
      transformSegments[lastIndex] = mergeTransformation(transformSegments[lastIndex], desiredTransformation);
    } else {
      transformSegments.push(desiredTransformation);
    }

    parsed.pathname = `${prefix}${[...transformSegments, ...publicSegments].join("/")}`;
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getOptimizedVideoUrl(
  videoUrl: string | null,
  options: CloudinaryVideoOptions = {}
): string | null {
  if (!videoUrl) return null;
  if (!videoUrl.startsWith("http://") && !videoUrl.startsWith("https://")) return videoUrl;
  return optimizeCloudinaryUrl(videoUrl, "video", options);
}

/**
 * Get the proper image URL for display
 * @param imageUrl - The image URL from the API
 * @returns The processed image URL
 */
export function getImageUrl(
  imageUrl: string | null,
  options: CloudinaryImageOptions = {}
): string | null {
  if (!imageUrl) return null;

  // Check if the URL contains only emoji or invalid characters
  if (imageUrl.length <= 2 && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(imageUrl)) {
    return null;
  }

  // If it's already a full URL, return it directly (no proxy needed)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return optimizeCloudinaryUrl(imageUrl, "image", options);
  }

  // If it's a backend upload path, proxy it through Next.js so SSR and CSR match
  if (imageUrl.startsWith('/uploads/')) {
    return `/api/uploaded-images${imageUrl}`;
  }

  return imageUrl;
}

/**
 * Get the proper image URL for multiple images
 * @param imageUrls - Array of image URLs
 * @returns Array of processed image URLs
 */
export function getImageUrls(
  imageUrls: (string | null)[],
  options: CloudinaryImageOptions = {}
): (string | null)[] {
  if (!Array.isArray(imageUrls)) return [];
  return imageUrls.map((url) => getImageUrl(url, options));
}

// Format price in Indian Rupees
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getPackagePriceLabel(priceType?: string): string {
  return priceType === "per_couple" ? "Per Couple" : "Per Person";
}

export function getPackagePriceSubLabel(priceType?: string): string {
  return priceType === "per_couple" ? "Starting from per couple" : "Starting from per person";
}

// Get category color classes
export function getCategoryColor(category: string): string {
  const colors = {
    premium: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    adventure: 'bg-gradient-to-r from-green-400 to-emerald-500',
    holiday: 'bg-gradient-to-r from-blue-400 to-purple-500',
    trending: 'bg-gradient-to-r from-pink-400 to-rose-500',
    'fixed-departure': 'bg-gradient-to-r from-red-400 to-pink-500',
    destination: 'bg-gradient-to-r from-indigo-400 to-blue-500',
    'holiday-type': 'bg-gradient-to-r from-teal-400 to-cyan-500'
  };
  return colors[category as keyof typeof colors] || 'bg-gray-400';
}

/**
 * Get the standardized .webp image for a destination
 * @param destinationName - The name of the destination/state/country
 * @returns The path to the .webp image or null if not matched
 */
export function getDestinationWebp(destinationName: string | null | undefined): string | null {
  if (!destinationName) return null;

  const name = destinationName.toLowerCase().replace(/-/g, ' ');

  if (name.includes('sikkim') || name.includes('gangtok') || name.includes('kalimpong')) return '/Destination%20Pages/Sikkim.webp';
  if (name.includes('andaman')) return '/Destination%20Pages/Andaman%20and%20Nicobar%20Island.webp';
  if (name.includes('kashmir') || name.includes('jammu') || name.includes('srinagar')) return '/Destination%20Pages/Jammu%20and%20Kashmir.webp';
  if (name.includes('rajasthan') || name.includes('jaipur') || name.includes('udaipur') || name.includes('jodhpur') || name.includes('jaisalmer')) return '/Destination%20Pages/Rajasthan.webp';
  if (name.includes('uttarakhand') || name.includes('char dham') || name.includes('nainital') || name.includes('rishikesh') || name.includes('mussoorie')) return '/Destination%20Pages/Uttarakhand.webp';
  if (name.includes('goa')) return '/Destination%20Pages/Goa.webp';
  if (name.includes('kerala') || name.includes('kochi') || name.includes('munnar') || name.includes('alleppey')) return '/Destination%20Pages/Kerala.webp';
  if (name.includes('himachal') || name.includes('shimla') || name.includes('manali')) return '/Destination%20Pages/Himachal%20Pradesh.webp';
  if (name.includes('ladakh') || name.includes('leh')) return '/Destination%20Pages/Ladakh.webp';
  if (name.includes('tamil nadu') || name.includes('ooty') || name.includes('chennai') || name.includes('madurai') || name.includes('kanyakumari')) return '/Destination%20Pages/Tamil%20Nadu.webp';

  // International
  if (name.includes('thailand')) return '/Destination%20Pages/Thailand.webp';
  if (name.includes('malaysia')) return '/Destination%20Pages/Malaysia.webp';
  if (name.includes('egypt')) return '/Destination%20Pages/Egypt.webp';
  if (name.includes('indonesia') || name.includes('bali')) return '/Destination%20Pages/Indonesia.webp';
  if (name.includes('kenya')) return '/Destination%20Pages/Kenya.webp';
  if (name.includes('maldives')) return '/Destination%20Pages/Maldives.webp';
  if (name.includes('singapore')) return '/Destination%20Pages/Singapore.webp';
  if (name.includes('united arab emirates') || name.includes('dubai') || name.includes('uae')) return '/Destination%20Pages/United%20Arab%20Emirates.webp';

  return null;
}
