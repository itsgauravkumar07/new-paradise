"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '@/components/Header';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import { Clock, MapPin, Star, Loader2, AlertCircle, Award, Check, Users, Calendar, Shield, ArrowRight, Plane, Utensils, Camera, Sparkles, ChevronDown } from 'lucide-react';

interface DestinationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface DayItinerary {
  day: number;
  title: string;
  activities: string[];
  accommodation: string;
  meals: string[];
  image?: string;
}

interface Destination {
  _id: string;
  name: string;
  slug?: string;
  image: string;
  images?: string[];
  rating?: number;
  duration?: string;
  location?: string;
  price?: number;
  shortDescription?: string;
  description?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: DayItinerary[];
  category?: string;
  reviews?: unknown[];
  tourType?: string;
}

export default function DestinationPage({ params }: DestinationPageProps) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [otherPackages, setOtherPackages] = useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [openDay, setOpenDay] = useState<number | null>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const resolvedParams = await params;
        const { slug } = resolvedParams;

        // Try fetching by slug endpoint first
        let response = await fetch(`/api/destinations/slug/${slug}`);

        // If slug endpoint fails, try fallback
        if (!response.ok) {
          // Fallback: fetch all destinations and find by slug
          try {
            response = await fetch('/api/destinations');

            if (!response.ok) {
              if (response.status === 404) {
                if (process.env.NODE_ENV === 'development') {
                  console.log(`Destination not found with slug: ${slug}`);
                }
              } else {
                if (process.env.NODE_ENV === 'development') {
                  console.error(`Failed to fetch destinations, Status: ${response.status}`);
                }
              }
              setError('Destination not found');
              setLoading(false);
              return;
            }

            const data = await response.json();

            // Handle both array and object responses
            let destinationsArray = [];
            if (Array.isArray(data)) {
              destinationsArray = data;
            } else if (data.destinations && Array.isArray(data.destinations)) {
              destinationsArray = data.destinations;
            } else if (data.data && Array.isArray(data.data)) {
              destinationsArray = data.data;
            }

            // Find destination by slug or _id or name
            const foundDestination = destinationsArray.find((dest: any) => {
              const destSlug = dest.slug?.toLowerCase() || dest.name?.toLowerCase().replace(/\s+/g, '-');
              const searchSlug = slug.toLowerCase();

              return (
                destSlug === searchSlug ||
                dest._id === slug ||
                dest.name?.toLowerCase().replace(/\s+/g, '-') === searchSlug
              );
            });

            if (!foundDestination) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`Destination not found with slug: ${slug}`);
              }
              setError('Destination not found');
              setLoading(false);
              return;
            }

            setDestination(foundDestination);
          } catch (fallbackError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error in fallback fetch:', fallbackError);
            }
            setError('Failed to load destination');
            setLoading(false);
            return;
          }
        } else {
          const data = await response.json();
          // The backend returns { destination: { ... } }, so we need to extract it
          setDestination(data.destination || data);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching destination:', error);
        }
        setError('Failed to load destination');
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [params]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Fetch other packages
  useEffect(() => {
    const fetchOtherPackages = async () => {
      if (otherPackages.length === 0) {
        try {
          setPackagesLoading(true);

          let response = await fetch('/api/destinations');
          let data = null;

          if (response.ok) {
            data = await response.json();
          } else {
            response = await fetch('/api/packages');
            if (response.ok) {
              data = await response.json();
            }
          }

          if (data && Array.isArray(data)) {
            const filteredPackages = data
              .filter((pkg: any) => pkg._id !== destination?._id)
              .slice(0, 3);
            setOtherPackages(filteredPackages);
          } else if (data && typeof data === 'object') {
            const possibleArrayKeys = ['destinations', 'data', 'results', 'packages', 'items'];
            let foundArray = null;

            for (const key of possibleArrayKeys) {
              if (Array.isArray(data[key])) {
                foundArray = data[key];
                break;
              }
            }

            if (foundArray) {
              const filteredPackages = foundArray
                .filter((pkg: any) => pkg._id !== destination?._id)
                .slice(0, 3);
              setOtherPackages(filteredPackages);
            } else {
              setOtherPackages([]);
            }
          } else {
            setOtherPackages([]);
          }
        } catch (error) {
          console.error('Error fetching other packages:', error);
          setOtherPackages([]);
        } finally {
          setPackagesLoading(false);
        }
      }
    };

    fetchOtherPackages();
  }, [destination?._id, otherPackages.length]);

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getDiscount = () => {
    return 0; // Destinations typically don't have discounts
  };

  const discount = getDiscount();

  // Get gallery images
  const isSikkim = destination?.name?.toLowerCase().includes('sikkim') ||
    destination?.slug?.toLowerCase().includes('sikkim') ||
    destination?.name?.toLowerCase().includes('gangtok') ||
    destination?.name?.toLowerCase().includes('kalimpong');

  const isAndaman = destination?.name?.toLowerCase().includes('andaman') ||
    destination?.slug?.toLowerCase().includes('andaman') ||
    destination?.name?.toLowerCase().includes('nicobar') ||
    destination?.name?.toLowerCase().includes('port blair') ||
    destination?.name?.toLowerCase().includes('havelock') ||
    destination?.name?.toLowerCase().includes('neil island');

  const isKashmir = destination?.name?.toLowerCase().includes('kashmir') ||
    destination?.slug?.toLowerCase().includes('kashmir') ||
    destination?.name?.toLowerCase().includes('jammu') ||
    destination?.name?.toLowerCase().includes('srinagar') ||
    destination?.name?.toLowerCase().includes('gulmarg') ||
    destination?.name?.toLowerCase().includes('pahalgam');

  const isRajasthan = destination?.name?.toLowerCase().includes('rajasthan') ||
    destination?.slug?.toLowerCase().includes('rajasthan') ||
    destination?.name?.toLowerCase().includes('jaipur') ||
    destination?.name?.toLowerCase().includes('udaipur') ||
    destination?.name?.toLowerCase().includes('jodhpur') ||
    destination?.name?.toLowerCase().includes('jaisalmer');

  const isUttarakhand = destination?.name?.toLowerCase().includes('uttarakhand') ||
    destination?.slug?.toLowerCase().includes('uttarakhand') ||
    destination?.name?.toLowerCase().includes('nainital') ||
    destination?.name?.toLowerCase().includes('rishikesh') ||
    destination?.name?.toLowerCase().includes('mussoorie') ||
    destination?.name?.toLowerCase().includes('haridwar');

  const isGoa = destination?.name?.toLowerCase().includes('goa') ||
    destination?.slug?.toLowerCase().includes('goa') ||
    destination?.name?.toLowerCase().includes('panjim') ||
    destination?.name?.toLowerCase().includes('calangute') ||
    destination?.name?.toLowerCase().includes('baga');

  const isKerala = destination?.name?.toLowerCase().includes('kerala') ||
    destination?.slug?.toLowerCase().includes('kerala') ||
    destination?.name?.toLowerCase().includes('kochi') ||
    destination?.name?.toLowerCase().includes('munnar') ||
    destination?.name?.toLowerCase().includes('alleppey');

  const isHimachal = destination?.name?.toLowerCase().includes('himachal') ||
    destination?.slug?.toLowerCase().includes('himachal') ||
    destination?.name?.toLowerCase().includes('shimla') ||
    destination?.name?.toLowerCase().includes('manali') ||
    destination?.name?.toLowerCase().includes('dharamshala') ||
    destination?.name?.toLowerCase().includes('dalhousie');

  const isLadakh = destination?.name?.toLowerCase().includes('ladakh') ||
    destination?.slug?.toLowerCase().includes('ladakh') ||
    destination?.name?.toLowerCase().includes('leh') ||
    destination?.name?.toLowerCase().includes('nubra');

  const isTamilNadu = destination?.name?.toLowerCase().includes('tamil nadu') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('tamil nadu') ||
    destination?.name?.toLowerCase().includes('ooty') ||
    destination?.name?.toLowerCase().includes('chennai') ||
    destination?.name?.toLowerCase().includes('madurai') ||
    destination?.name?.toLowerCase().includes('kanyakumari');

  const isThailand = destination?.name?.toLowerCase().includes('thailand') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('thailand');

  const isMalaysia = destination?.name?.toLowerCase().includes('malaysia') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('malaysia');

  const isEgypt = destination?.name?.toLowerCase().includes('egypt') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('egypt');

  const isIndonesia = destination?.name?.toLowerCase().includes('indonesia') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('indonesia');

  const isKenya = destination?.name?.toLowerCase().includes('kenya') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('kenya');

  const isMaldives = destination?.name?.toLowerCase().includes('maldives') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('maldives');

  const isSingapore = destination?.name?.toLowerCase().includes('singapore') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('singapore');

  const isUAE = destination?.name?.toLowerCase().includes('united arab emirates') ||
    destination?.name?.toLowerCase().includes('dubai') ||
    destination?.name?.toLowerCase().includes('uae') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('united arab emirates') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('dubai') ||
    destination?.slug?.toLowerCase().replace(/-/g, ' ').includes('uae');

  const galleryImages = isSikkim
    ? ['/Destination Pages/Sikkim.webp']
    : isAndaman
      ? ['/Destination Pages/Andaman and Nicobar Island.webp']
      : isKashmir
        ? ['/Destination Pages/Jammu and Kashmir.webp']
        : isRajasthan
          ? ['/Destination Pages/Rajasthan.webp']
          : isUttarakhand
            ? ['/Destination Pages/Uttarakhand.webp']
            : isGoa
              ? ['/Destination Pages/Goa.webp']
              : isKerala
                ? ['/Destination Pages/Kerala.webp']
                : isHimachal
                  ? ['/Destination Pages/Himachal Pradesh.webp']
                  : isLadakh
                    ? ['/Destination Pages/Ladakh.webp']
                    : isTamilNadu
                      ? ['/Destination Pages/Tamil Nadu.webp']
                      : isThailand
                        ? ['/Destination Pages/Thailand.webp']
                        : isMalaysia
                          ? ['/Destination Pages/Malaysia.webp']
                          : isEgypt
                            ? ['/Destination Pages/Egypt.webp']
                            : isIndonesia
                              ? ['/Destination Pages/Indonesia.webp']
                              : isKenya
                                ? ['/Destination Pages/Kenya.webp']
                                : isMaldives
                                  ? ['/Destination Pages/Maldives.webp']
                                  : isSingapore
                                    ? ['/Destination Pages/Singapore.webp']
                                    : isUAE
                                      ? ['/Destination Pages/United Arab Emirates.webp']
                                      : (destination?.images && destination.images.length > 0
                                        ? destination.images
                                        : destination?.image
                                          ? [destination.image]
                                          : ["https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"]);

  // Ensure we're using the exact database values
  const inclusions = Array.isArray(destination?.inclusions) ? destination.inclusions : [];
  const exclusions = Array.isArray(destination?.exclusions) ? destination.exclusions : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Destination Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The destination you're looking for doesn't exist."}</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className="min-h-screen bg-white"
    >
      <Header />

      {/* Image Gallery */}
      <section className="relative pt-6 sm:pt-8 bg-slate-50/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-4 md:px-8"
        >
          <div className="flex flex-col gap-4">
            {/* Main Featured Image - Complete Line */}
            <div className="relative group overflow-hidden rounded-lg shadow-xl h-[350px] sm:h-[400px] lg:h-[480px]">
              <img
                src={galleryImages[selectedImage]}
                alt={destination.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
            </div>


          </div>
        </motion.div>
      </section>


      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100 mb-2">
                <MapPin className="h-3.5 w-3.5 mr-2" />
                {destination.location || 'Explore Destination'}
              </div>

              <div className="space-y-4">
                <h1 className="!text-xl sm:!text-2xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  {destination.name}
                </h1>
                <p className="!text-md !text-slate-500 font-medium max-w-2xl leading-relaxed">
                  {destination.shortDescription || `Embark on an unforgettable journey to ${destination.name} with our premium tour packages.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-8 py-6 border-y border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold !text-slate-400 uppercase tracking-tighter">Duration</p>
                    <p className="!text-slate-900 font-bold">{destination.duration || 'Flexible'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Capacity</p>
                    <p className="!text-slate-900 font-bold">2-12 People</p>
                  </div>
                </div>
              </div>
            </motion.div>


            {/* All Details Sections */}
            <div className="space-y-16">
              {/* Overview Section */}
              <motion.section
                id="overview"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="scroll-mt-32"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="!text-2xl !font-bold text-slate-900">Experience  Highlights</h2>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="!text-md font-medium !text-slate-500 leading-relaxed mb-8">
                    {destination.description || destination.shortDescription || 'No description available.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destination.highlights && destination.highlights.length > 0 ? (
                    destination.highlights.map((highlight: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center space-x-3 p-4 bg-blue-50/50 border border-blue-100/50 rounded-lg group hover:bg-blue-50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <Check className="h-5 w-5 text-blue-600 group-hover:text-white" />
                        </div>
                        <span className="!text-md text-slate-700 font-medium">{highlight}</span>
                      </motion.div>
                    ))
                  ) : (
                    <p className="!text-md text-slate-500 italic">No highlights available</p>
                  )}
                </div>
              </motion.section>

              {/* Itinerary Section */}
              <motion.section
                id="itinerary"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="scroll-mt-32"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="!text-2xl !font-bold text-slate-900">Detailed Itinerary</h2>
                </div>

                {destination?.itinerary && destination.itinerary.length > 0 ? (
                  <div className="space-y-4">
                    {destination.itinerary.map((day: DayItinerary, index: number) => (
                      <div key={index} className="border border-slate-100 rounded-xl overflow-hidden bg-white transition-all duration-300">
                        <button
                          onClick={() => setOpenDay(openDay === index ? null : index)}
                          className="w-full flex items-center gap-4 p-3 sm:p-4 text-left bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                          <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold !text-sm sm:!text-lg transition-colors border ${openDay === index ? 'bg-[#155dfc] text-white border-[#155dfc] shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-slate-500'}`}>
                            D{day.day}
                          </div>
                          <div className="flex-grow">
                            <h3 className={`!text-base sm:!text-lg !font-semibold transition-colors ${openDay === index ? 'text-[#155dfc]' : 'text-slate-800'}`}>{day.title}</h3>
                          </div>
                          <div className={`flex-shrink-0 transition-transform duration-300 ${openDay === index ? 'rotate-180' : ''}`}>
                            <ChevronDown className={`w-5 h-5 ${openDay === index ? 'text-blue-600' : 'text-slate-400'}`} />
                          </div>
                        </button>

                        <AnimatePresence>
                          {openDay === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100">
                                <div className="pt-4 space-y-4">
                                  <ul className="space-y-3">
                                    {Array.isArray(day.activities) && day.activities.length > 0 ? (
                                      day.activities.map((activity, actIndex) => (
                                        <li key={actIndex} className="flex gap-3 text-slate-600">
                                          <div className="mt-2 min-w-[6px] h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                                          <span className="leading-relaxed text-[15px]">{activity}</span>
                                        </li>
                                      ))
                                    ) : (
                                      <li className="text-slate-400 italic !text-md">Activities to be updated</li>
                                    )}
                                  </ul>

                                  {(day.meals || day.accommodation) && (
                                    <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-dashed border-slate-100">
                                      {day.meals && (
                                        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 bg-orange-50 px-3 py-1.5 rounded-full">
                                          <Utensils className="w-3.5 h-3.5 text-orange-500" />
                                          <span>{Array.isArray(day.meals) ? day.meals.join(', ') : day.meals}</span>
                                        </div>
                                      )}
                                      {day.accommodation && (
                                        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 bg-emerald-50 px-3 py-1.5 rounded-full">
                                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                          <span>{day.accommodation}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-12 text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium !text-md">Itinerary details are being finalized. Stay tuned!</p>
                  </div>
                )}
              </motion.section>

              {/* Inclusions & Exclusions */}
              <motion.section
                id="included"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="scroll-mt-32"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Inclusions */}
                  <div className="bg-slate-50/50 rounded-lg p-6 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="!text-2xl !font-bold text-slate-900">What's Included</h3>
                    </div>
                    <ul className="space-y-4">
                      {inclusions.length > 0 ? (
                        inclusions.map((item: string, index: number) => (
                          <li key={index} className="flex items-start space-x-3 group">
                            <div className="mt-1 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-600 transition-colors">
                              <Check className="h-3 w-3 text-green-600 group-hover:text-white" />
                            </div>
                            <span className="text-slate-600 !text-md">{item?.trim() || item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500 italic !text-md">Details coming soon</li>
                      )}
                    </ul>
                  </div>

                  {/* Exclusions */}
                  <div className="bg-slate-50/50 rounded-lg p-6 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="!text-2xl !font-bold text-slate-900">What's Excluded</h3>
                    </div>
                    <ul className="space-y-4">
                      {exclusions.length > 0 ? (
                        exclusions.map((item: string, index: number) => (
                          <li key={index} className="flex items-start space-x-3 group">
                            <div className="mt-1 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                              <div className="h-1 w-2.5 bg-red-600 group-hover:bg-white rounded-full"></div>
                            </div>
                            <span className="text-slate-600 !text-md">{item?.trim() || item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500 italic !text-md">Standard exclusions apply</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Additional Amenities */}
                <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Plane, label: "All Transfers", color: "text-blue-600", bg: "bg-blue-50" },
                    { icon: Utensils, label: "Local Meals", color: "text-orange-600", bg: "bg-orange-50" },
                    { icon: Camera, label: "Photo Stops", color: "text-purple-600", bg: "bg-purple-50" },
                    { icon: Shield, label: "24/7 Support", color: "text-emerald-600", bg: "bg-emerald-50" }
                  ].map((amenity, idx) => (
                    <div key={idx} className={`${amenity.bg} p-4 rounded-lg flex flex-col items-center gap-2 border border-black/5`}>
                      <amenity.icon className={`h-6 w-6 ${amenity.color}`} />
                      <span className="!text-md font-semibold text-slate-700">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Similar Packages Section */}
              <motion.section
                id="packages"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="scroll-mt-32"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="!text-2xl !font-bold text-slate-900">Explore Other Packages</h2>
                  </div>
                </div>

                {packagesLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-slate-500 font-medium">Curating matching experiences...</p>
                  </div>
                ) : otherPackages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherPackages.map((pkg: any, index: number) => (
                      <motion.div
                        key={pkg._id || index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Link
                          href={`/package/${pkg.slug || pkg.name?.toLowerCase().replace(/\s+/g, '-') || pkg._id}`}
                          className="block h-full"
                        >
                          <Card className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-slate-200 transition-all duration-300 relative shadow-sm hover:shadow-xl hover:border-blue-100 h-full">
                            {/* White hover overlay */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none"></div>

                            <div className="relative h-64 w-full overflow-hidden">
                              <img
                                src={pkg.image || pkg.images?.[0] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&q=80"}
                                alt={pkg.title || pkg.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 z-10"></div>

                              <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                                <div className="flex items-center gap-1.5 mb-1.5 opacity-90">
                                  <MapPin className="h-3.5 w-3.5 text-white" />
                                  <span className="text-[10px] font-bold tracking-wider uppercase">{pkg.location || destination.name}</span>
                                </div>
                                <h4 className="!text-md font-bold leading-snug line-clamp-2 text-shadow-sm">
                                  {pkg.title || pkg.name}
                                </h4>
                              </div>
                            </div>

                            <div className="p-5">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                  <span className="text-[10px] !text-slate-700 font-bold uppercase tracking-wide">Duration</span>
                                  <span className="!text-sm font-bold text-slate-800 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                    {pkg.duration || 'Custom'}
                                  </span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wide">Starts from</span>
                                  <span className="!text-lg font-black text-blue-600">
                                    {pkg.price ? formatPrice(pkg.price) : 'Contact'}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-dashed border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] text-slate-700 font-bold">Per Person</span>
                                <div className="!text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                  View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-slate-500">More destinations coming soon.</p>
                  </div>
                )}
              </motion.section>
            </div>

          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="sticky top-20 sm:top-24 lg:top-28 z-10 self-start"
            >
              <Card className="p-0 border-none shadow-[0_32px_64px_-16px_rgba(37,99,235,0.2)] rounded-lg overflow-hidden bg-white">
                <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>

                  <p className="!text-blue-100 !font-bold uppercase tracking-widest text-xs mb-2">Value Package</p>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-4xl font-black">{destination.price ? formatPrice(destination.price) : 'Contact Us'}</span>
                  </div>
                  <p className="!text-blue-100/80 !text-sm !font-medium">Starting from per person</p>

                  {discount > 0 && (
                    <div className="mt-4 bg-white/20 backdrop-blur-md rounded-full py-1 px-4 inline-block text-xs font-bold">
                      Special {discount}% Limited Offer
                    </div>
                  )}
                </div>

                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="!text-xs !font-bold !text-slate-700 uppercase tracking-tighter">Duration</p>
                          <p className="!text-slate-900 !font-bold">{destination.duration || 'Flexible'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="!text-xs !font-bold !text-slate-700 uppercase tracking-tighter">Group Size</p>
                          <p className="!text-slate-900 !font-bold">2-12 Explorer</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setIsLeadFormOpen(true)}
                      className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-lg !text-lg !font-black shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
                    >
                      Book Your Trip
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>

                    <div className="space-y-4 pt-4">
                      {[
                        { icon: Shield, text: "Secure Booking Guarantee", sub: "100% encrypted payment" },
                        { icon: Award, text: "Best Price Guaranteed", sub: "Match any verified quote" },
                        { icon: Check, text: "Free Cancellation", sub: "Up to 30 days before" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <item.icon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="!text-sm !font-bold !text-slate-900 leading-tight">{item.text}</p>
                            <p className="!text-xs !text-slate-500">{item.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Terms and Conditions Section */}
        <section className="mt-8 sm:mt-16 pt-8 sm:pt-16 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="!text-2xl !font-bold text-slate-900 mb-4 sm:mb-8">Terms and Conditions</h2>

            <Accordion type="single" collapsible className="space-y-2 sm:space-y-4">
              <AccordionItem value="booking" className="border border-slate-200 rounded-lg">
                <AccordionTrigger
                  id="destination-terms-booking-trigger"
                  aria-controls="destination-terms-booking-content"
                  className="!px-4 !py-3 hover:bg-slate-50"
                >
                  <h3 className="!text-lg !font-bold text-slate-900 text-left">Booking and Payment</h3>
                </AccordionTrigger>
                <AccordionContent
                  id="destination-terms-booking-content"
                  aria-labelledby="destination-terms-booking-trigger"
                  className="!px-4 !pb-4"
                >
                  <ul className="space-y-1.5 sm:space-y-2 !text-sm text-slate-600">
                    <li>• A deposit of 30% is required to confirm your booking</li>
                    <li>• Full payment must be completed 30 days before departure</li>
                    <li>• All prices are in INR and include taxes unless otherwise stated</li>
                    <li>• Payment can be made via credit card, bank transfer, or UPI</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cancellation" className="border border-slate-200 rounded-lg">
                <AccordionTrigger
                  id="destination-terms-cancellation-trigger"
                  aria-controls="destination-terms-cancellation-content"
                  className="!px-4 !py-3 hover:bg-slate-50"
                >
                  <h3 className="!text-lg !font-bold text-slate-900 text-left">Cancellation Policy</h3>
                </AccordionTrigger>
                <AccordionContent
                  id="destination-terms-cancellation-content"
                  aria-labelledby="destination-terms-cancellation-trigger"
                  className="!px-4 !pb-4"
                >
                  <ul className="space-y-1.5 sm:space-y-2 !text-sm text-slate-600">
                    <li>• Cancellation 60+ days before departure: Full refund minus ₹100 processing fee</li>
                    <li>• Cancellation 30-59 days before departure: 75% refund</li>
                    <li>• Cancellation 15-29 days before departure: 50% refund</li>
                    <li>• Cancellation less than 15 days: No refund</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="documents" className="border border-slate-200 rounded-lg">
                <AccordionTrigger
                  id="destination-terms-documents-trigger"
                  aria-controls="destination-terms-documents-content"
                  className="!px-4 !py-3 hover:bg-slate-50"
                >
                  <h3 className="!text-lg !font-bold text-slate-900 text-left">Travel Documents</h3>
                </AccordionTrigger>
                <AccordionContent
                  id="destination-terms-documents-content"
                  aria-labelledby="destination-terms-documents-trigger"
                  className="!px-4 !pb-4"
                >
                  <ul className="space-y-1.5 sm:space-y-2 !text-sm text-slate-600">
                    <li>• Valid passport required (minimum 6 months validity)</li>
                    <li>• Visa requirements vary by destination - check with embassy</li>
                    <li>• Travel insurance is strongly recommended</li>
                    <li>• All travelers must provide accurate personal information</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="health" className="border border-slate-200 rounded-lg">
                <AccordionTrigger
                  id="destination-terms-health-trigger"
                  aria-controls="destination-terms-health-content"
                  className="!px-4 !py-3 hover:bg-slate-50"
                >
                  <h3 className="!text-lg !font-bold text-slate-900 text-left">Health and Safety</h3>
                </AccordionTrigger>
                <AccordionContent
                  id="destination-terms-health-content"
                  aria-labelledby="destination-terms-health-trigger"
                  className="!px-4 !pb-4"
                >
                  <ul className="space-y-1.5 sm:space-y-2 !text-sm text-slate-600">
                    <li>• Participants must be in good physical condition for adventure activities</li>
                    <li>• Medical conditions must be disclosed before booking</li>
                    <li>• Follow all safety instructions provided by guides</li>
                    <li>• Company is not liable for personal injury due to negligence</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="force-majeure" className="border border-slate-200 rounded-lg">
                <AccordionTrigger
                  id="destination-terms-force-majeure-trigger"
                  aria-controls="destination-terms-force-majeure-content"
                  className="!px-4 !py-3 hover:bg-slate-50"
                >
                  <h3 className="!text-lg !font-bold text-slate-900 text-left">Force Majeure</h3>
                </AccordionTrigger>
                <AccordionContent
                  id="destination-terms-force-majeure-content"
                  aria-labelledby="destination-terms-force-majeure-trigger"
                  className="!px-4 !pb-4"
                >
                  <ul className="space-y-1.5 sm:space-y-2 !text-sm text-slate-600">
                    <li>• Tours may be modified or cancelled due to weather, natural disasters, or political unrest</li>
                    <li>• Alternative arrangements will be provided when possible</li>
                    <li>• Refunds will be processed according to circumstances</li>
                    <li>• Travel insurance is recommended to cover unforeseen events</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="important" className="border border-slate-200 rounded-lg">
                <AccordionTrigger
                  id="destination-terms-important-trigger"
                  aria-controls="destination-terms-important-content"
                  className="!px-4 !py-3 hover:bg-slate-50"
                >
                  <h3 className="!text-lg !font-bold text-slate-900 text-left">Important Notes</h3>
                </AccordionTrigger>
                <AccordionContent
                  id="destination-terms-important-content"
                  aria-labelledby="destination-terms-important-trigger"
                  className="!px-4 !pb-4"
                >
                  <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                    <p className="!text-sm text-slate-600 leading-relaxed">
                      By booking this destination, you agree to these terms and conditions. We reserve the right to modify
                      itineraries due to local conditions while maintaining the quality of your experience. For any
                      questions or clarifications, please contact our customer service team.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>

      <LeadCaptureForm
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        packageTitle={destination.name}
        packagePrice={destination.price ? formatPrice(destination.price) : ''}
      />
    </motion.div>
  );
}
