"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonPackageCard } from "@/components/ui/skeleton";
import Skeleton from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import TruncatedText from "@/components/ui/truncated-text";
import { BLOG_CARD_IMAGE_OPTIONS } from "@/lib/blogImageOptions";
import { getImageUrl as getOptimizedImageUrl } from "@/lib/utils";

interface BlogPost {
  _id: string;
  slug?: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  image: string;
  category: string;
  readTime: number;
  views: number;
  likes: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
}

// Function to generate slug from title
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

const getImageUrl = (image: string | undefined) =>
  getOptimizedImageUrl(image || null, BLOG_CARD_IMAGE_OPTIONS);

const BlogSection = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update mobile state based on screen size
  useEffect(() => {
    const updateMobileState = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    updateMobileState();
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  // Handle scroll position for mobile indicators
  useEffect(() => {
    if (!isMobile || !scrollContainerRef.current) return;

    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth * 0.85; // 85vw
      const gap = 24; // 6 * 4px gap
      const adjustedCardWidth = cardWidth + gap;

      // Calculate scroll progress more smoothly
      const scrollProgress = scrollLeft / adjustedCardWidth;
      const newIndex = Math.floor(scrollProgress + 0.5); // Round to nearest

      // Add some threshold to prevent jittery updates
      if (Math.abs(newIndex - activeScrollIndex) >= 0.1) {
        setActiveScrollIndex(
          Math.min(Math.max(0, newIndex), allBlogPosts.length - 1)
        );
      }
    };

    const container = scrollContainerRef.current;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isMobile, allBlogPosts.length, activeScrollIndex]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const fetchBlogs = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        
        let response;
        try {
          response = await fetch("/api/blogs?featured=true", {
            signal: controller.signal,
            cache: 'default', // Use cache to reduce requests
          });
          clearTimeout(timeoutId);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            if (isMounted) {
              console.warn('Blog fetch timed out');
              setError("Request timeout - please refresh the page");
              setBlogPosts([]);
              setAllBlogPosts([]);
              setLoading(false);
            }
            return;
          }
          throw fetchError;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }

        const data = await response.json();

        // Handle both direct array and object with blogs array
        if (isMounted) {
          if (Array.isArray(data)) {
            setAllBlogPosts(data);
            setBlogPosts(data.slice(0, 3)); // Show only first 3 blogs initially
            setError(null);
          } else if (data.blogs && Array.isArray(data.blogs)) {
            setAllBlogPosts(data.blogs);
            setBlogPosts(data.blogs.slice(0, 3));
            setError(null);
          } else {
            console.error("Unexpected data structure:", data);
            setBlogPosts([]);
            setAllBlogPosts([]);
            setError("Invalid data format received");
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching blogs:", err);
          setError("Failed to load blogs");
          setBlogPosts([]); // Don't show static data, show empty state
          setAllBlogPosts([]);
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Calculate total groups for desktop navigation
  const totalGroups = Math.ceil(allBlogPosts.length / 3);

  // Handle desktop navigation
  const handlePrevious = () => {
    if (isMobile) return;
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);

    const startIndex = newIndex * 3;
    const endIndex = startIndex + 3;
    const newBlogPosts = allBlogPosts.slice(startIndex, endIndex);
    setBlogPosts(newBlogPosts);
  };

  const handleNext = () => {
    if (isMobile) return;
    const newIndex = Math.min(totalGroups - 1, currentIndex + 1);
    setCurrentIndex(newIndex);

    const startIndex = newIndex * 3;
    const endIndex = startIndex + 3;
    const newBlogPosts = allBlogPosts.slice(startIndex, endIndex);
    setBlogPosts(newBlogPosts);
  };

  if (loading) {
    return (
      <section className="section-padding bg-white px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <Skeleton height="2.5rem" width="300px" className="mx-auto mb-4" />
            <Skeleton height="1.25rem" width="200px" className="mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonPackageCard key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render if blogPosts is not an array
  if (!Array.isArray(blogPosts)) {
    return null;
  }

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-blue-600 text-base font-semibold tracking-wide mb-2"
          >
            Travel Insights
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3"
          >
            Travel Insights & Guides
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto font-nunito font-light"
          >
            Discover expert tips, local insights, and comprehensive guides to
            make your journey unforgettable
          </motion.p>
        </motion.div>

        {/* Navigation buttons for desktop */}
        <div className="hidden lg:flex justify-between items-center mb-8">
          <motion.button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            whileHover={{ scale: currentIndex === 0 ? 1 : 1.1 }}
            whileTap={{ scale: currentIndex === 0 ? 1 : 0.9 }}
            className={`w-12 h-12 border rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
              currentIndex === 0
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <div className="text-sm text-gray-500 font-medium">
            {currentIndex + 1} of {totalGroups}
          </div>

          <motion.button
            onClick={handleNext}
            disabled={currentIndex === totalGroups - 1}
            whileHover={{ scale: currentIndex === totalGroups - 1 ? 1 : 1.1 }}
            whileTap={{ scale: currentIndex === totalGroups - 1 ? 1 : 0.9 }}
            className={`w-12 h-12 border rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
              currentIndex === totalGroups - 1
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Blog Grid */}
        {blogPosts.length > 0 ? (
          <div className="relative">
            {/* Desktop view with carousel */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {blogPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group cursor-pointer modern-card overflow-hidden hover-lift rounded-3xl shadow-xl border-0 relative bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-[580px] flex flex-col"
                  >
                    {/* Blog Image */}
                    <div className="relative h-56 overflow-hidden card-image rounded-t-3xl">
                      {post.image && getImageUrl(post.image) ? (
                        <Image
                          src={getImageUrl(post.image)!}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-4xl ${
                          post.image ? "hidden" : ""
                        }`}
                      >
                        {post.image || "📝"}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="badge bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 text-lg font-bold shadow-md whitespace-nowrap">
                          {post.category}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full"
                        >
                          <Heart className="w-4 h-4 text-white" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full"
                        >
                          <Share2 className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </div>

                    {/* Blog Content */}
                    <div className="p-6 card-content flex flex-col flex-1">
                      {/* Title Section */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
                          {post.title}
                        </h3>
                        <TruncatedText
                          text={post.excerpt}
                          maxWords={25}
                          className="text-gray-600 text-sm leading-relaxed mb-4"
                        />
                      </div>

                      {/* Metadata Section */}
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="font-medium text-gray-700 truncate">
                              {post.author}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="font-medium text-gray-700">
                              {post.readTime} min read
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="font-medium text-gray-700">
                              {new Date(post.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <span className="font-medium text-gray-700">
                              {post.views}+ views
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Read More Button */}
                      <div className="mt-auto pt-4">
                        <Link href={`/blog/${getPostSlug(post)}`}>
                          <Button className="w-full py-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 hover:cursor-pointer hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-blue-300 group">
                            <span>Read More</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile view with horizontal scrolling */}
            <div className="lg:hidden">
              <div
                ref={scrollContainerRef}
                className="flex flex-nowrap gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {allBlogPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="flex-shrink-0 w-80 snap-start group cursor-pointer modern-card overflow-hidden hover-lift rounded-3xl shadow-xl border-0 relative bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-[580px] flex flex-col"
                  >
                    {/* Blog Image */}
                    <div className="relative h-56 overflow-hidden card-image rounded-t-3xl">
                      {post.image && getImageUrl(post.image) ? (
                        <Image
                          src={getImageUrl(post.image)!}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-4xl ${
                          post.image ? "hidden" : ""
                        }`}
                      >
                        {post.image || "📝"}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="badge bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 text-lg font-bold shadow-md whitespace-nowrap">
                          {post.category}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full"
                        >
                          <Heart className="w-4 h-4 text-white" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full"
                        >
                          <Share2 className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </div>

                    {/* Blog Content */}
                    <div className="p-6 card-content flex flex-col flex-1">
                      {/* Title Section */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
                          {post.title}
                        </h3>
                        <TruncatedText
                          text={post.excerpt}
                          maxWords={25}
                          className="text-gray-600 text-sm leading-relaxed mb-4"
                        />
                      </div>

                      {/* Metadata Section */}
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="font-medium text-gray-700 truncate">
                              {post.author}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="font-medium text-gray-700">
                              {post.readTime} min read
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="font-medium text-gray-700">
                              {new Date(post.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <span className="font-medium text-gray-700">
                              {post.views}+ views
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Read More Button */}
                      <div className="mt-auto pt-4">
                        <Link href={`/blog/${getPostSlug(post)}`}>
                          <Button className="w-full py-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 hover:cursor-pointer hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-blue-300 group">
                            <span>Read More</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile scroll indicators */}
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  {allBlogPosts.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${
                        index === activeScrollIndex
                          ? "bg-blue-600 w-8 scale-110"
                          : "bg-gray-300 w-2 hover:bg-gray-400 hover:scale-105"
                      }`}
                    />
                  ))}
                </div>
                <div className="ml-4 text-xs text-gray-500 flex items-center">
                  <span>Swipe to explore more</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {error
                ? "Failed to load blog posts."
                : "No featured blog posts available."}
            </p>
          </div>
        )}

        {/* View All Blogs Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center mt-12"
        >
          <Link href="/blog">
            <Button className="px-8 py-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow hover:from-blue-700 hover:to-blue-600 hover:cursor-pointer hover:scale-105 transition-all duration-200 inline-flex items-center group">
              <BookOpen className="w-5 h-5 mr-2 group-hover:text-blue-200 transition-colors" />
              View All Blog Posts
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;
