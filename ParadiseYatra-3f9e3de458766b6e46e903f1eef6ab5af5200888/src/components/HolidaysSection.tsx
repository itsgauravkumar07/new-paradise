"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ArrowRight, Globe, Tent, Star } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import TruncatedText from "@/components/ui/truncated-text";
import { SkeletonPackageCard } from "@/components/ui/skeleton";
import Skeleton from "@/components/ui/skeleton";

interface HolidayType {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  duration: string;
  travelers: string;
  badge: string;
  price: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

const HolidaysSection = () => {
  const [categories, setCategories] = useState<HolidayType[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHolidayTypes = async () => {
      try {
        const response = await fetch("/api/holiday-types");
        if (response.ok) {
          const data = await response.json();
          // Filter only active holiday types and sort by order
          const activeCategories = data
            .filter((item: HolidayType) => item.isActive)
            .sort((a: HolidayType, b: HolidayType) => a.order - b.order);
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error("Error fetching holiday types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidayTypes();
  }, []);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      checkScrollPosition();
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [categories]);

  if (loading) {
    return (
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton height="2.5rem" width="300px" className="mx-auto mb-4" />
            <Skeleton height="1.25rem" width="200px" className="mx-auto" />
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-80">
                <SkeletonPackageCard />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="animate-pulse flex items-center justify-center mb-2">
            <Tent className="w-5 h-5 text-purple-600" />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-4xl font-extrabold text-purple-600 mb-3"
          >
            Holidays for Every Traveler
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-blue-600 text-base font-semibold tracking-wide mb-2"
          >
            Choose Your Perfect Holiday Type
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto font-nunito font-light"
          >
            From beach getaways to mountain adventures, find the perfect holiday
            type that matches your travel style
          </motion.p>
        </motion.div>

        <div
          className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto pb-4 md:pb-0 scrollbar-hide md:overflow-x-visible mobile-scroll-container"
          ref={scrollContainerRef}
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="flex-shrink-0 w-80 md:w-auto md:flex-shrink h-full flex first:ml-0 last:mr-4 md:first:ml-0 md:last:mr-0"
            >
              <Card className="group overflow-hidden modern-card hover-lift rounded-3xl shadow-xl border-0 relative bg-gradient-to-br from-white via-gray-50 to-gray-100 h-full flex flex-col min-h-[480px]">
                <div className="relative h-48 overflow-hidden card-image rounded-t-3xl">
                  {getImageUrl(category.image) ? (
                    <Image
                      src={getImageUrl(category.image)!}
                      alt={category.title}
                      fill
                      sizes="(max-width: 768px) 320px, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm">Image unavailable</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="badge bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 text-xs font-bold shadow-md">
                      {category.badge}
                    </Badge>
                  </div>

                  {/* Floating Explore Button */}
                  <Link href={`/holiday-types/${category.slug}`}>
                    <Button
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/10 backdrop-blur-md text-gray-800 px-6 py-2 rounded-full shadow-xl hover:bg-blue-600 hover:shadow-2xl hover:cursor-pointer hover:scale-110 transition-all duration-300 border border-white/30 text-sm font-semibold group"
                      size="sm"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        Explore
                      </span>
                      <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                </div>

                <CardContent className="p-6 card-content flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="!text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-200">
                      {category.title}
                    </h3>
                    <TruncatedText
                      text={category.description}
                      maxWords={25}
                      className="text-gray-700 text-sm leading-relaxed mb-4 font-medium"
                    />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">
                          {category.duration}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="font-semibold">
                          {category.travelers}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="mb-4">
                      <div className="text-lg font-bold text-blue-700">
                        ₹{category.price}
                      </div>
                      <div className="text-xs text-gray-500">Per Person</div>
                    </div>
                    <Link href={`/holiday-types/${category.slug}`}>
                      <Button className="w-full py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 hover:cursor-pointer hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-blue-300 group">
                        <span>Discover More</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mobile Scroll Indicators */}
        <div className="md:hidden flex justify-center items-center mt-6 space-x-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: canScrollLeft ? 1 : 0.3,
              scale: canScrollLeft ? 1 : 0.8,
              x: canScrollLeft ? [0, -3, 0] : 0,
            }}
            transition={{
              duration: 0.3,
              repeat: canScrollLeft ? Infinity : 0,
              repeatDelay: 1.5,
            }}
            className="flex items-center space-x-2 text-blue-500"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-xs font-medium">Swipe left</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: canScrollRight ? 1 : 0.3,
              scale: canScrollRight ? 1 : 0.8,
              x: canScrollRight ? [0, 3, 0] : 0,
            }}
            transition={{
              duration: 0.3,
              repeat: canScrollRight ? Infinity : 0,
              repeatDelay: 1.5,
            }}
            className="flex items-center space-x-2 text-blue-500"
          >
            <span className="text-xs font-medium">Swipe right</span>
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Scroll Hint Text */}
        <div className="md:hidden text-center mt-3">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-xs text-blue-700 flex items-center justify-center"
          >
            <span>Swipe to explore more holiday types</span>
          </motion.p>
        </div>

        {/* View All Categories Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center mt-12"
        >
          <Link href="/holiday-types">
            <Button className="px-8 py-3 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-200 text-white rounded-full shadow hover:from-purple-700 hover:to-purple-600 hover:cursor-pointer hover:scale-105 transition-all duration-200 inline-flex items-center group">
              <Globe className="w-5 h-5 mr-2 group-hover:text-blue-200 transition-colors" />
              View All Holiday Types
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HolidaysSection;
