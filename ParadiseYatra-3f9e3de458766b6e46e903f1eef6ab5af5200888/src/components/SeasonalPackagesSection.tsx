"use client";

import { useEffect, useRef, useState } from "react";
import DestinationCard from "./DestinationCard";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import CarouselArrows from "./ui/CarouselArrows";

interface SeasonalPackage {
    id: number;
    name: string;
    image: string;
    href: string;
}

const SeasonalPackagesSection = () => {
    const [seasonalTags, setSeasonalTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        const fetchSeasonalData = async () => {
            try {
                const response = await fetch('/api/tags');
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        // Filter tags that have "Seasonal" as parent slug
                        // Filter tags that have "Seasonal" as parent
                        const filtered = result.data.filter((tag: any) => {
                            if (!tag.parent) return false;

                            // Check if parent is populated object or just ID
                            if (typeof tag.parent === 'object') {
                                const pSlug = tag.parent.slug?.toLowerCase();
                                const pName = tag.parent.name?.toLowerCase();
                                return pSlug === 'seasonal' || pName === 'seasonal';
                            }
                            return false; // Cannot filter by ID alone if not populated
                        });
                        setSeasonalTags(filtered);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch seasonal tags", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeasonalData();
    }, []);

    const updateScrollState = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener("scroll", updateScrollState);
            window.addEventListener("resize", updateScrollState);
            updateScrollState();

            return () => {
                carousel.removeEventListener("scroll", updateScrollState);
                window.removeEventListener("resize", updateScrollState);
            };
        }
    }, []);

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
                {/* Header Style matching India Tour Package */}
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[#005beb] font-black uppercase tracking-wider text-xs flex items-center gap-2">
                            <span className="h-px w-8 bg-[#005beb]"></span>
                            Timeless Moments
                        </span>
                        <h2 className="!text-2xl !font-bold text-slate-900 md:text-3xl">
                            The Seasonal Travel Collection
                        </h2>
                        <p className="!text-sm !text-slate-600 md:text-base max-w-2xl font-semibold">
                            Explore the beauty of India through our handpicked journeys, curated for the perfect weather and peak seasonal experiences.
                        </p>
                    </div>

                    <Link
                        href="/package/theme/seasonal"
                        className="group flex items-center gap-2 text-[#005beb] font-bold text-sm transition-all duration-300 w-fit shrink-0"
                    >
                        View All Collections
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Carousel */}
                <div className="relative group/carousel">
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
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="min-w-[280px] h-[420px] bg-gray-100 animate-pulse rounded-2xl" />
                            ))
                        ) : seasonalTags.length > 0 ? (
                            seasonalTags.map((tag: any) => {
                                // Get image from the first package if tag.image is missing
                                let packageImage = null;
                                if (tag.packages && tag.packages.length > 0) {
                                    const pkg = tag.packages[0];
                                    packageImage = typeof pkg === 'object' ? pkg.image : null;
                                }

                                return (
                                    <DestinationCard
                                        key={tag._id}
                                        name={tag.name}
                                        image={tag.image || packageImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=280&h=420&auto=format&fit=crop"}
                                        href={`/package/theme/${tag.slug}`}
                                    />
                                );
                            })
                        ) : (
                            <div className="w-full text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
                                <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No seasonal collections available yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SeasonalPackagesSection;
