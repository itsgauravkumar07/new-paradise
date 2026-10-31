import type { CloudinaryImageOptions } from "@/lib/utils";

export const BLOG_HERO_IMAGE_OPTIONS: CloudinaryImageOptions = {
  width: 1400,
  height: 788,
  crop: "fill",
  gravity: "auto",
  quality: "good",
};

export const BLOG_CARD_IMAGE_OPTIONS: CloudinaryImageOptions = {
  width: "auto",
  height: 600,
  crop: "fill",
  gravity: "auto",
  quality: "good",
};
