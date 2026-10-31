"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Star, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface PackageHeaderProps {
  title: string;
  subtitle: string;
  duration: string;
  location: string;
  rating: string;
  totalReviews: number;
  coverImage: string;
}

const PackageHeader = ({ 
  title, 
  subtitle, 
  duration, 
  location, 
  rating, 
  totalReviews, 
  coverImage 
}: PackageHeaderProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Multiple fallback images for better reliability - using more reliable Unsplash URLs
  const fallbackImages = [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];
  
  // Use fallback if image is empty, undefined, or failed to load
  const displayImage = (!coverImage || coverImage === "" || imageError) ? fallbackImages[0] : coverImage;
  
  // Ensure we have a valid image URL
  const finalImage = displayImage.startsWith('http') ? displayImage : fallbackImages[0];

  // Debug logging
  useEffect(() => {

  }, [coverImage, displayImage, finalImage, imageError]);

  const handleImageError = () => {
    
    setImageError(true);
  };

  return (
    <section className="relative lg:h-85 h-60 mb-2">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={finalImage} 
          alt={title}
          className="w-full h-full object-cover object-center"
          onError={handleImageError}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            width: '100%',
            height: '100%'
          }}
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black bg-opacity-40"></div>
      
      {/* Content */}
      <div className="absolute inset-0 container mx-auto px-4 h-full flex items-center">
        <div className="text-white max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {title}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-4 text-sm"
          >
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{location}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              <span>{rating} Rating</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{totalReviews} Reviews</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PackageHeader; 