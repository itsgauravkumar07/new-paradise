"use client";

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
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { getCategoryPageUrl } from "@/lib/categoryUtils";
import { SkeletonPackageCard } from "@/components/ui/skeleton";

interface AdventurePackage {
  _id: string;
  title: string;
  duration: string;
  destination: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  description: string;
  shortDescription: string;
  highlights: string[];
  isActive: boolean;
  isFeatured: boolean;
  slug: string;
  rating?: number;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

const cleanTitle = (title: string): string => {
  return title
    .replace(/\s*[-–—]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const NewAdventureEscapes = () => {
  const [allPackages, setAllPackages] = useState<AdventurePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const isScrollingProgrammatically = useRef(false);

  // Mobile detection
  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth < 768);
    updateMobileState();
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  // Fetch packages
  useEffect(() => {
    const fetchAdventurePackages = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/packages?category=Adventure%20Tours");
        if (!response.ok) throw new Error("Failed to fetch adventure packages");

        const data = await response.json();
        const packagesArray = Array.isArray(data) ? data : data.packages || [];
        setAllPackages(packagesArray);
        setError(null);
      } catch (err) {
        console.error("Error fetching adventure packages:", err);
        setError("Failed to load adventure packages");
        setAllPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdventurePackages();
  }, []);

  // Mobile scroll listener to update dots
  useEffect(() => {
    if (!isMobile || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Skip if we're scrolling programmatically
      if (isScrollingProgrammatically.current) return;

      // Clear existing timeout
      clearTimeout(scrollTimeout);

      // Set a small timeout to avoid too many updates during scroll
      scrollTimeout = setTimeout(() => {
        const itemElement = container.firstElementChild as HTMLElement;
        if (!itemElement) return;

        const itemWidth = itemElement.offsetWidth + 16; // 16px gap (1rem)
        const scrollLeft = container.scrollLeft;
        const newIndex = Math.round(scrollLeft / itemWidth);

        // Only update if index actually changed
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < allPackages.length) {
          setCurrentIndex(newIndex);
        }
      }, 50);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isMobile, currentIndex, allPackages.length]);

  const handlePrevious = () => {
    if (isMobile || isTransitioning || currentIndex === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (isMobile || isTransitioning || currentIndex >= allPackages.length - 3) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleDotClick = (index: number) => {
    if (isTransitioning) return;

    if (isMobile && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemElement = container.firstElementChild as HTMLElement;
      if (itemElement) {
        const itemWidth = itemElement.offsetWidth + 16; // 16px gap (1rem)
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

  // Get safe image URL with fallback priority
  const getSafeImage = (pkg: AdventurePackage) => {
    // If already marked as error → show fallback
    if (imageErrors[pkg._id]) return FALLBACK_IMAGE;

    // Get first image if exists and is not empty string
    const firstImage = pkg.images?.[0];
    if (!firstImage || firstImage.trim() === "" || firstImage === "null") {
      return FALLBACK_IMAGE;
    }

    // Try to process through getImageUrl
    const processedUrl = getImageUrl(firstImage);
    return processedUrl || FALLBACK_IMAGE;
  };

  const handleImageError = (packageId: string) => {
    setImageErrors((prev) => ({ ...prev, [packageId]: true }));
  };

  const formatDuration = (duration: string) => {
    if (!duration) return "Contact for details";
    const match = duration.match(/^(\d+)N\/(\d+)D$/i);
    if (match) return `${match[2]} Days, ${match[1]} Nights`;
    return duration;
  };

  const visiblePackages = allPackages.slice(currentIndex, currentIndex + 3);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < allPackages.length - 3;

  if (loading) return null;

  if (allPackages.length === 0) {
    return (
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-lg">
            {error ? "Failed to load adventure packages." : "No adventure packages available at the moment."}
          </p>
        </div>
      </section>
    );
  }

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
          opacity: 0;
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
        .mobile-scroll-container::-webkit-scrollbar { display: none; }
        .mobile-scroll-item { 
          scroll-snap-align: center;
          scroll-snap-stop: always;
          flex-shrink: 0; 
          width: 88vw !important; 
          max-width: 340px !important;
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .card-enter {
          animation: slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .card-enter:nth-child(2) {
          animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.1s;
        }
        .card-enter:nth-child(3) {
          animation: slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.2s;
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
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 relative">
          <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-32 h-32 bg-blue-100/40 blur-3xl rounded-full -z-10" />
          <div className="flex flex-col items-center gap-2 mb-4">
            <h2 className="!text-3xl md:!text-5xl !font-extrabold text-slate-900 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Adventure
              </span>{" "}
              Escapes
            </h2>

            {/* Rich accent line */}
            <div className="flex items-center gap-2 mt-1">
              <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-blue-500 rounded-full" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
              <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-blue-500 rounded-full" />
            </div>
          </div>
          <p className="!text-sm md:!text-lg !text-slate-500 max-w-2xl mx-auto leading-relaxed px-4">
            Push your limits with our adrenaline-pumping adventure packages
            designed for thrill-seekers and nature enthusiasts
          </p>
        </div>

        {/* Navigation arrows - Desktop only */}
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

        {/* Content */}
        {isMobile ? (
          <div className="md:hidden w-full overflow-x-hidden">
            <div className="mobile-scroll-container" ref={scrollContainerRef} style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
              {allPackages.map((pkg) => (
                <div key={pkg._id} className="mobile-scroll-item">
                  <Card className="overflow-hidden border border-gray-200 h-full bg-white flex flex-col shadow-md">
                    <div className="relative h-52 w-full overflow-hidden">
                      <Image
                        src={getSafeImage(pkg)}
                        alt={pkg.title}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(pkg._id)}
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
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-blue-600">
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
                            className="border-blue-600 border text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 cursor-pointer px-4 h-9"
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
                <div key={pkg._id} className="card-enter opacity-0">
                  <Card className="desktop-card overflow-hidden border border-gray-200 group h-full bg-white">
                    <div className="desktop-card-image relative h-64 overflow-hidden">
                      <Image
                        src={getSafeImage(pkg)}
                        alt={pkg.title}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(pkg._id)}
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
                      <h3 className="!text-xl !font-bold text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors duration-300">
                        {cleanTitle(pkg.title)}
                      </h3>
                      <div className="flex items-center text-slate-500 text-sm mb-4">
                        <Calendar className="h-4 w-4 mr-1" /> {formatDuration(pkg.duration)}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
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
                            className="desktop-card-button border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 cursor-pointer px-6"
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
                    className={`pagination-dot ${currentIndex === index ? 'active' : ''}`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="text-center mt-12 px-2">
          <Link href={getCategoryPageUrl("Adventure Tours")} className="inline-block group">
            <button
              className="relative overflow-hidden rounded-full w-full sm:w-auto shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-md pl-8 pr-4 whitespace-nowrap">
                  View All Packages
                </span>
                <div className="bg-white rounded-full p-2 m-1.5 transition-all duration-300 group-hover:-rotate-45 group-hover:scale-110 shadow-md">
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

export default NewAdventureEscapes;