"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLOG_HERO_IMAGE_OPTIONS } from "@/lib/blogImageOptions";
import { getImageUrl as getOptimizedImageUrl } from "@/lib/utils";

interface BlogPost {
  _id: string;
  slug?: string;
  title: string;
  excerpt: string;
  author: string;
  image: string;
  category: string;
  readTime: number;
  createdAt?: string;
  publishDate?: string;
  updatedAt?: string;
}

interface BlogHeroProps {
  post: BlogPost;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const getPostSlug = (post: BlogPost): string => {
  return post.slug || generateSlug(post.title);
};

const getImageUrl = (image: string | undefined): string =>
  getOptimizedImageUrl(image || null, BLOG_HERO_IMAGE_OPTIONS) || "/fallback.jpg";

export default function BlogHero({ post }: BlogHeroProps) {
  const displayDate = new Date(
    post.createdAt || post.publishDate || post.updatedAt || new Date().toISOString()
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl mb-12 md:mb-16 group">
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image
          src={getImageUrl(post.image)}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
         {/* Dark overlay for text + search visibility */}
        <div className="pointer-events-none absolute inset-0 bg-black/90" />
      

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12 text-white">
        <div className="max-w-4xl">
          {/* Category Badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white text-xs md:text-sm px-3 py-1.5 rounded-full font-medium">
              {post.category}
            </span>
            <span className="text-xs md:text-sm opacity-90">Featured Article</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-sm md:text-base lg:text-lg mb-6 md:mb-8 opacity-90 line-clamp-2 md:line-clamp-3 max-w-3xl">
            {post.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 text-xs md:text-sm opacity-80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-semibold text-white">
                  {post.author?.charAt(0) || "A"}
                </div>
                <span>{post.author || "Paradise Yatra"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{displayDate}</span>
              </div>
              <span>{post.readTime || 5} min read</span>
            </div>

            <Link href={`/blog/${getPostSlug(post)}`}>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-lg font-medium text-sm md:text-base group/btn">
                Read Article
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
