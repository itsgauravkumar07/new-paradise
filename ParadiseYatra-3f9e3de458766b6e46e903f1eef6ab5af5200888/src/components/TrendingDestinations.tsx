"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, ChevronLeft, ChevronRight, Compass, ArrowRight } from "lucide-react";
import { SkeletonPackageCard } from "@/components/ui/skeleton";
import Skeleton from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import TruncatedText from "@/components/ui/truncated-text";
import { getCategoryPageUrl } from "@/lib/categoryUtils";
import { useAuth } from "@/context/AuthContext";
import LoginAlertModal from "./LoginAlertModal";

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
}

function getRatingLabel(rating: number) {
  if (rating >= 4.7) return "Excellent";
  if (rating >= 4.5) return "Great";
  if (rating >= 4.0) return "Good";
  return "Average";
}

const TrendingDestinations = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  

  // Update mobile state based on screen size
  useEffect(() => {
    const updateMobileState = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    return () => window.removeEventListener('resize', updateMobileState);
  }, []);

  // Handle scroll position for mobile indicators
  useEffect(() => {
    if (!isMobile || !scrollContainerRef.current) return;

    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth * 0.85; // 85vw
      const gap = 16; // 4 * 4px gap
      const adjustedCardWidth = cardWidth + gap;
      const newIndex = Math.round(scrollLeft / adjustedCardWidth);
      setActiveScrollIndex(Math.min(Math.max(0, newIndex), allPackages.length - 1));
    };

    const container = scrollContainerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isMobile, allPackages.length]);

  useEffect(() => {
    const fetchTrendingPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/packages?category=Trending%20Destinations&limit=100');

        if (!response.ok) {
          throw new Error('Failed to fetch trending packages');
        }

        const data = await response.json();

        // Ensure data is an array before calling slice
        if (Array.isArray(data)) {
          setAllPackages(data);
          setPackages(data.slice(0, 3)); // Show only first 3 packages initially
          setError(null);
        } else if (data.packages && Array.isArray(data.packages)) {
          setAllPackages(data.packages);
          setPackages(data.packages.slice(0, 3));
          setError(null);
        } else {
          console.error('Unexpected data structure:', data);
          setPackages([]);
          setAllPackages([]);
          setError('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching trending packages:', err);
        setError('Failed to load trending packages');
        setPackages([]); // Don't show static data, show empty state
        setAllPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPackages();
  }, []);

  // Calculate total groups for desktop navigation
  const totalGroups = Math.ceil(allPackages.length / 3);

  // Handle desktop navigation
  const handlePrevious = () => {
    if (isMobile) return;
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);

    const startIndex = newIndex * 3;
    const endIndex = startIndex + 3;
    const newPackages = allPackages.slice(startIndex, endIndex);
    setPackages(newPackages);
  };

  const handleNext = () => {
    if (isMobile) return;
    const newIndex = Math.min(totalGroups - 1, currentIndex + 1);
    setCurrentIndex(newIndex);

    const startIndex = newIndex * 3;
    const endIndex = startIndex + 3;
    const newPackages = allPackages.slice(startIndex, endIndex);
    setPackages(newPackages);
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

  if (packages.length === 0) {
    return (
      <section className="section-padding bg-white px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <p className="text-gray-500">
            {error ? 'Failed to load trending packages.' : 'No trending packages available.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-white px-4 sm:px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.div
            animate={{ rotate: 360, }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="flex items-center justify-center mb-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Compass className="w-5 h-5 text-blue-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-600 mb-3"
          >
            Trending Packages
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-blue-600 text-sm sm:text-base font-semibold tracking-wide mb-2"
          >
            Handpicked packages for your next trip
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-nunito font-light px-2"
          >
            Discover our most popular travel packages, carefully curated for unforgettable experiences
          </motion.p>
        </motion.div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <motion.button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              whileHover={{ scale: currentIndex === 0 ? 1 : 1.1 }}
              whileTap={{ scale: currentIndex === 0 ? 1 : 0.9 }}
              className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${currentIndex === 0
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <div className="text-sm text-gray-500 font-medium">
              {currentIndex + 1} of {totalGroups}
            </div>

            <motion.button
              onClick={handleNext}
              disabled={currentIndex === totalGroups - 1}
              whileHover={{ scale: currentIndex === totalGroups - 1 ? 1 : 1.1 }}
              whileTap={{ scale: currentIndex === totalGroups - 1 ? 1 : 0.9 }}
              className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${currentIndex === totalGroups - 1
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        )}

        {/* Packages Container */}
        {isMobile ? (
          // Mobile: Snap-scroll flex layout
          <div className="md:hidden">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-0 pb-4 w-full scrollbar-hide"
              style={{
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}
            >
              {allPackages.map((pkg, index) => (
                <motion.div
                  key={pkg._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="flex-shrink-0 snap-start h-full w-full px-4"
                  style={{ maxWidth: '100%' }}
                >
                  <Link href={`/package/${pkg.slug || pkg._id}`} className="block w-full">
                    <article
                      className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-300 transition-all duration-300 relative w-full"
                    >
                      {/* White hover overlay */}
                      <div className="absolute inset-0 bg-white/10 opacity-10 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none"></div>

                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={getImageUrl(pkg.images?.[0]) || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
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
                            <span className="text-xs text-slate-800 font-black uppercase tracking-wide">Price</span>
                            <span className="!text-lg font-black text-blue-600">
                              ₹{pkg.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-dashed border-gray-300 flex items-center justify-between">
                          <span className="text-xs text-slate-800">Per Person</span>
                          <button className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                            View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile scroll indicators */}
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {allPackages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ease-in-out ${index === activeScrollIndex
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 w-2 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>
              <div className="ml-4 text-xs text-gray-500 flex items-center">
                <span>Swipe to explore more</span>
              </div>
            </div>
          </div>
        ) : (
          // Desktop: CSS Grid layout with equal height cards
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto items-stretch">
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="h-full flex flex-col"
                >
                  <Link href={`/package/${pkg.slug || pkg._id}`} className="block h-full w-full">
                    <article
                      className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-300 transition-all duration-300 relative w-full h-full"
                    >
                      {/* White hover overlay */}
                      <div className="absolute inset-0 bg-white/10 opacity-10 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none"></div>

                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={getImageUrl(pkg.images?.[0]) || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
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
                            <span className="text-xs text-slate-800 font-black uppercase tracking-wide">Price</span>
                            <span className="!text-lg font-black text-blue-600">
                              ₹{pkg.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-dashed border-gray-300 flex items-center justify-between">
                          <span className="text-xs text-slate-800">Per Person</span>
                          <button className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                            View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* View All Trending Packages Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center mt-8 sm:mt-12"
        >
          <Link href={getCategoryPageUrl("Trending Destinations")}>
            <Button className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow hover:from-blue-700 hover:to-blue-600 hover:cursor-pointer hover:scale-105 transition-all duration-200 inline-flex items-center group">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:text-blue-200 transition-colors" />
              View All Trending Packages
            </Button>
          </Link>
        </motion.div>
      </div>
      <LoginAlertModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} theme="blue" />
    </section>
  );
};

export default TrendingDestinations;