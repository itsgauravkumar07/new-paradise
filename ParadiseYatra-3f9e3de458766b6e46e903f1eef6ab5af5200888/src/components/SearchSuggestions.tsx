"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Calendar, DollarSign, Globe, TrendingUp, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { getImageUrl } from '@/lib/utils';

interface PackageSuggestion {
    id: string;
    title: string;
    destination: string;
    price: number;
    duration: string;
    category: string;
    slug: string;
    image: string | null;
    departureDate?: string;
    returnDate?: string;
    availableSeats?: number;
    totalSeats?: number;
    status?: string;
    description?: string;
    country?: string;
    region?: string;
    isFeatured?: boolean;
    type?: 'country' | 'package' | 'destination' | 'fixed-departure' | 'holiday-type' | 'location';
    iso2?: string;
    states?: Array<{
        id: number;
        name: string;
        state_code: string;
        latitude: number;
        longitude: number;
        type: string;
    }>;
    state?: string;
    tourType?: string;
}

interface SearchSuggestionsProps {
    query: string;
    onQueryChange: (query: string) => void;
    onSelect: (suggestion: PackageSuggestion) => void;
    isOpen: boolean;
    onClose: () => void;
    variant?: 'default' | 'hero';
    featuredDestinations?: FeaturedDestinationCard[];
}

interface FeaturedDestinationCard {
    name: string;
    image: string | null;
    size: 'normal' | 'tall';
    href: string;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
};

const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        'holiday': 'bg-gradient-to-r from-orange-500 to-red-500',
        'holiday-type': 'bg-gradient-to-r from-purple-500 to-pink-500',
        'fixed-departure': 'bg-gradient-to-r from-blue-500 to-cyan-500',
        'destination': 'bg-gradient-to-r from-green-500 to-emerald-500',
        'location': 'bg-gradient-to-r from-indigo-500 to-purple-500',
    };
    return colors[category] || 'bg-gradient-to-r from-gray-500 to-gray-600';
};

const slugifyLocation = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

