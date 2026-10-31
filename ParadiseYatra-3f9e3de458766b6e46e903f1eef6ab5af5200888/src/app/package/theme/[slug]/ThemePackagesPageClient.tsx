"use client";

import { Suspense, useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown, ChevronLeft, ChevronRight, X, SearchX } from 'lucide-react';
import Loading from '@/components/ui/loading';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl, getPackagePriceLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/components/Header';
import PackageCard from '@/components/ui/PackageCard';
import SearchFilterSidebar from '@/components/ui/SearchFilterSidebar';
import SearchHeader from '@/components/ui/SearchHeader';
import { useAuth } from '@/context/AuthContext';
import LoginAlertModal from '@/components/LoginAlertModal';
import CarouselArrows from '@/components/ui/CarouselArrows';
import NoPackagesEnquiryForm from '@/components/NoPackagesEnquiryForm';
import { getThemeOverviewDescription } from '@/lib/theme-overview';

import FAQSection from '@/components/FAQSection';

// Pagination Component
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination = ({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const handlePageChange = (page: number) => {
        onPageChange(page);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className={`flex items-center justify-end space-x-2 ${className}`}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="!text-[12px] !font-bold text-[#314594] border-[#dfe1df] rounded-[6px] transition-all !shadow-none whitespace-nowrap disabled:opacity-30 h-9 px-4 hover:!bg-[#314594] hover:!text-white"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
            </Button>

            <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                    <div key={index}>
                        {page === '...' ? (
                            <span className="px-2 text-slate-400 font-bold">...</span>
                        ) : (
                            <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page as number)}
                                className={`w-9 h-9 !p-0 !text-[12px] !font-bold rounded-[6px] transition-all !shadow-none ${currentPage === page
                                    ? '!bg-[#314594] !text-white border-transparent'
                                    : '!bg-white !text-[#000945] border-[#dfe1df] hover:bg-slate-50'
                                    }`}
                            >
                                {page}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="!text-[12px] !font-bold text-[#314594] border-[#dfe1df] rounded-[6px] transition-all !shadow-none whitespace-nowrap disabled:opacity-30 h-9 px-4 hover:!bg-[#314594] hover:!text-white"
            >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
        </div>
    );
};

const ThemeLoadingSkeleton = () => (
    <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="pt-24">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-80 hidden lg:block">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-32 mt-0.5 border border-slate-100 h-[600px] animate-pulse"></div>
                    </aside>
                    <div className="flex-1">
                        <div className="grid gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden h-64 animate-pulse border border-slate-100"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const createThemeSummary = (description: string, maxLength = 160) => {
    const plainText = description
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();

    if (plainText.length <= maxLength) return plainText;
    return `${plainText.slice(0, maxLength - 1).trimEnd()}…`;
};

type ThemeApiPackage = { _id?: string; name?: string; slug?: string; isActive?: boolean };
type ThemeApiData = { name?: string; description?: string; packages?: ThemeApiPackage[] };

interface ThemePackagesPageClientProps {
    slug: string;
    /** Theme with its (active) packages, loaded on the server so they're in the HTML; fetched in the browser if missing */
    initialTag?: ThemeApiData;
    /** Admin > Page Content for this theme (undefined = not loaded on the server) */
    initialContent?: { content?: string; image?: string; title?: string } | null;
    /** Theme FAQs loaded on the server */
    initialFaqs?: { question: string; answer: string }[];
}

export default function ThemePackagesPageClient({ slug, initialTag, initialContent, initialFaqs }: ThemePackagesPageClientProps) {
    const [tagData, setTagData] = useState<any>(initialTag ?? null);
    const [allItems, setAllItems] = useState<any[]>(initialTag?.packages ?? []);
    const [filteredItems, setFilteredItems] = useState<any[]>(initialTag?.packages ?? []);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(!initialTag);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Dynamic content
    const [dynamicOverview, setDynamicOverview] = useState<string | null>(initialContent?.content || null);
    const [dynamicTitle, setDynamicTitle] = useState<string | null>(initialContent?.title || null);
    const [dynamicImage, setDynamicImage] = useState<string | null>(initialContent?.image || null);

    // Filter & Pagination state
    const [durationFilter, setDurationFilter] = useState<string>('all');
    const [priceFilter, setPriceFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('recommended');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Carousel state
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const { user } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

    useEffect(() => {
        const fetchThemeData = async () => {
            try {
                let json: { success?: boolean; data?: ThemeApiData } = { success: true, data: initialTag };
                // Already rendered from the server: only the suggestions below are loaded here
                if (!initialTag) {
                    setLoading(true);
                    const response = await fetch(`/api/tags/slug/${slug}`, { cache: 'no-store' });
                    if (!response.ok) throw new Error('Theme not found');

                    json = await response.json();
                    if (json.success && json.data) {
                        // Packages switched off in admin stay off the page
                        const activePackages = (json.data.packages || []).filter((pkg: ThemeApiPackage) => pkg?.isActive !== false);
                        json.data = { ...json.data, packages: activePackages };
                        setTagData(json.data);
                        setAllItems(activePackages);
                        setFilteredItems(activePackages);
                    }
                }

                // Fetch suggestions from same source as package detail page
                const sugRes = await fetch(`/api/all-packages?limit=24&isActive=true`, { cache: 'no-store' });
                if (sugRes.ok) {
                    const sugData = await sugRes.json();
                    const suggestionsArray = Array.isArray(sugData)
                        ? sugData
                        : Array.isArray(sugData?.packages)
                            ? sugData.packages
                            : [];

                    const currentThemePackageIds = new Set(
                        (json?.data?.packages || []).map((pkg: any) => pkg?._id).filter(Boolean)
                    );

                    setSuggestions(
                        suggestionsArray
                            .filter((pkg: any) => pkg?.isActive !== false && !currentThemePackageIds.has(pkg?._id))
                            .slice(0, 9)
                    );
                }

                // Fetch dynamic overview (skipped when the server already loaded it)
                if (initialContent === undefined) try {
                    const contentKey = slug.toLowerCase().replace(/\s+/g, '-');
                    const contentResponse = await fetch(`/api/page-content/${contentKey}`);
                    if (contentResponse.ok) {
                        const contentData = await contentResponse.json();
                        if (contentData.success && contentData.data) {
                            setDynamicOverview(contentData.data.content);
                            if (contentData.data.image) setDynamicImage(contentData.data.image);
                            if (contentData.data.title) setDynamicTitle(contentData.data.title);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch dynamic content", e);
                }
            } catch (err) {
                console.error('Error fetching theme:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchThemeData();
    }, [slug, initialTag, initialContent]);

    useEffect(() => {
        let filtered = [...allItems];

        if (durationFilter !== 'all') {
            const extractDays = (d: string) => {
                const m = d.match(/(\d+)\s*(?:Days?|D)/i);
                return m ? parseInt(m[1]) : 0;
            };
            filtered = filtered.filter(item => {
                const days = extractDays(item.duration || '');
                if (durationFilter === '1-3') return days >= 1 && days <= 3;
                if (durationFilter === '4-6') return days >= 4 && days <= 6;
                if (durationFilter === '7-9') return days >= 7 && days <= 9;
                if (durationFilter === '10-12') return days >= 10 && days <= 12;
                if (durationFilter === '13+') return days >= 13;
                return true;
            });
        }

        if (priceFilter !== 'all') {
            filtered = filtered.filter(item => {
                const p = item.price;
                if (priceFilter === '0-10000') return p <= 10000;
                if (priceFilter === '10000-20000') return p > 10000 && p <= 20000;
                if (priceFilter === '20000-35000') return p > 20000 && p <= 35000;
                if (priceFilter === '35000-50000') return p > 35000 && p <= 50000;
                if (priceFilter === '50000+') return p > 50000;
                return true;
            });
        }

        filtered.sort((a, b) => {
            if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
            if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
            return 0;
        });

        setFilteredItems(filtered);
        setCurrentPage(1);
    }, [allItems, durationFilter, priceFilter, sortBy]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            setTimeout(updateScrollState, 500);
            return () => {
                carousel.removeEventListener("scroll", updateScrollState);
                window.removeEventListener("resize", updateScrollState);
            };
        }
    }, [suggestions]);

    if (loading) return <ThemeLoadingSkeleton />;

    if (!tagData) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="flex flex-col items-center justify-center h-[70vh]">
                    <h2 className="text-2xl font-bold text-slate-800">Theme Not Found</h2>
                    <p className="text-slate-600 mt-2">The requested package theme doesn't exist.</p>
                    <Link href="/package" className="mt-6 text-blue-600 font-bold hover:underline">Back to All Packages</Link>
                </div>
            </div>
        );
    }

    const formattedLocation = capitalize(tagData.name);
    const tourTypeLabel = 'Tour';

    const themeKey = slug.toLowerCase().replace(/\s+/g, '-');
    const overviewDescription = dynamicOverview || getThemeOverviewDescription(themeKey, tagData.description, formattedLocation);
    const heroDescription = createThemeSummary(overviewDescription);
    const finalTitle = dynamicTitle || `Overview of ${formattedLocation}`;
    const heroHeading = dynamicTitle || ((slug.includes('char-dham') || slug.includes('chardham'))
        ? 'Char Dham Yatra 2026'
        : slug.includes('honeymoon')
            ? 'Honeymoon Tour Packages'
            : slug.includes('luxury')
                ? 'Luxury Tour Packages'
            : slug.includes('trending')
                ? 'Trending Tour Packages'
            : `${formattedLocation}`);
    const minPrice = allItems.reduce((min, item) => {
        const price = Number(item.price) || 0;
        return price > 0 && (min === 0 || price < min) ? price : min;
    }, 0);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-plus-jakarta-sans">
           <Header />
           
            <main className="flex-grow pt-0 bg-white">
                {/* Theme page hero follows the India and International package page header layout. */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-strong to-slate-900 text-white">
                    <Image
                        src={dynamicImage || ((slug.includes('char-dham') || slug.includes('chardham'))
                            ? '/Destination Pages/Char Dham.webp'
                            : slug.includes('honeymoon')
                                ? '/Destination Pages/Honeymoon.webp'
                                : slug.includes('luxury')
                                    ? '/Destination%20Pages/Luxury.webp'
                                    : slug.includes('trending')
                                        ? '/Destination%20Pages/Trending%20Packages.jpg'
                                        : "https://images.unsplash.com/photo-1544735716-a9ff2824d7c1?q=80&w=2070&auto=format&fit=crop"
                        )}
                        alt={formattedLocation}
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/55 to-slate-900/85" />
                    <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-8 md:pb-16 md:pt-10">
                        <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-1.5 text-xs text-white/80">
                            <Link href="/" className="hover:text-white">Home</Link>
                            <span>›</span>
                            <Link href="/package" className="hover:text-white">Packages</Link>
                            <span>›</span>
                            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold text-white backdrop-blur-md">
                                {formattedLocation}
                            </span>
                        </nav>

                        <h1 className="!text-4xl font-extrabold !text-white md:!text-6xl">
                            {heroHeading}
                        </h1>
                        <p className="mt-4 line-clamp-3 max-w-2xl text-sm text-white/85 md:text-lg">
                            {heroDescription}
                        </p>
                        {!loading && allItems.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-3">
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Packages</p>
                                    <p className="text-xl font-extrabold">{allItems.length}</p>
                                </div>
                                {minPrice > 0 && (
                                    <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Starting from</p>
                                        <p className="text-xl font-extrabold">₹{minPrice.toLocaleString('en-IN')}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Main Content Area */}
                <section className="pt-4 pb-4 md:pt-6 md:pb-6 px-4 md:px-8 bg-white">
                    <div className="max-w-6xl mx-auto">
                        {/* Theme Overview Section */}
                        <div className="mb-6 text-left bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[20px] shadow-sm border border-slate-100/50">
                            <h2 className="!text-[20px] md:!text-[26px] !font-bold text-[#000945] mb-3">
                                {finalTitle}
                            </h2>
                            <p className="!text-slate-800 text-sm md:text-base leading-relaxed font-normal">
                                {overviewDescription}
                            </p>
                        </div>

                        <div className="mb-6 text-left">
                            <h2 className="!text-[24px] md:!text-[36px] !font-bold text-[#000945] mb-2">
                                Handpicked Curated Journeys
                            </h2>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
                            <aside className="hidden lg:block lg:w-80 flex-shrink-0">
                                <div className="lg:sticky lg:top-32 lg:mt-0.5">
                                    <Card className="hidden lg:block border border-[#dfe1df] shadow-none overflow-hidden p-0 bg-white rounded-[24px]">
                                        <SearchFilterSidebar
                                            durationFilter={durationFilter}
                                            setDurationFilter={setDurationFilter}
                                            priceFilter={priceFilter}
                                            setPriceFilter={setPriceFilter}
                                            onClearFilters={() => {
                                                setDurationFilter('all');
                                                setPriceFilter('all');
                                                setSortBy('recommended');
                                            }}
                                        />
                                    </Card>
                                </div>
                            </aside>

                            <div className="flex-1">
                                <div className="flex items-center justify-between lg:justify-end gap-3 mb-6 md:mb-8">
                                    <button
                                        onClick={() => setIsFiltersOpen(true)}
                                        className="lg:hidden flex items-center justify-center h-9 rounded-[6px] border border-slate-200 bg-white text-slate-900 font-medium text-xs px-6 shadow-none"
                                    >
                                        <Filter className="mr-2 h-3.5 w-3.5 text-slate-500" />
                                        Filters
                                    </button>

                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <span className="hidden sm:inline text-sm font-medium text-slate-500">Sort by:</span>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="w-[140px] bg-white border-slate-200 font-medium text-slate-900 rounded-[6px] h-9 text-xs px-4 shadow-none !shadow-none">
                                                <SelectValue placeholder="Recommended" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                <SelectItem value="recommended">Recommended</SelectItem>
                                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {filteredItems.length > 0 ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
                                            {paginatedItems.map((pkg) => (
                                                <PackageCard
                                                    key={pkg._id}
                                                    id={pkg._id}
                                                    destination={pkg.destination || pkg.location || pkg.state || pkg.country || ''}
                                                    duration={pkg.duration || ''}
                                                    title={pkg.name || pkg.title}
                                                    price={pkg.price || 0}
                                                    image={getImageUrl(pkg.image) || pkg.image}
                                                    imageAlt={pkg.imageAlt || pkg.name}
                                                    slug={pkg.slug || pkg._id}
                                                    hrefPrefix="/package"
                                                    priceLabel={getPackagePriceLabel(pkg.priceType)}
                                                    itinerary={pkg.itinerary}
                                                    rating={typeof pkg.rating === 'number' ? pkg.rating : undefined}
                                                    inclusions={Array.isArray(pkg.inclusions) ? pkg.inclusions : undefined}
                                                    showDestination={false}
                                                    className="!w-full"
                                                />
                                            ))}
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="mt-12">
                                                <Pagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={setCurrentPage}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    
                                    <div className="text-center py-16 bg-white rounded-[6px] border border-[#dfe1df] shadow-none">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                            <SearchX className="w-8 h-8 text-[#000945] opacity-20" />
                                        </div>
                                        <h3 className="!text-sm md:!text-xl !font-bold text-[#000945] mb-2">We don't have this exact package yet</h3>
                                        <p className="!text-[#000945]/70 !text-xs md:!text-sm font-medium max-w-sm mx-auto mb-6">
                                            But tell us what you need and we'll put one together.
                                        </p>

                                        <NoPackagesEnquiryForm
                                            context={[
                                                `Theme: ${tagData.name}`,
                                                durationFilter !== 'all' ? `Duration: ${durationFilter}` : "",
                                                priceFilter !== 'all' ? `Price: ${priceFilter}` : "",
                                            ].filter(Boolean).join(" | ")}
                                        />

                                        <button
                                            onClick={() => { setDurationFilter('all'); setPriceFilter('all'); setSortBy('recommended'); }}
                                            className="mt-5 text-xs font-bold text-[#155dfc] hover:underline"
                                        >
                                            Or clear all filters and browse everything
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>


                <FAQSection destination={tagData.name} tourType="india" faqs={initialFaqs?.length ? initialFaqs : undefined} />

                {suggestions.length > 0 && (
                    <section className="bg-gradient-to-b from-white to-slate-50 px-4 pt-0 pb-12 md:pt-0 md:pb-12 text-gray-900 md:px-8 relative z-20 border-t border-slate-100">
                        <div className="mx-auto flex max-w-6xl flex-col gap-6 relative z-10">
                            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-2">
                                <div className="flex flex-col gap-1">
                                    <h3 className="!text-[24px] md:!text-[36px] !font-bold !text-[#000945] !leading-tight tracking-tight">
                                        You Might Also Like
                                    </h3>
                                    <p className="!text-sm !text-slate-500 md:!text-base !max-w-2xl !font-medium">
                                        Explore our popular packages and create unforgettable memories
                                    </p>
                                </div>
                            </div>

                            <div className="relative group/carousel">
                                <CarouselArrows
                                    onPrevious={() => carouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                                    onNext={() => carouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                                    canScrollLeft={canScrollLeft}
                                    canScrollRight={canScrollRight}
                                />
                                <div
                                    ref={carouselRef}
                                    className="flex gap-4 overflow-x-auto scroll-smooth pb-8 scrollbar-hide px-2"
                                    style={{
                                        scrollbarWidth: "none",
                                        msOverflowStyle: "none",
                                        scrollSnapType: "x mandatory",
                                    }}
                                >
                                    {suggestions.map((pkg, idx) => (
                                        <PackageCard
                                            key={`${pkg._id}-${idx}`}
                                            id={pkg._id}
                                            title={pkg.name || pkg.title}
                                            destination={pkg.destination || pkg.location || pkg.state || pkg.country}
                                            itinerary={pkg.itinerary}
                                            image={getImageUrl(pkg.image) || pkg.image || ''}
                                            imageAlt={pkg.imageAlt || pkg.name}
                                            duration={pkg.duration}
                                            price={pkg.price || 0}
                                            slug={pkg.slug || pkg._id}
                                            hrefPrefix="/package"
                                            themeColor="#005beb"
                                            priceLabel={getPackagePriceLabel(pkg.priceType)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[6px]">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="!text-xl !font-bold !text-[#000945]">Filters</DialogTitle>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto px-0">
                        <div className="p-8 pt-0">
                            <SearchFilterSidebar
                                durationFilter={durationFilter}
                                setDurationFilter={setDurationFilter}
                                priceFilter={priceFilter}
                                setPriceFilter={setPriceFilter}
                                onClearFilters={() => {
                                    setDurationFilter('all');
                                    setPriceFilter('all');
                                    setSortBy('recommended');
                                }}
                                onApply={() => setIsFiltersOpen(false)}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <LoginAlertModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} theme="blue" />
        </div>
    );
}
