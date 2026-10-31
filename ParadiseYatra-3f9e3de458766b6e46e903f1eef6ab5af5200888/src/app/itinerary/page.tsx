"use client";

import { motion } from "framer-motion";
import { ChevronRight, Clock, MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { } from "react";
import Link from "next/link";
import Image from "next/image";

interface Package {
  _id: string;
  title: string;
  subtitle: string;
  duration: string;
  location: string;
  price: string;
  originalPrice: string;
  rating: string;
  totalBookings: number;
  coverImage: string;
  slug: string;
}

// Sample data for different packages - in real app this would come from API
const packageData: Record<string, Package> = {
  "royal-rajasthan": {
    _id: "royal-rajasthan-001",
    title: "Royal Rajasthan Adventure",
    subtitle: "Experience the grandeur of royal palaces and desert landscapes",
    duration: "6 Days / 5 Nights",
    location: "Rajasthan, India",
    price: "₹70,000",
    originalPrice: "₹76,500",
    rating: "4.9",
    totalBookings: 1200,
    coverImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    slug: "royal-rajasthan"
  },
  "swiss-alps-adventure": {
    _id: "swiss-alps-001",
    title: "Swiss Alps Adventure",
    subtitle: "Mountain adventures and scenic train journeys",
    duration: "7 Days / 8 Nights",
    location: "Switzerland",
    price: "₹1,25,000",
    originalPrice: "₹1,40,000",
    rating: "4.8",
    totalBookings: 950,
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    slug: "swiss-alps-adventure"
  },
  "bali-paradise": {
    _id: "bali-paradise-001",
    title: "Bali Paradise",
    subtitle: "Tropical beaches and cultural experiences",
    duration: "6 Days / 7 Nights",
    location: "Bali, Indonesia",
    price: "₹85,000",
    originalPrice: "₹95,000",
    rating: "4.7",
    totalBookings: 1700,
    coverImage: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    slug: "bali-paradise"
  }
};

const PackageCard = ({ pkg }: { pkg: Package }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex-shrink-0 w-80 md:w-auto"
    >
      <Card className="modern-card hover-lift overflow-hidden">
        <div className="relative">
          <Image 
            src={pkg.coverImage} 
            alt={pkg.title}
            className="w-full h-48 object-cover object-center"
            width={400}
            height={300}
          />
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full font-semibold text-sm">
            Popular
          </div>
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-sm font-semibold flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            {pkg.rating}
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{pkg.subtitle}</p>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{pkg.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <Clock className="w-4 h-4 mr-1" />
            <span>{pkg.duration}</span>
          </div>
          
          <div className="flex items-baseline mb-4">
            <span className="text-2xl font-bold text-blue-600">{pkg.price}</span>
            <span className="text-lg text-gray-500 line-through ml-2">{pkg.originalPrice}</span>
          </div>
             <Link href={`/package/${pkg.slug || pkg._id}`}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ItineraryPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
                            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Itineraries</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Explore Our Travel Itineraries
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            Discover carefully crafted travel experiences with detailed day-by-day itineraries, 
            accommodation details, and everything you need to know about your journey.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Packages</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our handpicked collection of premium travel experiences, 
            each designed to provide you with unforgettable memories.
          </p>
        </motion.div>

        <div className="flex flex-nowrap md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-4 md:pb-0">
          {Object.values(packageData).map((pkg, index) => (
            <PackageCard key={index} pkg={pkg} />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
                            Can&apos;t find what you&apos;re looking for? Contact our travel experts for custom itineraries.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Contact Travel Expert
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ItineraryPage; 