const TRAVEL_NOTES = [
    "Did you know that Tuesday and Wednesday are often the cheapest days to fly on many routes.",
    "Always carry a reusable water bottle while travelling in hilly areas.",
    "Did you know that your sense of taste can change slightly at high altitude during flights.",
    "Keep one set of clothes and your essentials in cabin baggage in case checked luggage is delayed.",
    "Did you know that some airports are larger than small towns and require long walking times.",
    "Download offline maps before entering a region with patchy mobile coverage.",
    "Did you know that sunlight exposure in the morning helps your body adjust to a new time zone faster.",
    "Always keep digital and printed copies of your ID, tickets, and hotel confirmations.",
    "Did you know that window seats usually feel colder than aisle seats on long flights.",
    "Use packing cubes to separate outfits, cables, medicines, and laundry.",
    "Did you know that train stations in Europe often sit much closer to city centers than airports.",
    "Carry a light snack when travelling through remote roads where food stops may be limited.",
    "Did you know that many museums around the world offer one free entry day each month.",
    "Keep a small amount of local cash for taxis, tips, and small shops.",
    "Did you know that your phone battery drains faster in cold mountain destinations.",
    "Always check road conditions before leaving for a hill station during the rainy season.",
    "Did you know that some countries require six months of passport validity even for short trips.",
    "Use hotel business cards or a saved location pin to avoid getting lost late at night.",
    "Did you know that red-eye flights can save hotel costs but may affect your first day badly.",
    "Carry a basic medicine pouch with motion-sickness, fever, and stomach-relief tablets.",
    "Did you know that local SIM cards are often cheaper than international roaming plans.",
    "Always keep one power bank fully charged before a sightseeing day starts.",
    "Did you know that desert destinations can become surprisingly cold after sunset.",
    "Wear layers instead of one thick jacket when travelling between different elevations.",
    "Did you know that some countries fine travelers for carrying certain fresh fruits or seeds.",
    "Book major attractions in advance during peak season to avoid long queues.",
    "Did you know that your body loses more moisture during flights than you may notice.",
    "Always label your luggage clearly inside and outside with your contact details.",
    "Did you know that many historic city centers are best explored on foot rather than by car.",
    "Keep a lightweight rain cover for your backpack during monsoon or mountain travel.",
    "Did you know that sunrise views are usually clearer than sunset views in many mountain regions.",
    "Use a cross-body or anti-theft bag in busy markets and transit hubs.",
    "Did you know that some hotels provide adapters only on request, not by default.",
    "Always inform your bank before an international trip if your cards are strict on fraud alerts.",
    "Did you know that temple, monastery, and church dress codes are stricter in many tourist areas than expected.",
    "Carry tissues and sanitizer because not every stop will have full restroom supplies.",
    "Did you know that a short layover can become stressful if your arrival gate is far from departure.",
    "Store your emergency contacts in both your phone and a small paper note.",
    "Did you know that trains often allow more luggage flexibility than budget airlines.",
    "Always check hotel check-in times before booking very early flights.",
    "Did you know that local buses can give you a better feel of a destination than taxis.",
    "Keep your first day itinerary light so travel delays do not ruin the trip mood.",
    "Did you know that sea-facing rooms may also mean higher humidity for your luggage and clothes.",
    "Use sunscreen even on cloudy days in snowy or high-altitude destinations.",
    "Did you know that some countries charge a city tax at the hotel even after prepaid booking.",
    "Always carry one universal adapter when travelling across multiple countries.",
    "Did you know that food tastes stronger after a long day outdoors because your body needs more energy.",
    "Keep a tiny day bag ready so you do not keep unpacking your main suitcase.",
    "Did you know that local sunrise and sunset times shift faster in mountain regions than many travelers expect.",
    "Always verify ferry and cable-car timings because weather can stop them without much notice.",
    "Did you know that narrow heritage streets often block car access during festival weeks.",
    "Save your hotel address in the local language if you are travelling somewhere with a different script.",
    "Did you know that mountain roads may look short on maps but take much longer in real driving time.",
    "Keep some snacks handy if you are travelling with children on long transfer days.",
    "Did you know that ear pressure changes can feel stronger during mountain drives than on flat highways.",
    "Always wear comfortable shoes on airport days because terminals can involve far more walking than expected.",
    "Did you know that many countries have eSIM options that activate within minutes after landing.",
    "Use hotel laundry services strategically on longer trips instead of overpacking.",
    "Did you know that early morning safari drives are not only cooler but often better for wildlife sightings.",
    "Carry one empty zip pouch for tickets, receipts, and small travel papers.",
    "Did you know that some viewpoints are best visited right after rain because the air gets clearer.",
    "Always double-check baggage weight limits on budget carriers before leaving for the airport.",
    "Did you know that old city areas can have weak GPS signals because of dense architecture.",
    "Keep your camera or phone in a warm pocket in cold weather to protect battery life.",
    "Did you know that many beach destinations have stronger sun reflection from sand than travelers expect.",
    "Use a neck pillow only if it supports your natural posture rather than pushing your head forward.",
    "Did you know that some monuments look their best in the first hour after opening because crowds are lower.",
    "Always keep buffer time when a trip includes mountain roads, ferries, or weather-dependent transport.",
    "Did you know that local breakfast timings can be much earlier in trekking towns than in cities.",
    "Pack one foldable tote bag for shopping, laundry, or unexpected extra items.",
    "Did you know that carrying fewer things often makes you move through airports and stations much faster.",
    "Always check if your hotel offers airport transfers before booking a last-minute taxi.",
    "Did you know that waterfalls and rivers become riskier during monsoon even if the weather seems calm.",
    "Use cloud backup for photos so you do not lose memories if a device gets damaged.",
    "Did you know that famous landmarks often have a quieter side entrance or alternate viewing point.",
    "Keep your daily essentials in the same pocket every day to avoid frantic searches.",
    "Did you know that local street food is often busiest at times when it is freshest.",
    "Always read weather forecasts for both day and night temperatures in desert and mountain regions.",
    "Did you know that many domestic flights close boarding gates earlier than international travelers expect.",
    "Use compression bags only for soft clothing, not for items you need quick access to.",
    "Did you know that staying near a transit station can save more time than staying near a landmark.",
    "Always charge your devices whenever you see a reliable power outlet during long transit days.",
    "Did you know that some travel insurance plans exclude adventure activities unless you add them separately.",
    "Keep a separate pouch for wet items after swimming, rafting, or beach visits.",
    "Did you know that moonlit nights can make certain desert and beach destinations feel completely different.",
    "Always ask about local scams or common tourist traps when you check into a hotel.",
    "Did you know that booking a place with breakfast can reduce morning decision fatigue on packed itineraries.",
    "Use lightweight neutral clothing pieces so more outfits can be built from fewer items.",
    "Did you know that many heritage structures look warmer and richer in color near golden hour.",
    "Always keep enough room in your itinerary for one unplanned stop or spontaneous local recommendation.",
    "Did you know that walking tours often reveal food spots and shortcuts you will not find online.",
    "Carry a small garbage bag or zip pouch to keep your backpack clean on road trips.",
    "Did you know that train platform numbers can change last minute in busy stations.",
    "Always keep your heaviest items at the bottom of your backpack for better balance.",
    "Did you know that some islands have stricter plastic rules and limited ATM access.",
    "Use a simple daily budget note so small expenses do not quietly pile up.",
    "Did you know that some destinations feel crowded only at one peak hour and calm the rest of the day.",
    "Always check whether your destination accepts UPI, cards, cash, or a mix before you arrive.",
    "Did you know that the best souvenir is often a small useful local item rather than something bulky.",
    "Use a calm first-night routine after arrival so you sleep better in a new place."
];

const SearchSuggestions = ({
    query,
    onQueryChange,
    onSelect,
    isOpen,
    onClose,
    variant = 'default',
    featuredDestinations: featuredDestinationsProp = []
}: SearchSuggestionsProps) => {
    const [suggestions, setSuggestions] = useState<PackageSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [error, setError] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showFeaturedFadeLeft, setShowFeaturedFadeLeft] = useState(false);
    const [showFeaturedFadeRight, setShowFeaturedFadeRight] = useState(false);
    const [travelNoteIndex, setTravelNoteIndex] = useState(0);
    const heroBackgroundUrl = '/Home/Seach Lightbox/Background.jpg';
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
    const [typedPlaceholder, setTypedPlaceholder] = useState('');
    const [typingTargetIndex, setTypingTargetIndex] = useState(0);
    const [isDeletingPlaceholder, setIsDeletingPlaceholder] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const activeQueryRef = useRef('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const keepFocusedRef = useRef(false);
    const resultsContainerRef = useRef<HTMLDivElement>(null);
    const featuredScrollRef = useRef<HTMLDivElement>(null);

    const placeholderTexts = variant === 'hero'
        ? [
            "Pick your destination...",
            "Explore Ladakh...",
            "Visit Kerala...",
            "Discover Kashmir...",
            "Journey to Himachal Pradesh...",
        ]
        : [
            "Search destinations, packages...",
            "Find your perfect trip...",
            "Discover amazing places...",
            "Plan your next adventure...",
        ];

    // Rotating placeholder effect
    useEffect(() => {
        if (variant !== 'hero' && !isFocused && !query.trim()) {
            const interval = setInterval(() => {
                setCurrentPlaceholder((prev) => (prev + 1) % placeholderTexts.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [variant, isFocused, query, placeholderTexts.length]);

    const heroTypingTargets = featuredDestinationsProp.length > 0
        ? featuredDestinationsProp.map((destination) => destination.name)
        : placeholderTexts.map((text) => text.replace(/\.\.\.$/, '').replace(/^(Pick|Explore|Visit|Discover|Journey to)\s+/i, ''));

    useEffect(() => {
        if (variant !== 'hero' || !isOpen || query.trim()) return;
        if (heroTypingTargets.length === 0) return;

        const currentTarget = heroTypingTargets[typingTargetIndex % heroTypingTargets.length];
        const nextText = currentTarget;

        let timer: number;

        if (!isDeletingPlaceholder && typedPlaceholder.length < nextText.length) {
            timer = window.setTimeout(() => {
                setTypedPlaceholder(nextText.slice(0, typedPlaceholder.length + 1));
            }, 58);
        } else if (!isDeletingPlaceholder && typedPlaceholder.length === nextText.length) {
            timer = window.setTimeout(() => {
                setIsDeletingPlaceholder(true);
            }, 700);
        } else if (isDeletingPlaceholder && typedPlaceholder.length > 0) {
            timer = window.setTimeout(() => {
                setTypedPlaceholder(nextText.slice(0, typedPlaceholder.length - 1));
            }, 26);
        } else {
            timer = window.setTimeout(() => {
                setIsDeletingPlaceholder(false);
                setTypingTargetIndex((prev) => (prev + 1) % heroTypingTargets.length);
            }, 24);
        }

        return () => window.clearTimeout(timer);
    }, [variant, isOpen, query, heroTypingTargets, typingTargetIndex, typedPlaceholder, isDeletingPlaceholder]);

    // Keep hero input unfocused on open
    useEffect(() => {
        if (variant === 'hero' && isOpen) {
            setIsFocused(false);
            inputRef.current?.blur();
        }
    }, [variant, isOpen]);

    // Escape key to close hero modal
    useEffect(() => {
        if (variant !== 'hero' || !isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [variant, isOpen, onClose]);

    useEffect(() => {
        if (variant !== 'hero' || !isOpen) return;

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [variant, isOpen]);

    useEffect(() => {
        if (variant !== 'hero' || !isOpen || TRAVEL_NOTES.length <= 1) return;

        const interval = window.setInterval(() => {
            setTravelNoteIndex((prev) => (prev + 1) % TRAVEL_NOTES.length);
        }, 5000);

        return () => window.clearInterval(interval);
    }, [variant, isOpen]);

    useEffect(() => {
        if (variant !== 'hero') return;
        if (!isOpen || query.trim()) {
            setTypedPlaceholder('');
            setIsDeletingPlaceholder(false);
            setTypingTargetIndex(0);
        }
    }, [variant, isOpen, query]);

    useEffect(() => {
        if (variant !== 'hero' || !isOpen || query.trim() || featuredDestinationsProp.length === 0) return;

        const updateFeaturedFadeState = () => {
            const container = featuredScrollRef.current;
            if (!container) return;

            const { scrollLeft, scrollWidth, clientWidth } = container;
            setShowFeaturedFadeLeft(scrollLeft > 4);
            setShowFeaturedFadeRight(scrollLeft + clientWidth < scrollWidth - 4);
        };

        updateFeaturedFadeState();

        const container = featuredScrollRef.current;
        if (!container) return;

        container.addEventListener('scroll', updateFeaturedFadeState, { passive: true });
        window.addEventListener('resize', updateFeaturedFadeState);

        return () => {
            container.removeEventListener('scroll', updateFeaturedFadeState);
            window.removeEventListener('resize', updateFeaturedFadeState);
        };
    }, [variant, isOpen, query, featuredDestinationsProp]);

    const calculateDropdownPosition = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const dropdownHeight = 400;
        const spaceBelow = viewportHeight - rect.bottom;
        let top = rect.bottom + scrollY + 12;
        let left = rect.left;
        const width = rect.width;
        if (spaceBelow < 100) {
            top = rect.top + scrollY - dropdownHeight - 12;
        }
        setDropdownPosition({ top, left, width });
    }, []);

    const fetchSuggestions = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }
        activeQueryRef.current = searchQuery.trim();
        setIsLoading(true);
        setError(null);
        try {
            const [packagesResponse, fixedResponse] = await Promise.all([
                fetch(`/api/all-packages?q=${encodeURIComponent(searchQuery)}&limit=10`, { cache: 'no-store' }),
                fetch(`/api/fixed-departures/suggest?q=${encodeURIComponent(searchQuery)}`, { cache: 'no-store' })
            ]);
            let packages = [];
            if (packagesResponse.ok) {
                const data = await packagesResponse.json();
                packages = data.packages || [];
            }
            let fixedDepartures = [];
            if (fixedResponse.ok) {
                const data = await fixedResponse.json();
                fixedDepartures = data.suggestions || [];
            }
            const mappedPackages = packages.map((pkg: any) => ({
                id: pkg._id,
                title: pkg.name,
                destination: pkg.location || pkg.state || pkg.country || 'Multiple Locations',
                price: pkg.price || 0,
                duration: pkg.duration || 'N/A',
                category: pkg.category || 'package',
                slug: pkg.slug || pkg._id,
                image: getImageUrl(pkg.image || (pkg.images && pkg.images.length > 0 ? pkg.images[0] : null)) || null,
                type: 'package' as const,
                tourType: pkg.tourType
            }));
            const mappedFixed = fixedDepartures.map((departure: any) => ({
                ...departure,
                type: 'fixed-departure' as const,
                category: 'fixed-departure'
            }));
            const allSuggestions = [...mappedPackages, ...mappedFixed].slice(0, 15);
            if (activeQueryRef.current !== searchQuery.trim()) {
                return;
            }
            setSuggestions(allSuggestions);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            if (activeQueryRef.current !== searchQuery.trim()) {
                return;
            }
            setError('Failed to load suggestions');
            setSuggestions([]);
        } finally {
            if (activeQueryRef.current === searchQuery.trim()) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (query.trim()) {
            timeoutRef.current = setTimeout(() => fetchSuggestions(query), 300);
        } else {
            activeQueryRef.current = '';
            setSuggestions([]);
            setIsLoading(false);
            setError(null);
        }
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [query, fetchSuggestions]);

    useEffect(() => { setSelectedIndex(-1); }, [suggestions]);

    const isMobileDevice = () => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < 640 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const isMobile = isMobileDevice();
        switch (e.key) {
            case 'ArrowDown':
                if (!isFocused || suggestions.length === 0) return;
                e.preventDefault();
                setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
                break;
            case 'ArrowUp':
                if (!isFocused || suggestions.length === 0) return;
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (isMobile && query.trim()) {
                    keepFocusedRef.current = true;
                    setIsFocused(true);
                    if (inputRef.current) inputRef.current.blur();
                    if (suggestions.length === 0 && !isLoading) fetchSuggestions(query);
                    setTimeout(() => { keepFocusedRef.current = false; }, 300);
                } else if (isFocused && selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    onSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsFocused(false);
                if (inputRef.current) inputRef.current.blur();
                onClose();
                break;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        const handleResize = () => { if (isFocused) calculateDropdownPosition(); };
        const handleScroll = () => {
            if (isFocused) {
                const isMobile = isMobileDevice();
                if (isMobile && variant !== 'hero') closeMobileKeyboard();
                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = setTimeout(() => calculateDropdownPosition(), 16);
            }
        };
        if (isFocused) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleScroll, true);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, true);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, [isFocused, calculateDropdownPosition]);

    const closeMobileKeyboard = () => {
        const isMobile = isMobileDevice();
        if (isMobile && inputRef.current) inputRef.current.blur();
    };

    useEffect(() => {
        const resultsContainer = resultsContainerRef.current;
        if (!resultsContainer || variant === 'hero') return;
        const handleResultsScroll = () => {
            const isMobile = isMobileDevice();
            if (isMobile && isFocused) closeMobileKeyboard();
        };
        resultsContainer.addEventListener('scroll', handleResultsScroll, { passive: true });
        resultsContainer.addEventListener('touchstart', handleResultsScroll, { passive: true });
        return () => {
            resultsContainer.removeEventListener('scroll', handleResultsScroll);
            resultsContainer.removeEventListener('touchstart', handleResultsScroll);
        };
    }, [isFocused, variant]);

    const handleSuggestionClick = (suggestion: PackageSuggestion) => {
        closeMobileKeyboard();
        if (suggestion.type === 'location' && suggestion.iso2) {
            window.location.href = `/packages?country=${encodeURIComponent(suggestion.destination)}`;
            return;
        }
        onSelect(suggestion);
    };

    const handleInputFocus = () => {
        setIsFocused(true);
        calculateDropdownPosition();
        setTimeout(() => calculateDropdownPosition(), 50);
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            if (keepFocusedRef.current) return;
            const isMobile = isMobileDevice();
            if (isMobile && query.trim() && suggestions.length > 0) return;
            if (!containerRef.current?.contains(document.activeElement)) {
                setIsFocused(false);
                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            }
        }, 150);
    };

    const getInputClasses = () => {
        if (variant === 'hero') {
            return "w-full min-h-[52px] rounded-full bg-white pl-14 pr-4 md:pr-44 py-3 text-base text-[#212B40] placeholder:text-[#212B40]/55 focus:outline-none";
        }
        return "w-full pl-11 pr-4 py-3.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200";
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {variant !== 'hero' && (
                <div className="relative group">
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${isFocused ? 'scale-110' : 'scale-100'}`}>
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={!isFocused && !query.trim() ? placeholderTexts[currentPlaceholder] : "Search destinations..."}
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className={getInputClasses()}
                    />
                </div>
            )}

            <AnimatePresence>
                {/* ── HERO VARIANT: Premium fullscreen dark overlay ── */}
                {variant === 'hero' && isOpen && (
                    <>
                        {createPortal(
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="fixed inset-0 z-[99999] overflow-hidden flex flex-col"
                                style={{
                                    backgroundColor: '#08101f',
                                    backgroundImage: `url("${heroBackgroundUrl}")`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-5 right-5 z-50 p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                                    aria-label="Close search"
                                >
                                    <X className="w-7 h-7" />
                                </button>

                                {/* ── Main Content ── */}
                                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-24 sm:pt-28 pb-8 overflow-hidden">
                                    <div className="w-full max-w-5xl">
                                        {/* Headline */}
                                        <motion.h1
                                            initial={{ opacity: 0, y: -16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05, duration: 0.3 }}
                                            className="!font-unbounded !text-3xl sm:!text-4xl md:!text-[3.35rem] !font-bold text-white text-center mb-7 sm:mb-9"
                                        >
                                            This one won’t be basic.
                                        </motion.h1>

                                        {/* Search Input */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1, duration: 0.3 }}
                                            className="relative w-full max-w-3xl mx-auto mb-7 sm:mb-9"
                                        >
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                <Search className="w-6 h-6 text-[#212B40]" />
                                            </div>
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                placeholder={variant === 'hero' ? '' : placeholderTexts[currentPlaceholder]}
                                                value={query}
                                                onChange={(e) => onQueryChange(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onFocus={() => setIsFocused(true)}
                                                onBlur={handleInputBlur}
                                                className={getInputClasses()}
                                            />
                                            {variant === 'hero' && !query && !isFocused && (
                                                <div className="pointer-events-none absolute inset-y-0 left-14 right-24 hidden items-center overflow-hidden md:flex">
                                                    <div className="flex items-center text-[clamp(0.95rem,1.3vw,1.1rem)] text-[#6b7280]">
                                                        <span>{typedPlaceholder}</span>
                                                        <motion.span
                                                            animate={{ opacity: [1, 0, 1] }}
                                                            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                                                            className="ml-0.5 inline-block h-6 w-[2px] rounded-full bg-[#374151]"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {variant === 'hero' && !query && !isFocused && (
                                                <div className="pointer-events-none absolute inset-y-0 left-14 right-4 flex items-center overflow-hidden md:hidden">
                                                    <div className="flex items-center text-base text-[#6b7280]">
                                                        <span>{typedPlaceholder}</span>
                                                        <motion.span
                                                            animate={{ opacity: [1, 0, 1] }}
                                                            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                                                            className="ml-0.5 inline-block h-5 w-[2px] rounded-full bg-[#374151]"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="pointer-events-none absolute inset-y-0 right-4 hidden md:flex items-center">
                                                <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5">
                                                    <span className="text-xs font-bold text-blue-600">Search Destinations</span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* ── Results or Featured Grid ── */}
                                        {!isLoading && !error && suggestions.length > 0 && (
                                            <p className="text-base sm:text-lg font-semibold !text-white mb-4">
                                                This Is What We Have For You.
                                            </p>
                                        )}

                                        <motion.div
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15, duration: 0.3 }}
                                            className="relative w-full max-h-[42vh]"
                                        >
                                            <div
                                                ref={resultsContainerRef}
                                                className="max-h-[42vh] overflow-y-auto scrollbar-hide"
                                            >
                                            {/* Loading */}
                                            {isLoading && (
                                                <div className="flex justify-center py-16">
                                                    <div className="min-w-[250px] rounded-[18px] border border-white/25 bg-white/12 px-6 py-5 backdrop-blur-md">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <div className="flex items-center gap-2">
                                                                {[0, 1, 2].map((dot) => (
                                                                    <motion.span
                                                                        key={dot}
                                                                        animate={{ opacity: [0.35, 1, 0.35], y: [0, -4, 0] }}
                                                                        transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.14, ease: "easeInOut" }}
                                                                        className="h-2.5 w-2.5 rounded-full bg-white"
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm font-semibold text-white">Finding your next escape...</span>
                                                        </div>
                                                        <p className="mt-3 text-center text-xs tracking-[0.18em] text-white/65 uppercase">
                                                            Curating destinations
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                        {/* Search Results */}
                                            {!isLoading && !error && suggestions.length > 0 && (
                                                <div className="pb-6">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                    {suggestions.map((suggestion, index) => (
                                                        <motion.div
                                                            key={suggestion.id}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: index * 0.04 }}
                                                            className="relative rounded-[6px] overflow-hidden cursor-pointer group"
                                                            style={{ height: '140px' }}
                                                            onClick={() => handleSuggestionClick(suggestion)}
                                                        >
                                                            {suggestion.image ? (
                                                                <img
                                                                    src={suggestion.image}
                                                                    alt={suggestion.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                                                                    <MapPin className="w-8 h-8 text-white/70" />
                                                                </div>
                                                            )}
                                                            {/* Bottom gradient */}
                                                            <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/92 via-black/52 via-45% to-transparent" />
                                                            <div className="absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/10" />
                                                            {/* Text */}
                                                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                                                <p className="!text-white text-xs font-semibold leading-tight line-clamp-2">{suggestion.title}</p>
                                                                {suggestion.price > 0 && (
                                                                    <p className="text-[#4ade80] text-[10px] font-bold mt-0.5">{formatPrice(suggestion.price)}</p>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                </div>
                                            )}

                                        {/* No Results */}
                                            {!isLoading && !error && suggestions.length === 0 && query.trim() && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                                                <div className="w-14 h-14 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
                                                    <Search className="w-7 h-7 text-white/50" />
                                                </div>
                                                <p className="text-white/80 font-semibold mb-1.5">No results for "{query}"</p>
                                                <p className="text-white/40 text-sm">Try different keywords or explore below</p>
                                                </motion.div>
                                            )}

                                        {/* Featured Destinations Grid (when no query) */}
                                            {!isLoading && !query.trim() && (
                                                <div>
                                                <p className="text-base sm:text-lg font-semibold !text-white mb-4">
                                                    Can't Decide ? We Got You.
                                                </p>
                                                {/* Masonry-style horizontal scroll layout */}
                                                <div className="relative">
                                                    <div
                                                        ref={featuredScrollRef}
                                                        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                                                    >
                                                        {featuredDestinationsProp.map((dest, index) => (
                                                            <motion.div
                                                                key={dest.name}
                                                                initial={{ opacity: 0, y: 16 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="relative flex-shrink-0 rounded-[6px] overflow-hidden cursor-pointer group"
                                                                style={{
                                                                    width: dest.size === 'tall' ? '160px' : '140px',
                                                                    height: dest.size === 'tall' ? '200px' : '170px',
                                                                }}
                                                                onClick={() => {
                                                                    window.location.href = dest.href;
                                                                }}
                                                            >
                                                                {dest.image ? (
                                                                    <img
                                                                        src={dest.image}
                                                                        alt={dest.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                                                                        <MapPin className="w-8 h-8 text-white/70" />
                                                                    </div>
                                                                )}
                                                                {/* Gradient overlay */}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                                                <div className="absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/10" />
                                                                {/* Name at bottom */}
                                                                <div className="absolute bottom-3 left-3 right-3">
                                                                    <p className="!text-white text-base font-bold leading-tight">{dest.name}</p>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>

                                                    {showFeaturedFadeLeft && (
                                                        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#577791] via-[#577791]/40 to-transparent" />
                                                    )}

                                                    {showFeaturedFadeRight && (
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#577791] via-[#577791]/40 to-transparent" />
                                                    )}
                                                </div>
                                                </div>
                                            )}
                                            </div>

                                    </motion.div>
                                    </div>
                                </div>

                                {/* ── Bottom Rating Bar ── */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center justify-between px-5 sm:px-8 py-3 border-t border-white/10"
                                >
                                    <div className="flex min-w-0 flex-1 items-center justify-center">
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <AnimatePresence mode="wait">
                                                <motion.p
                                                    key={travelNoteIndex}
                                                    initial={{ opacity: 0, scale: 0.82 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.06 }}
                                                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                                                    className="min-h-[2.75rem] px-2 text-center !text-white text-xs leading-relaxed sm:min-h-0 sm:px-0 sm:text-left sm:truncate"
                                                >
                                                    {TRAVEL_NOTES[travelNoteIndex]}
                                                </motion.p>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400/40'}`} />
                                            ))}
                                        </div>
                                        <span className="text-white font-bold text-sm">4.4</span>
                                        <span className="text-white text-xs">160+ reviews</span>
                                    </div>
                                </motion.div>
                            </motion.div>,
                            document.body
                        )}
                    </>
                )}

                {/* ── NON-HERO dropdown (unchanged) ── */}
                {variant !== 'hero' && isFocused && (query.trim() || isLoading) && (
                    <>
                        {createPortal(
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 bg-black/10 z-[99999]"
                                onClick={() => setIsFocused(false)}
                            />,
                            document.body
                        )}

                        {createPortal(
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200 z-[999999] overflow-hidden"
                                style={{
                                    position: 'absolute',
                                    top: dropdownPosition.top,
                                    left: dropdownPosition.left,
                                    width: dropdownPosition.width,
                                    maxWidth: '100vw',
                                    zIndex: 999999
                                }}
                                onTouchStart={() => closeMobileKeyboard()}
                            >
                                {suggestions.length > 0 && !isLoading && (
                                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border-b border-gray-200/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <TrendingUp className="w-3 h-3 text-orange-600" />
                                                <span className="text-xs font-semibold text-gray-700">Top Results</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{suggestions.length} found</span>
                                        </div>
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="p-6 sm:p-8 text-center">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
                                            {[0, 1, 2].map((dot) => (
                                                <motion.span
                                                    key={dot}
                                                    animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
                                                    transition={{ duration: 1, repeat: Infinity, delay: dot * 0.12, ease: "easeInOut" }}
                                                    className="h-2 w-2 rounded-full bg-orange-500"
                                                />
                                            ))}
                                            <span className="text-xs sm:text-sm font-medium text-gray-700">Searching destinations...</span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-6 sm:p-8 text-center">
                                        <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                                            <Search className="w-6 h-6 text-red-500" />
                                        </div>
                                        <p className="text-xs sm:text-sm text-red-600 font-medium">{error}</p>
                                    </div>
                                )}

                                {!isLoading && !error && suggestions.length > 0 && (
                                    <div ref={resultsContainerRef} className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto scrollbar-hide">
                                        {suggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`p-2 sm:p-2.5 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 ${selectedIndex === index ? 'bg-gradient-to-r from-orange-50 to-red-50' : ''}`}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                            >
                                                <div className="flex items-start gap-2 sm:gap-2.5">
                                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shadow-md ring-1 ring-gray-200">
                                                        {suggestion.type === 'location' ? (
                                                            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                                                                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                                            </div>
                                                        ) : suggestion.image ? (
                                                            <img src={suggestion.image} alt={suggestion.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center">
                                                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-1.5 mb-0.5">
                                                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate flex-1">{suggestion.title}</h4>
                                                            <span className={`flex-shrink-0 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] text-white rounded-full ${getCategoryColor(suggestion.type === 'location' ? 'location' : suggestion.category)} shadow-sm`}>
                                                                {suggestion.type === 'location' ? 'Location' :
                                                                    suggestion.category === 'fixed-departure' ? 'Fixed' :
                                                                        suggestion.category === 'destination' ? 'Place' :
                                                                            suggestion.category === 'holiday-type' ? 'Type' : 'Package'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600 mb-0.5">
                                                            <div className="flex items-center gap-0.5">
                                                                <MapPin className="w-2.5 h-2.5 text-orange-500" />
                                                                <span className="font-medium truncate max-w-[100px] sm:max-w-none">{suggestion.destination}</span>
                                                            </div>
                                                            {suggestion.type !== 'location' && (
                                                                <>
                                                                    <div className="hidden sm:flex items-center gap-0.5">
                                                                        <Calendar className="w-2.5 h-2.5 text-blue-500" />
                                                                        <span>{suggestion.duration}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-0.5 font-semibold text-green-600">
                                                                        <DollarSign className="w-2.5 h-2.5" />
                                                                        <span>{formatPrice(suggestion.price)}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {!isLoading && !error && suggestions.length === 0 && query.trim() && (
                                    <div className="p-6 sm:p-8 text-center">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-3">
                                            <Search className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5">No results found for "{query}"</p>
                                        <p className="text-[10px] sm:text-xs text-gray-500">Try different keywords or explore our destinations</p>
                                    </div>
                                )}
                            </motion.div>,
                            document.body
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchSuggestions;
