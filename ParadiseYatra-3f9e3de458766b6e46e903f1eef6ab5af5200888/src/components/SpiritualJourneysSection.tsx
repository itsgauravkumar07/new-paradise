"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { getImageUrl, getDestinationWebp } from "@/lib/utils";
import PackageCard from "./ui/PackageCard";
import { useAuth } from "@/context/AuthContext";
import LoginAlertModal from "./LoginAlertModal";
import CarouselArrows from "./ui/CarouselArrows";

interface SpiritualDestination {
    id: string | number;
    destination: string;
    duration: string;
    title: string;
    price: number;
    image: string;
    slug: string;
}

const SpiritualJourneysSection = () => {
    const [destinations, setDestinations] = useState<SpiritualDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const carouselRef = useRef<HTMLDivElement>(null);
    const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const { user } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    

    useEffect(() => {
        const fetchSpiritualData = async () => {
            try {
                setLoading(true);

                const [tagRes, allTagsRes] = await Promise.all([
                    fetch("/api/tags/slug/spiritual", { cache: 'no-store' }),
                    fetch("/api/tags", { cache: 'no-store' })
                ]);

                const tagResult = await tagRes.json();
                const allTagsResult = await allTagsRes.json();

                let spiritualTag = tagResult.success ? tagResult.data : null;
                const allTags = allTagsResult.success ? allTagsResult.data : [];

                if (!spiritualTag) {
                    spiritualTag = allTags.find((t: any) => {
                        const slug = t.slug?.toLowerCase() || "";
                        const name = t.name?.toLowerCase() || "";
                        return slug.includes("spiritual") || name.includes("spiritual");
                    });
                }

                if (spiritualTag) {
                    const subTags = allTags.filter((t: any) => {
                        const parent = t.parent;
                        if (!parent) return false;
                        const parentId = typeof parent === 'string' ? parent : parent._id;
                        return String(parentId) === String(spiritualTag._id);
                    });

                    let finalItems: any[] = [];

                    if (subTags.length > 0) {
                        finalItems = subTags.map((t: any) => ({
                            id: t._id,
                            title: t.name,
                            image: getImageUrl(t.image) || (t.packages?.[0]?.image ? getImageUrl(t.packages[0].image) : "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=2000&auto=format&fit=crop"),
                            slug: t.slug,
                            price: 0,
                            duration: "Varies",
                            destination: "India"
                        }));
                    }

                    if (spiritualTag.packages && spiritualTag.packages.length > 0) {
                        const packageItems = spiritualTag.packages.map((pkg: any) => ({
                            id: pkg._id || pkg.id,
                            title: pkg.name || pkg.title || "Spiritual Package",
                            image: getImageUrl(pkg.image) || (pkg.images?.[0] ? getImageUrl(pkg.images[0]) : "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=2000&auto=format&fit=crop"),
                            slug: pkg.slug,
                            price: pkg.price || 15000,
                            duration: pkg.duration || "4N/5D",
                            destination: pkg.location || "India"
                        }));

                        const existingIds = new Set(finalItems.map((item: any) => item.id));
                        packageItems.forEach((item: any) => {
                            if (!existingIds.has(item.id)) {
                                finalItems.push(item);
                            }
                        });
                    }

                    finalItems.forEach((item: any) => {
                        const nameLower = item.title.toLowerCase();
                        const slugLower = (item.slug || "").toLowerCase();
                        if (nameLower.includes('char dham') || slugLower.includes('char-dham') || nameLower.includes('uttarakhand')) {
                            item.image = getDestinationWebp('uttarakhand') || item.image;
                        }
                    });

                    setDestinations(finalItems);
                } else {
                    setDestinations([]);
                }
            } catch (error) {
                console.error("Error fetching spiritual data:", error);
                setDestinations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSpiritualData();
    }, []);

    const updateScrollState = useCallback(() => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    }, []);

    const getMaxScroll = useCallback(() => {
        if (!carouselRef.current) return 0;
        return carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
    }, []);

    const getStep = useCallback(() => {
        if (!carouselRef.current) return 0;
        const card = carouselRef.current.querySelector("article");
        if (!card) return 0;
        const gap = 24;
        return card.getBoundingClientRect().width + gap;
    }, []);

    const startAutoScroll = useCallback(() => {
        if (autoScrollRef.current) {
            clearInterval(autoScrollRef.current);
        }

        autoScrollRef.current = setInterval(() => {
            if (!carouselRef.current || isHovered) return;

            const maxScroll = getMaxScroll();
            if (maxScroll <= 0) return;

            const currentScroll = carouselRef.current.scrollLeft;

            if (currentScroll >= maxScroll - 1) {
                stopAutoScroll();
                setTimeout(() => {
                    if (carouselRef.current && !isHovered) {
                        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
                        startAutoScroll();
                    }
                }, 2000);
            } else {
                carouselRef.current.scrollLeft += 1;
            }
        }, 20);
    }, [isHovered, getMaxScroll]);

    const stopAutoScroll = useCallback(() => {
        if (autoScrollRef.current) {
            clearInterval(autoScrollRef.current);
            autoScrollRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (destinations.length > 0) {
            if (isHovered) {
                stopAutoScroll();
            } else {
                startAutoScroll();
            }
        }

        const handleTouchStart = () => stopAutoScroll();
        const handleTouchEnd = () => {
            if (!isHovered) {
                setTimeout(startAutoScroll, 2000);
            }
        };

        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
            carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
            carousel.addEventListener("scroll", updateScrollState);
            window.addEventListener("resize", updateScrollState);
            updateScrollState();
        }

        return () => {
            stopAutoScroll();
            if (carousel) {
                carousel.removeEventListener('touchstart', handleTouchStart);
                carousel.removeEventListener('touchend', handleTouchEnd);
                carousel.removeEventListener("scroll", updateScrollState);
                window.removeEventListener("resize", updateScrollState);
            }
        };
    }, [isHovered, startAutoScroll, stopAutoScroll, destinations, updateScrollState]);

    const handlePrev = () => {
        if (isScrolling || !carouselRef.current) return;
        setIsScrolling(true);
        const step = getStep();
        carouselRef.current.scrollBy({ left: -step, behavior: "smooth" });
        setTimeout(() => setIsScrolling(false), 500);
    };

    const handleNext = () => {
        if (isScrolling || !carouselRef.current) return;
        setIsScrolling(true);
        const step = getStep();
        const maxScroll = getMaxScroll();
        const currentScroll = carouselRef.current.scrollLeft;

        if (currentScroll >= maxScroll - 10) {
            carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            carouselRef.current.scrollBy({ left: step, behavior: "smooth" });
        }
        setTimeout(() => setIsScrolling(false), 500);
    };

    return (
        <section className="bg-white pt-20 pb-14 px-4 text-gray-900 md:px-8 relative z-20 overflow-hidden min-h-[500px] -mt-12 md:-mt-24 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-20px_50px_0px_rgba(0,0,0,0.1)]">
            <div className="mx-auto max-w-6xl">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[#005beb] !font-black uppercase tracking-wider text-xs flex items-center gap-2">
                            <span className="h-px w-8 bg-[#005beb]"></span>
                            Divine India
                        </span>
                        <h2 className="!text-2xl !font-bold text-slate-900 md:text-3xl">
                            A Journey Through Sacred India
                        </h2>
                        <p className="!text-sm !text-slate-600 md:text-base max-w-2xl font-semibold">
                            Find peace and divine connection with our handpicked pilgrimage packages across India's most revered temples and sacred cities.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* <CarouselArrows 
                            canScrollLeft={canScrollLeft}
                            canScrollRight={canScrollRight}
                            onPrevious={handlePrev}
                            onNext={handleNext}
                            variant="compact"
                        /> */}
                        <Link
                            href="/package/theme/spiritual"
                            className="hidden md:flex items-center gap-2 text-[#005beb] font-bold text-sm transition-all duration-300 w-fit shrink-0 group"
                        >
                            View All Packages
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="flex gap-4 overflow-x-hidden pb-6 pt-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="min-w-[85vw] sm:min-w-[340px] h-[400px] bg-gray-100 rounded-[6px] animate-pulse"></div>
                        ))}
                    </div>
                ) : destinations.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        No spiritual journeys available at the moment.
                    </div>
                ) : (
                    <div 
                        className="relative group/carousel"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div 
                            ref={carouselRef}
                            className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:gap-6 touch-auto"
                            style={{
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                                scrollSnapType: "x proximity",
                                WebkitOverflowScrolling: "touch"
                            }}
                        >
                        {destinations.map((pkg) => (
                            <div key={pkg.id} className="snap-start w-fit shrink-0">
                                <PackageCard 
                                    id={pkg.id}
                                    destination={pkg.destination}
                                    duration={pkg.duration}
                                    title={pkg.title}
                                    price={pkg.price}
                                    image={pkg.image}
                                    slug={pkg.slug}
                                    hrefPrefix="/package"
                                    themeColor="#005beb"
                                    priceLabel="Per Person"
                                                                                                        />
                            </div>
                        ))}
                        </div>
                    </div>
                )}
                
                <div className="mt-8 flex justify-center md:hidden">
                    <Link
                        href="/package/theme/spiritual"
                        className="flex items-center gap-2 text-[#005beb] font-bold text-sm transition-all duration-300 w-fit shrink-0 group"
                    >
                        View All Packages
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <LoginAlertModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
            />
        </section>
    );
};

export default SpiritualJourneysSection;
