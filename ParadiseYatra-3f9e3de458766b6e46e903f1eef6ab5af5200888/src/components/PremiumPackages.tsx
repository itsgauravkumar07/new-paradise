"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { SkeletonPackageCard } from "@/components/ui/skeleton";
import Skeleton from "@/components/ui/skeleton";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import TruncatedText from "@/components/ui/truncated-text";
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
}

const PremiumPackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update mobile state based on screen size (match Trending: md breakpoint)
  useEffect(() => {
    const updateMobileState = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    return () => window.removeEventListener('resize', updateMobileState);
  }, []);

  // Handle scroll position for mobile indicators (match Trending)
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
    const fetchPremiumPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/packages?category=Premium%20Packages');
        
        if (!response.ok) {
          throw new Error('Failed to fetch premium packages');
        }
        
        const data = await response.json();

        
        // Handle both direct array and object with packages array
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
        console.error('Error fetching premium packages:', err);
        setError('Failed to load premium packages');
        setPackages([]); // Don't show static data, show empty state
        setAllPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumPackages();
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
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <Crown className="w-5 h-5 text-purple-600" />
            <span className="text-purple-600 text-base font-semibold tracking-wide">Premium Collection</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-purple-600 mb-3"
          >
            Explore Our Premium Packages
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-nunito font-light"
          >
            Indulge in luxury travel experiences, handpicked for unforgettable journeys
          </motion.p>
        </motion.div>

        {/* Desktop Navigation (match Trending) */}
        {!isMobile && (
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <motion.button 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              whileHover={{ scale: currentIndex === 0 ? 1 : 1.1 }}
              whileTap={{ scale: currentIndex === 0 ? 1 : 0.9 }}
              className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                currentIndex === 0 
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
              className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                currentIndex === totalGroups - 1 
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
          // Mobile: Snap-scroll flex layout (match Trending)
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
                    <Card className="group overflow-hidden modern-card hover-lift rounded-3xl shadow-xl border-0 relative bg-gradient-to-br from-white via-purple-50 to-indigo-100 flex flex-col min-h-[580px] w-full cursor-pointer">
                    {/* Fixed height image container */}
                    <div className="relative h-60 overflow-hidden card-image rounded-t-3xl w-full flex-shrink-0">
                      <Image 
                        src={getImageUrl(pkg.images?.[0]) || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                        alt={pkg.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          console.error('Image failed to load:', pkg.images?.[0]);
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
                      
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
                        <Badge className="badge bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 sm:px-3 py-1 text-xs font-bold shadow-md">
                          {pkg.category === 'premium' ? 'Premium' : pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1)}
                        </Badge>
                      </div>
                      
                    </div>
                    
                    {/* Content container with flexbox layout */}
                    <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors duration-200">
                          {pkg.title}
                        </h3>

                        <TruncatedText 
                          text={pkg.shortDescription}
                          maxWords={18}
                          className="text-gray-700 text-sm leading-relaxed font-medium line-clamp-3 mb-4"
                          buttonClassName="text-purple-600 hover:text-purple-700 font-semibold"
                        />

                        <div className="space-y-2 text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span className="font-semibold truncate">{pkg.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span className="font-semibold truncate">{pkg.destination}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom always aligned */}
                      <div className="mt-auto">
                        <div className="mb-4">
                          <div className="text-lg sm:text-xl font-extrabold text-purple-700">₹{pkg.price.toLocaleString()}</div>
                          {pkg.originalPrice && (
                            <div className="line-through text-gray-400 text-xs">₹{pkg.originalPrice.toLocaleString()}</div>
                          )}
                          <div className="text-xs text-gray-500">Starting From Per Person</div>
                        </div>

                        <Button className="w-full py-3 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all duration-200">
                         View Details 
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                    className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                      index === activeScrollIndex 
                        ? 'bg-purple-600 w-8' 
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
          // Desktop: CSS Grid layout with equal height cards (match Trending)
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
                  <Link href={`/package/${pkg.slug || pkg._id}`} className="block h-full">
                    <Card className="h-full flex flex-col group overflow-hidden modern-card hover-lift rounded-3xl shadow-xl border-0 bg-gradient-to-br from-white via-purple-50 to-indigo-100 min-h-[580px] cursor-pointer">
                    <div className="relative h-60 overflow-hidden card-image rounded-t-3xl w-full flex-shrink-0">
                      <Image 
                        src={getImageUrl(pkg.images?.[0]) || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                        alt={pkg.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          console.error('Image failed to load:', pkg.images?.[0]);
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('unsplash.com')) {
                            target.src = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                          }
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', pkg.images?.[0]);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
                      
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
                        <Badge className="badge bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 sm:px-3 py-1 text-xs font-bold shadow-md">
                          {pkg.category === 'premium' ? 'Premium' : pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1)}
                        </Badge>
                      </div>
                    
                      
                    </div>
                    
                    <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors duration-200">
                          {pkg.title}
                        </h3>

                        <TruncatedText 
                          text={pkg.shortDescription}
                          maxWords={18}
                          className="text-gray-700 text-sm leading-relaxed font-medium line-clamp-3 mb-4"
                          buttonClassName="text-purple-600 hover:text-purple-700 font-semibold"
                        />

                        <div className="space-y-2 text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span className="font-semibold truncate">{pkg.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span className="font-semibold truncate">{pkg.destination}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom always aligned */}
                      <div className="mt-auto">
                        <div className="mb-4">
                          <div className="text-lg sm:text-xl font-extrabold text-purple-700">₹{pkg.price.toLocaleString()}</div>
                          {pkg.originalPrice && (
                            <div className="line-through text-gray-400 text-xs">₹{pkg.originalPrice.toLocaleString()}</div>
                          )}
                          <div className="text-xs text-gray-500">Starting From Per Person</div>
                        </div>

                        <Button className="w-full py-3 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all duration-200">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty state (match Trending behavior) */}
        {packages.length === 0 && !loading && (
          <div className="text-center">
            <p className="text-gray-500">
              {error ? 'Failed to load premium packages.' : 'No premium packages available.'}
            </p>
          </div>
        )}
        
        {/* View All Premium Packages Button (match Trending style) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center mt-8 sm:mt-12"
        >
          <Link href={getCategoryPageUrl("Premium Packages")}>
            <Button className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow hover:from-purple-700 hover:to-indigo-700 hover:cursor-pointer hover:scale-105 transition-all duration-200 inline-flex items-center">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              View All Premium Packages
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumPackages;