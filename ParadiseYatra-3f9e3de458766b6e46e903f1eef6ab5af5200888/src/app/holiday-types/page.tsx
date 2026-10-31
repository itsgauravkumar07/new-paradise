"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ArrowRight, Globe, Tent, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import TruncatedText from "@/components/ui/truncated-text";
import { LazyHeader } from "@/components/lazy-components";

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

const HolidayTypesPage = () => {
  const [holidayTypes, setHolidayTypes] = useState<HolidayType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHolidayTypes = async () => {
      try {
        const response = await fetch('/api/holiday-types');
        if (response.ok) {
          const data = await response.json();
          // Filter only active holiday types and sort by order
          const activeHolidayTypes = data
            .filter((item: HolidayType) => item.isActive)
            .sort((a: HolidayType, b: HolidayType) => a.order - b.order);
          setHolidayTypes(activeHolidayTypes);
        } else {
          setError('Failed to load holiday types');
        }
      } catch (err) {
        console.error('Error fetching holiday types:', err);
        setError('Failed to load holiday types');
      } finally {
        setLoading(false);
      }
    };

    fetchHolidayTypes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Loading holiday types...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Holiday Types</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Go Back Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <LazyHeader />
      
      <div className="pt-20">
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="animate-pulse flex items-center justify-center mb-2">
                <Tent className="w-5 h-5 text-purple-600" />
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl font-extrabold text-purple-600 mb-3"
              >
                All Holiday Types
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-blue-600 text-lg font-semibold tracking-wide mb-2"
              >
                Discover Your Perfect Holiday Experience
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto font-nunito font-light"
              >
                From beach getaways to mountain adventures, explore all our holiday types and find the perfect match for your travel style
              </motion.p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {holidayTypes.map((holidayType, index) => (
                <motion.div
                  key={holidayType._id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="h-full"
                >
                  <Card className="group overflow-hidden modern-card hover-lift rounded-3xl shadow-xl border-0 relative bg-gradient-to-br from-white via-gray-50 to-gray-100 h-full flex flex-col min-h-[480px]">
                    <div className="relative h-48 overflow-hidden card-image rounded-t-3xl">
                      {getImageUrl(holidayType.image) ? (
                        <Image 
                          src={getImageUrl(holidayType.image)!} 
                          alt={holidayType.title}
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
                      
                      {/* Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="badge bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 text-xs font-bold shadow-md">
                          {holidayType.badge}
                        </Badge>
                      </div>
                      
                      {/* Featured Badge */}
                      {holidayType.isFeatured && (
                        <div className="absolute top-4 right-4 z-20">
                          <Badge className="bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold shadow-md">
                            Featured
                          </Badge>
                        </div>
                      )}
                      
                      {/* Floating Explore Button */}
                      <Link href={`/holiday-types/${holidayType.slug}`}>
                        <Button 
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/10 backdrop-blur-md text-gray-800 px-6 py-2 rounded-full shadow-xl hover:bg-blue-600 hover:shadow-2xl hover:cursor-pointer hover:scale-110 transition-all duration-300 border border-white/30 text-sm font-semibold group"
                          size="sm"
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform duration-200">Explore</span>
                          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                        </Button>
                      </Link>
                    </div>
                    
                    <CardContent className="p-6 card-content flex flex-col flex-1">
                      <div className="mb-4">
                        <h3 className="!text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-200">
                          {holidayType.title}
                        </h3>
                        <TruncatedText 
                          text={holidayType.description}
                          maxWords={25}
                          className="text-gray-700 text-sm leading-relaxed mb-4 font-medium"
                        />
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold">{holidayType.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-green-500" />
                            <span className="font-semibold">{holidayType.travelers}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="mb-4">
                          <div className="text-lg font-bold text-blue-700">{holidayType.price}</div>
                          <div className="text-xs text-gray-500">Per Person</div>
                        </div>
                        <Link href={`/holiday-types/${holidayType.slug}`}>
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
            
            {/* Back to Home Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center mt-12"
            >
              <Link href="/">
                <Button className="px-8 py-3 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-200 text-white rounded-full shadow hover:from-purple-700 hover:to-purple-600 hover:cursor-pointer hover:scale-105 transition-all duration-200 inline-flex items-center group">
                  <Globe className="w-5 h-5 mr-2 group-hover:text-blue-200 transition-colors" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HolidayTypesPage;
