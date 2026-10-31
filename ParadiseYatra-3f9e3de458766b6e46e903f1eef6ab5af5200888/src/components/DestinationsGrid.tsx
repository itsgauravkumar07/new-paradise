"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { SkeletonPackageCard } from "@/components/ui/skeleton";
import Skeleton from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import TruncatedText from "@/components/ui/truncated-text";
import { getCategoryPageUrl } from "@/lib/categoryUtils";

interface Destination {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription: string;
  image: string;
  location: string;
  price?: number;
  duration?: string;
  isActive: boolean;
  isTrending: boolean;
  visitCount: number;
}

const DestinationsGrid = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset to first page
  const resetToFirstPage = () => {
    if (!isMobile && allDestinations.length > 0) {
      const initialDestinations = allDestinations.slice(0, 3);
      setDestinations(initialDestinations);
      setCurrentIndex(0);
    }
  };

  // Update mobile state based on screen size
  useEffect(() => {
    const updateMobileState = () => {
      const wasMobile = isMobile;
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      
      // If switching from mobile to desktop, reset to first page
      if (wasMobile && !newIsMobile) {
        resetToFirstPage();
      }
    };

    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    return () => window.removeEventListener('resize', updateMobileState);
  }, [isMobile]);

  // Ensure initial state shows only 3 destinations for desktop view
  useEffect(() => {
    if (!isMobile && allDestinations.length > 0) {
      resetToFirstPage();
    }
  }, [allDestinations, isMobile]);

  // Set initial state when component mounts
  useEffect(() => {
    if (allDestinations.length > 0 && !isMobile) {
      resetToFirstPage();
    }
  }, []); // Empty dependency array means this runs once on mount

  // Handle scroll position for mobile indicators
  useEffect(() => {
    if (!isMobile || !scrollContainerRef.current) return;

    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollLeft = container.scrollLeft;
      // Use flex-based calculation instead of fixed values
      const containerWidth = container.offsetWidth;
      const cardWidth = containerWidth * 0.85; // 85% of container width
      const gap = 16; // gap between cards (matches the gap-4 class)
      const adjustedCardWidth = cardWidth + gap;
      const newIndex = Math.round(scrollLeft / adjustedCardWidth);
      setActiveScrollIndex(Math.min(Math.max(0, newIndex), allDestinations.length - 1));
    };

    const container = scrollContainerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isMobile, allDestinations.length]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/destinations');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to fetch destinations: ${response.status} ${errorData.message || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Handle both direct array response and wrapped response
        const destinationsArray = Array.isArray(data) ? data : (data.destinations || []);
        
        if (destinationsArray.length > 0) {
          setAllDestinations(destinationsArray);
          // Set initial destinations to first 3 for desktop view
          const initialDestinations = destinationsArray.slice(0, 3);
          setDestinations(initialDestinations);
        } else {
          console.log('No destinations in array:', destinationsArray);
          console.log('Full API response:', data);
          // Don't throw error, just set empty arrays and let the UI handle it
          setAllDestinations([]);
          setDestinations([]);
        }
        
        setError(null);
      } catch (err: unknown) {
        console.error('Error fetching destinations:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load destinations';
        setError(errorMessage);
        // Don't set any fallback data - let the error state handle it
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Calculate total groups for desktop navigation
  const totalGroups = Math.ceil(allDestinations.length / 3);

  // Handle desktop navigation
  const handlePrevious = () => {
    if (isMobile) return;
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    
    const startIndex = newIndex * 3;
    const endIndex = startIndex + 3;
    const newDestinations = allDestinations.slice(startIndex, endIndex);
    setDestinations(newDestinations);
  };

  const handleNext = () => {
    if (isMobile) return;
    const newIndex = Math.min(totalGroups - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    
    const startIndex = newIndex * 3;
    const endIndex = startIndex + 3;
    const newDestinations = allDestinations.slice(startIndex, endIndex);
    setDestinations(newDestinations);
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

  if (destinations.length === 0) {
    return (
      <section className="section-padding bg-white px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <div className="animate-bounce flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-3">
            No Destinations Available
          </h2>
          <p className="text-gray-600 mb-4">
            We're currently setting up our destination database. Please check back later or contact our team.
          </p>
          <div className="text-sm text-gray-500">
            <p>If you're an admin, you can add destinations through the admin panel.</p>
            <p>If you're a developer, check that the backend database has destination data.</p>
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
          <div className="animate-bounce flex items-center justify-center mb-2">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-600 mb-3"
          >
            Popular Destinations
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-blue-600 text-sm sm:text-base font-semibold tracking-wide mb-2"
          >
            Explore Our Top Destinations
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-nunito font-light px-2"
          >
            Discover our most sought-after destinations, each offering unique experiences and unforgettable memories
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

        {/* Destinations Container */}
        {isMobile ? (
          // Mobile: Snap-scroll flex layout
          <div className="md:hidden w-full">
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-0 pb-4 w-full scrollbar-hide flex-nowrap items-stretch"
              style={{
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch'
              }}
            >
              {allDestinations.map((destination, index) => (
                <motion.div
                  key={destination._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="flex-shrink-0 snap-start flex-1 min-w-0 w-full px-4"
                  style={{ 
                    flex: '0 0 100%',
                    maxWidth: '100%',
                    minWidth: '100%',
                    width: '100%',
                    flexShrink: 0
                  }}
                >
                  <Link href={`/destinations/${destination.slug || destination.name}`} className="block w-full">
                    <Card className="group overflow-hidden modern-card hover-lift rounded-3xl shadow-xl border-0 relative bg-gradient-to-br from-white via-blue-50 to-blue-100 flex flex-col min-h-[580px] transition-all duration-300 ease-in-out w-full h-full cursor-pointer">
                    <div className="relative h-60 overflow-hidden card-image rounded-t-3xl w-full flex-shrink-0">
                      {getImageUrl(destination.image) ? (
                        <Image 
                          src={getImageUrl(destination.image)!} 
                          alt={destination.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-sm">Image unavailable</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
                      
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
                        <Badge className={`badge ${
                          destination.isTrending ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-blue-400'
                        } text-white px-2 sm:px-3 py-1 text-xs font-bold shadow-md`}>
                          {destination.isTrending ? 'Trending' : 'Popular'}
                        </Badge>
                      </div>
                      
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="w-6 h-6 sm:w-8 sm:h-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full"
                        >
                          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </Button>
                      </div>
                      
                    </div>
                    
                    <CardContent className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-200">
                          {destination.name}
                        </h3>

                        <div className="mb-4">
                          <TruncatedText 
                            text={destination.shortDescription}
                            maxWords={25}
                            className="text-gray-700 text-sm leading-relaxed font-medium"
                            buttonClassName="text-blue-600 hover:text-blue-700 font-semibold"
                          />
                        </div>

                        <div className="flex flex-col space-y-2 text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span className="font-semibold truncate">{destination.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span className="font-semibold truncate">{destination.duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="mb-4">
                          <div className="text-lg sm:text-xl font-extrabold text-blue-700">₹{destination.price?.toLocaleString() || 'Contact Us'}</div>
                          <div className="text-xs text-gray-500">Starting From Per Person</div>
                        </div>

                        <Button className="w-full py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 hover:cursor-pointer hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-blue-300">
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
                 {allDestinations.map((_, index) => (
                   <div 
                     key={index}
                     className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                       index === activeScrollIndex 
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
          // Desktop: CSS Grid layout
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {destinations.map((destination, index) => (
                <motion.div
                  key={destination._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="h-full"
                >
                  <Card className="group overflow-hidden modern-card hover-lift rounded-3xl shadow-xl border-0 relative bg-gradient-to-br from-white via-blue-50 to-blue-100 flex flex-col min-h-[580px] flex-grow transition-all duration-300 ease-in-out h-full">
                    <div className="relative h-60 overflow-hidden card-image rounded-t-3xl w-full flex-shrink-0">
                      {getImageUrl(destination.image) ? (
                        <Image 
                          src={getImageUrl(destination.image)!} 
                          alt={destination.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-sm">Image unavailable</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
                      
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
                        <Badge className={`badge ${
                          destination.isTrending ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-blue-400'
                        } text-white px-2 sm:px-3 py-1 text-xs font-bold shadow-md`}>
                          {destination.isTrending ? 'Trending' : 'Popular'}
                        </Badge>
                      </div>
                      
                    </div>
                    
                    <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-200">
                          {destination.name}
                        </h3>

                        <div className="mb-4">
                          <TruncatedText 
                            text={destination.shortDescription}
                            maxWords={25}
                            className="text-gray-700 text-sm leading-relaxed font-medium"
                            buttonClassName="text-blue-600 hover:text-blue-700 font-semibold"
                          />
                        </div>

                        <div className="flex flex-col space-y-2 text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span className="font-semibold truncate">{destination.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span className="font-semibold truncate">{destination.duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="mb-4">
                          <div className="text-lg sm:text-xl font-extrabold text-blue-700">₹{destination.price?.toLocaleString() || 'Contact Us'}</div>
                          <div className="text-xs text-gray-500">Starting From Per Person</div>
                        </div>

                        <Link href={`/destinations/${destination.slug || destination._id}`} className="w-full block">
                          <Button className="w-full py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 hover:cursor-pointer hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-blue-300">
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
        )}
        
        {/* View All Destinations Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center mt-8 sm:mt-12"
        >
          <Link href={getCategoryPageUrl("Popular Destinations")}>
            <Button className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow hover:from-blue-700 hover:to-blue-600 hover:cursor-pointer hover:scale-105 transition-all duration-200 inline-flex items-center group">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:text-blue-200 transition-colors" />
              View All Popular Destinations
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default DestinationsGrid;