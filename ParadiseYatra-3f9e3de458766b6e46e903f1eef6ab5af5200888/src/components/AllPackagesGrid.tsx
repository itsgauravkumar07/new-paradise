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

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const AllPackagesGrid = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [allPackages, setAllPackages] = useState<Package[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [selectedState, setSelectedState] = useState<string>("All States");
    const [loading, setLoading] = useState(true);
    const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const updateMobileState = () => setIsMobile(window.innerWidth < 768);
        updateMobileState();
        window.addEventListener("resize", updateMobileState);
        return () => window.removeEventListener("resize", updateMobileState);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.state-dropdown-container')) {
                setIsStateDropdownOpen(false);
            }
        };

        if (isStateDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isStateDropdownOpen]);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/packages?limit=100");
                if (!response.ok) throw new Error("Failed to fetch packages");

                const data = await response.json();
                const packagesData = Array.isArray(data) ? data : (data.data || data.packages || []);

                setAllPackages(packagesData);
                setPackages(packagesData);

                // Extract unique states
                const uniqueStates = Array.from(
                    new Set(
                        packagesData
                            .map((pkg: Package) => pkg.state)
                            .filter((state: string | undefined): state is string => !!state)
                    )
                ).sort() as string[];

                setStates(uniqueStates);
            } catch (err) {
                console.error("Error fetching packages:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    useEffect(() => {
        if (selectedState === "All States") {
            setPackages(allPackages);
        } else {
            const filtered = allPackages.filter(
                (pkg) => pkg.state === selectedState
            );
            setPackages(filtered);
        }
        setCurrentIndex(0);
    }, [selectedState, allPackages]);

    const handlePrevious = () => {
        if (currentIndex === 0) return;
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        const maxIndex = Math.max(0, packages.length - (isMobile ? 1 : 3));
        if (currentIndex >= maxIndex) return;
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    };

    const formatDuration = (duration: string) => {
        if (!duration) return "Contact for details";
        const match = duration.match(/^(\d+)N\/(\d+)D$/i);
        if (match) {
            const nights = match[1];
            return `${nights} nights`;
        }
        return duration;
    };

    const getCategoryTag = (category?: string) => {
        if (!category) return null;
        const categoryMap: { [key: string]: string } = {
            'Honeymoon Packages': 'COUPLE',
            'Family Tours': 'FAMILY',
            'Adventure Tours': 'ADVENTURE',
            'Budget Tours': 'BUDGET',
            'Luxury Tours': 'LUXURY',
        };
        return categoryMap[category] || category.toUpperCase().split(' ')[0];
    };

    if (loading) {
        return (
            <section className="py-16 bg-white px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="h-8 bg-slate-200 rounded w-64 mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-96 bg-slate-200 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    const visiblePackages = isMobile
        ? packages.slice(currentIndex, currentIndex + 1)
        : packages.slice(currentIndex, currentIndex + 3);

    const canGoPrevious = currentIndex > 0;
    const canGoNext = currentIndex < packages.length - (isMobile ? 1 : 3);

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Heading */}
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                        <span className="relative">
                            All Packages
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-green-500/30" style={{ height: '3px', borderRadius: '2px' }}></span>
                        </span>
                    </h2>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    {/* State Dropdown */}
                    <div className="relative state-dropdown-container">
                        <button
                            onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:border-blue-500 transition-colors"
                        >
                            <span className="text-sm font-medium text-slate-700">
                                {selectedState}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isStateDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isStateDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-20 min-w-[200px] max-h-60 overflow-y-auto">
                                <button
                                    onClick={() => {
                                        setSelectedState("All States");
                                        setIsStateDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${selectedState === "All States" ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                                        }`}
                                >
                                    All States
                                </button>
                                {states.map((state) => (
                                    <button
                                        key={state}
                                        onClick={() => {
                                            setSelectedState(state);
                                            setIsStateDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${selectedState === state ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                                            }`}
                                    >
                                        {state}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    {!isMobile && packages.length > 3 && (
                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                onClick={handlePrevious}
                                disabled={!canGoPrevious}
                                className={`w-10 h-10 rounded-full bg-white border border-slate-300 flex items-center justify-center transition-all ${!canGoPrevious
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
                                className={`w-10 h-10 rounded-full bg-white border border-slate-300 flex items-center justify-center transition-all ${!canGoNext
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
                        <p className="text-slate-600">No packages found for the selected state.</p>
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
                                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <div className="relative h-48 w-full">
                                                <Image
                                                    src={getImageUrl(pkg.images[0]) || FALLBACK_IMAGE}
                                                    alt={pkg.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                                                    {pkg.title}
                                                </h3>
                                                <div className="flex items-center text-sm text-slate-600 mb-2">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    <span>{pkg.destination}</span>
                                                    {pkg.state && <span className="ml-1">• {pkg.state}</span>}
                                                </div>
                                                {getCategoryTag(pkg.category) && (
                                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-pink-100 text-pink-700 rounded-full mb-3">
                                                        {getCategoryTag(pkg.category)}
                                                    </span>
                                                )}
                                                <div className="flex items-center justify-between mt-4">
                                                    <div>
                                                        <div className="text-2xl font-bold text-slate-900">
                                                            ₹{pkg.price.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {formatDuration(pkg.duration)} / person
                                                        </div>
                                                    </div>
                                                    <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {visiblePackages.map((pkg) => (
                                    <Link
                                        key={pkg._id}
                                        href={`/package/${pkg.slug}`}
                                        className="block"
                                    >
                                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                                            <div className="relative h-56 w-full">
                                                <Image
                                                    src={getImageUrl(pkg.images[0]) || FALLBACK_IMAGE}
                                                    alt={pkg.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-[56px]">
                                                    {pkg.title}
                                                </h3>
                                                <div className="flex items-center text-sm text-slate-600 mb-3">
                                                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                                    <span className="truncate">{pkg.destination}</span>
                                                    {pkg.state && <span className="ml-1 flex-shrink-0">• {pkg.state}</span>}
                                                </div>
                                                {getCategoryTag(pkg.category) && (
                                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-pink-100 text-pink-700 rounded-full mb-4">
                                                        {getCategoryTag(pkg.category)}
                                                    </span>
                                                )}
                                                <div className="flex items-center justify-between mt-4">
                                                    <div>
                                                        <div className="text-2xl font-bold text-slate-900">
                                                            ₹{pkg.price.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {formatDuration(pkg.duration)} / person
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
                                    className={`w-10 h-10 rounded-full bg-white border border-slate-300 flex items-center justify-center transition-all ${!canGoPrevious
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-blue-50 hover:border-blue-500 cursor-pointer"
                                        }`}
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                                </button>
                                <span className="text-sm text-slate-600">
                                    {currentIndex + 1} / {packages.length}
                                </span>
                                <button
                                    onClick={handleNext}
                                    disabled={!canGoNext}
                                    className={`w-10 h-10 rounded-full bg-white border border-slate-300 flex items-center justify-center transition-all ${!canGoNext
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

export default AllPackagesGrid;
