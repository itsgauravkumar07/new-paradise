"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

const Skeleton = ({
  className,
  variant = "default",
  width,
  height,
  lines = 1,
  animated = true,
}: SkeletonProps) => {
  return null;
};

// Predefined skeleton components for common use cases
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("p-4 space-y-3", className)}>
    <Skeleton variant="card" height="200px" className="w-full" />
    <Skeleton height="1.5rem" width="80%" />
    <Skeleton height="1rem" width="60%" />
    <div className="flex justify-between items-center">
      <Skeleton height="1rem" width="40%" />
      <Skeleton height="2rem" width="80px" />
    </div>
  </div>
);

export const SkeletonText = ({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={cn("space-y-2", className)}>
    <Skeleton lines={lines} />
  </div>
);

export const SkeletonAvatar = ({
  size = "40px",
  className,
}: {
  size?: string;
  className?: string;
}) => (
  <Skeleton variant="circle" width={size} height={size} className={className} />
);

export const SkeletonButton = ({
  width = "120px",
  height = "40px",
  className,
}: {
  width?: string;
  height?: string;
  className?: string;
}) => (
  <Skeleton
    variant="default"
    width={width}
    height={height}
    className={cn("rounded-lg", className)}
  />
);

export const SkeletonHero = () => (
  <div className="hero-section relative min-h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden pt-20 sm:pt-24 md:pt-28 lg:pt-32 px-4 sm:px-6 z-10 bg-white">
    <div className="max-w-4xl mx-auto w-full text-center space-y-8">
      {/* Trust badge skeleton */}
      <div className="flex justify-center">
        <Skeleton width="200px" height="40px" className="rounded-full" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-4">
        <Skeleton height="4rem" width="80%" className="mx-auto" />
        <Skeleton height="2rem" width="60%" className="mx-auto" />
      </div>

      {/* Description skeleton */}
      <SkeletonText lines={2} className="max-w-2xl mx-auto" />

      {/* Buttons skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <SkeletonButton width="150px" height="48px" />
        <SkeletonButton width="140px" height="48px" />
      </div>

      {/* Search bar skeleton */}
      <div className="max-w-2xl mx-auto">
        <Skeleton height="60px" className="rounded-3xl" />
      </div>

      {/* Popular destinations skeleton */}
      <div className="space-y-4">
        <Skeleton height="1rem" width="200px" className="mx-auto" />
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              width="120px"
              height="32px"
              className="rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonPackageCard = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <Skeleton variant="card" height="200px" className="w-full" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <Skeleton height="1.25rem" width="70%" />
        <Skeleton height="1.5rem" width="60px" className="rounded-full" />
      </div>
      <Skeleton height="1rem" width="50%" />
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton height="0.875rem" width="80px" />
          <Skeleton height="0.875rem" width="60px" />
        </div>
        <Skeleton height="2rem" width="80px" />
      </div>
    </div>
  </div>
);

export const SkeletonTestimonial = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg">
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonAvatar size="48px" />
      <div className="space-y-1">
        <Skeleton height="1rem" width="120px" />
        <Skeleton height="0.875rem" width="80px" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex items-center justify-between mt-4">
      <div className="flex space-x-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width="16px" height="16px" className="rounded-sm" />
        ))}
      </div>
      <Skeleton height="0.875rem" width="60px" />
    </div>
  </div>
);

export default Skeleton;
