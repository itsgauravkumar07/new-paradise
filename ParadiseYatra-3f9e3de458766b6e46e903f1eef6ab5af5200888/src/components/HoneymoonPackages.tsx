"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { getImageUrl, getDestinationWebp } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import LoginAlertModal from "./LoginAlertModal";
import PackageCard from "./ui/PackageCard";
import CarouselArrows from "./ui/CarouselArrows";

interface HoneymoonPackage {
    id: string | number;
    destination: string;
    duration: string;
    title: string;
    price: number;
    image: string;
    imageAlt?: string;
    slug: string;
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

const HoneymoonPackages = () => {
    const [packages, setPackages] = useState<HoneymoonPackage[]>([]);
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
        const fetchHoneymoonData = async () => {
            try {
                setLoading(true);
                // Fetch the 'honeymoon' tag specifically to get its curated packages
                const response = await fetch("/api/tags/slug/honeymoon", { cache: 'no-store' });

                if (!response.ok) {
                    throw new Error("Failed to fetch Where Love Takes You");
                }

                const json = await response.json();
                const packagesData = (json.success && json.data && json.data.packages) ? json.data.packages : [];

                // Map to HoneymoonPackage format
                const mappedPackages: HoneymoonPackage[] = packagesData.map((pkg: any) => {
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
                        title: pkg.name || pkg.title || "Honeymoon Package",
                        price: pkg.price || 0,
                        image: packageImage,
                        slug: pkg.slug || pkg._id,
                    };
                });

                setPackages(mappedPackages);
            } catch (error) {
                console.error("Error fetching Where Love Takes You:", error);
                setPackages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHoneymoonData();
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
        if (packages.length > 0) {
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
    }, [isHovered, startAutoScroll, stopAutoScroll, packages, updateScrollState]);

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

    if (loading) {
        return (
            <section className="bg-white px-4 py-16 text-gray-900 md:px-8 relative z-20">
                <div className="mx-auto flex max-w-6xl flex-col gap-10">
                    <div className="flex animate-pulse flex-col gap-4">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-8 w-64 bg-gray-200 rounded"></div>
                        <div className="h-4 w-96 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="min-w-[265px] h-96 bg-gray-100 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (packages.length === 0) return null;

    return (
        <section 
            className="px-4 py-16 text-white md:px-8 relative z-20 overflow-hidden min-h-[600px]"
            style={{
                backgroundImage: "url('/Home/Hero/Pick Your Style Background.jpg')",
                backgroundSize: "cover",
            }}
        >
            {/* Dark overlay with blur for better readability */}
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="mx-auto flex max-w-6xl flex-col gap-10 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[#ff1493] font-black tracking-wider text-xs uppercase flex items-center gap-2">
                            <span className="h-px w-8 bg-[#ff1493]"></span>
                            Where Love Takes You
                        </span>
                        <h2 className="!text-2xl md:text-3xl !font-bold text-white leading-tight flex items-center gap-3 flex-wrap">
                            Honeymoon Packages
                        </h2>

                        <p className="!text-sm !text-white md:text-base max-w-2xl font-semibold">
                            Curated romantic escapes with luxury stays, candlelit dinners and unforgettable moments.
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
                            href="/package/theme/honeymoon"
                            className="hidden md:flex items-center gap-2 text-[#ff1493] font-bold text-sm transition-all duration-300 w-fit shrink-0 group"
                        >
                            View All Packages
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div 
                    className="relative group/carousel"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div 
                        ref={carouselRef}
                        className="flex gap-4 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:gap-6 touch-auto"
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            scrollSnapType: "x proximity",
                            WebkitOverflowScrolling: "touch"
                        }}
                    >
                        {packages.map((pkg, index) => (
                            <div 
                                key={`${pkg.id}-${index}`}
                                className="snap-start w-fit shrink-0"
                            >
                                <PackageCard
                                    id={pkg.id}
                                    destination={pkg.destination}
                                    duration={pkg.duration}
                                    title={pkg.title}
                                    price={pkg.price}
                                    image={pkg.image}
                                    imageAlt={pkg.imageAlt || pkg.title}
                                    slug={pkg.slug}
                                    hrefPrefix="/package"
                                    themeColor="#ff1493"
                                    priceLabel="Per Couple"
                                    showDestination={false}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex justify-center md:hidden">
                    <Link
                        href="/package/theme/honeymoon"
                        className="flex items-center gap-2 text-[#ff1493] font-bold text-sm transition-all duration-300 w-fit shrink-0 group"
                    >
                        View All Packages
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
            <LoginAlertModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} theme="pink" />
        </section>
    );
};

export default HoneymoonPackages;
