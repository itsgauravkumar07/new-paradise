"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { getCategoryPageUrl } from "@/lib/categoryUtils";
import { getImageUrl } from "@/lib/utils";

interface PremiumPackage {
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

const NewPremiumPackages = () => {
  const [allPackages, setAllPackages] = useState<PremiumPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newCardIndex, setNewCardIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80";

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth < 768);
    updateMobileState();
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  useEffect(() => {
    const fetchPremiumPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/packages?category=Premium%20Packages&limit=10");
        if (!response.ok) throw new Error("Failed to fetch premium packages");
        const data = await response.json();
        let packagesToSet = Array.isArray(data) ? data : (data.packages || []);
        setAllPackages(packagesToSet);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchPremiumPackages();
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
          const itemWidth = itemElement.offsetWidth + 20;
          const newIndex = Math.round(scrollLeft / itemWidth);

          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < allPackages.length) {
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

  const formatDuration = (duration: string) => {
    if (!duration) return "Contact for details";
    const match = duration.match(/^(\d+)N\/(\d+)D$/i);
    if (match) return `${match[2]} Days, ${match[1]} Nights`;
    return duration;
  };

  if (loading) return null;

  const SafeImage = React.memo(({ src, alt, fallback }: { src: string; alt: string; fallback: string }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);
    const previousSrc = useRef(src);

    // Update imgSrc when src prop changes (but don't reset error state if already using fallback)
    useEffect(() => {
      if (previousSrc.current !== src && !hasError) {
        previousSrc.current = src;
        setImgSrc(src);
        setHasError(false);
      }
    }, [src, hasError]);

    const handleError = () => {
      if (!hasError && imgSrc !== fallback) {
        setHasError(true);
        setImgSrc(fallback);
      }
    };

    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover"
        onError={handleError}
        unoptimized={imgSrc.startsWith('http')}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
      />
    );
  }, (prevProps, nextProps) => {
    // Only re-render if src actually changes
    return prevProps.src === nextProps.src && prevProps.alt === nextProps.alt;
  });

  const visiblePackages = allPackages.slice(currentIndex, currentIndex + 3);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < allPackages.length - 3;

  const totalDesktopDots = Math.max(0, allPackages.length - 2);
  const totalMobileDots = allPackages.length;

  return (
    <section
      className="py-16 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:good,w_auto,dpr_auto,c_limit/v1768219728/Abstract_background_of_weathered_wood_in_blue_and_red_tones_1_gmdgpd.jpg')"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white-60 pointer-events-none z-0" />
      <style jsx global>{`
        @keyframes fadeInSoft { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .card-enter { 
          animation: fadeInSoft 0.35s ease-out forwards; 
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

        .premium-pagination-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ffff;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: none;
        }
        
        .premium-pagination-dot.active {
          background-color: #6366f1;
          width: 24px;
          border-radius: 4px;
        }
        
        .premium-pagination-dot.mobile-active {
          background-color: #6366f1;
          width: 20px;
          border-radius: 4px;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 relative">
          {/* Decorative Background Element */}
          <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-32 h-32 bg-gray-900/40 blur-3xl rounded-full -z-10" />


          <div className="flex flex-col items-center gap-2 mb-4">
            <h2 className="!text-3xl md:!text-5xl !font-extrabold text-slate-900 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Premium
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

          <p className="!text-sm md:!text-lg !text-black font-semibold max-w-2xl mx-auto leading-relaxed px-4">
            Indulge in luxury travel experiences, handpicked for unforgettable journeys
          </p>
        </div>

        {!isMobile && (
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious || isTransitioning}
              className={`w-8 h-10 border border-gray-200 rounded-sm flex items-center justify-center shadow-sm duration-300 cursor-pointer ${!canGoPrevious
                ? "bg-white border-gray-200 text-gray-400"
                : "bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 hover:scale-110"
                }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext || isTransitioning}
              className={`w-8 h-10 border border-gray-200 rounded-sm flex items-center justify-center shadow-sm cursor-pointer ${!canGoNext
                ? "bg-gray-100 border-gray-200 text-gray-400"
                : "bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 hover:shadow-xl hover:scale-110"
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
                  <Card className="overflow-hidden border border-gray-200 h-full bg-white flex flex-col shadow-md">
                    <div className="relative h-52 w-full overflow-hidden">
                      <SafeImage
                        src={getImageUrl(pkg.images?.[0]) || FALLBACK_IMAGE}
                        alt={pkg.title}
                        fallback={FALLBACK_IMAGE}
                      />
                      {pkg.rating && (
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{pkg.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="flex flex-col flex-grow p-4">
                      <div className="flex items-center text-slate-500 text-xs mb-1">
                        <MapPin className="h-3 w-3 mr-1" /> {pkg.destination}
                      </div>
                      <h3 className="!text-lg !font-bold text-slate-900 mb-2 truncate">
                        {cleanTitle(pkg.title)}
                      </h3>
                      <div className="flex items-center text-slate-500 !text-xs mb-1">
                        <Calendar className="h-3 w-3 mr-1" /> {formatDuration(pkg.duration)}
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-blue-600 font-black uppercase tracking-wide">Price</span>
                          <span className="!text-2xl font-black text-blue-600">
                            ₹{pkg.price.toLocaleString()}
                          </span>
                          {pkg.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{pkg.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Link href={`/package/${pkg.slug || pkg._id}`}>
                          <Button
                            variant="outline"
                            className="border-blue-600 border text-blue-600 bg-transparent hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 cursor-pointer px-4 h-9"
                          >
                            View <ArrowRight className="ml-1 h-3 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {totalMobileDots > 1 && (
              <div className="flex justify-center items-center gap-2 mt-3">
                {allPackages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`premium-pagination-dot ${currentIndex === index ? 'mobile-active' : ''}`}
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
                  <Card className="desktop-card overflow-hidden border border-gray-200 group h-full bg-white">
                    <div className="desktop-card-image relative h-64 overflow-hidden">
                      <SafeImage
                        src={getImageUrl(pkg.images?.[0]) || FALLBACK_IMAGE}
                        alt={pkg.title}
                        fallback={FALLBACK_IMAGE}
                      />
                      {pkg.rating && (
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{pkg.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center text-slate-500 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-1" /> {pkg.destination}
                      </div>
                      <h3 className="!text-xl !font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors duration-300">
                        {cleanTitle(pkg.title)}
                      </h3>
                      <div className="flex items-center text-slate-500 text-sm mb-4">
                        <Calendar className="h-4 w-4 mr-1" /> {formatDuration(pkg.duration)}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-blue-600 font-black uppercase tracking-wide">Price</span>
                          <span className="text-2xl font-black text-blue-600">
                            ₹{pkg.price.toLocaleString()}
                          </span>
                          {pkg.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{pkg.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Link href={`/package/${pkg.slug || pkg._id}`}>
                          <Button
                            variant="outline"
                            className="desktop-card-button border border-blue-600 text-blue-600 bg-transparent hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 cursor-pointer px-6"
                          >
                            View Details <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
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
                    className={`premium-pagination-dot ${currentIndex === index ? 'active' : ''}`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="text-center mt-12 px-2">
          <Link href={getCategoryPageUrl("Premium Packages")} className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm group transition-all duration-300">
            View All Packages
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewPremiumPackages;
