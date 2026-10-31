"use client";

import { createLazyComponent } from "./ui/lazy-wrapper";
import { SkeletonHero, SkeletonPackageCard } from "./ui/skeleton";
import Skeleton from "./ui/skeleton";

// Lazy load all components with consistent loading states and optimized intersection observer settings
export const LazyHeader = createLazyComponent(
  () => import("./Header"),
  <div className="min-h-[80px] bg-white flex items-center justify-center">
    <Skeleton height="40px" width="200px" />
  </div>,
  { threshold: 0, rootMargin: "0px" }
);

export const LazyHeroSection = createLazyComponent(
  () => import("./HeroSection"),
  <SkeletonHero />,
  { threshold: 0.1, rootMargin: "200px" }
);

// minHeight values below are the sections' real desktop heights minus this padding (8rem), so a section
// swapping in for its placeholder barely moves the page
const SectionPlaceholder = ({ minHeight = "420px" }: { minHeight?: string }) => (
  <div className="section-padding bg-white px-4 sm:px-6">
    <div className="container mx-auto">
      <div
        className="w-full rounded-[6px] bg-slate-100/70"
        style={{ minHeight }}
      />
    </div>
  </div>
);

export const LazyHoneymoonPackages = createLazyComponent(
  () => import("./HoneymoonPackages"),
  <SectionPlaceholder minHeight="420px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyTrendingDestinationPills = createLazyComponent(
  () => import("./TrendingDestinationPills"),
  <SectionPlaceholder minHeight="520px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyFixedDepartureCarousel = createLazyComponent(
  () => import("./FixedDepartureCarousel"),
  <SectionPlaceholder minHeight="680px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyLuxuryHotelsSection = createLazyComponent(
  () => import("./LuxuryHotelsSection"),
  <SectionPlaceholder minHeight="610px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyReviewScoreSection = createLazyComponent(
  () => import("./ReviewScoreSection"),
  <SectionPlaceholder minHeight="0px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyHolidayThemesRail = createLazyComponent(
  () => import("./HolidayThemesRail"),
  <SectionPlaceholder minHeight="610px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyTagPackagesSection = createLazyComponent(
  () => import("./TagPackagesSection"),
  <SectionPlaceholder minHeight="0px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyOffersSection = createLazyComponent(
  () => import("./OffersSection"),
  <SectionPlaceholder minHeight="560px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyGlobalPackagesMap = createLazyComponent(
  () => import("./GlobalPackagesMap"),
  <SectionPlaceholder minHeight="700px" />,
  { threshold: 0.1, rootMargin: "300px" }
);

