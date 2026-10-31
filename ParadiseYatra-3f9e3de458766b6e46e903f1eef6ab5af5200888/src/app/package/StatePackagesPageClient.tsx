"use client";

import { Fragment, useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Award, CalendarDays, ChevronDown, Headphones, MapPin, Package, Phone, SearchX, ShieldCheck, SlidersHorizontal, Sparkles, Star, Users, X } from 'lucide-react';
import { TOUR_MENUS } from '@/lib/tourMenus';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl, getPackagePriceLabel, getDestinationWebp } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import PackageCard from '@/components/ui/PackageCard';
import DestinationPackageCard, { type ListingPackage } from '@/components/packages/DestinationPackageCard';
import { DURATIONS, PRICES, durationInDays, matchesDuration } from '@/components/ui/SearchFilterSidebar';
import PackageFilters, { type FilterGroup, type FilterSelection } from '@/components/packages/PackageFilters';
import { toAmenities } from '@/lib/amenities';
import SectionHeader from '@/components/ui/SectionHeader';
import CarouselArrows from '@/components/ui/CarouselArrows';
import NoPackagesEnquiryForm from '@/components/NoPackagesEnquiryForm';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import MomentsStrip from '@/components/moments/MomentsStrip';
import FAQSection from '@/components/FAQSection';
import { averageRating, fetchPastTrips } from '@/lib/fdExperiences';
import { COMPANY } from '@/lib/chat/company';

