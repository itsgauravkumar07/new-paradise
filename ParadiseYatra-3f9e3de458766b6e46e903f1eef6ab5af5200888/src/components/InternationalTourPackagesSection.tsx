"use client";

import { useEffect, useRef, useState } from "react";
import DestinationCard from "./DestinationCard";
import CarouselArrows from "./ui/CarouselArrows";

interface InternationalDestination {
    id: number;
    name: string;
    image: string;
    href: string;
}

const InternationalTourPackagesSection = () => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [destinations, setDestinations] = useState<InternationalDestination[]>([]);
    const [loading, setLoading] = useState(true);

    const updateScrollState = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        const fetchInternationalCountriesData = async () => {
            try {
                setLoading(true);
                // Fetch packages from 'all-packages' collection where tourType is 'international'
                const response = await fetch("/api/all-packages?tourType=international&limit=200&isActive=true&minimal=true");

                if (!response.ok) {
                    throw new Error("Failed to fetch International packages");
                }

                const data = await response.json();
                const packages = data.packages || [];

                // Group by 'country' to get unique countries from the database
                const uniqueCountriesMap = new Map<string, InternationalDestination>();

                packages.forEach((pkg: any) => {
                    if (pkg.country && typeof pkg.country === 'string' && pkg.country.trim() !== '') {
                        const countryName = pkg.country.trim();
                        const countryKey = countryName.toLowerCase();

                        if (!uniqueCountriesMap.has(countryKey)) {
                            uniqueCountriesMap.set(countryKey, {
                                id: pkg._id, // Using the first package ID as key
                                name: countryName,
                                // Use the package image or a fallback
                                image: pkg.image || `https://picsum.photos/400/600?random=${uniqueCountriesMap.size + 200}`,
                                // Construct the link to /package/international/[country-slug]
                                href: `/package/international/${countryName.toLowerCase().replace(/\s+/g, '-')}`
                            });
                        }
                    }
                });

                const countriesList = Array.from(uniqueCountriesMap.values());
                setDestinations(countriesList);
            } catch (error) {
                console.error("Error fetching International countries from allpackages:", error);
                setDestinations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInternationalCountriesData();
    }, []);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener("scroll", updateScrollState);
            window.addEventListener("resize", updateScrollState);
            // Delay update to allow rendering
            if (destinations.length > 0) {
                setTimeout(updateScrollState, 100);
            }

            return () => {
                carousel.removeEventListener("scroll", updateScrollState);
                window.removeEventListener("resize", updateScrollState);
            };
        }
    }, [destinations]);

    const scrollByStep = (direction: number) => {
        if (carouselRef.current) {
            const card = carouselRef.current.querySelector("a");
            const gap = 16; // gap-4 = 16px
            const cardWidth = card ? card.getBoundingClientRect().width : 272;
            const step = cardWidth + gap;

            carouselRef.current.scrollBy({
                left: direction * step,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="bg-white pt-14 pb-30 px-4 text-gray-900 md:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header with Controls */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex-1 flex flex-col gap-2">
                        <span className="text-[#005beb] font-black uppercase tracking-wider text-xs flex items-center gap-2">
                            <span className="h-px w-8 bg-[#005beb]"></span>
                            World Awaits
                        </span>
                        <h2 className="!text-2xl !font-bold text-slate-900 md:text-3xl">
                            Across the World's Finest Places
                        </h2>
                        <p className="!text-sm !text-slate-600 md:text-base max-w-2xl font-semibold">
                            Embark on extraordinary adventures and discover iconic global destinations with our curated international tour packages.
                        </p>
                    </div>
                </div>

                {/* Carousel */}
                <div className="relative group/carousel">
                    {loading ? (
                        <div className="flex gap-4 overflow-hidden">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="min-w-[272px] h-[272px] bg-slate-100 rounded-lg animate-pulse border border-slate-200"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {destinations.length > 0 ? (
                                <>
                                    <CarouselArrows
                                        onPrevious={() => scrollByStep(-1)}
                                        onNext={() => scrollByStep(1)}
                                        canScrollLeft={canScrollLeft}
                                        canScrollRight={canScrollRight}
                                    />

                                    <div
                                        ref={carouselRef}
                                        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
                                        style={{
                                            scrollbarWidth: "none",
                                            msOverflowStyle: "none",
                                            scrollSnapType: "x mandatory",
                                        }}
                                    >
                                        {destinations.map((destination) => (
                                            <DestinationCard
                                                key={destination.id}
                                                name={destination.name}
                                                image={destination.image}
                                                href={destination.href}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 bg-slate-50 rounded-lg">
                                    <p className="text-slate-500 font-medium">No destinations found in database.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section >
    );
};

export default InternationalTourPackagesSection;