export const LazyTrendingPackagesSection = createLazyComponent(
  () => import("./TrendingPackagesSection"),
  <SectionPlaceholder minHeight="520px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyWhyChooseParadiseYatra = createLazyComponent(
  () => import("./WhyChooseParadiseYatra"),
  <SectionPlaceholder minHeight="520px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyIndiaTourPackagesSection = createLazyComponent(
  () => import("./IndiaTourPackagesSection"),
  <SectionPlaceholder minHeight="520px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyInternationalTourPackagesSection = createLazyComponent(
  () => import("./InternationalTourPackagesSection"),
  <SectionPlaceholder minHeight="520px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazySpiritualJourneysSection = createLazyComponent(
  () => import("./SpiritualJourneysSection"),
  <SectionPlaceholder minHeight="520px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyLuxuryPackagesSection = createLazyComponent(
  () => import("./LuxuryPackagesSection"),
  <SectionPlaceholder minHeight="520px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazySeasonalPackagesSection = createLazyComponent(
  () => import("./SeasonalPackagesSection"),
  <SectionPlaceholder minHeight="520px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyFestivalSection = createLazyComponent(
  () => import("./FestivalSection"),
  <SectionPlaceholder minHeight="620px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyTestimonialsSection = createLazyComponent(
  () => import("./TestimonialsSection"),
  <SectionPlaceholder minHeight="520px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyTrendingDestinationsShowcase = createLazyComponent(
  () => import("./TrendingDestinationsShowcase"),
  <SectionPlaceholder minHeight="600px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

// Video testimonials from Admin → Customer Gallery (the "Watch Real Traveller Stories" layout)
export const LazyTravellerMomentsSection = createLazyComponent(
  () => import("./moments/HomeTestimonials"),
  <SectionPlaceholder minHeight="590px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyVerifiedConfidenceSection = createLazyComponent(
  () => import("./VerifiedConfidenceSection"),
  <SectionPlaceholder minHeight="630px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyBlogSectionNew = createLazyComponent(
  () => import("./BlogSectionNew"),
  <SectionPlaceholder minHeight="640px" />,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyTrendingDestinations = createLazyComponent(
  () => import("./TrendingDestinations"),
  <div className="section-padding bg-white px-4 sm:px-6">
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
  </div>,
  { threshold: 0.1, rootMargin: "150px" }
);                 

export const LazyRecentlyBooked = createLazyComponent(
  () => import("./RecentlyBooked"),
  <div className="section-padding bg-white px-4 sm:px-6">
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
  </div>,
  { threshold: 0.1, rootMargin: "100px" }
);

export const LazyHolidaysSection = createLazyComponent(
  () => import("./HolidaysSection"),
  <div className="section-padding bg-white px-4 sm:px-6">
    <div className="container mx-auto">
      <div className="text-center mb-8">
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
  </div>,
  { threshold: 0.1, rootMargin: "150px" }
);

export const LazyDestinationsGrid = createLazyComponent(
  () => import("./DestinationsGrid"),
  <div className="section-padding bg-white px-4 sm:px-6">
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
  </div>,
  { threshold: 0.1, rootMargin: "200px" }
);

export const LazyPremiumPackages = createLazyComponent(
  () => import("./PremiumPackages"),
  <div className="section-padding bg-white px-4 sm:px-6">
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
  </div>,
  { threshold: 0.1, rootMargin: "150px" }
);

export const LazyAdventureEscapes = createLazyComponent(
  () => import("./AdventureEscapes"),
  <div className="section-padding bg-white px-4 sm:px-6">
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
  </div>,
  { threshold: 0.1, rootMargin: "150px" }
);

export const LazyBlogSection = createLazyComponent(
  () => import("./BlogSection"),
  <div className="section-padding bg-white px-4 sm:px-6">
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
  </div>,
  { threshold: 0.1, rootMargin: "150px" }
);

export const LazyTestimonialSection = createLazyComponent(
  () => import("./TestimonialSection"),
  <div className="section-padding bg-white px-4 sm:px-6">
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
  </div>,
  { threshold: 0.1, rootMargin: "100px" }
);

export const LazyCTASection = createLazyComponent(
  () => import("./CTASection"),
  <div className="section-padding bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
    <div className="container mx-auto px-4">
      <div className="text-center text-white">
        <div className="mb-8">
          <Skeleton
            height="2.5rem"
            width="300px"
            className="mx-auto mb-4 bg-white/20"
          />
          <Skeleton
            height="1.25rem"
            width="200px"
            className="mx-auto bg-white/20"
          />
        </div>
        <div className="max-w-3xl mx-auto mb-8">
          <Skeleton height="1.5rem" width="100%" className="mb-4 bg-white/20" />
          <Skeleton
            height="1.5rem"
            width="80%"
            className="mx-auto bg-white/20"
          />
        </div>
      </div>
    </div>
  </div>,
  { threshold: 0.1, rootMargin: "100px" }
);

export const LazyFooter = createLazyComponent(
  () => import("./Footer"),
  <div className="min-h-[300px] bg-gray-900 flex items-center justify-center">
    <Skeleton height="40px" width="200px" className="bg-white/20" />
  </div>,
  { threshold: 0.1, rootMargin: "100px" }
);

export const LazyNewsletterSubscribe = createLazyComponent(
  () => import("./NewsLetter"),
  <SectionPlaceholder minHeight="260px" />,
  { threshold: 0.1, rootMargin: "150px" }
);

export const LazyAboutUsSection = createLazyComponent(
  () => import("./AboutUsSection"),
  <SectionPlaceholder minHeight="600px" />,
  { threshold: 0.1, rootMargin: "200px" }
);
