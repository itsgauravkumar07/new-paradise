"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { getImageUrl, getDestinationWebp } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import LoginAlertModal from "./LoginAlertModal";
import PackageCard from "./ui/PackageCard";
import SectionHeader from "./ui/SectionHeader";
import CarouselArrows from "./ui/CarouselArrows";

interface TrendingPackage {
    id: string | number;
    destination: string;
    duration: string;
    title: string;
    price: number;
    originalPrice?: number;
    description?: string;
    image: string;
    imageAlt?: string;
    slug: string;
    rating?: number;
    inclusions?: string[];
}

// Robust helper to extract ID from any format
const getPackageId = (item: any): string => {
    if (!item) return "";
    if (typeof item === 'string') return item;
    if (typeof item === 'object') {
        const id = item._id || item.id;
        if (id && typeof id === 'object' && id.$oid) return id.$oid;
        if (id) return String(id);
    }
    return "";
};

const TrendingPackagesSection = () => {
    const [packages, setPackages] = useState<TrendingPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const { user } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    

    useEffect(() => {
        const fetchTrendingData = async () => {
            try {
                setLoading(true);
                // Fetch the 'trending' tag specifically to get its curated packages
                const response = await fetch("/api/tags/slug/trending", { cache: 'no-store' });

                if (!response.ok) {
                    throw new Error("Failed to fetch trending packages");
                }

                const json = await response.json();
                const packagesData = (json.success && json.data && json.data.packages) ? json.data.packages : [];

                // Map to TrendingPackage format
                const mappedPackages: TrendingPackage[] = packagesData.map((pkg: any) => {
                    const destination = pkg.location || pkg.destination || "India";
                    const packageImage =
                        getImageUrl(pkg.image) ||
                        getImageUrl(pkg.images?.[0]) ||
                        getDestinationWebp(destination) ||
                        "";
                    return {
                        id: pkg._id,
                        destination: destination,
                        duration: pkg.duration || "5N/6D",
                        title: pkg.name || pkg.title || "Trending Package",
                        price: pkg.price || 0,
                        originalPrice: Number(pkg.originalPrice) || undefined,
                        description: pkg.shortDescription || pkg.description || "",
                        image: packageImage,
                        slug: pkg.slug || pkg._id,
                        rating: typeof pkg.rating === "number" ? pkg.rating : undefined,
                        inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : undefined,
                    };
                });

                setPackages(mappedPackages);
            } catch (error) {
                console.error("Error fetching trending packages:", error);
                setPackages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingData();
    }, []);

    const updateScrollState = useCallback(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        setCanScrollLeft(carousel.scrollLeft > 5);
        setCanScrollRight(carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 5);
    }, []);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        updateScrollState();
        carousel.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);
        return () => {
            carousel.removeEventListener("scroll", updateScrollState);
            window.removeEventListener("resize", updateScrollState);
        };
    }, [packages.length, updateScrollState]);

    const scrollCards = (direction: 1 | -1) => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        const card = carousel.querySelector("article");
        const step = (card?.getBoundingClientRect().width ?? 280) + 24;
        carousel.scrollBy({ left: direction * step, behavior: "smooth" });
    };

    if (loading) {
        return (
            <section className="bg-background py-16">
                <div className="mx-auto max-w-7xl px-4 md:px-8">
                    <div className="mb-8 animate-pulse space-y-3">
                        <div className="h-9 w-72 rounded-xl bg-slate-200" />
                        <div className="h-4 w-96 max-w-full rounded-lg bg-slate-200" />
                    </div>
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-[420px] w-[280px] shrink-0 animate-pulse rounded-3xl bg-slate-200" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (packages.length === 0) return null;

    return (
        <section className="relative overflow-hidden bg-white py-14 md:py-16">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <SectionHeader
                    eyebrow="Traveller favourites"
                    eyebrowIcon={<Heart />}
                    titleClassName="!text-[24px] leading-tight tracking-tight sm:!text-3xl md:!text-3xl"
                    title="Popular Tour Packages"
                    description="Top-rated journeys our travellers keep coming back for, with stays, transfers and sightseeing planned for you."
                    action={
                        <div className="flex items-center gap-4">
                            {packages.length > 1 && (
                                <div className="hidden md:block">
                                    <CarouselArrows
                                        variant="compact"
                                        onPrevious={() => scrollCards(-1)}
                                        onNext={() => scrollCards(1)}
                                        canScrollLeft={canScrollLeft}
                                        canScrollRight={canScrollRight}
                                    />
                                </div>
                            )}
                        </div>
                    }
                />

                <div>
                    <div
                        ref={carouselRef}
                        className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-8 pt-2 scrollbar-hide touch-auto md:mx-0 md:scroll-px-1 md:gap-6 md:px-1"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
                    >
                        {packages.map((pkg, index) => (
                            <PackageCard
                                key={`${pkg.id}-${index}`}
                                id={pkg.id}
                                destination={pkg.destination}
                                duration={pkg.duration}
                                title={pkg.title}
                                price={pkg.price}
                                originalPrice={pkg.originalPrice}
                                description={pkg.description}
                                image={pkg.image}
                                imageAlt={pkg.imageAlt || pkg.title}
                                slug={pkg.slug}
                                hrefPrefix="/package"
                                priceLabel="Per Person"
                                rating={pkg.rating}
                                inclusions={pkg.inclusions}
                                // Phones: next card peeks in; desktop: exactly four across (3 gaps of 1.5rem)
                                className="w-[82%] max-w-[320px] snap-start sm:w-[300px] lg:w-[calc((100%-4.5rem-4px)/4)] lg:max-w-none"
                            />
                        ))}
                    </div>
                </div>
            </div>
            <LoginAlertModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} theme="blue" />
        </section>
    );
};

export default TrendingPackagesSection;
