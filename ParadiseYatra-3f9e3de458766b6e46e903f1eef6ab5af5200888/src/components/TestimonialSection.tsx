"use client";

import { useState, useEffect, useRef } from "react";
import { Star, Play, ChevronLeft, ChevronRight, Users, ThumbsUp, Youtube, CheckCircle, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonTestimonial } from "@/components/ui/skeleton";
import Skeleton from "@/components/ui/skeleton";
import Image from "next/image";
import TruncatedText from "@/components/ui/truncated-text";
import { toast } from "react-toastify";

interface Testimonial {
  _id: string;
  name: string;
  location: string;
  rating: number;
  image: string;
  text: string;
  package: string;
  date: string;
  verified: boolean;
  featured: boolean;
}

// Custom YouTube Player Component using iframe
const YouTubePlayer = ({ videoId }: { videoId: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(videoId);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const handlePlayClick = () => {
    if (iframeRef.current && !hasError) {
      // Add autoplay parameter to the iframe src
      const currentSrc = iframeRef.current.src;
      if (!currentSrc.includes('autoplay=1')) {
        iframeRef.current.src = currentSrc + '&autoplay=1';
      }
      setIsPlaying(true);
    }
  };

  // Create iframe src with privacy-enhanced settings
  const getIframeSrc = (videoId: string) => {
    const params = new URLSearchParams({
      autoplay: '0',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      controls: '1',
      mute: '0',
      origin: typeof window !== 'undefined' ? window.location.origin : '',
      enablejsapi: '0', // Disable JavaScript API to prevent logging calls
      iv_load_policy: '3', // Disable annotations
      fs: '1', // Allow fullscreen
      playsinline: '1', // Better mobile support
      disablekb: '0', // Enable keyboard controls
      cc_load_policy: '0', // Disable closed captions by default
    });
    
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  // Debounced video loading to prevent rapid reloads
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (videoId !== currentVideoId) {
        setCurrentVideoId(videoId);
        setIsPlaying(false);
        setIsLoaded(false);
        setHasError(false);
      }
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timeoutId);
    };
  }, [videoId, currentVideoId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // No cleanup needed for this effect
    };
  }, []);

  if (hasError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100 rounded-l-3xl">
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-2">📹</div>
          <p className="text-sm">Video unavailable</p>
          <p className="text-xs text-gray-500 mt-1">Please try another video</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-l-3xl">
          <div className="flex items-center space-x-2">
            <Skeleton width="20px" height="20px" className="rounded-full" />
            <Skeleton width="60px" height="16px" />
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={getIframeSrc(currentVideoId)}
        className="w-full h-full rounded-l-3xl"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="YouTube video player"
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-presentation allow-popups allow-popups-to-escape-sandbox"
      />
      
      {/* Custom play button overlay */}
      {!isPlaying && isLoaded && !hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-l-3xl cursor-pointer"
          onClick={handlePlayClick}
        >
          <div className="bg-red-600 rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform duration-200">
            <Play className="w-8 h-8 text-white fill-current" />
          </div>
        </div>
      )}
    </div>
  );
};

