"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, ArrowRight, Loader2, AlertCircle, Search, Users, ChevronRight, ChevronDown, Filter, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { getImageUrl, getDestinationWebp } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Destination {
    _id: string;
    name: string;
    slug?: string;
    description: string;
    shortDescription: string;
    image: string;
    location: string;
    price?: number;
    duration?: string;
    rating?: number;
    fallback?: boolean;
}

const fallbackDestinations: Destination[] = [
    { _id: "uttarakhand", name: "Uttarakhand", description: "Explore the Himalayan landscapes, sacred Char Dham sites, and hill stations of Uttarakhand.", shortDescription: "Himalayan escapes and spiritual journeys.", image: "/images/himalaya-trek.png", location: "India", fallback: true },
    { _id: "himachal-pradesh", name: "Himachal Pradesh", description: "Discover mountain villages, scenic valleys, and adventure escapes in Himachal Pradesh.", shortDescription: "Mountain adventures and scenic valleys.", image: "/images/himalaya-trek.png", location: "India", fallback: true },
    { _id: "jammu-and-kashmir", name: "Kashmir", description: "Experience the lakes, gardens, and mountain scenery of Kashmir.", shortDescription: "Lakes, gardens, and Himalayan scenery.", image: "/images/himalaya-trek.png", location: "India", fallback: true },
    { _id: "rajasthan", name: "Rajasthan", description: "Visit Rajasthan's historic forts, palaces, and desert landscapes.", shortDescription: "Historic cities, forts, and desert journeys.", image: "/images/placeholder-travel.jpg", location: "India", fallback: true },
    { _id: "kerala", name: "Kerala", description: "Enjoy Kerala's backwaters, beaches, and lush hill country.", shortDescription: "Backwaters, beaches, and green hill country.", image: "/images/placeholder-travel.jpg", location: "India", fallback: true },
    { _id: "goa", name: "Goa", description: "Discover Goa's beaches, coastal towns, and local culture.", shortDescription: "Coastal escapes and beach holidays.", image: "/images/placeholder-travel.jpg", location: "India", fallback: true },
];

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<Destination[]>(fallbackDestinations);
    const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>(fallbackDestinations);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("popular");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await fetch("/api/destinations");
                if (!response.ok) throw new Error("Failed to fetch destinations");
                const data = await response.json();
                const fetched = data.destinations || (Array.isArray(data) ? data : []);
                if (fetched.length > 0) {
                    setDestinations(fetched);
                    setFilteredDestinations(fetched);
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredDestinations(destinations);
            return;
        }
        const query = searchQuery.toLowerCase();
        const filtered = destinations.filter(d =>
            d.name?.toLowerCase().includes(query) ||
            d.location?.toLowerCase().includes(query) ||
            d.description?.toLowerCase().includes(query)
        );
        setFilteredDestinations(filtered);
    }, [searchQuery, destinations]);

    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="flex items-center justify-center h-[60vh] pt-[88px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-plus-jakarta-sans text-slate-900">
            <Header />

            <main className="flex-grow pt-0">

                {/* Hero Section */}
                <section className="relative flex flex-col md:flex-row w-full md:h-[496px] md:overflow-hidden items-center justify-center bg-white md:bg-transparent">
                    {/* Image Container */}
                    <div className="relative w-full h-[230.4px] md:absolute md:inset-0 md:h-auto flex-shrink-0">
                        <Image
                            src="/Destination%20Pages/Rajasthan.webp"
                            alt="Explore Destinations"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/30" />
                    </div>

                    {/* Centered Search Hub */}
                    <div className="max-w-6xl w-full mx-auto px-4 md:px-8 relative z-30 md:pt-0 md:pb-0">
                        <div className="flex flex-col items-center">
                            <Card className="bg-white rounded-[6px] shadow-lg md:shadow-none border border-slate-100 overflow-hidden w-full h-auto md:h-[200px] flex items-center">
                                <CardContent className="p-4 md:p-6 w-full h-full flex flex-col justify-center items-center">
                                    {/* Desktop Heading */}
                                    <h1 className="!text-2xl !font-black text-[#000945] mb-6 text-center font-plus-jakarta-sans tracking-tight leading-tight md:!text-[44px]">
                                        Discover Your Next <span className="text-[#000945]">Adventure</span>
                                    </h1>

                                    <div className="flex flex-col lg:flex-row gap-4 items-center w-full">
                                        {/* Search Field */}
                                        <div className="flex-grow relative group w-full lg:w-auto">
                                            <div className="flex items-center gap-3 p-3 rounded-[6px] border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200 transition-all h-16 group">
                                                <div className="w-10 h-10 rounded-[6px] bg-white border border-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                                    <Search className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 flex flex-col">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Where to?</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Explore destinations..."
                                                        className="bg-transparent border-none outline-none w-full text-slate-900 font-bold placeholder:text-slate-400 text-sm md:text-base"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-auto">
                                            <Button className="h-16 w-full lg:w-[160px] rounded-[6px] bg-slate-900 hover:bg-black text-white font-black text-lg transition-all duration-300">
                                                Explore
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                        <div className="max-w-2xl">
                            <h2 className="!text-3xl md:!text-4xl !font-black text-slate-900 mb-4 tracking-tight">
                                Popular <span className="text-blue-600">Destinations</span>
                            </h2>
                            <p className="text-slate-500 font-medium text-lg">
                                Handpicked collections of the most beautiful places on Earth.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px] bg-white border-slate-200 font-bold text-slate-900 rounded-full h-11 shadow-sm">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="popular">Most Popular</SelectItem>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="rating">Top Rated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && destinations.length > 0 && (
                        <p role="status" className="mb-6 text-sm text-slate-600">
                            Destination updates are temporarily unavailable; showing popular destinations.
                        </p>
                    )}

                    {error && destinations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[32px] shadow-sm border border-red-100">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <p className="text-red-600 font-bold text-lg">{error}</p>
                            <Button onClick={() => window.location.reload()} className="mt-6 rounded-full px-8 py-6 h-auto font-bold bg-red-600 hover:bg-red-700">Try Again</Button>
                        </div>
                    ) : filteredDestinations.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="!text-2xl !font-black text-slate-900 mb-2">No destinations found</h3>
                            <p className="!text-slate-500 font-medium max-w-md mx-auto">
                                We couldn't find any results matching "{searchQuery}". Try searching for something else.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredDestinations.map((dest) => (
                                <div key={dest._id}>
                                    <Link href={dest.fallback ? "/package" : `/destinations/${dest.slug || dest._id}`} className="block group">
                                        <Card className="overflow-hidden border border-slate-100 bg-white rounded-[6px] shadow-sm hover:shadow-md transition-all duration-500 h-full flex flex-col">
                                            <div className="relative h-[320px] overflow-hidden">
                                                <Image
                                                    src={(dest.name?.toLowerCase().includes('sikkim') ||
                                                        dest.name?.toLowerCase().includes('gangtok') ||
                                                        dest.name?.toLowerCase().includes('kalimpong') ||
                                                        dest.location?.toLowerCase().includes('sikkim') ||
                                                        dest.location?.toLowerCase().includes('gangtok') ||
                                                        dest.location?.toLowerCase().includes('kalimpong'))
                                                        ? '/Destination%20Pages/Sikkim.webp'
                                                        : (dest.name?.toLowerCase().includes('andaman') ||
                                                            dest.location?.toLowerCase().includes('andaman'))
                                                            ? '/Destination%20Pages/Andaman%20and%20Nicobar%20Island.webp'
                                                            : (dest.name?.toLowerCase().includes('kashmir') ||
                                                                dest.name?.toLowerCase().includes('jammu') ||
                                                                dest.location?.toLowerCase().includes('kashmir') ||
                                                                dest.location?.toLowerCase().includes('jammu'))
                                                                ? '/Destination%20Pages/Jammu%20and%20Kashmir.webp'
                                                                : (dest.name?.toLowerCase().includes('rajasthan') ||
                                                                    dest.name?.toLowerCase().includes('jaipur') ||
                                                                    dest.name?.toLowerCase().includes('udaipur') ||
                                                                    dest.name?.toLowerCase().includes('jodhpur') ||
                                                                    dest.name?.toLowerCase().includes('jaisalmer') ||
                                                                    dest.location?.toLowerCase().includes('rajasthan') ||
                                                                    dest.location?.toLowerCase().includes('jaipur') ||
                                                                    dest.location?.toLowerCase().includes('udaipur') ||
                                                                    dest.location?.toLowerCase().includes('jodhpur') ||
                                                                    dest.location?.toLowerCase().includes('jaisalmer'))
                                                                    ? '/Destination%20Pages/Rajasthan.webp'
                                                                    : (dest.name?.toLowerCase().includes('uttarakhand') ||
                                                                        dest.name?.toLowerCase().includes('nainital') ||
                                                                        dest.name?.toLowerCase().includes('rishikesh') ||
                                                                        dest.name?.toLowerCase().includes('mussoorie') ||
                                                                        dest.name?.toLowerCase().includes('dehradun') ||
                                                                        dest.name?.toLowerCase().includes('haridwar') ||
                                                                        dest.location?.toLowerCase().includes('uttarakhand') ||
                                                                        dest.location?.toLowerCase().includes('nainital') ||
                                                                        dest.location?.toLowerCase().includes('rishikesh') ||
                                                                        dest.location?.toLowerCase().includes('mussoorie') ||
                                                                        dest.location?.toLowerCase().includes('dehradun') ||
                                                                        dest.location?.toLowerCase().includes('haridwar'))
                                                                        ? '/Destination%20Pages/Uttarakhand.webp'
                                                                        : (dest.name?.toLowerCase().includes('goa') ||
                                                                            dest.name?.toLowerCase().includes('panjim') ||
                                                                            dest.location?.toLowerCase().includes('goa') ||
                                                                            dest.location?.toLowerCase().includes('panjim'))
                                                                            ? '/Destination%20Pages/Goa.webp'
                                                                            : (dest.name?.toLowerCase().includes('kerala') ||
                                                                                dest.name?.toLowerCase().includes('kochi') ||
                                                                                dest.name?.toLowerCase().includes('munnar') ||
                                                                                dest.name?.toLowerCase().includes('alleppey') ||
                                                                                dest.location?.toLowerCase().includes('kerala') ||
                                                                                dest.location?.toLowerCase().includes('kochi') ||
                                                                                dest.location?.toLowerCase().includes('munnar') ||
                                                                                dest.location?.toLowerCase().includes('alleppey'))
                                                                                ? '/Destination%20Pages/Kerala.webp'
                                                                                : (dest.name?.toLowerCase().includes('himachal') ||
                                                                                    dest.name?.toLowerCase().includes('shimla') ||
                                                                                    dest.name?.toLowerCase().includes('manali') ||
                                                                                    dest.location?.toLowerCase().includes('himachal') ||
                                                                                    dest.location?.toLowerCase().includes('shimla') ||
                                                                                    dest.location?.toLowerCase().includes('manali'))
                                                                                    ? '/Destination%20Pages/Himachal%20Pradesh.webp'
                                                                                    : (dest.name?.toLowerCase().includes('ladakh') ||
                                                                                        dest.name?.toLowerCase().includes('leh') ||
                                                                                        dest.name?.toLowerCase().includes('nubra') ||
                                                                                        dest.name?.toLowerCase().includes('zanskar') ||
                                                                                        dest.location?.toLowerCase().includes('ladakh') ||
                                                                                        dest.location?.toLowerCase().includes('leh') ||
                                                                                        dest.location?.toLowerCase().includes('nubra') ||
                                                                                        dest.location?.toLowerCase().includes('zanskar'))
                                                                                        ? '/Destination%20Pages/Ladakh.webp'
                                                                                        : (dest.name?.toLowerCase().includes('tamil nadu') ||
                                                                                            dest.location?.toLowerCase().includes('tamil nadu'))
                                                                                            ? '/Destination%20Pages/Tamil%20Nadu.webp'
                                                                                            : (dest.name?.toLowerCase().includes('thailand') ||
                                                                                                dest.location?.toLowerCase().includes('thailand'))
                                                                                                ? '/Destination%20Pages/Thailand.webp'
                                                                                                : (dest.name?.toLowerCase().includes('malaysia') ||
                                                                                                    dest.location?.toLowerCase().includes('malaysia'))
                                                                                                    ? '/Destination%20Pages/Malaysia.webp'
                                                                                                    : (dest.name?.toLowerCase().includes('egypt') ||
                                                                                                        dest.location?.toLowerCase().includes('egypt'))
                                                                                                        ? '/Destination%20Pages/Egypt.webp'
                                                                                                        : (dest.name?.toLowerCase().includes('indonesia') ||
                                                                                                            dest.location?.toLowerCase().includes('indonesia'))
                                                                                                            ? '/Destination%20Pages/Indonesia.webp'
                                                                                                            : (dest.name?.toLowerCase().includes('kenya') ||
                                                                                                                dest.location?.toLowerCase().includes('kenya'))
                                                                                                                ? '/Destination%20Pages/Kenya.webp'
                                                                                                                : (dest.name?.toLowerCase().includes('maldives') ||
                                                                                                                    dest.location?.toLowerCase().includes('maldives'))
                                                                                                                    ? '/Destination%20Pages/Maldives.webp'
                                                                                                                    : (dest.name?.toLowerCase().includes('singapore') ||
                                                                                                                        dest.location?.toLowerCase().includes('singapore'))
                                                                                                                        ? '/Destination%20Pages/Singapore.webp'
                                                                                                                        : (dest.name?.toLowerCase().includes('united arab emirates') ||
                                                                                                                            dest.name?.toLowerCase().includes('dubai') ||
                                                                                                                            dest.name?.toLowerCase().includes('uae') ||
                                                                                                                            dest.location?.toLowerCase().includes('united arab emirates') ||
                                                                                                                            dest.location?.toLowerCase().includes('dubai') ||
                                                                                                                            dest.location?.toLowerCase().includes('uae'))
                                                                                                                            ? '/Destination%20Pages/United%20Arab%20Emirates.webp'
                                                                                                                            : getImageUrl(dest.image) || FALLBACK_IMAGE}
                                                    alt={dest.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                                />
                                                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full !text-[10px] !font-black !text-blue-600 flex items-center gap-2 shadow-sm border border-white/50 !uppercase tracking-wider">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {dest.location}
                                                </div>
                                            </div>
                                            <CardContent className="p-8 flex flex-col flex-grow">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="flex text-amber-500">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg key={i} className={`w-4 h-4 fill-current ${i < (dest.rating || 5) ? 'text-amber-500' : 'text-slate-200'}`} viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{dest.rating || 5}.0 Rating</span>
                                                </div>

                                                <h2 className="!text-2xl !font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors tracking-tight">
                                                    {dest.name}
                                                </h2>

                                                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 line-clamp-3">
                                                    {dest.shortDescription || dest.description}
                                                </p>

                                                <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Starting From</span>
                                                        <span className="text-2xl font-black text-slate-900">
                                                            {dest.price ? `₹${dest.price.toLocaleString('en-IN')}` : "Contact Us"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 !text-sm !font-black !text-slate-900 group-hover:gap-5 transition-all duration-300">
                                                        Discover
                                                        <div className="w-11 h-11 bg-slate-900 group-hover:bg-blue-600 text-white flex items-center justify-center rounded-full shadow-lg transition-all duration-300">
                                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
