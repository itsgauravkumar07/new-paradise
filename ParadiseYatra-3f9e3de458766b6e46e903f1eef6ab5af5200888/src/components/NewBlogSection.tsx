"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonPackageCard } from "@/components/ui/skeleton";
import Skeleton from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
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
  createdAt?: string;
  publishDate?: string;
  updatedAt?: string;
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

const NewBlogSection = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newCardIndex, setNewCardIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);

  // Update mobile state based on screen size
  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth < 768);
    updateMobileState();
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  // Mobile Scroll Handler with debouncing
  useEffect(() => {
    if (!isMobile || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (isScrollingProgrammatically.current) return;

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const itemElement = container.firstElementChild as HTMLElement;

        if (itemElement) {
          const itemWidth = itemElement.offsetWidth + 20; // 20px gap
          const newIndex = Math.round(scrollLeft / itemWidth);

          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < allBlogPosts.length) {
            setCurrentIndex(newIndex);
          }
        }
      }, 50);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isMobile, currentIndex, allBlogPosts.length]);

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
          // Fetch latest 10 published blogs, show 3 at a time with pagination
          // Use published=true to get latest blogs regardless of featured status
          response = await fetch("/api/blogs?published=true&limit=10", {
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
        let blogsArray: BlogPost[] = [];
        if (Array.isArray(data)) {
          blogsArray = data;
        } else if (data.blogs && Array.isArray(data.blogs)) {
          blogsArray = data.blogs;
        } else {
          if (isMounted) {
            console.error("Unexpected data structure:", data);
            setAllBlogPosts([]);
            setError("Invalid data format received");
            setLoading(false);
          }
          return;
        }

        // Sort by createdAt (latest first) - same logic as AdminBlogs
        // Use fallback to publishDate or updatedAt if createdAt is missing
        blogsArray.sort((a, b) => {
          const dateA = new Date(
            a.publishDate ||
            a.createdAt ||
            a.updatedAt ||
            0
          ).getTime();
          const dateB = new Date(
            b.publishDate ||
            b.createdAt ||
            b.updatedAt ||
            0
          ).getTime();
          return dateB - dateA; // Latest first (descending order)
        });

        if (isMounted) {
          setAllBlogPosts(blogsArray);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching blogs:", err);
          setError("Failed to load blogs");
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

  const visibleBlogPosts = allBlogPosts.slice(currentIndex, currentIndex + 3);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < allBlogPosts.length - 3;
  const totalDesktopDots = Math.max(0, allBlogPosts.length - 2);
  const totalMobileDots = allBlogPosts.length;

  const handlePrevious = () => {
    if (isMobile || isTransitioning || currentIndex === 0) return;
    setIsTransitioning(true);
    setNewCardIndex(0);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => {
      setIsTransitioning(false);
      setNewCardIndex(null);
    }, 400);
  };

  const handleNext = () => {
    if (isMobile || isTransitioning || currentIndex >= allBlogPosts.length - 3) return;
    setIsTransitioning(true);
    setNewCardIndex(2);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => {
      setIsTransitioning(false);
      setNewCardIndex(null);
    }, 400);
  };

  const handleDotClick = (index: number) => {
    if (isTransitioning) return;

    if (isMobile && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemElement = container.firstElementChild as HTMLElement;
      if (itemElement) {
        const itemWidth = itemElement.offsetWidth + 20;
        isScrollingProgrammatically.current = true;

        container.scrollTo({
          left: index * itemWidth,
          behavior: 'smooth'
        });

        setCurrentIndex(index);

        setTimeout(() => {
          isScrollingProgrammatically.current = false;
        }, 500);
      }
    } else {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  if (loading) return null;

  // Don't render if allBlogPosts is not an array
  if (!Array.isArray(allBlogPosts)) {
    return null;
  }

  return (
    <section className="py-16 bg-slate-50">
      <style jsx global>{`
        @keyframes fadeInSoft {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-enter {
          animation: fadeInSoft 0.35s ease-out forwards;
        }
        @media (min-width: 768px) {
          .desktop-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .desktop-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          }
          .desktop-card-image {
            overflow: hidden;
          }
          .desktop-card-button {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .desktop-card:hover .desktop-card-button {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
          }
        }
        .mobile-scroll-container {
          scroll-snap-type: x mandatory;
          display: flex;
          overflow-x: auto;
          gap: 0.75rem;
          padding: 0 0.5rem 1.5rem !important;
          scrollbar-width: none;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scroll-padding-left: 0.5rem;
          scroll-padding-right: 0.5rem;
        }
        .mobile-scroll-container::-webkit-scrollbar { 
          display: none; 
        }
        .mobile-scroll-item { 
          scroll-snap-align: center;
          scroll-snap-stop: always;
          flex-shrink: 0; 
          width: 88vw !important; 
          max-width: 340px !important;
        }
        
        .pagination-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #cbd5e1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: none;
        }
        
        .pagination-dot.active {
          background-color: #3b82f6;
          width: 24px;
          border-radius: 4px;
        }
        
        .pagination-dot.mobile-active {
          background-color: #3b82f6;
          width: 20px;
          border-radius: 4px;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 relative">
          <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-32 h-32 bg-blue-100/40 blur-3xl rounded-full -z-10" />

          <div className="flex flex-col items-center gap-2 mb-4">
            <h2 className="!text-3xl md:!text-5xl !font-extrabold text-slate-900 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Travel
              </span>{" "}
              Insights & Guides
            </h2>

            <div className="flex items-center gap-2 mt-1">
              <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-blue-500 rounded-full" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
              <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-blue-500 rounded-full" />
            </div>
          </div>

          <p className="!text-sm md:!text-lg !text-slate-500 max-w-2xl mx-auto leading-relaxed px-4">
            Discover expert tips, local insights, and comprehensive guides to make your journey unforgettable
          </p>
        </div>

        {!isMobile && (
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious || isTransitioning}
              className={`w-8 h-10 border border-gray-200 rounded-sm flex items-center justify-center shadow-sm duration-300 cursor-pointer ${!canGoPrevious
                ? "bg-gray-100 border-gray-200 text-gray-400"
                : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:scale-110"
                }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext || isTransitioning}
              className={`w-8 h-10 border border-gray-200 rounded-sm flex items-center justify-center shadow-sm cursor-pointer ${!canGoNext
                ? "bg-gray-100 border-gray-200 text-gray-400"
                : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:shadow-xl hover:scale-110"
                }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {isMobile ? (
          <div className="md:hidden w-full overflow-x-hidden">
            <div className="mobile-scroll-container" ref={scrollContainerRef} style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
              {allBlogPosts.map((post) => (
                <div key={post._id} className="mobile-scroll-item">
                  <Link href={`/blog/${getPostSlug(post)}`} className="block h-full">
                    <Card className="overflow-hidden border border-gray-200 h-full bg-white flex flex-col shadow-md">
                      <div className="relative h-52 w-full overflow-hidden">
                        <Image
                          src={post.image && getImageUrl(post.image) ? getImageUrl(post.image)! : "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                          alt={post.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="!bg-blue-600 text-white">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="flex flex-col flex-grow p-4">
                        <div className="flex items-center text-slate-500 text-xs mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span className="mr-2">
                            {new Date(post.createdAt || post.publishDate || post.updatedAt || new Date().toISOString()).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="mr-2">•</span>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{post.readTime} min</span>
                        </div>
                        <h3 className="!text-lg !font-bold text-slate-900 mb-2 truncate">
                          {post.title}
                        </h3>
                        <p className="!text-gray-600 !text-xs mb-3 line-clamp-2">
                          {post.excerpt || post.content.substring(0, 120)}...
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-2">
                              {post.author.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-slate-700 font-medium">
                              {post.author}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            className="border-slate-900 border text-slate-900 bg-transparent hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 cursor-pointer px-3 h-8 text-xs"
                          >
                            Read <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>

            {totalMobileDots > 1 && (
              <div className="flex justify-center items-center gap-2 mt-3">
                {allBlogPosts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`pagination-dot ${currentIndex === index ? 'mobile-active' : ''}`}
                    aria-label={`Go to blog ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleBlogPosts.map((post, index) => (
                <div key={post._id} className={newCardIndex === index ? 'card-enter' : ''}>
                  <Link href={`/blog/${getPostSlug(post)}`} className="block h-full">
                    <Card className="desktop-card overflow-hidden border border-gray-200 group h-full bg-white">
                      <div className="desktop-card-image relative h-64 overflow-hidden">
                        <Image
                          src={post.image && getImageUrl(post.image) ? getImageUrl(post.image)! : "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                          alt={post.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="!bg-blue-600 text-white">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center text-slate-500 text-sm mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="mr-2">
                            {new Date(post.createdAt || post.publishDate || post.updatedAt || new Date().toISOString()).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="mr-2">•</span>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{post.readTime} min</span>
                        </div>
                        <h3 className="!text-xl !font-bold text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors duration-300">
                          {post.title}
                        </h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                          {post.excerpt || post.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Image
                              src="/l1.webp"
                              alt="author"
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                            <span className="text-sm text-slate-700 font-medium ml-2">
                              {post.author}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            className="desktop-card-button border border-slate-900 text-slate-900 bg-transparent hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 cursor-pointer px-6"
                          >
                            Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>

            {totalDesktopDots > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {Array.from({ length: totalDesktopDots }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`pagination-dot ${currentIndex === index ? 'active' : ''}`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {allBlogPosts.length === 0 && !loading && (
          <div className="text-center">
            <p className="text-gray-500">
              {error
                ? "Failed to load blog posts."
                : "No featured blog posts available."}
            </p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/blog" className="inline-block group">
            <button
              className="relative overflow-hidden rounded-full w-full sm:w-auto shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center justify-center gap-2 px-8 py-4 text-white font-semibold text-base">
                View All Blog Posts
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewBlogSection;
