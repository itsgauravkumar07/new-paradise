"use client"

import { useState, useEffect } from "react";
import { MapPin, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Package {
  _id: string;
  title: string;
  slug: string;
  price: number;
  duration: string;
  destination: string;
  state?: string;
  images: string[];
  category?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

type PriceFilterId = "all" | "under_50k" | "50k_1_5l" | "1_5l_2_5l" | "luxury";

const PRICE_FILTERS: {
  id: PriceFilterId;
  label: string;
  min?: number;
  max?: number;
}[] = [
  { id: "all", label: "All Budgets" },
  { id: "under_50k", label: "Under ₹50K", max: 50000 },
  { id: "50k_1_5l", label: "₹50K to ₹1.5L", min: 50000, max: 150000 },
  { id: "1_5l_2_5l", label: "₹1.5L to ₹2.5L", min: 150000, max: 250000 },
  { id: "luxury", label: "Luxury", min: 250000 },
];

const RecentlyBookedItineraries = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] =
    useState<string>("All Destinations");
  const [selectedPriceFilter, setSelectedPriceFilter] =
    useState<PriceFilterId>("all");
  const [loading, setLoading] = useState(true);
  const [isDestinationDropdownOpen, setIsDestinationDropdownOpen] =
    useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth < 768);
    updateMobileState();
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  // Close destination dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".destination-dropdown-container")) {
        setIsDestinationDropdownOpen(false);
      }
    };

    if (isDestinationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDestinationDropdownOpen]);

  // Fetch packages once
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/packages?limit=100");
        if (!response.ok) throw new Error("Failed to fetch packages");

        const data = await response.json();
        const packagesData: Package[] = Array.isArray(data)
          ? data
          : data.packages || [];

        setAllPackages(packagesData);

        // Extract unique destinations
        const uniqueDestinations = Array.from(
          new Set(
            packagesData
              .map((pkg) => pkg.destination)
              .filter((dest): dest is string => !!dest)
          )
        ).sort();

        setDestinations(uniqueDestinations);
      } catch (err) {
        console.error("Error fetching packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...allPackages];

    if (selectedDestination !== "All Destinations") {
      filtered = filtered.filter(
        (pkg) => pkg.destination === selectedDestination
      );
    }

    const priceFilter = PRICE_FILTERS.find(
      (filter) => filter.id === selectedPriceFilter
    );
    if (priceFilter && priceFilter.id !== "all") {
      filtered = filtered.filter((pkg) => {
        const price = pkg.price || 0;
        if (priceFilter.min && price < priceFilter.min) return false;
        if (priceFilter.max && price >= priceFilter.max) return false;
        return true;
      });
    }

    setPackages(filtered);
    setCurrentIndex(0);
  }, [selectedDestination, selectedPriceFilter, allPackages]);

  const handlePrevious = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const visibleCount = isMobile ? 1 : 3;
    const maxIndex = Math.max(0, packages.length - visibleCount);
    if (currentIndex >= maxIndex) return;
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const formatDuration = (duration: string) => {
    if (!duration) return "Contact for details";
    const match = duration.match(/^(\d+)N\/(\d+)D$/i);
    if (match) {
      const nights = match[1];
      return `${nights} nights / person`;
    }
    return `${duration} / person`;
  };

  const getCategoryTag = (category?: string) => {
    if (!category) return null;
    const categoryMap: { [key: string]: string } = {
      "Honeymoon Packages": "COUPLE",
      "Family Tours": "FAMILY",
      "Adventure Tours": "ADVENTURE",
      "Budget Tours": "BUDGET",
      "Luxury Tours": "LUXURY",
    };
    return categoryMap[category] || category.toUpperCase().split(" ")[0];
  };

  if (loading) {
    return (
      <section className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 bg-slate-200 rounded w-72 mb-6 animate-pulse" />
          <div className="h-9 bg-slate-100 rounded-full w-72 mb-10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-96 bg-slate-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const visibleCount = isMobile ? 1 : 4;
  const visiblePackages = isMobile
    ? packages.slice(currentIndex, currentIndex + 1)
    : packages.slice(currentIndex, currentIndex + visibleCount);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < packages.length - visibleCount;

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading + Badge */} 
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              <span className="relative inline-block">
                <span className="relative z-10 block">
                  <span className="block">Recently</span>
                  <span className="block">Booked</span>
                  <span className="block">Itineraries</span>
                </span>
                <span className="absolute -left-2 -top-2 w-32 h-10 border-2 border-green-400 rounded-full border-dashed opacity-70" />
              </span>
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 shadow-sm text-sm text-green-800">
            <span className="text-base">❤️</span>
            <span className="font-semibold">143+ trips</span>
            <span className="text-slate-600">booked last week</span>
          </div>
        </div>

        {/* Filters + Navigation */} 
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Destination Dropdown */} 
          <div className="relative destination-dropdown-container">
            <button
              onClick={() =>
                setIsDestinationDropdownOpen(!isDestinationDropdownOpen)
              }
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-full hover:border-blue-500 transition-colors shadow-sm"
            >
              <span className="text-sm font-medium text-slate-700">
                {selectedDestination}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-600 transition-transform ${
                  isDestinationDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDestinationDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-20 min-w-[220px] max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedDestination("All Destinations");
                    setIsDestinationDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                    selectedDestination === "All Destinations"
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-slate-700"
                  }`}
                >
                  All Destinations
                </button>
                {destinations.map((dest) => (
                  <button
                    key={dest}
                    onClick={() => {
                      setSelectedDestination(dest);
                      setIsDestinationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                      selectedDestination === dest
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700"
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Filters */} 
          <div className="flex flex-wrap items-center gap-2">
            {PRICE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedPriceFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium border transition-all ${
                  selectedPriceFilter === filter.id
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Desktop Navigation */} 
          {!isMobile && packages.length > visibleCount && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className={`w-9 h-9 rounded-full bg-white border border-slate-300 flex items-center justify-center transition-all ${
                  !canGoPrevious
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-50 hover:border-blue-500 cursor-pointer"
                }`}
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`w-9 h-9 rounded-full bg-white border border-slate-300 flex items-center justify-center transition-all ${
                  !canGoNext
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-50 hover:border-blue-500 cursor-pointer"
                }`}
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          )}
        </div>

        {/* Packages Grid */} 
        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">
              No itineraries found for the selected filters.
            </p>
          </div>
        ) : (
          <div className="relative">
            {isMobile ? (
              <div className="space-y-4">
                {visiblePackages.map((pkg) => (
                  <Link
                    key={pkg._id}
                    href={`/package/${pkg.slug}`}
                    className="block"
                  >
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative h-52 w-full">
                        <Image
                          src={getImageUrl(pkg.images[0]) || FALLBACK_IMAGE}
                          alt={pkg.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2">
                          {pkg.title}
                        </h3>
                        <div className="flex items-center text-xs text-slate-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{pkg.destination}</span>
                          {pkg.state && <span className="ml-1">• {pkg.state}</span>}
                        </div>
                        {getCategoryTag(pkg.category) && (
                          <span className="inline-block px-2 py-1 text-[11px] font-medium bg-pink-100 text-pink-700 rounded-full mb-3">
                            {getCategoryTag(pkg.category)}
                          </span>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <div className="text-xl font-bold text-slate-900">
                              ₹{pkg.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDuration(pkg.duration)}
                            </div>
                          </div>
                          <Button className="bg-green-600 hover:bg-green-700 text-white px-5 h-9">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {visiblePackages.map((pkg) => (
                  <Link
                    key={pkg._id}
                    href={`/package/${pkg.slug}`}
                    className="block"
                  >
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                      <div className="relative h-52 w-full">
                        <Image
                          src={getImageUrl(pkg.images[0]) || FALLBACK_IMAGE}
                          alt={pkg.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="!text-sm !font-semibold text-slate-900 mb-2 line-clamp-2 min-h-[40px]">
                          {pkg.title}
                        </h3>
                        <div className="flex items-center text-xs text-slate-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{pkg.destination}</span>
                          {pkg.state && (
                            <span className="ml-1 flex-shrink-0">• {pkg.state}</span>
                          )}
                        </div>
                        {getCategoryTag(pkg.category) && (
                          <span className="inline-block px-2 py-1 text-[11px] font-medium bg-pink-100 text-pink-700 rounded-full mb-4">
                            {getCategoryTag(pkg.category)}
                          </span>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <div className="text-2xl font-bold text-slate-900">
                              ₹{pkg.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDuration(pkg.duration)}
                            </div>
                          </div>
                          <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Navigation */}
            {isMobile && packages.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                  className={`w-9 h-9 rounded-full bg-white border border-slate-300 flex items-center justify-center transition-all ${
                    !canGoPrevious
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-50 hover:border-blue-500 cursor-pointer"
                  }`}
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <span className="text-xs text-slate-600">
                  {currentIndex + 1} / {packages.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className={`w-9 h-9 rounded-full bg-white border border-slate-300 flex items-center justify-center transition-all ${
                    !canGoNext
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-50 hover:border-blue-500 cursor-pointer"
                  }`}
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentlyBookedItineraries;

