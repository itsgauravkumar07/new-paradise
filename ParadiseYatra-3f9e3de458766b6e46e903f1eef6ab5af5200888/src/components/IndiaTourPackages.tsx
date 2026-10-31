"use client"
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

interface State {
  name: string;
  image: string;
  price: number;
  packagesCount: number;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

// Helper function to get descriptive subtitle for states
const getStateSubtitle = (stateName: string): string => {
  const subtitles: { [key: string]: string } = {
    'Gujarat': 'LAND OF LEGENDS',
    'Rajasthan': 'LAND OF KINGS',
    'Himachal Pradesh': 'ALPINE PARADISE',
    'Uttarakhand': 'DEV BHOOMI',
    'Kerala': 'GOD\'S OWN COUNTRY',
    'Tamil Nadu': 'LAND OF TEMPLES',
    'Karnataka': 'SOUTHERN CHARM',
    'Maharashtra': 'CULTURAL CAPITAL',
    'Goa': 'BEACH PARADISE',
    'Andaman': 'TROPICAL ESCAPE',
    'Jammu and Kashmir': 'PARADISE ON EARTH',
    'Ladakh': 'LAND OF HIGH PASSES',
    'Sikkim': 'HIMALAYAN GEM',
    'West Bengal': 'CULTURAL HUB',
    'Odisha': 'TEMPLE STATE',
  };
  return subtitles[stateName] || 'INCREDIBLE INDIA';
};

const IndiaTourPackages = () => {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth < 768);
    updateMobileState();
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  useEffect(() => {
    const fetchIndiaStates = async () => {
      try {
        setLoading(true);

        // Fetch tour types and packages in parallel
        const [tourTypesResponse, packagesResponse] = await Promise.all([
          fetch("/api/tour-types"),
          fetch("/api/packages?tourType=india&limit=100")
        ]);

        if (!tourTypesResponse.ok) throw new Error("Failed to fetch India tour data");

        const tourTypesData = await tourTypesResponse.json();
        const packagesData = packagesResponse.ok ? await packagesResponse.json() : { packages: [] };
        const packages = Array.isArray(packagesData) ? packagesData : (packagesData.packages || []);

        // Find India tour type
        const indiaTourType = tourTypesData.tourTypes?.find((tour: any) => tour.tourType === 'india');

        if (!indiaTourType || !indiaTourType.states) {
          setStates([]);
          return;
        }

        // Group packages by state
        const packagesByState: { [key: string]: any[] } = {};
        packages.forEach((pkg: any) => {
          const state = pkg.state || 'Other';
          if (!packagesByState[state]) {
            packagesByState[state] = [];
          }
          packagesByState[state].push(pkg);
        });

        // Transform states data to include image and price
        const statesData: State[] = indiaTourType.states.map((state: any) => {
          // Get first destination/package image from this state
          let image = FALLBACK_IMAGE;
          let minPrice = 0;

          if (state.destinations && state.destinations.length > 0) {
            // Get image from first destination
            const firstItem = state.destinations[0];
            image = firstItem.image || FALLBACK_IMAGE;
          }

          // Get minimum price from packages for this state
          const statePackages = packagesByState[state.name] || [];
          if (statePackages.length > 0) {
            const prices = statePackages
              .map((p: any) => p.price || 0)
              .filter((p: number) => p > 0);
            if (prices.length > 0) {
              minPrice = Math.min(...prices);
            }
          }

          return {
            name: state.name,
            image: (state.name.toLowerCase().includes('sikkim') ||
              state.name.toLowerCase().includes('gangtok') ||
              state.name.toLowerCase().includes('kalimpong'))
              ? '/Destination%20Pages/Sikkim.webp'
              : (state.name.toLowerCase().includes('andaman'))
                ? '/Destination%20Pages/Andaman%20and%20Nicobar%20Island.webp'
                : (state.name.toLowerCase().includes('kashmir') ||
                  state.name.toLowerCase().includes('jammu'))
                  ? '/Destination%20Pages/Jammu%20and%20Kashmir.webp'
                  : (state.name.toLowerCase().includes('rajasthan'))
                    ? '/Destination%20Pages/Rajasthan.webp'
                    : (state.name.toLowerCase().includes('uttarakhand'))
                      ? '/Destination%20Pages/Uttarakhand.webp'
                      : (state.name.toLowerCase().includes('goa'))
                        ? '/Destination%20Pages/Goa.webp'
                        : (state.name.toLowerCase().includes('kerala'))
                          ? '/Destination%20Pages/Kerala.webp'
                          : (state.name.toLowerCase().includes('himachal'))
                            ? '/Destination%20Pages/Himachal%20Pradesh.webp'
                            : (state.name.toLowerCase().includes('ladakh'))
                              ? '/Destination%20Pages/Ladakh.webp'
                              : (state.name.toLowerCase().replace(/-/g, ' ').includes('tamil nadu') ||
                                state.name.toLowerCase().includes('ooty') ||
                                state.name.toLowerCase().includes('chennai') ||
                                state.name.toLowerCase().includes('madurai'))
                                ? '/Destination%20Pages/Tamil%20Nadu.webp'
                                : (state.name.toLowerCase().replace(/-/g, ' ').includes('thailand'))
                                  ? '/Destination%20Pages/Thailand.webp'
                                  : (state.name.toLowerCase().replace(/-/g, ' ').includes('malaysia'))
                                    ? '/Destination%20Pages/Malaysia.webp'
                                    : (state.name.toLowerCase().replace(/-/g, ' ').includes('egypt'))
                                      ? '/Destination%20Pages/Egypt.webp'
                                      : (state.name.toLowerCase().replace(/-/g, ' ').includes('indonesia'))
                                        ? '/Destination%20Pages/Indonesia.webp'
                                        : (state.name.toLowerCase().replace(/-/g, ' ').includes('kenya'))
                                          ? '/Destination%20Pages/Kenya.webp'
                                          : (state.name.toLowerCase().replace(/-/g, ' ').includes('maldives'))
                                            ? '/Destination%20Pages/Maldives.webp'
                                            : (state.name.toLowerCase().replace(/-/g, ' ').includes('singapore'))
                                              ? '/Destination%20Pages/Singapore.webp'
                                              : (state.name.toLowerCase().replace(/-/g, ' ').includes('united arab emirates') || state.name.toLowerCase().includes('dubai') || state.name.toLowerCase().includes('uae'))
                                                ? '/Destination%20Pages/United%20Arab%20Emirates.webp'
                                                : image,
            price: minPrice,
            packagesCount: state.destinations?.length || 0
          };
        });

        setStates(statesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchIndiaStates();
  }, []);

  // Mobile Scroll Handler
  useEffect(() => {
    if (!isMobile || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (isScrollingProgrammatically.current) return;

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const itemElement = container.firstElementChild as HTMLElement;

        if (itemElement) {
          const itemWidth = itemElement.offsetWidth + 16;
          const newIndex = Math.round(scrollLeft / itemWidth);

          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < states.length) {
            setCurrentIndex(newIndex);
          }
        }
      }, 50);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isMobile, currentIndex, states.length]);

  const handlePrevious = () => {
    if (isMobile || currentIndex === 0) return;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (isMobile || currentIndex >= states.length - 5) return;
    setCurrentIndex((prev) => Math.min(states.length - 5, prev + 1));
  };


  if (loading) {
    return (
      <section className="py-16 bg-amber-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-slate-200 rounded w-64 mb-8 animate-pulse"></div>
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 h-80 bg-slate-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || states.length === 0) {
    return null;
  }

  const visibleStates = states.slice(currentIndex, currentIndex + 5);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < states.length - 5;

  return (
    <section className="py-16 bg-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading styled similar to RecentlyBookedItineraries */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              <span className="relative inline-block">
                <span className="relative z-10 block">
                  <span className="block">India Tour</span>
                  <span className="block">Packages</span>
                </span>
                <span className="absolute -left-2 -top-2 w-32 h-10 border-2 border-blue-400 rounded-full border-dashed opacity-70" />
              </span>
            </h2>
            <p className="mt-3 text-sm md:text-base !text-slate-600">
              Dekho My India — explore handpicked, state-wise journeys across the country.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm text-sm text-blue-800">
            <span className="text-base">✨</span>
            <span className="font-semibold">Top-selling</span>
            <span className="text-slate-600">India experiences</span>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {!isMobile && (
            <>
              <button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 ${!canGoPrevious
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-110 hover:shadow-xl cursor-pointer"
                  }`}
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 ${!canGoNext
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-110 hover:shadow-xl cursor-pointer"
                  }`}
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </>
          )}

          {/* Cards Container */}
          {isMobile ? (
            <div className="overflow-x-auto scrollbar-hide" ref={scrollContainerRef}>
              <div className="flex gap-4 pb-4" style={{ scrollSnapType: 'x mandatory' }}>
                {states.map((state) => (
                  <Link
                    key={state.name}
                    href={`/package/india/${state.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex-shrink-0 w-[280px]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="bg-white rounded-t-3xl rounded-b-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <div className="relative h-72 w-full">
                        <Image
                          src={getImageUrl(state.image) || FALLBACK_IMAGE}
                          alt={state.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-4 py-5">
                          <div className="text-white">
                            <div className="text-[10px] font-medium uppercase tracking-wider opacity-90 mb-1">
                              {getStateSubtitle(state.name)}
                            </div>
                            <div className="text-lg font-bold">
                              {state.name}
                            </div>
                            {state.price > 0 && (
                              <div className="text-xs font-medium mt-2 opacity-90">
                                Starting from ₹ {state.price.toLocaleString()}/-
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              {visibleStates.map((state) => (
                <Link
                  key={state.name}
                  href={`/package/india/${state.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex-1 max-w-[220px]"
                >
                  <div className="bg-white rounded-t-3xl rounded-b-lg shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="relative h-80 w-full">
                      <Image
                        src={getImageUrl(state.image) || FALLBACK_IMAGE}
                        alt={state.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-4 py-6">
                        <div className="text-white">
                          <div className="text-[10px] font-medium uppercase tracking-wider opacity-90 mb-1">
                            {getStateSubtitle(state.name)}
                          </div>
                          <div className="text-xl font-bold">
                            {state.name}
                          </div>
                          {state.price > 0 && (
                            <div className="text-xs font-medium mt-2 opacity-90">
                              Starting from ₹ {state.price.toLocaleString()}/-
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default IndiaTourPackages;
