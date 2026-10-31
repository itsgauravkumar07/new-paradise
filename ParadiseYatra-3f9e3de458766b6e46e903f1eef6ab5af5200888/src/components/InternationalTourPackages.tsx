"use client"
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

interface Country {
  name: string;
  image: string;
  price: number;
  packagesCount: number;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

// Helper function to get descriptive subtitle for countries
const getCountrySubtitle = (countryName: string): string => {
  const subtitles: { [key: string]: string } = {
    'Switzerland': 'ALPINE VIEWS IN',
    'Japan': 'LAND OF RISING SUN',
    'Dubai': 'THE CITY OF LIFE',
    'Singapore': 'THE LION CITY',
    'Thailand': 'LAND OF SMILES',
    'Bali': 'ISLAND OF GODS',
    'Maldives': 'TROPICAL PARADISE',
    'France': 'CITY OF LIGHTS',
    'Italy': 'BEAUTIFUL COUNTRY',
    'Spain': 'LAND OF PASSION',
    'Greece': 'CRADLE OF CIVILIZATION',
    'Australia': 'LAND DOWN UNDER',
    'New Zealand': 'MIDDLE EARTH',
    'South Africa': 'RAINBOW NATION',
    'Mauritius': 'PEARL OF INDIAN OCEAN',
    'Sri Lanka': 'PEARL OF OCEAN',
    'Vietnam': 'LAND OF ASCENDING DRAGON',
    'Malaysia': 'TRULY ASIA',
    'Abu Dhabi': 'CITY OF GOLD',
    'United States': 'LAND OF OPPORTUNITY',
    'United Kingdom': 'UNITED KINGDOM',
    'Canada': 'GREAT WHITE NORTH',
  };
  return subtitles[countryName] || 'EXPLORE THE WORLD';
};

const InternationalTourPackages = () => {
  const [countries, setCountries] = useState<Country[]>([]);
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
    const fetchInternationalCountries = async () => {
      try {
        setLoading(true);

        // Fetch tour types and packages in parallel
        const [tourTypesResponse, packagesResponse] = await Promise.all([
          fetch("/api/tour-types"),
          fetch("/api/packages?tourType=international&limit=100")
        ]);

        if (!tourTypesResponse.ok) throw new Error("Failed to fetch International tour data");

        const tourTypesData = await tourTypesResponse.json();
        const packagesData = packagesResponse.ok ? await packagesResponse.json() : { packages: [] };
        const packages = Array.isArray(packagesData) ? packagesData : (packagesData.packages || []);

        // Find International tour type
        const internationalTourType = tourTypesData.tourTypes?.find((tour: any) => tour.tourType === 'international');

        if (!internationalTourType || !internationalTourType.countries) {
          setCountries([]);
          return;
        }

        // Group packages by country
        const packagesByCountry: { [key: string]: any[] } = {};
        packages.forEach((pkg: any) => {
          const country = pkg.country || 'Other';
          if (!packagesByCountry[country]) {
            packagesByCountry[country] = [];
          }
          packagesByCountry[country].push(pkg);
        });

        // Transform countries data to include image and price
        const countriesData: Country[] = internationalTourType.countries.map((country: any) => {
          // Get first destination/package image from this country
          let image = FALLBACK_IMAGE;
          let minPrice = 0;

          // Get image from first state's first destination
          if (country.states && country.states.length > 0) {
            const firstState = country.states[0];
            if (firstState.destinations && firstState.destinations.length > 0) {
              const firstItem = firstState.destinations[0];
              image = firstItem.image || FALLBACK_IMAGE;
            }
          }

          // Override with premium webp images if available
          const countryLower = country.name.toLowerCase();
          if (countryLower.includes('thailand')) image = '/Destination%20Pages/Thailand.webp';
          else if (countryLower.includes('malaysia')) image = '/Destination%20Pages/Malaysia.webp';
          else if (countryLower.includes('egypt')) image = '/Destination%20Pages/Egypt.webp';
          else if (countryLower.includes('indonesia')) image = '/Destination%20Pages/Indonesia.webp';
          else if (countryLower.includes('kenya')) image = '/Destination%20Pages/Kenya.webp';
          else if (countryLower.includes('maldives')) image = '/Destination%20Pages/Maldives.webp';
          else if (countryLower.includes('singapore')) image = '/Destination%20Pages/Singapore.webp';
          else if (countryLower.includes('united arab emirates') || countryLower.includes('dubai') || countryLower.includes('uae')) image = '/Destination%20Pages/United%20Arab%20Emirates.webp';

          // Get minimum price from packages for this country
          const countryPackages = packagesByCountry[country.name] || [];
          if (countryPackages.length > 0) {
            const prices = countryPackages
              .map((p: any) => p.price || 0)
              .filter((p: number) => p > 0);
            if (prices.length > 0) {
              minPrice = Math.min(...prices);
            }
          }

          // Count total destinations across all states
          const totalDestinations = country.states?.reduce((acc: number, state: any) => {
            return acc + (state.destinations?.length || 0);
          }, 0) || 0;

          return {
            name: country.name,
            image: image,
            price: minPrice,
            packagesCount: totalDestinations
          };
        });

        setCountries(countriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchInternationalCountries();
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

          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < countries.length) {
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
  }, [isMobile, currentIndex, countries.length]);

  const handlePrevious = () => {
    if (isMobile || currentIndex === 0) return;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (isMobile || currentIndex >= countries.length - 5) return;
    setCurrentIndex((prev) => Math.min(countries.length - 5, prev + 1));
  };

  if (loading) {
    return (
      <section className="py-16 bg-slate-200 px-4">
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

  if (error || countries.length === 0) {
    return null;
  }

  const visibleCountries = countries.slice(currentIndex, currentIndex + 5);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < countries.length - 5;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading styled similar to IndiaTourPackages */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              <span className="relative inline-block">
                <span className="relative z-10 block">
                  <span className="block">International Tour</span>
                  <span className="block">Packages</span>
                </span>
                <span className="absolute -left-2 -top-2 w-40 h-10 border-2 border-emerald-400 rounded-full border-dashed opacity-70" />
              </span>
            </h2>
            <p className="mt-3 text-sm md:text-base !text-slate-600">
              Discover stunning international destinations with expertly curated itineraries.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm text-sm text-emerald-800">
            <span className="text-base">🌍</span>
            <span className="font-semibold">Best-selling</span>
            <span className="text-slate-600">International experiences</span>
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
                {countries.map((country) => (
                  <Link
                    key={country.name}
                    href={`/package/international/${country.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex-shrink-0 w-[280px]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="bg-white rounded-t-3xl rounded-b-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <div className="relative h-72 w-full">
                        <Image
                          src={getImageUrl(country.image) || FALLBACK_IMAGE}
                          alt={country.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-4 py-5">
                          <div className="text-white">
                            <div className="text-[10px] font-medium uppercase tracking-wider opacity-90 mb-1">
                              {getCountrySubtitle(country.name)}
                            </div>
                            <div className="text-lg font-bold">
                              {country.name}
                            </div>
                            {country.price > 0 && (
                              <div className="text-xs font-medium mt-2 opacity-90">
                                Starting from ₹ {country.price.toLocaleString()}/-
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
              {visibleCountries.map((country) => (
                <Link
                  key={country.name}
                  href={`/package/international/${country.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex-1 max-w-[220px]"
                >
                  <div className="bg-white rounded-t-3xl rounded-b-lg shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="relative h-80 w-full">
                      <Image
                        src={getImageUrl(country.image) || FALLBACK_IMAGE}
                        alt={country.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-4 py-6">
                        <div className="text-white">
                          <div className="text-[10px] font-medium uppercase tracking-wider opacity-90 mb-1">
                            {getCountrySubtitle(country.name)}
                          </div>
                          <div className="text-xl font-bold">
                            {country.name}
                          </div>
                          {country.price > 0 && (
                            <div className="text-xs font-medium mt-2 opacity-90">
                              Starting from ₹ {country.price.toLocaleString()}/-
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

export default InternationalTourPackages;