// YouTube Video Selector Component
const YouTubeVideoSelector = ({ 
  onVideoSelect, 
  selectedVideoId 
}: { 
  onVideoSelect: (videoId: string) => void;
  selectedVideoId: string;
}) => {
  // Sample video IDs from Paradise Yatra channel with proper thumbnails
  const paradiseYatraVideos = [
    { 
      id: "ekd51s2WShk", 
      title: "Shimla Manali Tour", 
      thumbnail: "https://img.youtube.com/vi/ekd51s2WShk/mqdefault.jpg"
    },

    { 
      id: "yeGB8wLU5KU", 
      title: "Bali Paradise Tour", 
      thumbnail: "https://img.youtube.com/vi/yeGB8wLU5KU/mqdefault.jpg"
    },
    { 
      id: "nuKUUiJHEiA", 
      title: "Kerala - God's Own Country", 
      thumbnail: "https://img.youtube.com/vi/nuKUUiJHEiA/mqdefault.jpg"
    },
  ];

  const handleVideoSelect = (videoId: string) => {
    onVideoSelect(videoId);
  };

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {paradiseYatraVideos.map((video) => (
        <button
          key={video.id}
          onClick={() => handleVideoSelect(video.id)}
          className={`relative rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 group hover:cursor-pointer ${
            selectedVideoId === video.id ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-blue-300'
          }`}
        >
          <div className="relative w-20 h-14 bg-gray-100">
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={80}
              height={56}
              className="w-20 h-14 object-cover"
              onError={(e) => {
                // Fallback to a placeholder if thumbnail fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-20 h-14 bg-gray-200 flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-red-600 rounded-full p-1">
              <Play className="w-3 h-3 text-white fill-current" />
            </div>
          </div>
          {selectedVideoId === video.id && (
            <div className="absolute top-1 right-1">
              <div className="bg-blue-500 rounded-full w-3 h-3 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState("ekd51s2WShk"); // Default to Shimla video
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        
        // First try to get featured testimonials
        let response = await fetch('/api/testimonials?featured=true');
        let data = await response.json();
        
        // If no featured testimonials, get all testimonials
        if (!response.ok || data.length === 0) {
          response = await fetch('/api/testimonials');
          data = await response.json();
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        
        setTestimonials(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        toast.error('Failed to load testimonials');
        setError('Failed to load testimonials');
        // Set fallback data
        setTestimonials([
          {
            _id: "1",
            name: "Patel Family",
            location: "Mumbai",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            text: "Our Kedarnath trip with Paradise Yatra was amazing! Everything—from train to darshan—was well-organized. The team was supportive, friendly, and made us feel like family. A truly smooth and memorable spiritual journey.",
            package: "Kedarnath Spiritual Journey",
            date: "March 2024",
            verified: true,
            featured: true
          },
          {
            _id: "2",
            name: "Sarah & Mike",
            location: "Delhi",
            rating: 5,
            image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            text: "The European tour exceeded our expectations! Every detail was perfect, from the hotels to the local guides. Paradise Yatra truly knows how to create unforgettable travel experiences.",
            package: "European Discovery",
            date: "February 2024",
            verified: true,
            featured: false
          },
          {
            _id: "3",
            name: "Rajesh Kumar",
            location: "Bangalore",
            rating: 5,
            image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            text: "Bali was a dream come true! The package was perfectly planned with the right mix of adventure and relaxation. Highly recommend Paradise Yatra for international tours.",
            package: "Bali Paradise",
            date: "January 2024",
            verified: true,
            featured: true
          },
          {
            _id: "4",
            name: "Priya Sharma",
            location: "Chennai",
            rating: 5,
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            text: "The Kashmir package was absolutely breathtaking! The snow-covered mountains and pristine lakes were exactly as promised. Paradise Yatra made our dream vacation a reality.",
            package: "Kashmir Paradise",
            date: "December 2023",
            verified: true,
            featured: false
          },
          {
            _id: "5",
            name: "David & Emma",
            location: "London",
            rating: 5,
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            text: "Amazing experience with Paradise Yatra! The Rajasthan tour was perfectly organized with authentic experiences and luxury accommodations. Highly recommended!",
            package: "Rajasthan Heritage",
            date: "November 2023",
            verified: true,
            featured: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (loading) {
    return (
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton height="2.5rem" width="300px" className="mx-auto mb-4" />
            <Skeleton height="1.25rem" width="200px" className="mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonTestimonial key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Get visible testimonials based on current index
  const getVisibleTestimonials = () => {
    if (testimonials.length <= 3) return testimonials;
    return testimonials.slice(currentIndex, currentIndex + 3);
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Google Reviews Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
              {/* Google Logo */}
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 272 92" width="68" height="23" className="flex-shrink-0">
                  <path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                  <path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                  <path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
                  <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/>
                  <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
                  <path fill="#4285F4" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
                </svg>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-gray-700 font-semibold text-sm">4.9</span>
                <span className="text-gray-500 text-sm">(2,847 reviews)</span>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-600 text-base font-semibold tracking-wide">Verified Google Reviews</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3"
          >
            What Our Travelers Say
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto font-nunito font-light"
          >
            Real experiences from real travelers who chose Paradise Yatra for their journeys
          </motion.p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Arrows - Desktop */}
          {testimonials.length > 1 && (
            <>
              <motion.button 
                onClick={prevSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              
              <motion.button 
                onClick={nextSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </motion.button>
            </>
          )}

          {/* Carousel */}
          <div 
            ref={carouselRef}
            className="relative overflow-hidden px-4 sm:px-8 md:px-16 lg:px-20"
          >
            {/* Desktop/Tablet Grid View */}
            <div className="hidden md:block">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-10 mb-10"
                >
                  {visibleTestimonials.map((testimonial, index) => (
                    <motion.div 
                      key={`${testimonial._id}-${currentIndex}`}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      className="relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-200 h-[450px] flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      {/* Google Review Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 272 92" width="48" height="16" className="flex-shrink-0">
                            <path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                            <path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                            <path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
                            <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/>
                            <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
                            <path fill="#4285F4" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
                          </svg>
                          <span className="text-gray-700 font-semibold text-sm">Review</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 text-xs font-medium">Verified</span>
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-current" />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600 font-medium">
                          {testimonial.rating}.0
                        </span>
                        <span className="ml-2 text-xs text-gray-500">• {testimonial.date}</span>
                      </div>

                      {/* Featured Badge */}
                      {testimonial.featured && (
                        <div className="mb-4">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold shadow-sm">
                            ⭐ Featured Review
                          </Badge>
                        </div>
                      )}
                      
                      {/* Testimonial text */}
                      <div className="text-gray-700 leading-relaxed mb-6 text-sm flex-grow relative">
                        <div className="overflow-hidden">
                          <TruncatedText 
                            text={testimonial.text}
                            maxWords={30}
                            className="text-gray-700 leading-relaxed text-sm"
                            onExpand={() => setIsAutoPlaying(false)}
                          />
                        </div>
                      </div>

                      {/* Traveler info */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-sm">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {testimonial.location}
                          </div>
                        </div>
                      </div>

                      {/* Package info */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Package:</span> {testimonial.package}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Traveled:</span> {testimonial.date}
                        </div>
                      </div>

                      {/* Google Review Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Helpful?</span>
                          <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-600 transition-colors">
                              <ThumbsUp className="w-3 h-3" />
                              <span>Yes</span>
                            </button>
                            <span>•</span>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile Sliding Carousel */}
            <div className="md:hidden">
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full"
                  >
                    <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 h-[500px] flex flex-col overflow-hidden mx-2 mb-2">
                      {/* Google Review Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 272 92" width="48" height="16" className="flex-shrink-0">
                            <path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                            <path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                            <path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
                            <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/>
                            <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
                            <path fill="#4285F4" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
                          </svg>
                          <span className="text-gray-700 font-semibold text-sm">Review</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 text-xs font-medium">Verified</span>
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(testimonials[currentIndex]?.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-current" />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600 font-medium">
                          {testimonials[currentIndex]?.rating || 5}.0
                        </span>
                        <span className="ml-2 text-xs text-gray-500">• {testimonials[currentIndex]?.date}</span>
                      </div>

                      {/* Featured Badge */}
                      {testimonials[currentIndex]?.featured && (
                        <div className="mb-4">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold shadow-sm">
                            ⭐ Featured Review
                          </Badge>
                        </div>
                      )}
                      
                      {/* Testimonial text */}
                      <div className="text-gray-700 leading-relaxed mb-6 text-sm flex-grow relative">
                        <div className="overflow-hidden">
                          <TruncatedText 
                            text={testimonials[currentIndex]?.text || ""}
                            maxWords={30}
                            className="text-gray-700 leading-relaxed text-sm"
                            onExpand={() => setIsAutoPlaying(false)}
                          />
                        </div>
                      </div>

                      {/* Traveler info */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-sm">
                            {testimonials[currentIndex]?.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">{testimonials[currentIndex]?.name}</div>
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {testimonials[currentIndex]?.location}
                          </div>
                        </div>
                      </div>

                      {/* Package info */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Package:</span> {testimonials[currentIndex]?.package}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Traveled:</span> {testimonials[currentIndex]?.date}
                        </div>
                      </div>

                      {/* Google Review Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Helpful?</span>
                          <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-600 transition-colors">
                              <ThumbsUp className="w-3 h-3" />
                              <span>Yes</span>
                            </button>
                            <span>•</span>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {testimonials.length > 1 && (
            <div className="flex md:hidden justify-center items-center mt-8 space-x-6">
              <motion.button 
                onClick={prevSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-lg"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              
              {/* Dots for mobile */}
              <div className="flex space-x-2">
                {Array.from({ length: testimonials.length }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-blue-600 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              <motion.button 
                onClick={nextSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-lg"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          )}

          {/* Dots Indicator - Desktop */}
          {testimonials.length > 1 && (
            <div className="hidden md:flex justify-center mt-8 space-x-2">
              {Array.from({ length: testimonials.length }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Google Reviews Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 272 92" width="72" height="24" className="flex-shrink-0">
                  <path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                  <path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                  <path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
                  <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/>
                  <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
                  <path fill="#4285F4" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
                </svg>
                <span className="text-gray-700 font-semibold text-xl">Reviews</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-current" />
                  ))}
                </div>
                <span className="text-gray-700 font-bold text-xl">4.9</span>
              </div>
              <p className="text-gray-600 text-sm">Based on 2,847 reviews</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users, label: "Happy Travelers", value: "5000+", color: "text-blue-600" },
                { icon: Star, label: "Average Rating", value: "4.9/5", color: "text-yellow-600" },
                { icon: ThumbsUp, label: "Satisfaction Rate", value: "98%", color: "text-green-600" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300"
                >
                  <div className={`w-10 h-10 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Video testimonial */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-16 max-w-6xl mx-auto"
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <div className="grid md:grid-cols-2 gap-0">
              {/* YouTube Video section */}
              <div className="relative h-64 md:h-full card-image">
                <YouTubePlayer videoId={selectedVideoId} />

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-red-600 rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform duration-200">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
              </div>

              {/* Content section */}
              <div className="p-6 sm:p-8 flex flex-col justify-center card-content bg-gradient-to-br from-gray-50 to-white">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  See Our Travelers in Action
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base">
                  Watch real testimonials from our satisfied travelers and see how Paradise Yatra creates unforgettable experiences around the world.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">4.9 Average Rating</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <span className="font-medium">5000+ Happy Travelers</span>
                  </div>
                </div>
                
                {/* Video Selector */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Choose a video:</p>
                  <YouTubeVideoSelector onVideoSelect={setSelectedVideoId} selectedVideoId={selectedVideoId} />
                </div>
                
                {/* Channel Link */}
                <div className="mt-6">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:bg-red-500 text-gray-600 transition-colors duration-200 font-medium hover:cursor-pointer"
                    onClick={() => window.open('https://www.youtube.com/@ParadiseYatra', '_blank')}
                  >
                    <Youtube className="w-4 h-4 mr-2" />
                    Visit Our Channel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection;