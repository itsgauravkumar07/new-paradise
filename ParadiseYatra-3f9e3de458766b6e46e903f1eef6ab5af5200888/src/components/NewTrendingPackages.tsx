"use client"
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { SkeletonPackageCard } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { getCategoryPageUrl } from "@/lib/categoryUtils";

interface Package {
  _id: string;
  title: string;
  duration: string;
  destination: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  shortDescription: string;
  slug: string;
  rating?: number;
}

const cleanTitle = (title: string): string => {
  return title
    .replace(/\s*[-–—]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// Robust helper to extract ID from any format
const getPackageId = (item: any): string => {
  if (!item) return "";
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    const id = item._id || item.id;
    if (id && typeof id === 'object' && id.$oid) return id.$oid;
    if (id) return String(id);
  }
  return "";
};

const NewTrendingDestinations = () => {
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newCardIndex, setNewCardIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth < 768);
    updateMobileState();
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  useEffect(() => {
    const fetchTrendingPackages = async () => {
      try {
        setLoading(true);
        // 1. Fetch all tags to find the trending tag
        const tagsRes = await fetch("/api/tags");
        const tagsData = await tagsRes.json();

        const allTags = Array.isArray(tagsData) ? tagsData : (tagsData.data || []);
        const success = Array.isArray(tagsData) || tagsData.success;

        if (!tagsRes.ok || !success) {
          console.error("Failed to fetch tags", tagsData);
          return;
        }

        const trendingTag = allTags.find((tag: any) =>
          tag.slug.toLowerCase().includes("trending") ||
          tag.name.toLowerCase().includes("trending")
        );

        if (!trendingTag || !trendingTag.packages || trendingTag.packages.length === 0) {
          console.warn("Trending tag not found or has no packages", trendingTag);
          setAllPackages([]);
          setLoading(false);
          return;
        }

        // 2. Fetch all possible data sources to match IDs
        let matchedPackages = [];

        if (typeof trendingTag.packages[0] === 'object') {
          matchedPackages = trendingTag.packages;
        } else {
          // It's an array of IDs, we need to fetch all possible sources
          const [packagesRes, holidayRes, destinationsRes, fixedRes] = await Promise.all([
            fetch("/api/packages?limit=100"),
            fetch("/api/holiday-types?limit=100"),
            fetch("/api/destinations?limit=100"),
            fetch("/api/fixed-departures?limit=100")
          ]);

          const [packagesData, holidayData, destinationsData, fixedData] = await Promise.all([
            packagesRes.json().catch(() => ({})),
            holidayRes.json().catch(() => ([])),
            destinationsRes.json().catch(() => ({})),
            fixedRes.json().catch(() => ({}))
          ]);

          const normalize = (data: any) => {
            if (Array.isArray(data)) return data;
            if (data && data.packages) return data.packages;
            if (data && data.destinations) return data.destinations;
            if (data && data.fixedDepartures) return data.fixedDepartures;
            return [];
          };

          const allItems = [
            ...normalize(packagesData),
            ...normalize(holidayData),
            ...normalize(destinationsData),
            ...normalize(fixedData)
          ];

          // Normalize tagged package IDs to ensure consistent matching
          const taggedIds = (trendingTag.packages || []).map((p: any) => getPackageId(p)).filter((id: string) => id !== "");

          matchedPackages = allItems.filter((item: any) => {
            const itemId = getPackageId(item);
            return itemId && taggedIds.includes(itemId);
          });

          // Remove duplicates based on ID
          matchedPackages = Array.from(new Map(matchedPackages.map((pkg: any) => [getPackageId(pkg), pkg])).values());
        }

        // 3. Map to Package format
        const mappedPackages: Package[] = matchedPackages.map((pkg: any) => ({
          _id: pkg._id || pkg.id,
          title: pkg.title || pkg.name || "Exciting Tour",
          duration: pkg.duration || "5N/6D",
          destination: pkg.destination || pkg.location || pkg.state || pkg.title || "India",
          price: typeof pkg.price === 'string' ? parseInt(pkg.price.replace(/[^\d]/g, '')) : (pkg.price || 0),
          originalPrice: pkg.originalPrice,
          images: pkg.images || [pkg.image || pkg.thumbnail || FALLBACK_IMAGE],
          category: pkg.category || "Tour",
          shortDescription: pkg.shortDescription || pkg.description || "",
          slug: pkg.slug || pkg._id || pkg.id,
          rating: pkg.rating || 4.5
        }));

        setAllPackages(mappedPackages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingPackages();
  }, []);

  // FIXED: Mobile Scroll Handler with debouncing
  useEffect(() => {
    if (!isMobile || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Don't update index if we're scrolling programmatically (from dot click)
      if (isScrollingProgrammatically.current) return;

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const itemElement = container.firstElementChild as HTMLElement;

        if (itemElement) {
          const itemWidth = itemElement.offsetWidth + 20; // 20px gap
          const newIndex = Math.round(scrollLeft / itemWidth);

          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < allPackages.length) {
            setCurrentIndex(newIndex);
          }
        }
      }, 50); // Debounce for 50ms
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isMobile, currentIndex, allPackages.length]);

  const handlePrevious = () => {
    if (isMobile || isTransitioning || currentIndex === 0) return;
    setIsTransitioning(true);
    setNewCardIndex(0); // New card appears at leftmost position (index 0)
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => {
      setIsTransitioning(false);
      setNewCardIndex(null);
    }, 400);
  };

  const handleNext = () => {
    if (isMobile || isTransitioning || currentIndex >= allPackages.length - 3) return;
    setIsTransitioning(true);
    setNewCardIndex(2); // New card appears at rightmost position (index 2)
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
        const itemWidth = itemElement.offsetWidth + 20; // 20px gap
        isScrollingProgrammatically.current = true;

        container.scrollTo({
          left: index * itemWidth,
          behavior: 'smooth'
        });

        setCurrentIndex(index);

        // Reset the flag after scroll animation completes
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

  const formatDuration = (duration: string) => {
    if (!duration) return "Contact for details";
    const match = duration.match(/^(\d+)N\/(\d+)D$/i);
    if (match) return `${match[2]} Days, ${match[1]} Nights`;
    return duration;
  };

  if (loading) return null;

  const visiblePackages = allPackages.slice(currentIndex, currentIndex + 3);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < allPackages.length - 3;

  const totalDesktopDots = Math.max(0, allPackages.length - 2);
  const totalMobileDots = allPackages.length;

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
        {/* <div className="text-center mb-4">
          <h2 className="!text-3xl md:!text-5xl !font-bold text-slate-900 mb-4">Trending Packages</h2>
          <p className="!text-sm md:!text-xl !text-slate-600 max-w-3xl mx-auto">
            Discover our most popular travel packages, carefully curated for unforgettable experiences
          </p>
        </div> */}
        <div className="text-center mb-4 relative">
          {/* Decorative Background Element (Optional subtle glow) */}
          <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-32 h-32 bg-blue-100/40 blur-3xl rounded-full -z-10" />

          <div className="flex flex-col items-center gap-2 mb-4">

            <h2 className="!text-3xl md:!text-5xl !font-extrabold text-slate-900 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Trending
              </span>{" "}
              Packages
            </h2>

            {/* Rich accent line */}
            <div className="flex items-center gap-2 mt-1">
              <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-blue-500 rounded-full" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
              <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-blue-500 rounded-full" />
            </div>
          </div>

          <p className="!text-sm md:!text-lg !text-slate-500 max-w-2xl mx-auto leading-relaxed px-4">
            Discover our most popular travel packages, carefully curated for unforgettable experiences
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
              {allPackages.map((pkg) => (
                <div key={pkg._id} className="mobile-scroll-item">
                  <Link href={`/package/${pkg.slug || pkg._id}`} className="block w-full">
                    <article
                      className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-300 transition-all duration-300 relative w-full"
                    >
                      {/* White hover overlay */}
                      <div className="absolute inset-0 bg-white/10 opacity-10 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none"></div>

                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={getImageUrl(pkg.images?.[0]) || FALLBACK_IMAGE}
                          alt={pkg.title}
                          fill
                          className="object-cover transition-transform duration-700"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        {/* Content on Image */}
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="flex items-center gap-1.5 mb-1.5 opacity-90">
                            <MapPin className="h-3.5 w-3.5 text-blue-600" />
                            <span className="!text-xs !font-semibold tracking-wide uppercase">{pkg.destination}</span>
                          </div>
                          <h4 className="text-md !font-bold leading-snug line-clamp-2 text-shadow-sm">
                            {pkg.title}
                          </h4>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-800 font-black uppercase tracking-wide">Duration</span>
                            <span className="text-sm !font-bold text-slate-800 flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                              {pkg.duration}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-blue-600 font-black uppercase tracking-wide">Price</span>
                            <span className="!text-lg font-black text-blue-600">
                              ₹{pkg.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-dashed border-gray-300 flex items-center justify-between">
                          <span className="text-xs text-slate-800">Per Person</span>
                          <button className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                            View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              ))}
            </div>

            {totalMobileDots > 1 && (
              <div className="flex justify-center items-center gap-2 mt-3">
                {allPackages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`pagination-dot ${currentIndex === index ? 'mobile-active' : ''}`}
                    aria-label={`Go to package ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visiblePackages.map((pkg, index) => (
                <div key={pkg._id} className={newCardIndex === index ? 'card-enter' : ''}>
                  <Link href={`/package/${pkg.slug || pkg._id}`} className="block h-full w-full">
                    <article
                      className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-300 transition-all duration-300 relative w-full h-full"
                    >
                      {/* White hover overlay */}
                      <div className="absolute inset-0 bg-white/10 opacity-10 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none"></div>

                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={getImageUrl(pkg.images?.[0]) || FALLBACK_IMAGE}
                          alt={pkg.title}
                          fill
                          className="object-cover transition-transform duration-700"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        {/* Content on Image */}
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="flex items-center gap-1.5 mb-1.5 opacity-90">
                            <MapPin className="h-3.5 w-3.5 text-blue-600" />
                            <span className="!text-xs !font-semibold tracking-wide uppercase">{pkg.destination}</span>
                          </div>
                          <h4 className="text-md !font-bold leading-snug line-clamp-2 text-shadow-sm">
                            {pkg.title}
                          </h4>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-800 font-black uppercase tracking-wide">Duration</span>
                            <span className="text-sm !font-bold text-slate-800 flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                              {pkg.duration}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-blue-600 font-black uppercase tracking-wide">Price</span>
                            <span className="!text-lg font-black text-blue-600">
                              ₹{pkg.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-dashed border-gray-300 flex items-center justify-between">
                          <span className="text-xs text-slate-800">Per Person</span>
                          <button className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                            View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </article>
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
                    disabled={isTransitioning}
                    className={`pagination-dot ${currentIndex === index ? 'active' : ''}`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="text-center mt-12 px-2">
          <Link href={getCategoryPageUrl("Trending Destinations")} className="inline-block group">
            <button
              className="relative overflow-hidden rounded-full w-full sm:w-auto shadow-xl transition-all duration-300  bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-md pl-8 pr-4 whitespace-nowrap">
                  View All Packages
                </span>
                <div className="bg-xwhite rounded-full p-2 m-1.5 transition-all duration-300 group-hover:-rotate-45 group-hover:scale-110 shadow-md">
                  <ArrowRight className="w-4 h-4 text-indigo-600" strokeWidth={2.5} />
                </div>
              </div>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewTrendingDestinations;