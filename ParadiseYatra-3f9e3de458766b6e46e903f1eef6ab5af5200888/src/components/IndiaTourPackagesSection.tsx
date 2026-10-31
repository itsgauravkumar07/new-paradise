"use client";

import { useEffect, useRef, useState } from "react";
import DestinationCard from "./DestinationCard";
import CarouselArrows from "./ui/CarouselArrows";

interface IndiaDestination {
    id: number;
    name: string;
    image: string;
    href: string;
}

const IndiaTourPackagesSection = () => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [destinations, setDestinations] = useState<IndiaDestination[]>([]);
    const [loading, setLoading] = useState(true);

    const updateScrollState = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        const fetchIndiaStatesData = async () => {
            try {
                setLoading(true);
                // Fetch packages from 'all-packages' collection where tourType is 'india'
                const response = await fetch("/api/all-packages?tourType=india&limit=200&isActive=true&minimal=true");
                if (!response.ok) {
                    throw new Error("Failed to fetch India packages");
                }

                const data = await response.json();
                const packages = data.packages || [];

                // Group by 'state' to get unique states from the database
                const uniqueStatesMap = new Map<string, IndiaDestination>();

                packages.forEach((pkg: any) => {
                    if (pkg.state && typeof pkg.state === 'string' && pkg.state.trim() !== '') {
                        const stateName = pkg.state.trim();
                        const stateKey = stateName.toLowerCase();

                        if (!uniqueStatesMap.has(stateKey)) {
                            uniqueStatesMap.set(stateKey, {
                                id: pkg._id, // Using the first package ID as key
                                name: stateName,
                                // Specific hero images for major destinations
                                image: (stateName.toLowerCase().includes('sikkim') ||
                                    stateName.toLowerCase().includes('gangtok') ||
                                    stateName.toLowerCase().includes('kalimpong'))
                                    ? '/Destination%20Pages/Sikkim.webp'
                                    : (stateName.toLowerCase().includes('andaman'))
                                        ? '/Destination%20Pages/Andaman%20and%20Nicobar%20Island.webp'
                                        : (stateName.toLowerCase().includes('kashmir') ||
                                            stateName.toLowerCase().includes('jammu'))
                                            ? '/Destination%20Pages/Jammu%20and%20Kashmir.webp'
                                            : (stateName.toLowerCase().includes('rajasthan'))
                                                ? '/Destination%20Pages/Rajasthan.webp'
                                                : (stateName.toLowerCase().includes('uttarakhand'))
                                                    ? '/Destination%20Pages/Uttarakhand.webp'
                                                    : (stateName.toLowerCase().includes('goa'))
                                                        ? '/Destination%20Pages/Goa.webp'
                                                        : (stateName.toLowerCase().includes('kerala'))
                                                            ? '/Destination%20Pages/Kerala.webp'
                                                            : (stateName.toLowerCase().includes('himachal'))
                                                                ? '/Destination%20Pages/Himachal%20Pradesh.webp'
                                                                : (stateName.toLowerCase().includes('ladakh'))
                                                                    ? '/Destination%20Pages/Ladakh.webp'
                                                                    : (stateName.toLowerCase().replace(/-/g, ' ').includes('tamil nadu') ||
                                                                        stateName.toLowerCase().replace(/-/g, ' ').includes('ooty') ||
                                                                        stateName.toLowerCase().replace(/-/g, ' ').includes('chennai') ||
                                                                        stateName.toLowerCase().replace(/-/g, ' ').includes('madurai'))
                                                                        ? '/Destination%20Pages/Tamil%20Nadu.webp'
                                                                        : (stateName.toLowerCase().replace(/-/g, ' ').includes('thailand'))
                                                                            ? '/Destination%20Pages/Thailand.webp'
                                                                            : (stateName.toLowerCase().replace(/-/g, ' ').includes('malaysia'))
                                                                                ? '/Destination%20Pages/Malaysia.webp'
                                                                                : (stateName.toLowerCase().replace(/-/g, ' ').includes('egypt'))
                                                                                    ? '/Destination%20Pages/Egypt.webp'
                                                                                    : (pkg.image || `https://picsum.photos/400/600?random=${uniqueStatesMap.size}`),
                                // Construct the link to /package/india/[state-slug]
                                href: `/package/india/${stateName.toLowerCase().replace(/\s+/g, '-')}`
                            });
                        }
                    }
                });

                const statesList = Array.from(uniqueStatesMap.values());
                setDestinations(statesList);
            } catch (error) {
                console.error("Error fetching India states from allpackages:", error);
                setDestinations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchIndiaStatesData();
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
        <section className="bg-white py-14 px-4 text-gray-900 md:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header with Controls */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex-1 flex flex-col gap-2">
                        <span className="text-[#005beb] font-black uppercase tracking-wider text-xs flex items-center gap-2">
                            <span className="h-px w-8 bg-[#005beb]"></span>
                            Incredible India
                        </span>
                        <h2 className="!text-2xl !font-bold text-slate-900 md:text-3xl">
                            Signature Destinations Of India
                        </h2>
                        <p className="!text-sm !text-slate-600 md:text-base max-w-2xl font-semibold">
                            Discover the soul of Incredible India through our handpicked collection of iconic landmarks and cultural wonders.
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

export default IndiaTourPackagesSection;
