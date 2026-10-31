"use client";

import { useState, useMemo } from "react";
import BlogHero from "./BlogHero";
import BlogFilters from "./BlogFilters";
import BlogGrid from "./BlogGrid";

interface BlogPost {
  _id: string;
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

interface BlogPageClientProps {
  posts: BlogPost[];
}

export default function BlogPageClient({ posts }: BlogPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map((post) => post.category))).filter(
      Boolean
    );
    return cats.sort();
  }, [posts]);

  // Get featured post (first post)
  const featuredPost = posts.length > 0 ? posts[0] : null;

  // Get remaining posts for grid
  const gridPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>✨</span>
            <span>Read Our Blog</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-slate-900 leading-tight">
            Browse Our Resources
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            We provide tips and resources from industry leaders. For real.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
        {/* Featured Hero Post */}
        {featuredPost && <BlogHero post={featuredPost} />}

        {/* Filters and Search */}
        <BlogFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Blog Grid */}
        <BlogGrid
          posts={gridPosts}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      </div>
    </div>
  );
}
