"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, BedDouble, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NoPackagesEnquiryForm from "@/components/NoPackagesEnquiryForm";
import HotelSearchBar from "@/components/hotels/HotelSearchBar";
import HotelCard from "@/components/hotels/HotelCard";
import HotelFilters, { defaultHotelFilters, HotelFilterState, priceToRange, PRICE_OPTIONS } from "@/components/hotels/HotelFilters";
import { cachedGet } from "@/components/hotels/cachedGet";
import { Hotel, nightsBetween, queryToSearch, searchToQuery } from "@/components/hotels/types";
import { HOTEL_FEATURES, type HotelFeature } from "@/components/hotels/hotelFeatures";

const HERO_BG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=70";

// Dark photo header with breadcrumb, title and the search bar (design.md)
const HotelsHero = ({ city, children }: { city?: string; children: React.ReactNode }) => (
  <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-strong to-slate-900 px-4 pb-10 pt-8 text-white md:px-8 md:pb-12 md:pt-10">
    <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${HERO_BG})` }} />
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/85" />
    <div className="relative mx-auto max-w-7xl">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-white/80">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>›</span>
        <Link href="/hotels" className="hover:text-white">Hotels</Link>
        {city && (
          <>
            <span>›</span>
            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold text-white backdrop-blur-md">{city}</span>
          </>
        )}
      </nav>
      <h1 className="!text-3xl font-extrabold !text-white md:!text-5xl">
        {city ? `Hotels in ${city}` : "Find your perfect stay"}
      </h1>
      <p className="mb-6 mt-2 max-w-xl text-sm text-white/80 md:text-base">
        Handpicked stays at prices you will like, with a travel expert one call away.
      </p>
      {children}
    </div>
  </section>
);

const PAGE_SIZE = 10;
const QUICK_FEATURES: HotelFeature[] = [
  "breakfastIncluded",
  "dinnerIncluded",
  "freeWifi",
  "parking",
  "swimmingPool",
  "flexibleCancellation",
];

const HotelSearchClient = () => {
  const params = useSearchParams();
  const search = useMemo(() => queryToSearch(new URLSearchParams(params.toString())), [params]);
  const searchKey = params.toString();

  const [filters, setFilters] = useState<HotelFilterState>(() => {
    const price = params.get("price") || "all";
    const validFeatures = new Set(HOTEL_FEATURES.map((feature) => feature.value));
    return {
      price: PRICE_OPTIONS.some((option) => option.value === price) ? price : "all",
      stars: (params.get("stars") || "").split(",").map(Number).filter((star) => [2, 3, 4, 5].includes(star)),
      amenities: (params.get("amenities") || "").split(",").filter(Boolean),
      features: (params.get("features") || "").split(",").filter((feature): feature is HotelFeature => validFeatures.has(feature as HotelFeature)),
    };
  });
  const [sortBy, setSortBy] = useState(() => {
    const sort = params.get("sort");
    return ["recommended", "price-asc", "price-desc", "rating"].includes(sort || "") ? sort! : "recommended";
  });
  const [page, setPage] = useState(() => {
    const initialPage = Number(params.get("page"));
    return Number.isInteger(initialPage) && initialPage > 0 ? initialPage : 1;
  });
  const [amenityOptions, setAmenityOptions] = useState<string[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    cachedGet("/api/hotels/filters")
      .then((d) => d?.success && setAmenityOptions(d.amenities || []))
      .catch((error) => console.error("Error loading hotel filter options:", error));
  }, []);

  // a new search from the top bar resets the page (filters are kept)
  useEffect(() => setPage(1), [searchKey]);

  useEffect(() => {
    if (!search.city.trim()) return;

    const controller = new AbortController();
    const q = new URLSearchParams();
    q.set("city", search.city.trim());
    const { min, max } = priceToRange(filters.price);
    if (min !== undefined) q.set("minPrice", String(min));
    if (max !== undefined) q.set("maxPrice", String(max));
    if (filters.stars.length) q.set("stars", filters.stars.join(","));
    if (filters.amenities.length) q.set("amenities", filters.amenities.join(","));
    if (filters.features.length) q.set("features", filters.features.join(","));
    q.set("sort", sortBy);
    q.set("page", String(page));
    q.set("limit", String(PAGE_SIZE));

    setLoading(true);
    setError(false);
    fetch(`/api/hotels?${q.toString()}`, { cache: "no-store", signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error("bad response");
        setHotels(d.hotels || []);
        setTotal(d.total || 0);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search.city, filters, sortBy, page, retry]);

  const changeFilters = (f: HotelFilterState) => {
    setFilters(f);
    setPage(1);
  };
  const clearFilters = () => {
    setFilters(defaultHotelFilters);
    setSortBy("recommended");
    setPage(1);
  };
  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const activeFilterCount =
    (filters.price !== "all" ? 1 : 0) + filters.stars.length + filters.amenities.length + filters.features.length;

  const filterProps = { filters, setFilters: changeFilters, amenityOptions, onClear: clearFilters };
  const featureLabel = (feature: HotelFeature) =>
    HOTEL_FEATURES.find((option) => option.value === feature)?.label || feature;
  const toggleFeature = (feature: HotelFeature) => changeFilters({
    ...filters,
    features: filters.features.includes(feature)
      ? filters.features.filter((value) => value !== feature)
      : [...filters.features, feature],
  });
  const hotelReturnQuery = useMemo(() => {
    const query = new URLSearchParams(searchToQuery(search));
    if (filters.price !== "all") query.set("price", filters.price);
    if (filters.stars.length) query.set("stars", filters.stars.join(","));
    if (filters.amenities.length) query.set("amenities", filters.amenities.join(","));
    if (filters.features.length) query.set("features", filters.features.join(","));
    if (sortBy !== "recommended") query.set("sort", sortBy);
    if (page > 1) query.set("page", String(page));
    return query.toString();
  }, [search, filters, sortBy, page]);

  if (!search.city.trim()) {
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <HotelsHero>
          <HotelSearchBar key={searchKey} initial={search} variant="compact" />
        </HotelsHero>
        <main className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
          <BedDouble className="w-10 h-10 text-[#155dfc] mx-auto mb-4" />
          <h1 className="!text-2xl !font-black !text-[#000945]">Choose a destination</h1>
          <p className="!text-sm !text-slate-500 mt-2">
            Enter a city or destination above to see matching hotels.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <HotelsHero city={search.city}>
        <HotelSearchBar key={searchKey} initial={search} variant="compact" />
      </HotelsHero>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left filters */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0 hidden lg:block">
            <div className="lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <HotelFilters {...filterProps} />
              </div>
              
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">

            <div className="mb-6 flex items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
              <div className="min-w-0">
                <h2 className="!text-lg md:!text-xl !font-bold !text-heading truncate">
                  {search.city ? `${loading ? "Hotels" : total} ${total === 1 && !loading ? "Hotel" : "Hotels"} in ${search.city}` : "All hotels"}
                </h2>
                <p className="!text-sm !text-slate-500 mt-0.5">
                  {loading ? "Searching..." : `${total} stay${total === 1 ? "" : "s"} found`}
                  {nights > 0 ? ` · ${nights} night${nights > 1 ? "s" : ""}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={() => setFiltersOpen(true)}
                  variant="outline"
                  className="lg:hidden h-10 rounded-full border-primary bg-primary text-white hover:bg-primary-hover hover:text-white font-bold text-xs px-5"
                >
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </Button>
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                  <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 font-semibold text-slate-900 rounded-full h-10 text-xs px-4">
                    <SelectValue placeholder="Recommended" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price-asc">Price: low to high</SelectItem>
                    <SelectItem value="price-desc">Price: high to low</SelectItem>
                    <SelectItem value="rating">Star rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {QUICK_FEATURES.map((feature) => {
                  const active = filters.features.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleFeature(feature)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                        active
                          ? "border-[#155dfc] bg-blue-50 text-[#155dfc]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#155dfc] hover:text-[#155dfc]"
                      }`}
                    >
                      {featureLabel(feature)}
                    </button>
                  );
                })}
              </div>

              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2" aria-label="Selected filters">
                  <span className="text-xs font-bold text-slate-500">Applied:</span>
                  {filters.price !== "all" && (
                    <button type="button" onClick={() => changeFilters({ ...filters, price: "all" })} className="rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-[#155dfc]">
                      {PRICE_OPTIONS.find((option) => option.value === filters.price)?.label} ×
                    </button>
                  )}
                  {filters.stars.map((star) => (
                    <button key={star} type="button" onClick={() => changeFilters({ ...filters, stars: filters.stars.filter((value) => value !== star) })} className="rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-[#155dfc]">
                      {star} star ×
                    </button>
                  ))}
                  {filters.features.map((feature) => (
                    <button key={feature} type="button" onClick={() => toggleFeature(feature)} className="rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-[#155dfc]">
                      {featureLabel(feature)} ×
                    </button>
                  ))}
                  {filters.amenities.map((amenity) => (
                    <button key={amenity} type="button" onClick={() => changeFilters({ ...filters, amenities: filters.amenities.filter((value) => value !== amenity) })} className="rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-[#155dfc]">
                      {amenity} ×
                    </button>
                  ))}
                  <button type="button" onClick={clearFilters} className="px-2 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                <p className="!text-slate-600 font-semibold">We couldn&apos;t load hotels right now.</p>
                <Button className="mt-4" onClick={() => setRetry((n) => n + 1)} variant="outline">
                  Try again
                </Button>
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-100">
                <BedDouble className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <h3 className="!text-xl !font-bold !text-slate-900 mb-2">
                  {search.city ? `No hotels match in ${search.city}` : "No hotels match these filters"}
                </h3>
                <p className="!text-sm !text-slate-500 max-w-sm mx-auto mb-4">
                  {activeFilterCount > 0 ? "Try removing a filter, or " : ""}tell us what you need and we&apos;ll find a stay for you.
                </p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" onClick={clearFilters} className="mb-6">
                    Clear all filters
                  </Button>
                )}
                <NoPackagesEnquiryForm
                  context={[
                    search.city ? `Hotel in ${search.city}` : "General hotel enquiry",
                    search.checkIn && search.checkOut ? `${search.checkIn} to ${search.checkOut}` : "",
                    `${search.adults + search.children} guests, ${search.rooms} room(s)`,
                  ].filter(Boolean).join(" | ")}
                />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {hotels.map((h) => (
                    <HotelCard key={h._id} hotel={h} search={search} returnQuery={hotelReturnQuery} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
                    <Button variant="outline" size="icon" disabled={page === 1} onClick={() => goToPage(page - 1)} aria-label="Previous page" className="rounded-full">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToPage(i + 1)}
                        aria-current={page === i + 1 ? "page" : undefined}
                        className={`w-10 h-10 rounded-full text-sm font-bold ${
                          page === i + 1 ? "bg-[#155dfc] text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-[#155dfc]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => goToPage(page + 1)} aria-label="Next page" className="rounded-full">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filters */}
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <HotelFilters {...filterProps} onApply={() => setFiltersOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelSearchClient;
