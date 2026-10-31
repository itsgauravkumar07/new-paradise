"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, MapPin, Users, Clock, ArrowRight, Star,
    CheckCircle2, ShieldCheck, Zap, Search, Filter,
    TrendingUp, X, SlidersHorizontal, Ticket, Plane, Heart
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import LoginAlertModal from '@/components/LoginAlertModal';
import PastTripsSection from '@/components/PastTripsSection';

interface Departure {
    _id: string;
    title: string;
    slug: string;
    subtitle?: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    duration: string;
    price: number;
    originalPrice?: number | null;
    availableSeats: number;
    totalSeats: number;
    image: string;
    tag: string;
    typeColor?: string;
    rating?: number;
    reviews?: number;
    location?: string;
    transport?: string;
    hotel?: string;
    meals?: string;
    nextDeparture?: string;
    shortDescription: string;
   }

interface FixedDeparturesClientProps {
    departures: Departure[];
}

const stripHtmlTags = (value: string = "") =>
    value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/\s+/g, " ")
        .trim();

    //New code edit ---- start
    const getDiscountPercent = (price: number, originalPrice?: number | null) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export default function FixedDeparturesClient({ departures }: FixedDeparturesClientProps) {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('all');
    const [selectedDuration, setSelectedDuration] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Image error handling component
    const DepartureImage = ({ src, alt }: { src: string, alt: string }) => {
        const [imgSrc, setImgSrc] = useState(src || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
        
        useEffect(() => {
            setImgSrc(src || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
        }, [src]);

        return (
            <img
                src={imgSrc}
                alt={alt}
                onError={() => setImgSrc('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')}
                className="absolute inset-0 w-full h-full object-cover text-transparent group-hover:scale-105 transition-transform duration-700"
            />
        );
    };

    // Wishlist states
    const { user } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleWishlistToggle = (e: any, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        // Placeholder for future implementation
    };

    const isInWishlist = (id: string) => false;

    // Extract unique categories from departures, excluding "Fixed Departure"
    const categories = ['All Departures', ...Array.from(new Set(departures.map(d => d.tag).filter(t => t && t !== 'Fixed Departure')))];

    // Restore filters from sessionStorage on mount
    useEffect(() => {
        const savedFilter = sessionStorage.getItem('fd_filter');
        const savedPrice = sessionStorage.getItem('fd_price');
        const savedDuration = sessionStorage.getItem('fd_duration');
        const savedSort = sessionStorage.getItem('fd_sort');
        const savedSearch = sessionStorage.getItem('fd_search');

        if (savedFilter) setFilter(savedFilter);
        if (savedPrice) setSelectedPrice(savedPrice);
        if (savedDuration) setSelectedDuration(savedDuration);
        if (savedSort) setSortBy(savedSort);
        if (savedSearch) setSearchQuery(savedSearch);

        // Robust scroll to top on mount
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
            requestAnimationFrame(() => window.scrollTo(0, 0));
        }

        setIsMounted(true);
    }, []);

    // Save filters to sessionStorage whenever they change
    useEffect(() => {
        if (!isMounted) return;
        sessionStorage.setItem('fd_filter', filter);
        sessionStorage.setItem('fd_price', selectedPrice);
        sessionStorage.setItem('fd_duration', selectedDuration);
        sessionStorage.setItem('fd_sort', sortBy);
        sessionStorage.setItem('fd_search', searchQuery);
    }, [filter, selectedPrice, selectedDuration, sortBy, searchQuery, isMounted]);

    const filteredDepartures = departures.filter(item => {
        const matchesCategory = filter === 'all' ||
            item.tag.toLowerCase() === filter.toLowerCase();

        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.destination.toLowerCase().includes(searchQuery.toLowerCase());

        // Price Filter Logic
        let matchesPrice = true;
        if (selectedPrice === 'under_15k') matchesPrice = item.price < 15000;
        else if (selectedPrice === '15k_25k') matchesPrice = item.price >= 15000 && item.price <= 25000;
        else if (selectedPrice === 'above_25k') matchesPrice = item.price > 25000;

        // Duration Filter Logic
        let matchesDuration = true;
        const days = parseInt(item.duration.split('/')[1]?.trim() || item.duration) || 0;
        if (selectedDuration === 'short') matchesDuration = days <= 5;
        else if (selectedDuration === 'medium') matchesDuration = days > 5 && days <= 10;
        else if (selectedDuration === 'long') matchesDuration = days > 10;

        return matchesCategory && matchesSearch && matchesPrice && matchesDuration;
    }).sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'duration_short') {
            const daysA = parseInt(a.duration.split('/')[1]?.trim() || a.duration) || 0;
            const daysB = parseInt(b.duration.split('/')[1]?.trim() || b.duration) || 0;
            return daysA - daysB;
        }
        return 0;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const clearFilters = () => {
        setFilter('all');
        setSelectedPrice('all');
        setSelectedDuration('all');
        setSearchQuery('');
        setSortBy('default');

        sessionStorage.removeItem('fd_filter');
        sessionStorage.removeItem('fd_price');
        sessionStorage.removeItem('fd_duration');
        sessionStorage.removeItem('fd_sort');
        sessionStorage.removeItem('fd_search');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const topFilterBar = (isMobile: boolean, hideSearch = false) => (
        <div className={`flex ${isMobile ? 'flex-col space-y-6' : 'flex-row items-center justify-between gap-6 w-full'}`}>
            {/* Search Input */}
            {!hideSearch && (
                <div className={`${isMobile ? 'w-full' : 'flex-1 max-w-sm'} relative group`}>
                    <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 !text-slate-400 group-focus-within:!text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search destination..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-3 pl-11 pr-5 bg-white border border-slate-200 rounded-full shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all !font-bold !text-slate-900 !text-sm"
                    />
                </div>
            )}

            <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row items-center gap-4 flex-wrap'}`}>
                {/* Price Filter */}
                <select
                    value={selectedPrice}
                    onChange={(e) => {
                        setSelectedPrice(e.target.value);
                        if (isMobile) setIsMobileFilterOpen(false);
                    }}
                    className="py-3 px-5 bg-white border border-slate-200 rounded-full !font-bold !text-sm !text-slate-700 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none cursor-pointer"
                >
                    <option value="all">Any Price</option>
                    <option value="under_15k">Under ₹15,000</option>
                    <option value="15k_25k">₹15,000 - ₹25,000</option>
                    <option value="above_25k">Above ₹25,000</option>
                </select>

                {/* Duration Filter */}
                <select
                    value={selectedDuration}
                    onChange={(e) => {
                        setSelectedDuration(e.target.value);
                        if (isMobile) setIsMobileFilterOpen(false);
                    }}
                    className="py-3 px-5 bg-white border border-slate-200 rounded-full !font-bold !text-sm !text-slate-700 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none cursor-pointer"
                >
                    <option value="all">Any Duration</option>
                    <option value="short">Short (1-5 Days)</option>
                    <option value="medium">Medium (6-10 Days)</option>
                    <option value="long">Long (11+ Days)</option>
                </select>

                {/* Sort Filter */}
                <div className={`flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm ${isMobile ? 'w-full' : ''}`}>
                    <Filter className="w-4 h-4 !text-slate-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 !font-bold !text-sm !text-slate-700 outline-none cursor-pointer w-full"
                    >
                        <option value="default">Sort: Recommended</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="duration_short">Duration: Shortest First</option>
                    </select>
                </div>

                {/* Reset Button */}
                {(filter !== 'all' || selectedPrice !== 'all' || selectedDuration !== 'all' || searchQuery !== '') && (
                    <button
                        onClick={clearFilters}
                        className="py-3 px-5 bg-red-50 !text-red-600 border border-red-100 rounded-full !font-bold !text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        <span className={isMobile ? 'inline' : 'hidden md:inline'}>Clear</span>
                    </button>
                )}
            </div>
        </div>
    );

    // Real numbers for the hero (no hardcoded stats)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const upcoming = departures.filter((d) => new Date(d.departureDate) >= startOfToday);
    const heroMinPrice = departures.reduce((min, d) => (d.price > 0 && (min === 0 || d.price < min) ? d.price : min), 0);
    const nextDeparture = upcoming
        .map((d) => new Date(d.departureDate))
        .sort((a, b) => a.getTime() - b.getTime())[0];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-plus-jakarta-sans bg-background min-h-screen"
        >
            <Header />

            {/* Hero (design.md) */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-strong to-slate-900 text-white">
                <Image
                    src="/Destination%20Pages/Himachal%20Pradesh.webp"
                    alt="Fixed departures"
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/55 to-slate-900/85" />
                <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-8 md:pb-16 md:pt-10">
                    <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-1.5 text-xs text-white/80">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <span>›</span>
                        <span className="rounded-full bg-white/15 px-3 py-1 font-semibold text-white backdrop-blur-md">Fixed Departures</span>
                    </nav>

                    {departures.length > 0 && (
                        <span className="glass-pill mb-4">
                            <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                            {departures.length} {departures.length === 1 ? 'DEPARTURE' : 'DEPARTURES'} AVAILABLE
                        </span>
                    )}
                    <h1 className="!text-4xl font-extrabold !text-white md:!text-6xl">Explore Fixed Departures</h1>
                    <p className="mt-4 max-w-2xl text-sm text-white/85 md:text-lg">
                        Group journeys with fixed dates and fixed prices. Pick a departure, reserve your seat, and leave the planning to us.
                    </p>

                    {departures.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-3">
                            {heroMinPrice > 0 && (
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Starting from</p>
                                    <p className="text-xl font-extrabold">₹{heroMinPrice.toLocaleString('en-IN')}</p>
                                </div>
                            )}
                            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Departures</p>
                                <p className="text-xl font-extrabold">{departures.length}</p>
                            </div>
                            {nextDeparture && (
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Next departure</p>
                                    <p className="text-xl font-extrabold">
                                        {nextDeparture.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Main Content Area */}
            <main id="departures-list" className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                
                {/* Top Filter Bar (Desktop) */}
                <div className="hidden lg:block bg-white/80 backdrop-blur-xl border border-gray-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-4 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white to-white"></div>
                    {topFilterBar(false)}
                </div>

                {/* Mobile Search & Filter Trigger */}
                <div className="lg:hidden space-y-4 mb-8 mt-10">
                    <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-300 ">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{filteredDepartures.length} Departures</p>
                            <h2 className="text-lg font-extrabold text-slate-900">Explore Tours</h2>
                        </div>
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-full text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Mobile Filter Modal */}
                <AnimatePresence>
                    {isMobileFilterOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-x-0 bottom-0 bg-slate-50 rounded-t-[2.5rem] z-[101] lg:hidden max-h-[90vh] overflow-y-auto"
                            >
                                <div className="sticky top-0 bg-white/90 backdrop-blur-xl px-6 py-5 border-b border-slate-100 flex items-center justify-between z-10 shadow-sm">
                                    <h2 className="text-xl font-extrabold text-slate-900">Filters</h2>
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    {topFilterBar(true)}
                                </div>
                                <div className="p-6 pt-0 sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="w-full py-4 bg-primary text-white rounded-full text-sm font-extrabold uppercase tracking-widest shadow-xl shadow-blue-600/20"
                                    >
                                        Show {filteredDepartures.length} Results
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Departures Ticket List */}
                <div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        <AnimatePresence mode='popLayout'>
                                {filteredDepartures.map((item) => {
                                const discountPercent = getDiscountPercent(item.price, item.originalPrice);
                                const isLowSeats = item.availableSeats > 0 && item.availableSeats < 10;
                                const isSoldOut = item.availableSeats <= 0;
                                const category = item.tag && item.tag !== 'Fixed Departure' ? item.tag : null;

                                return (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="group relative"
                                    >
                                        <Link href={`/fixed-departures/${item.slug}`}>
                                            {/* Card Container */}
                                            <div className="flex flex-col md:flex-row bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden border border-slate-100 group-hover:border-indigo-200">

                                                {/* Left: Image Area */}
                                                <div className="relative w-full md:w-[300px] h-56 md:h-auto flex-shrink-0 bg-slate-200 overflow-hidden">
                                                    <DepartureImage
                                                        src={item.image}
                                                        alt={item.title}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

                                                    {/* Top-left badges: destination + category */}
                                                    <div className="absolute top-4 left-4 right-14 flex flex-wrap gap-2">
                                                        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5 shadow-sm">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {item.destination}
                                                        </div>
                                                        {category && (
                                                            <div className="bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                                                                {category}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Discount ribbon */}
                                                    {discountPercent > 0 && (
                                                        <div className="absolute top-14 left-4 bg-primary text-white px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                                                            {discountPercent}% OFF
                                                        </div>
                                                    )}

                                                    {/* Title*/}
                                                    <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
                                                       
                                                        <h3 className="text-xl md:text-lg font-extrabold text-white leading-tight drop-shadow-md">
                                                            {item.title}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {/* Middle: Details Area */}
                                                <div className="flex-1 p-6 md:p-7 flex flex-col justify-center bg-white relative gap-4">
                                                    <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-2">
                                                        {stripHtmlTags(item.subtitle || item.shortDescription)}
                                                    </p>

                                                    <div className="flex flex-wrap gap-2">
                                                        <div className="flex items-center gap-1.5 bg-primary-light px-3 py-1.5 rounded-lg border border-indigo-100">
                                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                            <span className="text-xs font-bold text-indigo-700">{formatDate(item.departureDate)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            <span className="text-xs font-bold text-slate-700">{item.duration}</span>
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isSoldOut ? 'bg-slate-100 border-slate-200 text-slate-400' : isLowSeats ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-700'}`}>
                                                            <Users className="w-3.5 h-3.5" />
                                                            <span className="text-xs font-bold">
                                                                {isSoldOut ? 'Sold Out' : `${item.availableSeats} Seats Left`}
                                                            </span>
                                                        </div>

                                                         {item.rating ? (
                                                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-100">
                                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                                <span className="text-xs font-extrabold text-black">{item.rating.toFixed(1)}</span>
                                                                {item.reviews ? (
                                                                    <span className="text-[11px] font-medium text-black/70">({item.reviews})</span>
                                                                ) : null}
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                        Guaranteed Departure
                                                    </div>
                                                </div>

                                                {/* Dashed Divider with Cutouts */}
                                                <div className="hidden md:flex flex-col items-center justify-center relative bg-white w-8">
                                                    <div className="absolute top-[-10px] w-6 h-6 bg-slate-50 rounded-full border border-slate-100 border-t-0 border-l-0 -rotate-45 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02)]"></div>
                                                    <div className="h-full w-[2px] border-l-2 border-dashed border-slate-200"></div>
                                                    <div className="absolute bottom-[-10px] w-6 h-6 bg-slate-50 rounded-full border border-slate-100 border-b-0 border-r-0 -rotate-45 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02)]"></div>
                                                </div>

                                                {/* Mobile Divider */}
                                                <div className="md:hidden flex items-center justify-center relative bg-white h-8 w-full">
                                                    <div className="absolute left-[-10px] w-6 h-6 bg-slate-50 rounded-full border border-slate-100 border-l-0 border-b-0 rotate-45"></div>
                                                    <div className="w-full h-[2px] border-t-2 border-dashed border-slate-200"></div>
                                                    <div className="absolute right-[-10px] w-6 h-6 bg-slate-50 rounded-full border border-slate-100 border-r-0 border-t-0 rotate-45"></div>
                                                </div>

                                                {/* Right: Pricing & Action */}
                                                <div className="p-6 md:p-7 md:w-[260px] flex flex-col justify-center bg-slate-50/60 group-hover:bg-primary-light/40 transition-colors gap-3">
                                                    <div>
                                                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Per Person From</p>
                                                        <div className="flex items-baseline gap-2 flex-wrap">
                                                            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{item.price.toLocaleString()}</span>
                                                            {discountPercent > 0 && item.originalPrice ? (
                                                                <span className="text-sm font-bold text-slate-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                                                            ) : null}
                                                        </div>
                                                        {discountPercent > 0 ? (
                                                            <p className="text-xs font-bold text-emerald-600 mt-1">You save {discountPercent}%</p>
                                                        ) : null}
                                                        {isLowSeats ? (
                                                            <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                                Filling fast — {item.availableSeats} left
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={isSoldOut}
                                                        className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-extrabold uppercase tracking-widest transition-all ${isSoldOut
                                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                            : 'bg-primary text-white shadow-lg shadow-indigo-600/20 group-hover:bg-primary-hover hover:scale-105'
                                                            }`}
                                                    >
                                                        {isSoldOut ? 'Sold Out' : 'Book Now'}
                                                        {!isSoldOut && <ArrowRight className="w-4 h-4" />}
                                                    </button>
                                                </div>

                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {filteredDepartures.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No departures found</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your filters or searching for a different destination.</p>
                            <button 
                                onClick={clearFilters}
                                className="mt-6 px-6 py-3 bg-primary-light text-blue-600 rounded-xl font-bold hover:bg-primary/15 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </motion.div>
                    )}
                </div>
            </main>

            <PastTripsSection className="border-t border-slate-100" />

            <LoginAlertModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} theme="blue" />
        </motion.div>
    );
}
