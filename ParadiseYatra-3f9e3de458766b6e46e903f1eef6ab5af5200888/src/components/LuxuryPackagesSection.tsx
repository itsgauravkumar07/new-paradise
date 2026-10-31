"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, MapPin } from "lucide-react";
import { getImageUrl, getDestinationWebp } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import LoginAlertModal from "./LoginAlertModal";
import CarouselArrows from "./ui/CarouselArrows";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TruncatedText from "@/components/ui/truncated-text";

interface LuxuryPackage {
    _id: string;
    destination: string;
    duration: string;
    title: string;
    price: number;
    images: string[];
    slug: string;
    shortDescription?: string;
}

const LuxuryPackagesSection = () => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [packages, setPackages] = useState<LuxuryPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const { user } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    

    const updateScrollState = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        const fetchLuxuryPackages = async () => {
            try {
                setLoading(true);
                // Fetch the 'luxury' tag specifically to get its curated packages from the all-packages system
                const response = await fetch("/api/tags/slug/luxury", { cache: 'no-store' });

                if (!response.ok) {
                    throw new Error("Failed to fetch luxury packages");
                }

                const json = await response.json();
                const packagesData = (json.success && json.data && json.data.packages) ? json.data.packages : [];

                // Map to LuxuryPackage format with fallbacks
                const mappedPackages: LuxuryPackage[] = packagesData.map((pkg: any) => {
                    const destination = pkg.location || pkg.destination || pkg.state || pkg.country || "India";
                    const packageImage = getImageUrl(pkg.image) || getImageUrl(pkg.images?.[0]);
                    const fallbackImage = getDestinationWebp(destination);
                    return {
                        _id: pkg._id,
                        destination: destination,
                        duration: pkg.duration || "5N/6D",
                        title: pkg.name || pkg.title || "Luxury Package",
                        price: pkg.price || 0,
                        images: packageImage ? [packageImage] : (fallbackImage ? [fallbackImage] : (pkg.images || [])),
                        slug: pkg.slug || pkg._id,
                        shortDescription: pkg.shortDescription || "",
                    };
                });

                setPackages(mappedPackages);

            } catch (error) {
                console.error("Error fetching luxury packages:", error);
                setPackages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLuxuryPackages();
    }, []);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener("scroll", updateScrollState);
            window.addEventListener("resize", updateScrollState);
            // Initial update
            setTimeout(updateScrollState, 100);

            return () => {
                carousel.removeEventListener("scroll", updateScrollState);
                window.removeEventListener("resize", updateScrollState);
            };
        }
    }, [packages]); // Re-run when packages load

    const scrollByStep = (direction: number) => {
        if (carouselRef.current) {
            const card = carouselRef.current.querySelector("article");
            const gap = 24; // gap-6 = 24px
            const cardWidth = card ? card.getBoundingClientRect().width : 254;
            const step = cardWidth + gap;

            carouselRef.current.scrollBy({
                left: direction * step,
                behavior: "smooth",
            });
        }
    };

    // Fallback image if needed
    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";

    if (loading) {
        // Render a simple loading state or skeleton if desired, 
        // effectively keeping the section height but empty or with logic
        return (
            <section
                className="px-4 py-14 text-gray-900 md:px-8 relative z-20 overflow-hidden min-h-[600px]"
                style={{
                    backgroundImage: "url('/Home/Luxury/Background.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
                    {/* Header matches structure */}
                    <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between mb-6">
                        <div className="h-8 w-64 bg-white/20 animate-pulse rounded"></div>
                    </div>
                </div>
            </section>
        )
    }

    if (packages.length === 0) {
        return (
            <section
                className="px-4 py-14 text-gray-900 md:px-8 relative z-20 overflow-hidden min-h-[600px]"
                style={{
                    backgroundImage: "url('/Home/Luxury/Background.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative mx-auto flex max-w-6xl flex-col gap-10 items-center justify-center h-full pt-20">
                    <h3
                        className="text-2xl !font-bold text-white md:text-3xl text-center"
                        style={{ fontFamily: "'Orange Avenue', serif" }}
                    >
                        No luxury packages available at the moment
                    </h3>
                </div>
            </section>
        );
    }

    return (
        <section
            className="px-4 py-14 text-white md:px-8 relative z-20 overflow-hidden min-h-[600px]"
            style={{
                backgroundImage: "url('/Home/Hero/Pick Your Style Background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-2">
                    <div className="flex flex-col gap-1">

                        <span className="text-[#005beb] font-black uppercase tracking-wider text-xs flex items-center gap-2">
                            <span className="h-px w-8 bg-[#005beb]"></span>
                            Journeys of Royal Indulgence
                        </span>

                        <h2 className="!text-2xl !font-bold text-white md:text-3xl">
                            Luxury Tour Packages
                        </h2>
                        <p className="!text-sm !text-white md:text-base max-w-2xl font-semibold">
                            Experience the ultimate in travel excellence with our handpicked collection of elite escapes.
                        </p>

                    </div>

                    <Link
                        href="/package/theme/luxury"
                        className="hidden md:flex items-center gap-2 text-[#005beb] font-bold text-sm transition-all duration-300 w-fit shrink-0 group hover:text-white"
                    >
                        View All Luxury
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Carousel */}
                <div className="relative group/carousel">
                    {/* Floating Navigation Buttons */}
                    <CarouselArrows
                        onPrevious={() => scrollByStep(-1)}
                        onNext={() => scrollByStep(1)}
                        canScrollLeft={canScrollLeft}
                        canScrollRight={canScrollRight}
                    />

                    <div
                        ref={carouselRef}
                        className="flex gap-2 overflow-x-auto scroll-smooth py-2 scrollbar-hide px-2"
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            scrollSnapType: "x mandatory",
                        }}
                    >
                        {packages.map((pkg) => (
                            <Link href={`/package/${pkg.slug || pkg._id}`} key={pkg._id} className="block h-full">
                                <Card className="group overflow-hidden hover-lift rounded-3xl shadow-xl border border-amber-200/20 bg-gradient-to-br from-gray-900 via-gray-900 to-black scroll-snap-align-center md:scroll-snap-align-start transition-all duration-300 relative w-[300px] min-w-[300px] md:w-[320px] md:min-w-[320px] max-w-[300px] md:max-w-[320px] h-full flex flex-col min-h-[540px]">
                                    {/* Fixed height image container */}
                                    <div className="relative h-56 overflow-hidden card-image rounded-t-3xl w-full flex-shrink-0">
                                        <Image
                                            src={getImageUrl(pkg.images?.[0]) || FALLBACK_IMAGE}
                                            alt={pkg.destination || pkg.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                                    </div>

                                    {/* Content container */}
                                    <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
                                        <div className="flex-1">
                                            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#005beb] transition-colors duration-200" >
                                                {pkg.title}
                                            </h3>

                                            <TruncatedText
                                                text={pkg.shortDescription ? pkg.shortDescription.replace(/<[^>]*>?/gm, '') : "Experience the ultimate in travel excellence with our handpicked collection of elite escapes."}
                                                maxWords={15}
                                                className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-2 mb-4"
                                                buttonClassName="text-amber-400 hover:text-amber-300 font-semibold"
                                            />

                                            <div className="space-y-2 text-xs text-gray-400 mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="w-3 h-3 text-[#005beb] flex-shrink-0" />
                                                    <span className="font-semibold truncate text-gray-300">{pkg.duration}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="w-3 h-3 text-[#005beb] flex-shrink-0" />
                                                    <span className="font-semibold truncate text-gray-300">{pkg.destination}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom section */}
                                        <div className="mt-auto">
                                            <div className="mb-4">
                                                <div className="text-lg sm:text-xl font-extrabold text-white">
                                                    ₹{pkg.price.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mt-1">
                                                    Starting From Per Person
                                                </div>
                                            </div>

                                            <Button className="w-full py-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200">
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <LoginAlertModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} theme="blue" />
        </section >
    );
};

export default LuxuryPackagesSection;

