"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { BLOG_CARD_IMAGE_OPTIONS } from "@/lib/blogImageOptions";
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

interface BlogGridProps {
  posts: BlogPost[];
  searchQuery: string;
  selectedCategory: string;
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
  getOptimizedImageUrl(image || null, BLOG_CARD_IMAGE_OPTIONS) || "/fallback.jpg";

export default function BlogGrid({ posts, searchQuery, selectedCategory }: BlogGridProps) {
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [posts, searchQuery, selectedCategory]);

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12 md:py-16">
        <p className="text-slate-500 text-lg mb-2">No blog posts found.</p>
        <p className="text-slate-400 text-sm">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-sm text-slate-600">
        Showing {filteredPosts.length} of {posts.length} results
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {filteredPosts.map((post, index) => {
        const displayDate = new Date(
          post.createdAt || post.publishDate || post.updatedAt || new Date().toISOString()
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <motion.article
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group"
          >
            <Link href={`/blog/${getPostSlug(post)}`} className="block h-full">
              {/* Image */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                <Image
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {post.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime || 5} min
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm md:text-base text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                      {post.author?.charAt(0) || "A"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-900">
                        {post.author || "Paradise Yatra"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{displayDate}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                    Read More →
                  </span>
                </div>
              </div>
            </Link>
          </motion.article>
        );
      })}
      </div>
    </>
  );
}
