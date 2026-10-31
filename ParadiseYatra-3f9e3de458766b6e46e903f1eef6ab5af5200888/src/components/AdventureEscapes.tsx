"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Mountain,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";
import { SkeletonPackageCard } from "@/components/ui/skeleton";
import Skeleton from "@/components/ui/skeleton";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import TruncatedText from "@/components/ui/truncated-text";
import { getCategoryPageUrl } from "@/lib/categoryUtils";

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
}

const AdventureEscapes = () => {
  const [adventurePackages, setAdventurePackages] = useState<
    AdventurePackage[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allPackages, setAllPackages] = useState<AdventurePackage[]>([]);
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
          Math.min(Math.max(0, newIndex), allPackages.length - 1)
        );
      }
    };

    const container = scrollContainerRef.current;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isMobile, allPackages.length, activeScrollIndex]);

  useEffect(() => {
    const fetchAdventurePackages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "/api/packages?category=Adventure%20Tours"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch adventure packages");
        }

        const data = await response.json();

        // Handle both direct array and object with packages array
        if (Array.isArray(data)) {
          setAllPackages(data);
          setAdventurePackages(data.slice(0, 3)); // Show only first 3 packages initially
          setError(null);
        } else if (data.packages && Array.isArray(data.packages)) {
          setAllPackages(data.packages);
          setAdventurePackages(data.packages.slice(0, 3));
          setError(null);
        } else {
          console.error("Unexpected data structure:", data);
          setAdventurePackages([]);
          setAllPackages([]);
          setError("Invalid data format received");
        }
      } catch (err) {
        console.error("Error fetching adventure packages:", err);
        setError("Failed to load adventure packages");
        setAdventurePackages([]); // Don't show static data, show empty state
        setAllPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdventurePackages();
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
    setAdventurePackages(newPackages);
  };

  const handleNext = () => {
    if (isMobile) return;
    const newIndex = Math.min(totalGroups - 1, currentIndex + 1);
    setCurrentIndex(newIndex);

    const startIndex = newIndex * 3;
    const endIndex = startIndex + 3;
    const newPackages = allPackages.slice(startIndex, endIndex);
    setAdventurePackages(newPackages);
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

  return (
    <section className="section-padding bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <Zap className="w-5 h-5 text-green-600" />
            <span className="text-green-600 text-base font-semibold tracking-wide">
              Adventure Collection
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3"
          >
            Epic Adventure Escapes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto font-nunito font-light"
          >
            Push your limits with our adrenaline-pumping adventure packages
            designed for thrill-seekers and nature enthusiasts
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

        {adventurePackages.length > 0 ? (
          <div className="relative">
            {/* Desktop view with carousel */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {adventurePackages.map((pkg, index) => (
                  <motion.div
                    key={pkg._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    className="flex-shrink-0 w-full"
                  >
                    <Card className="group overflow-hidden modern-card hover-lift rounded-3xl shadow-xl border-0 relative bg-gradient-to-br from-white via-green-50 to-green-100 h-full flex flex-col min-h-[560px]">
                      <div className="relative h-60 overflow-hidden card-image rounded-t-3xl">
                        <Image
                          src={
                            getImageUrl(pkg.images?.[0]) ||
                            "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                          }
                          alt={pkg.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

                        {/* Adventure Badge */}
                        <div className="absolute top-4 left-4 z-20">
                          <Badge className="badge bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-md">
                            Adventure
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-7 card-content flex flex-col flex-1">
                        <div className="mb-4">
                          <h3 className="!text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-200">
                            {pkg.title}
                          </h3>
                          <TruncatedText
                            text={pkg.description}
                            maxWords={25}
                            className="text-gray-700 text-base leading-relaxed mb-4 font-medium"
                          />
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-green-500" />
                              <span className="font-semibold">
                                {pkg.duration}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-green-500" />
                              <span className="font-semibold">
                                {pkg.destination}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <div className="text-2xl font-extrabold text-green-700">
                              ₹{pkg.price?.toLocaleString()}
                            </div>
                            {pkg.originalPrice && (
                              <div className="line-through text-gray-400 text-sm">
                                ₹{pkg.originalPrice.toLocaleString()}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Starting From Per Person
                            </div>
                          </div>
                          {pkg.originalPrice && (
                            <div className="text-right">
                              <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs shadow-sm animate-pulse">
                                <span role="img" aria-label="savings">
                                  ⚡
                                </span>
                                Save ₹
                                {(
                                  pkg.originalPrice - pkg.price
                                ).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto">
                          <Link href={`/package/${pkg.slug || pkg._id}`}>
                            <Button className="book-button w-full py-3 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 hover:cursor-pointer hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-green-300 animate-pulse">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile view with horizontal scrolling */}
            <div className="lg:hidden">
              <div
                ref={scrollContainerRef}
                className="flex flex-nowrap gap-0 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {allPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    className="flex-shrink-0 w-full snap-start px-4"
                  >
                    <Card className="group overflow-hidden modern-card hover-lift rounded-3xl shadow-xl border-0 relative bg-gradient-to-br from-white via-green-50 to-green-100 h-full flex flex-col min-h-[560px]">
                      <div className="relative h-60 overflow-hidden card-image rounded-t-3xl">
                        <Image
                          src={
                            getImageUrl(pkg.images?.[0]) ||
                            "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                          }
                          alt={pkg.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

                        {/* Adventure Badge */}
                        <div className="absolute top-4 left-4 z-20">
                          <Badge className="badge bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-md">
                            Adventure
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-7 card-content flex flex-col flex-1">
                        <div className="mb-4">
                          <h3 className="!text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-200">
                            {pkg.title}
                          </h3>
                          <TruncatedText
                            text={pkg.description}
                            maxWords={25}
                            className="text-gray-700 text-base leading-relaxed mb-4 font-medium"
                          />
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-green-500" />
                              <span className="font-semibold">
                                {pkg.duration}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-green-500" />
                              <span className="font-semibold">
                                {pkg.destination}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <div className="text-2xl font-extrabold text-green-700">
                              ₹{pkg.price?.toLocaleString()}
                            </div>
                            {pkg.originalPrice && (
                              <div className="line-through text-gray-400 text-sm">
                                ₹{pkg.originalPrice.toLocaleString()}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Starting From Per Person
                            </div>
                          </div>
                          {pkg.originalPrice && (
                            <div className="text-right">
                              <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs shadow-sm animate-pulse">
                                <span role="img" aria-label="savings">
                                  ⚡
                                </span>
                                Save ₹
                                {(
                                  pkg.originalPrice - pkg.price
                                ).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto">
                          <Link href={`/package/${pkg.slug || pkg._id}`}>
                            <Button className="book-button w-full py-3 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 hover:cursor-pointer hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-green-300 animate-pulse">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Mobile scroll indicators */}
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  {allPackages.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${
                        index === activeScrollIndex
                          ? "bg-green-600 w-8 scale-110"
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
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {error
                ? "Failed to load adventure packages."
                : "No adventure packages available."}
            </p>
          </div>
        )}

        {/* View All Adventure Packages Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center mt-8 sm:mt-12 px-4"
        >
          <Link href={getCategoryPageUrl("Adventure Tours")}>
            <Button className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow hover:from-green-700 hover:to-emerald-700 hover:cursor-pointer hover:scale-105 transition-all duration-200 inline-flex items-center justify-center group min-h-[48px] sm:min-h-[52px]">
              <Mountain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:text-green-200 transition-colors flex-shrink-0" />
              <span className="truncate">View All Adventure Packages</span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default AdventureEscapes;