const PAGE_SIZE = 12;
const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`;

// Hero images for the whole-region pages (/package/india, /package/international)
const REGION_HERO_IMAGES: Record<'india' | 'international', string> = {
    india: '/Destination%20Pages/Jammu%20and%20Kashmir.webp',
    international: '/Destination%20Pages/Maldives.webp',
};

const destinationDescriptions: Record<string, string> = {
    'kerala': 'Known as "God\'s Own Country", Kerala is famous for its serene backwaters, lush tea gardens, pristine beaches, and rich cultural heritage. Experience the perfect blend of nature and tradition as you explore the tranquil networks of canals in Alleppey, the misty hills of Munnar, and the pristine shores of Varkala. From ancient Ayurvedic therapies that rejuvenate the soul to delectable local cuisine infused with fresh spices, Kerala offers a truly transformative escape.',
    'goa': 'Goa is India\'s pocket-sized paradise, renowned for its golden beaches, vibrant nightlife, Portuguese colonial architecture, and delicious seafood. Beyond the lively parties and stunning coastlines, you can explore centuries-old cathedrals, winding spice plantations, and quaint villages that reflect a unique blend of Indian and Portuguese heritage. Whether you seek thrilling water sports, tranquil yoga retreats, or romantic sunset cruises, Goa promises an unforgettable coastal getaway.',
    'rajasthan': 'The Land of Kings, Rajasthan offers a royal experience with its magnificent palaces, historic forts, colorful culture, and the vast Thar Desert. Wander through the pink hues of Jaipur, marvel at the blue city of Jodhpur, and take a serene boat ride on the romantic lakes of Udaipur. With its grand heritage hotels, vibrant bazaars, and traditional folk music, Rajasthan immerses you in the majestic history and enduring charm of India\'s royal past.',
    'kashmir': 'Often referred to as "Paradise on Earth", Kashmir captivates visitors with its snow-capped mountains, beautiful Dal Lake, and blooming Mughal gardens. Drift along the calm waters in a traditional Shikara, glide down the world-class ski slopes of Gulmarg, and wander through lush meadows bursting with colorful wildflowers. The warm hospitality, exquisite handicrafts, and rich culinary traditions make a journey to Kashmir a truly magical and romantic experience.',
    'himachal-pradesh': 'Nestled in the Himalayas, Himachal Pradesh is a haven for nature lovers and adventure enthusiasts, featuring picturesque hill stations and breathtaking landscapes. Whether you are trekking through the stunning valleys of Manali, exploring the colonial charm of Shimla, or finding spiritual peace in Dharamshala, the state offers diverse experiences. With its crisp mountain air, gushing rivers, and serene monasteries, Himachal is the ultimate destination to unwind and connect with nature.',
    'uttarakhand': 'The "Land of Gods", Uttarakhand is famous for its sacred pilgrimage sites, majestic Himalayan peaks, and thrilling adventure sports in Rishikesh. Discover the spiritual aura of Haridwar, embark on the legendary Char Dham yatra, or challenge yourself with white-water rafting and jungle safaris in Jim Corbett National Park. From lush green valleys to snow-covered peaks, Uttarakhand offers both spiritual awakening and heart-pounding adventures.',
    'sikkim': 'A hidden gem in the Northeast, Sikkim boasts stunning views of Mt. Kanchenjunga, serene monasteries, and diverse flora and fauna. Explore the vibrant capital city of Gangtok, drive through the breathtaking high-altitude mountain passes, and immerse yourself in the peaceful ambiance of ancient Buddhist shrines. Known for its organic farming, pristine lakes, and warm local hospitality, Sikkim is a paradise for travelers seeking tranquility and untouched natural beauty.',
    'andaman-and-nicobar-island': 'A tropical paradise offering crystal-clear waters, white sandy beaches, colorful coral reefs, and exciting water sports. Dive into the vibrant underwater world with scuba diving and snorkeling adventures, or simply relax on the sun-kissed shores of Radhanagar Beach. With its fascinating history, dense tropical forests, and secluded island resorts, the Andamans provide the perfect backdrop for romantic honeymoons and thrilling family vacations.',
    'ladakh': 'The Land of High Passes, Ladakh is famous for its stark, breathtaking landscapes, ancient Buddhist monasteries, and thrilling mountain roads. Experience the surreal beauty of the azure Pangong Lake, cross the world\'s highest motorable passes, and marvel at the stark contrast of snow-capped peaks against the desert valleys. The rich Tibetan-Buddhist culture and untamed natural beauty make Ladakh a dream destination for adventurers and spiritual seekers alike.',
    'tamil-nadu': 'Rich in Dravidian culture, Tamil Nadu is known for its magnificent temples, classical arts, hill stations like Ooty, and diverse culinary heritage. Marvel at the towering gopurams of Madurai, stroll through the French colonial streets of Pondicherry, and relax in the cool, misty climate of the Nilgiri Hills. From golden beaches along the Coromandel Coast to ancient stone carvings in Mahabalipuram, Tamil Nadu offers a deep and rewarding cultural immersion.',
    'dubai': 'A city of superlatives, Dubai offers futuristic architecture, luxury shopping, desert safaris, and world-class entertainment. Stand at the top of the Burj Khalifa, explore the massive indoor theme parks, and shop for gold in the traditional souks. Beyond the glitz and glamour, experience the magic of an Arabian night with thrilling dune bashing, camel rides, and dining under the stars in the vast, mystical desert.',
    'thailand': 'The Land of Smiles features pristine beaches, ornate temples, vibrant street life, and world-renowned cuisine. Discover the bustling night markets of Bangkok, explore the historic ruins of Ayutthaya, and relax on the stunning, limestone-fringed islands of Phuket and Krabi. With its incredibly affordable luxury, warm tropical climate, and deeply spiritual Buddhist culture, Thailand remains a favorite getaway for travelers around the globe.',
    'malaysia': 'A melting pot of cultures, Malaysia offers a mix of modern cities, colonial architecture, lush rainforests, and beautiful islands. Admire the iconic Petronas Twin Towers in Kuala Lumpur, explore the historic streets of Penang, and dive into the crystal-clear waters of Langkawi. The country\'s rich multicultural heritage translates into an incredible culinary scene, vibrant festivals, and diverse landscapes ranging from cool tea highlands to ancient jungles.',
    'maldives': 'The ultimate tropical getaway, the Maldives is famous for its luxurious overwater bungalows, crystal-clear lagoons, and vibrant marine life. Spend your days snorkeling alongside manta rays and sea turtles, enjoying private beachside dining, and relaxing in world-class spas floating above the ocean. With its secluded resorts, powdery white sand, and endless turquoise horizons, the Maldives offers unparalleled luxury and romance.',
    'singapore': 'A dynamic city-state known for its stunning skyline, lush green spaces, diverse food scene, and world-class attractions. Marvel at the futuristic Supertrees in Gardens by the Bay, enjoy family-friendly thrills at Universal Studios Sentosa, and savor Michelin-starred street food in the bustling hawker centers. Clean, safe, and incredibly efficient, Singapore flawlessly blends ultra-modern innovation with a rich tapestry of Asian cultures.',
    'indonesia': 'An archipelago of thousands of islands, offering diverse experiences from the cultural hub of Bali to the volcanic landscapes of Java. Explore the iconic terraced rice paddies of Ubud, surf the world-class waves of the coastline, and witness breathtaking sunrises over ancient temples. With its rich spiritual traditions, vibrant arts scene, and incredible biodiversity, Indonesia provides a deeply enriching and adventurous travel experience.'
};

// Facts the About page already publishes (kept in COMPANY)
const WHY_BOOK = [
    { Icon: Award, title: `${COMPANY.yearsOfExperience} years`, text: `Planning trips since ${COMPANY.foundedYear}` },
    { Icon: Users, title: `${COMPANY.clients} travellers`, text: 'Families, couples and groups hosted' },
    { Icon: ShieldCheck, title: 'Govt. registered', text: 'Registered with Uttarakhand Tourism' },
    { Icon: Headphones, title: 'Real people', text: 'One trip expert from enquiry to return' },
];

const SORT_OPTIONS = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'duration-asc', label: 'Duration: Shortest' },
    { value: 'duration-desc', label: 'Duration: Longest' },
];

const FILTER_KEYS =['location', 'duration', 'budget', 'inclusions', 'themes'] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

/** Tag (theme) ids on a package; the API returns plain ids or populated tags. */
const tagIds = (tags: unknown): string[] =>
    Array.isArray(tags)
        ? tags.map((t) => (typeof t === 'string' ? t : (t as { _id?: string })?._id)).filter((id): id is string => !!id)
        : [];

const ListingSkeleton = () => (
    <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl border border-slate-100 bg-white md:h-56" />
        ))}
    </div>
);

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    icon: React.ReactNode;
    width?: string;
}

const FilterSelect = ({ value, onChange, options, icon, width = 'w-[160px]' }: FilterSelectProps) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger
            className={`h-10 shrink-0 gap-1.5 rounded-full border-slate-200 text-xs font-semibold ${width} ${
                value !== 'all' && value !== 'recommended' ? 'border-primary bg-primary-light text-primary' : 'bg-white'
            }`}
        >
            {icon}
            <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
            {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
        </SelectContent>
    </Select>
);

interface DedicatedPackagesPageClientProps {
    tourType: 'india' | 'international';
    /** Omit both state and country to list every package for the tour type */
    state?: string;
    country?: string;
    /** Loaded on the server (page.tsx) so the list is in the HTML; when missing, it's fetched in the browser */
    initialPackages?: ListingPackage[];
    /** Admin > Page Content for this page, loaded on the server (undefined = not loaded, fetch in the browser) */
    initialContent?: { content?: string; image?: string; title?: string } | null;
    /** Destination FAQs loaded on the server */
    initialFaqs?: { question: string; answer: string }[];
    /** Proper name from the data, e.g. "Jammu and Kashmir" for the slug "jammu-and-kashmir" */
    displayName?: string;
}

export default function DedicatedPackagesPageClient({
    tourType,
    state,
    country,
    initialPackages,
    initialContent,
    initialFaqs,
    displayName,
}: DedicatedPackagesPageClientProps) {
    const [allItems, setAllItems] = useState<ListingPackage[]>(initialPackages ?? []);
    const [suggestions, setSuggestions] = useState<ListingPackage[]>([]);
    const [loading, setLoading] = useState(!initialPackages);

    // Content managed in Admin > Page Content
    const [dynamicOverview, setDynamicOverview] = useState<string | null>(initialContent?.content || null);
    const [dynamicTitle, setDynamicTitle] = useState<string | null>(initialContent?.title || null);
    const [dynamicImage, setDynamicImage] = useState<string | null>(initialContent?.image || null);

    // Real reviews from past group trips to this destination (none → no stars shown)
    const [reviewStats, setReviewStats] = useState<{ rating: number; count: number } | null>(null);

    const [selected, setSelected] = useState<FilterSelection>({});
    const [sortBy, setSortBy] = useState('recommended');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [tagNames, setTagNames] = useState<Record<string, string>>({});
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [aboutOpen, setAboutOpen] = useState(false);

    // Enquiry popup: a specific package, or a general enquiry for the destination
    const [enquiry, setEnquiry] = useState<{ title: string; price?: string } | null>(null);

    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const isRegionPage = !state && !country;
    const regionMenu = TOUR_MENUS[tourType];
    const locationField = tourType === 'india' ? 'state' : 'country';

    const locationLabel = state || country || (tourType === 'india' ? 'India' : 'International');
    const formattedLocation =
        displayName ||
        locationLabel
            .replace(/-/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                let packages: ListingPackage[] = initialPackages ?? [];
                // Already rendered from the server: only the suggestions below are loaded here
                if (!initialPackages) {
                    setLoading(true);
                    const params = new URLSearchParams({ tourType, isActive: 'true', limit: '100' });
                    if (state) params.append('state', state);
                    if (country) params.append('country', country);

                    const packagesResponse = await fetch(`/api/all-packages?${params.toString()}`, { cache: 'no-store' });
                    if (!packagesResponse.ok) throw new Error('Failed to fetch packages');
                    packages = (await packagesResponse.json()).packages || [];
                    if (!mounted) return;
                    setAllItems(packages);
                    setLoading(false);
                }

                const suggestionsResponse = await fetch(`/api/all-packages?limit=24&isActive=true`, { cache: 'no-store' });
                if (suggestionsResponse.ok) {
                    const data = await suggestionsResponse.json();
                    const list = Array.isArray(data) ? data : Array.isArray(data?.packages) ? data.packages : [];
                    const shown = new Set(packages.map((p) => p._id));
                    if (mounted) setSuggestions(list.filter((p: ListingPackage & { isActive?: boolean }) => p?.isActive !== false && !shown.has(p?._id)).slice(0, 9));
                }
            } catch (error) {
                console.error('Error fetching packages:', error);
                if (mounted) setLoading(false);
            }
        };

        const fetchContent = async () => {
            if (initialContent !== undefined) return; // loaded on the server
            try {
                const contentKey = (state || country || `${tourType}-packages`).toLowerCase().replace(/\s+/g, '-');
                const res = await fetch(`/api/page-content/${contentKey}`);
                if (!res.ok) return;
                const data = await res.json();
                if (mounted && data.success && data.data) {
                    setDynamicOverview(data.data.content || null);
                    setDynamicImage(data.data.image || null);
                    setDynamicTitle(data.data.title || null);
                }
            } catch (e) {
                console.error('Failed to fetch dynamic content', e);
            }
        };

        const fetchReviews = async () => {
            if (isRegionPage) return;
            const trips = await fetchPastTrips({ destination: formattedLocation, limit: 50 }).catch(() => []);
            const reviews = trips.flatMap((t) => t.reviews || []);
            if (mounted) setReviewStats(reviews.length ? { rating: averageRating(reviews), count: reviews.length } : null);
        };

        // Theme names (Honeymoon, Adventure...) for the packages' tag ids
        const fetchTags = async () => {
            try {
                const res = await fetch('/api/tags');
                if (!res.ok) return;
                const data = await res.json();
                const names: Record<string, string> = {};
                (Array.isArray(data?.data) ? data.data : []).forEach((t: { _id?: string; name?: string }) => {
                    if (t._id && t.name) names[t._id] = t.name;
                });
                if (mounted) setTagNames(names);
            } catch (e) {
                console.error('Failed to fetch tags', e);
            }
        };

        fetchData();
        fetchContent();
        fetchReviews();
        fetchTags();
        return () => {
            mounted = false;
        };
    }, [tourType, state, country, isRegionPage, formattedLocation, initialPackages, initialContent]);

    // What each filter group checks on a package. Options in a group are OR-ed, groups are AND-ed.
    const facets = useMemo(() => {
        const amenities = new Map(allItems.map((p) => [p._id, toAmenities(p.inclusions ?? [], 8).map((a) => a.label)]));
        const themes = new Map(allItems.map((p) => [p._id, tagIds(p.tags)]));
        const tests: Record<FilterKey, (p: ListingPackage, v: string) => boolean> = {
            location: (p, v) => (p[locationField] || '').trim() === v,
            duration: (p, v) => matchesDuration(p.duration || '', v),
            budget: (p, v) => (PRICES.find((b) => b.value === v)?.test(Number(p.price) || 0) ?? true),
            inclusions: (p, v) => amenities.get(p._id)?.includes(v) ?? false,
            themes: (p, v) => themes.get(p._id)?.includes(v) ?? false,
        };
        return { amenities, themes, tests };
    }, [allItems, locationField]);

    const matches = (p: ListingPackage, skip?: FilterKey) =>
        FILTER_KEYS.every((key) => key === skip || !selected[key]?.length || selected[key].some((v) => facets.tests[key](p, v)));

    const filteredItems = useMemo(() => {
        const sorted = allItems.filter((p) => matches(p));
        if (sortBy === 'price-asc') sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        if (sortBy === 'price-desc') sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        if (sortBy === 'duration-asc') sorted.sort((a, b) => durationInDays(a.duration) - durationInDays(b.duration));
        if (sortBy === 'duration-desc') sorted.sort((a, b) => durationInDays(b.duration) - durationInDays(a.duration));
        return sorted;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allItems, selected, sortBy, facets]);

    // Back to the first page of results whenever the filters change
    useEffect(() => setVisible(PAGE_SIZE), [selected, sortBy]);

    // States / countries present in this region, most packages first
    const locationOptions = useMemo(() => {
        if (!isRegionPage) return [];
        const counts = new Map<string, number>();
        allItems.forEach((item) => {
            const name = (item[locationField] || '').trim();
            if (name) counts.set(name, (counts.get(name) || 0) + 1);
        });
        return Array.from(counts, ([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }, [allItems, isRegionPage, locationField]);

    // Filter groups with live counts. Only options that at least one package here has are listed.
    const filterGroups = useMemo<FilterGroup[]>(() => {
        const byFrequency = (values: string[][]) => {
            const counts = new Map<string, number>();
            values.flat().forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
            return Array.from(counts.keys()).sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0));
        };
        const build = (key: FilterKey, title: string, values: { value: string; label: string }[]): FilterGroup => ({
            key,
            title,
            options: values
                .filter((o) => allItems.some((p) => facets.tests[key](p, o.value)))
                .map((o) => ({ ...o, count: allItems.filter((p) => matches(p, key) && facets.tests[key](p, o.value)).length })),
        });
        return [
            ...(isRegionPage && locationOptions.length > 1
                ? [build('location', tourType === 'india' ? 'State' : 'Country', locationOptions.map((o) => ({ value: o.name, label: o.name })))]
                : []),
            build('duration', 'Duration', DURATIONS.filter((d) => d.value !== 'all')),
            build('budget', 'Budget (per person)', PRICES.filter((p) => p.value !== 'all').map(({ value, label }) => ({ value, label }))),
            build('inclusions', 'Includes', byFrequency(Array.from(facets.amenities.values())).map((v) => ({ value: v, label: v }))),
            build('themes', 'Themes', byFrequency(Array.from(facets.themes.values()))
                .filter((id) => tagNames[id])
                .map((id) => ({ value: id, label: tagNames[id] }))),
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allItems, selected, facets, isRegionPage, locationOptions, tourType, tagNames]);

    const toggleFilter = (group: string, value: string) =>
        setSelected((s) => {
            const current = s[group] ?? [];
            return { ...s, [group]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
        });

    // Removable chips for everything that's selected
    const activeChips = filterGroups.flatMap((g) =>
        (selected[g.key] ?? []).map((value) => ({ group: g.key, value, label: g.options.find((o) => o.value === value)?.label ?? value }))
    );

    // Keep the page behind the phone filter sheet still
    useEffect(() => {
        if (!filtersOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [filtersOpen]);

    // Hero facts, all taken from the packages themselves
    const stats = useMemo(() => {
        const prices = allItems.map((i) => Number(i.price) || 0).filter((p) => p > 0);
        const days = allItems.map((i) => durationInDays(i.duration)).filter((d) => d > 0);
        const cheapest = allItems.find((i) => Number(i.price) === Math.min(...prices));
        return {
            minPrice: prices.length ? Math.min(...prices) : 0,
            minOriginal: cheapest && Number(cheapest.originalPrice) > Number(cheapest.price) ? Number(cheapest.originalPrice) : 0,
            minDays: days.length ? Math.min(...days) : 0,
            maxDays: days.length ? Math.max(...days) : 0,
        };
    }, [allItems]);

    // Most-viewed packages; only worth a separate row when the list is long
    const topPicks = useMemo(() => {
        if (allItems.length < 4) return [];
        const featured = allItems.filter((p) => p.isFeatured);
        const rest = [...allItems]
            .filter((p) => !p.isFeatured)
            .sort((a, b) => (Number(b.visitCount) || 0) - (Number(a.visitCount) || 0));
        return [...featured, ...rest].slice(0, 3);
    }, [allItems]);

    // Suggestions carousel
    const updateScrollState = () => {
        const el = carouselRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };

    useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateScrollState);
        window.addEventListener('resize', updateScrollState);
        const timer = setTimeout(updateScrollState, 500);
        return () => {
            clearTimeout(timer);
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [suggestions]);

    const scrollByStep = (direction: number) => {
        const el = carouselRef.current;
        if (!el) return;
        const card = el.querySelector('article');
        el.scrollBy({ left: direction * ((card ? card.getBoundingClientRect().width : 290) + 24), behavior: 'smooth' });
    };

    const locationKey = locationLabel.toLowerCase().replace(/\s+/g, '-');
    const overviewDescription = dynamicOverview || (isRegionPage ? regionMenu.blurb : null) || destinationDescriptions[locationKey] || `Discover the exceptional beauty and rich cultural charm of ${formattedLocation}. Immerse yourself in the authentic local culture, explore awe-inspiring landscapes, and indulge in culinary delights that tell the story of the region. Whether you are seeking thrilling adventures, peaceful relaxation, or a deep dive into history, this destination has something incredible to offer. Let us help you create unforgettable memories on a meticulously curated journey tailored specifically to your unique travel desires.`;
    const aboutTitle = dynamicTitle || `About ${formattedLocation}`;

    const clearFilters = () => setSelected({});

    const heroTitle = isRegionPage ? regionMenu.title : `${formattedLocation} Tour Packages`;
    const heroImage = isRegionPage ? REGION_HERO_IMAGES[tourType] : (dynamicImage || getDestinationWebp(formattedLocation));
    const pickedLocations = selected.location ?? [];
    const scopeLabel = isRegionPage ? (pickedLocations.length === 1 ? pickedLocations[0] : regionMenu.shortLabel) : formattedLocation;
    const durationRange = stats.minDays
        ? stats.minDays === stats.maxDays ? `${stats.minDays} days` : `${stats.minDays}-${stats.maxDays} days`
        : '';

    const openEnquiry = (pkg?: ListingPackage) =>
        setEnquiry(
            pkg
                ? { title: pkg.name || pkg.title || formattedLocation, price: Number(pkg.price) > 0 ? inr(Number(pkg.price)) : undefined }
                : { title: `${formattedLocation} tour` }
        );

    const shownItems = filteredItems.slice(0, visible);

    return (
        <div className="min-h-screen bg-background flex flex-col font-plus-jakarta-sans">
            <Header />

            <main className="flex-grow pt-0">
                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-strong to-slate-900 text-white">
                    {heroImage && (
                        <Image src={heroImage} alt={isRegionPage ? regionMenu.title : formattedLocation} fill priority className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-slate-900/60" />
                    <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 md:px-8 md:pb-14 md:pt-8">
                        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-white/80">
                            <Link href="/" className="hover:text-white">Home</Link>
                            <span>›</span>
                            <Link href="/package" className="hover:text-white">Packages</Link>
                            <span>›</span>
                            {isRegionPage ? (
                                <span className="font-semibold text-white">{regionMenu.label}</span>
                            ) : (
                                <>
                                    <Link href={regionMenu.basePath} className="hover:text-white">{regionMenu.label}</Link>
                                    <span>›</span>
                                    <span className="font-semibold text-white">{formattedLocation}</span>
                                </>
                            )}
                        </nav>

                        <div className="mt-8 md:mt-12">
                            {reviewStats && (
                                <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                                    <Star className="h-3.5 w-3.5 fill-tertiary text-tertiary" />
                                    {reviewStats.rating.toFixed(1)}
                                    <span className="text-white/75">
                                        · {reviewStats.count} {reviewStats.count === 1 ? 'review' : 'reviews'} from our group trips
                                    </span>
                                </p>
                            )}
                            <h1 className="max-w-3xl !text-3xl font-extrabold !leading-tight !text-white md:!text-5xl">{heroTitle}</h1>
                            <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-white/85 md:text-base">{overviewDescription}</p>

                            {!loading && allItems.length > 0 && (
                                <ul className="mt-6 flex flex-wrap gap-2 text-xs font-semibold md:text-sm">
                                    <li className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-md">
                                        <Package className="h-4 w-4 text-tertiary" /> {allItems.length} {allItems.length === 1 ? 'package' : 'packages'}
                                    </li>
                                    {durationRange && (
                                        <li className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-md">
                                            <CalendarDays className="h-4 w-4 text-tertiary" /> {durationRange}
                                        </li>
                                    )}
                                    {isRegionPage && locationOptions.length > 1 && (
                                        <li className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-md">
                                            <MapPin className="h-4 w-4 text-tertiary" /> {locationOptions.length} destinations
                                        </li>
                                    )}
                                </ul>
                            )}

                            <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4">
                                {stats.minPrice > 0 && (
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">Starting from</p>
                                        <p className="flex items-baseline gap-2">
                                            <span className="text-3xl font-extrabold">{inr(stats.minPrice)}</span>
                                            {stats.minOriginal > 0 && <span className="text-sm text-white/60 line-through">{inr(stats.minOriginal)}</span>}
                                        </p>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEnquiry()}
                                        className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-primary transition-colors hover:bg-primary-light"
                                    >
                                        <Sparkles className="h-4 w-4" /> Plan my trip
                                    </button>
                                    <a
                                        href="tel:+919873391733"
                                        className="flex h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 text-sm font-bold backdrop-blur-md transition-colors hover:bg-white/20"
                                    >
                                        <Phone className="h-4 w-4" /> {COMPANY.phone}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Top picks */}
                {topPicks.length > 0 && (
                    <section className="bg-white px-4 pb-4 pt-10 md:px-8 md:pt-14">
                        <div className="mx-auto max-w-7xl">
                            <SectionHeader
                                eyebrow="Top picks"
                                eyebrowIcon={<Sparkles />}
                                title={`Most loved ${formattedLocation} trips`}
                                description="The packages travellers look at most."
                                titleClassName="!text-[22px] sm:!text-3xl"
                            />
                            <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-4 scrollbar-hide md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                                {topPicks.map((pkg) => (
                                    <PackageCard
                                        key={pkg._id}
                                        id={pkg._id}
                                        destination={pkg.state || pkg.country || pkg.location || ''}
                                        duration={pkg.duration || ''}
                                        title={pkg.name || pkg.title || ''}
                                        price={Number(pkg.price) || 0}
                                        image={getImageUrl(pkg.image || null) || pkg.image || ''}
                                        imageAlt={pkg.imageAlt || pkg.name}
                                        slug={pkg.slug || pkg._id}
                                        hrefPrefix="/package"
                                        priceLabel={getPackagePriceLabel(pkg.priceType)}
                                        inclusions={Array.isArray(pkg.inclusions) ? (pkg.inclusions as string[]) : undefined}
                                        showDestination={isRegionPage}
                                        className="md:!w-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* All packages */}
                <section className="bg-background px-4 pb-14 pt-10 md:px-8">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="!text-[22px] font-extrabold text-heading sm:!text-3xl">
                            {loading ? `${formattedLocation} Tour Packages` : `${filteredItems.length} ${scopeLabel} Tour ${filteredItems.length === 1 ? 'Package' : 'Packages'}`}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">Hand-picked itineraries with hotels, transfers and sightseeing sorted for you.</p>

                        <div className="mt-6 flex gap-8">
                            {/* Filters: sidebar on desktop */}
                            <aside className="hidden w-72 shrink-0 lg:block">
                                <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl border border-slate-100 bg-white p-5 shadow-sm scrollbar-hide">
                                    {loading ? (
                                        <div className="h-96 animate-pulse rounded-2xl bg-slate-50" />
                                    ) : (
                                        <PackageFilters groups={filterGroups} selected={selected} onToggle={toggleFilter} onClear={clearFilters} />
                                    )}
                                </div>
                            </aside>

                            <div className="min-w-0 flex-1">
                                {/* Toolbar */}
                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setFiltersOpen(true)}
                                        className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-white lg:hidden"
                                    >
                                        <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                                        {activeChips.length > 0 && (
                                            <span className="rounded-full bg-white px-1.5 text-[10px] text-primary">{activeChips.length}</span>
                                        )}
                                    </button>
                                    <p className="hidden pl-2 text-sm text-muted-foreground lg:block">
                                        {loading ? 'Loading packages…' : (
                                            <>Showing <span className="font-bold text-heading">{filteredItems.length}</span> of {allItems.length} packages</>
                                        )}
                                    </p>
                                    <FilterSelect
                                        value={sortBy}
                                        onChange={setSortBy}
                                        icon={<ArrowUpDown className="h-3.5 w-3.5 shrink-0" />}
                                        width="w-[170px] sm:w-[190px]"
                                        options={SORT_OPTIONS}
                                    />
                                </div>

                                {/* Active filters */}
                                {activeChips.length > 0 && (
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        {activeChips.map((chip) => (
                                            <button
                                                key={`${chip.group}-${chip.value}`}
                                                type="button"
                                                onClick={() => toggleFilter(chip.group, chip.value)}
                                                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/15"
                                                aria-label={`Remove filter ${chip.label}`}
                                            >
                                                {chip.label} <X className="h-3 w-3" />
                                            </button>
                                        ))}
                                        <button type="button" onClick={clearFilters} className="cursor-pointer px-2 text-xs font-bold text-slate-500 hover:text-primary">
                                            Clear all
                                        </button>
                                    </div>
                                )}

                                <div className="mt-5">
                                    {loading ? (
                                        <ListingSkeleton />
                                    ) : filteredItems.length > 0 ? (
                                        <>
                                            <div className="flex flex-col gap-5">
                                                {shownItems.map((pkg, i) => (
                                                    <Fragment key={pkg._id}>
                                                        <DestinationPackageCard pkg={pkg} onEnquire={openEnquiry} showLocation={isRegionPage} />
                                                        {/* Custom-trip prompt after the second card (or after the last one in short lists) */}
                                                        {i === Math.min(1, shownItems.length - 1) && (
                                                            <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-primary-strong to-primary p-6 text-white shadow-lg shadow-blue-900/15 sm:flex-row sm:items-center sm:justify-between">
                                                                <div>
                                                                    <h3 className="text-lg font-bold !text-white">Want it your way?</h3>
                                                                    <p className="mt-1 max-w-md text-sm text-white/85">
                                                                        Tell us your dates, budget and who&apos;s travelling. Our {formattedLocation} expert will send a plan made for you, free.
                                                                    </p>
                                                                </div>
                                                                <div className="flex shrink-0 flex-wrap gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openEnquiry()}
                                                                        className="flex h-10 cursor-pointer items-center rounded-full bg-white px-5 text-sm font-bold text-primary transition-colors hover:bg-primary-light"
                                                                    >
                                                                        Get a free quote
                                                                    </button>
                                                                    <a
                                                                        href="tel:+919873391733"
                                                                        className="flex h-10 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-semibold hover:bg-white/10"
                                                                    >
                                                                        <Phone className="h-4 w-4" /> Call us
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Fragment>
                                                ))}
                                            </div>
                                            <div className="mt-8 flex flex-col items-center gap-3">
                                                <p className="text-sm text-muted-foreground">
                                                    Showing <span className="font-bold text-heading">{shownItems.length}</span> of {filteredItems.length} packages
                                                </p>
                                                {visible < filteredItems.length && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setVisible((v) => v + PAGE_SIZE)}
                                                        className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-primary px-6 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                                                    >
                                                        Show more packages <ChevronDown className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="rounded-3xl border border-slate-100 bg-white px-4 py-16 text-center shadow-sm">
                                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
                                                <SearchX className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-bold text-heading">We don&apos;t have this exact package yet</h3>
                                            <p className="mx-auto mb-6 max-w-sm text-sm text-muted-foreground">
                                                But tell us what you need and we&apos;ll put one together.
                                            </p>
                                            <NoPackagesEnquiryForm
                                                context={[`Destination: ${scopeLabel}`, ...activeChips.map((c) => c.label)].join(' | ')}
                                            />
                                            {activeChips.length > 0 && (
                                                <button onClick={clearFilters} className="mt-5 cursor-pointer text-xs font-bold text-primary hover:underline">
                                                    Or clear all filters and browse everything
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters: bottom sheet on phones and tablets */}
                    {filtersOpen && (
                        <div className="fixed inset-0 z-[120] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
                            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
                            <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-white shadow-2xl">
                                <div className="relative flex justify-center pb-1 pt-3">
                                    <span className="h-1.5 w-10 rounded-full bg-slate-200" />
                                    <button
                                        type="button"
                                        onClick={() => setFiltersOpen(false)}
                                        aria-label="Close filters"
                                        className="absolute right-3 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="overflow-y-auto px-5 pb-4">
                                    <PackageFilters groups={filterGroups} selected={selected} onToggle={toggleFilter} onClear={clearFilters} />
                                </div>
                                <div className="border-t border-slate-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                                    <button
                                        type="button"
                                        onClick={() => setFiltersOpen(false)}
                                        className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-primary text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                                    >
                                        Show {filteredItems.length} {filteredItems.length === 1 ? 'package' : 'packages'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* About the destination */}
                <section className="border-t border-slate-100 bg-white px-4 py-14 md:px-8">
                    <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12">
                        {heroImage && (
                            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-primary-light">
                                <Image src={heroImage} alt={formattedLocation} fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
                            </div>
                        )}
                        <div>
                            <SectionHeader
                                eyebrow="Destination guide"
                                eyebrowIcon={<MapPin />}
                                title={aboutTitle}
                                titleClassName="!text-[22px] sm:!text-3xl"
                                className="!mb-4"
                            />
                            <p className={`whitespace-pre-line text-sm leading-relaxed text-slate-600 md:text-base ${aboutOpen ? '' : 'line-clamp-5'}`}>
                                {overviewDescription}
                            </p>
                            {overviewDescription.length > 320 && (
                                <button
                                    type="button"
                                    onClick={() => setAboutOpen((o) => !o)}
                                    className="mt-3 cursor-pointer text-sm font-bold text-primary hover:underline"
                                >
                                    {aboutOpen ? 'Read less' : 'Read more'}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Why book with us */}
                <section className="bg-slate-50 px-4 py-14 md:px-8">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeader
                            align="center"
                            eyebrow="Why Paradise Yatra"
                            eyebrowIcon={<ShieldCheck />}
                            title={`Book your ${formattedLocation} trip with confidence`}
                            titleClassName="!text-[22px] sm:!text-3xl"
                        />
                        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {WHY_BOOK.map(({ Icon, title, text }) => (
                                <li key={title} className="rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm md:p-6">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                        <Icon className="h-6 w-6" />
                                    </span>
                                    <p className="mt-3 text-base font-extrabold text-heading">{title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground md:text-sm">{text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Customer photos & videos tagged with this state / country (hidden when there are none) */}
                {!isRegionPage && <MomentsStrip location={formattedLocation} className="mx-auto max-w-7xl px-4 pt-12 md:px-8 md:pt-16" />}

                <FAQSection destination={state || country} tourType={tourType} faqs={initialFaqs?.length ? initialFaqs : undefined} />

                {suggestions.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50 px-4 pb-12 pt-12 md:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <SectionHeader
                                eyebrow="More to explore"
                                eyebrowIcon={<Sparkles />}
                                title="You might also like"
                                titleClassName="!text-[22px] sm:!text-3xl"
                            />
                            <div className="group/carousel relative -mx-4 px-4 md:mx-0 md:px-0">
                                <CarouselArrows
                                    onPrevious={() => scrollByStep(-1)}
                                    onNext={() => scrollByStep(1)}
                                    canScrollLeft={canScrollLeft}
                                    canScrollRight={canScrollRight}
                                />
                                <div
                                    ref={carouselRef}
                                    className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-8 pt-2 scrollbar-hide"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory' }}
                                >
                                    {suggestions.map((pkg, index) => (
                                        <PackageCard
                                            key={`${pkg._id}-${index}`}
                                            id={pkg._id}
                                            destination={pkg.state || pkg.country || pkg.location || ''}
                                            duration={pkg.duration || ''}
                                            title={pkg.name || pkg.title || ''}
                                            price={Number(pkg.price) || 0}
                                            image={getImageUrl(pkg.image || null) || pkg.image || ''}
                                            imageAlt={pkg.imageAlt || pkg.name}
                                            slug={pkg.slug || pkg._id}
                                            hrefPrefix="/package"
                                            priceLabel={getPackagePriceLabel(pkg.priceType)}
                                            inclusions={Array.isArray(pkg.inclusions) ? (pkg.inclusions as string[]) : undefined}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </main>

            {enquiry && (
                <LeadCaptureForm
                    isOpen
                    onClose={() => setEnquiry(null)}
                    packageTitle={enquiry.title}
                    packagePrice={enquiry.price}
                />
            )}
        </div>
    );
}
