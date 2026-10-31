"use client";

import { memo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import HeroSection from "./HeroSection";
import {
  LazyFixedDepartureCarousel,
  LazyGlobalPackagesMap,
  LazyHolidayThemesRail,
  LazyLuxuryHotelsSection,
  LazyOffersSection,
  LazyReviewScoreSection,
  LazyTagPackagesSection,
  LazyTrendingDestinationPills,
  LazyBlogSectionNew,
  LazyFestivalSection,
  LazyHoneymoonPackages,
  LazyIndiaTourPackagesSection,
  LazyInternationalTourPackagesSection,
  LazyLuxuryPackagesSection,
  LazySpiritualJourneysSection,
  LazyTravellerMomentsSection,
  LazyTrendingPackagesSection,
  LazyWhyChooseParadiseYatra,
  LazyAboutUsSection,
  LazyCTASection,
  LazyVerifiedConfidenceSection,
} from "@/components/lazy-components";

const ShutdownPopup = dynamic(() => import("@/components/ShutdownPopup"), {
  ssr: false,
});

const PerformanceMonitor = dynamic(
  () => import("@/components/ui/PerformanceMonitor"),
  { ssr: false }
);

// Honeymoon / Why Choose / India + International tours / Spiritual / About are not part of the new home design.
// Hidden by default. Flip to true to show them again.
const SHOW_LEGACY_SECTIONS = false;

interface HomePageClientProps {
  /** Server-rendered content (destination directory) that must be in the HTML; shown after the scroll-loaded sections */
  directory?: React.ReactNode;
}

const HomePageClient = memo(({ directory }: HomePageClientProps) => {
  const [showShutdownPopup, setShowShutdownPopup] = useState(false);
  const [renderBelowFold, setRenderBelowFold] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const enableBelowFold = () => {
      if (!cancelled) {
        setRenderBelowFold(true);
      }
    };

    if ("requestIdleCallback" in window) {
      const id = (window as Window & { requestIdleCallback: Function }).requestIdleCallback(
        enableBelowFold,
        { timeout: 1500 }
      );
      return () => {
        cancelled = true;
        (window as Window & { cancelIdleCallback: Function }).cancelIdleCallback(id);
      };
    }

    const timeoutId = setTimeout(enableBelowFold, 800);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-background overflow-x-hidden w-full"
    >
      <Header />

      <main aria-label="Paradise Yatra - Travel Packages and Destinations">
        <HeroSection />

        <div>
          {renderBelowFold ? (
            <>
              <LazyTrendingDestinationPills />
              <LazyTrendingPackagesSection />
              <LazyFixedDepartureCarousel />
              <LazyLuxuryHotelsSection />
              <LazyReviewScoreSection />
              <LazyHolidayThemesRail isHomePage />
              <LazyTagPackagesSection
                tagSlug="corporate"
                eyebrow="Teams & groups"
                title="Corporate Offsites & MICE Tours"
                description="Tailored executive retreats, annual conferences, and incentive travel designed for high-performing teams."
                priceLabel="Per Delegate"
              />
              <LazyOffersSection />
              <LazyGlobalPackagesMap />

            {/* Sections that are NOT in the new design. Set SHOW_LEGACY_SECTIONS to true to bring them back. */}
            {SHOW_LEGACY_SECTIONS && (
              <>
                <LazyHoneymoonPackages />
                <LazyWhyChooseParadiseYatra />
                <LazyIndiaTourPackagesSection />
                <LazyInternationalTourPackagesSection />
                <LazySpiritualJourneysSection />
                <LazyAboutUsSection />
              </>
            )}
              {/* <LazyFestivalSection /> */}
              <LazyTravellerMomentsSection />
              <LazyCTASection />
              <LazyVerifiedConfidenceSection />

              <LazyBlogSectionNew />

              {/* Performance monitoring - only visible in development */}
              {process.env.NODE_ENV !== "production" && (
                <PerformanceMonitor showInProduction={false} />
              )}
            </>
          ) : (
            <div className="min-h-[600px]" aria-hidden="true" />
          )}
        </div>

        {directory}
      </main>

      {/* Shutdown Popup - you can control this with state */}
      {showShutdownPopup && <ShutdownPopup isOpen={showShutdownPopup} />}

    </div>
  );
});

HomePageClient.displayName = "HomePageClient";

export default HomePageClient;
