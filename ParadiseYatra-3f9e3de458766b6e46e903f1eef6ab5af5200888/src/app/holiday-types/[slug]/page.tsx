"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin, Star, ArrowRight, Calendar, Hotel, Utensils, CheckCircle, Award, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { DayItineraryCard, InclusionList } from "@/components/itinerary";
import { LazyHeader } from "@/components/lazy-components";
import LeadCaptureForm from "@/components/LeadCaptureForm";

interface DayItinerary {
  day: number;
  title: string;
  activities: string[];
  accommodation: string;
  meals: string;
  image: string;
}

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
  itinerary: DayItinerary[];
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  rating?: number;
  reviews?: Array<{
    _id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

interface Package {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  discount: number;
  duration: string;
  destination: string;
  category: string;
  holidayType?: string;
  images: string[];
  rating: number;
  isActive: boolean;
  isFeatured: boolean;
}

const HolidayTypePage = () => {
  const params = useParams();
  const [holidayType, setHolidayType] = useState<HolidayType | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const fetchHolidayType = async () => {
      try {
        const response = await fetch(`/api/holiday-types/slug/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setHolidayType(data);
        } else {
          setError("Holiday type not found");
        }
      } catch {
        setError("Failed to load holiday type");
      } finally {
        setLoading(false);
      }
    };

    const fetchPackages = async () => {
      try {
        setPackagesLoading(true);
        // First fetch the holiday type to get its ID
        const holidayResponse = await fetch(`/api/holiday-types/slug/${params.slug}`);
        if (holidayResponse.ok) {
          const holidayData = await holidayResponse.json();
          
          // Then fetch packages that match this holiday type using the ID
          const packagesResponse = await fetch(`/api/packages?holidayType=${holidayData._id}&limit=6`);
          if (packagesResponse.ok) {
            const packagesData = await packagesResponse.json();
            if (packagesData.packages && Array.isArray(packagesData.packages)) {
              const filteredPackages = packagesData.packages.filter((pkg: Package) => 
                pkg.isActive
              );
              setPackages(filteredPackages);
            } else {
              console.error('Invalid packages data structure:', packagesData);
              setPackages([]);
            }
          } else {
            console.error('Failed to fetch packages');
            setPackages([]);
          }
        } else {
          console.error('Failed to fetch holiday type for packages');
          setPackages([]);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        setPackages([]);
      } finally {
        setPackagesLoading(false);
      }
    };

    if (params.slug) {
      fetchHolidayType();
      fetchPackages();
    }
  }, [params.slug]);

  const toggleDayExpansion = (dayNumber: number) => {
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(dayNumber)) {
      newExpandedDays.delete(dayNumber);
    } else {
      newExpandedDays.add(dayNumber);
    }
    setExpandedDays(newExpandedDays);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Loading holiday type details...</p>
        </div>
      </div>
    );
  }

  if (error || !holidayType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Holiday Type Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The holiday type you're looking for doesn't exist."}</p>
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
    >
      {/* Header Navbar */}
      <LazyHeader />

      {/* Hero Section */}
      <section className="mt-15 relative h-96 overflow-hidden">
        <OptimizedImage 
          src={holidayType.image}
          alt={holidayType.title}
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black bg-opacity-40"></div>
        <div className="absolute inset-0 container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-3 mb-4"
            >
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-bold border-0">
                {holidayType.badge}
              </Badge>
              {holidayType.isFeatured && (
                <Badge className="bg-yellow-400 text-yellow-900 border-0">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              {holidayType.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl mb-6"
            >
              {holidayType.shortDescription}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4 text-sm"
            >
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{holidayType.duration}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>{holidayType.travelers} travelers</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                <span>{holidayType.price}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Holiday Type Overview */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-12 mt-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">About {holidayType.title}</h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {holidayType.description}
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Holiday Type Details */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    Holiday Type Details
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">Duration</span>
                      </div>
                      <span className="font-semibold text-gray-900 text-right">{holidayType.duration}</span>
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">Group Size</span>
                      </div>
                      <span className="font-semibold text-gray-900 text-right">{holidayType.travelers}</span>
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-center text-gray-600">
                        <Star className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">Price Range</span>
                      </div>
                      <span className="font-semibold text-gray-900 text-right">{holidayType.price}</span>
                    </div>
                  </div>
                </div>

                {/* Why Choose This Holiday Type */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    Why Choose This Holiday Type?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Carefully curated experiences</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Expert local knowledge</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Flexible booking options</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Itinerary Section */}
            {holidayType.itinerary && holidayType.itinerary.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-12"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
                  {holidayType.title} Itinerary
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mb-8">
                  Experience the perfect {holidayType.title.toLowerCase()} journey with our carefully planned itinerary
                </p>

                <div className="space-y-6">
                  {holidayType.itinerary.map((day, index) => {
                    const dayData = {
                      day: day.day,
                      title: day.title,
                      activities: day.activities,
                      accommodation: day.accommodation,
                      meals: day.meals,
                      image: day.image
                    };
                    
                    return (
                      <DayItineraryCard
                        key={index}
                        day={dayData}
                        isExpanded={expandedDays.has(index)}
                        onToggle={() => toggleDayExpansion(index)}
                      />
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* Featured Packages Section */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
                {packagesLoading 
                  ? `${holidayType.title} Packages`
                  : packages.length > 0 
                    ? `${packages.length} ${holidayType.title} Packages`
                    : `${holidayType.title} Packages`
                }
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mb-8">
                {packagesLoading 
                  ? `Searching for ${holidayType.title.toLowerCase()} packages...`
                  : packages.length > 0 
                    ? `Discover our carefully curated packages for the perfect ${holidayType.title.toLowerCase()} experience`
                    : `We're preparing amazing packages for your ${holidayType.title.toLowerCase()} adventure`
                }
              </p>

              {packagesLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                      <div className="bg-white p-6 rounded-b-lg">
                        <div className="bg-gray-200 h-6 rounded mb-2"></div>
                        <div className="bg-gray-200 h-4 rounded mb-4 w-3/4"></div>
                        <div className="bg-gray-200 h-4 rounded mb-4 w-1/2"></div>
                        <div className="bg-gray-200 h-8 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : packages.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    {packages.map((pkg, index) => (
                      <motion.div
                        key={pkg._id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                      >
                        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                          <div className="relative h-48">
                            <OptimizedImage
                              src={pkg.images[0] || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                              alt={pkg.title}
                              width={400}
                              height={300}
                              className="w-full h-full object-cover"
                            />
                            {pkg.discount > 0 && (
                              <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                                {pkg.discount}% OFF
                              </Badge>
                            )}
                            {pkg.isFeatured && (
                              <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {pkg.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {pkg.shortDescription}
                            </p>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{pkg.duration}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{pkg.destination}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{pkg.rating}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-2xl font-bold text-blue-600">
                                ₹{pkg.price.toLocaleString()}
                              </div>
                              {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                <div className="text-sm text-gray-500 line-through">
                                  ₹{pkg.originalPrice.toLocaleString()}
                                </div>
                              )}
                            </div>
                            <Link href={`/packages/${pkg.slug}`}>
                              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                View Details
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <Link href="/packages">
                      <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                        View All Packages
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center py-12"
                >
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Packages Available
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We&apos;re currently preparing amazing packages for {holidayType.title.toLowerCase()}. Check back soon!
                  </p>
                  <Link href="/packages">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Browse All Packages
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Info */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="sticky top-8"
            >
              <Card className="shadow-lg border-0 bg-white mt-12 mb-8">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      {holidayType.duration}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-blue-600" />
                      {holidayType.travelers}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Star className="w-4 h-4 mr-2 text-blue-600" />
                      {holidayType.price}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Card */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-400 to-indigo-700 text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-white">Ready to Experience {holidayType.title}?</h3>
                  <p className="text-blue-100 mb-6">
                    Contact our travel experts to plan your perfect {holidayType.title.toLowerCase()} adventure
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setIsLeadFormOpen(true)}
                      className="w-full text-blue-600 hover:bg-gray-100"
                    >
                      Contact Us
                    </Button>
                    <Link href="/packages">
                      <Button variant="outline" className="w-full border-white bg-white text-blue-600">
                        View All Packages
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lead Capture Form */}
      <LeadCaptureForm
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        packageTitle={holidayType.title}
        packagePrice={holidayType.price}
      />
    </motion.div>
  );
};

export default HolidayTypePage; 