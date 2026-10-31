"use client";

import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { useState } from "react";

interface OptimizedImageProps {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  onError,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Image failed to load:", src);
    console.error("Processed image URL:", getImageUrl(src));
    setImageError(true);
    setIsLoading(false);
    onError?.(e);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  // If image has errored, show fallback
  if (imageError) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center text-gray-500 text-sm`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4"
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
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    );
  }

  const processedSrc = getImageUrl(src, {
    width,
    quality: "good",
  });

  // If no valid image source, show fallback
  if (!processedSrc) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center text-gray-500 text-sm`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4"
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
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />
      )}
      <Image
        src={processedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        // Add better error handling for Next.js Image component
        unoptimized={src?.startsWith("data:") || false}
      />
    </div>
  );
}
