"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CalendarDays, Users, Search, Minus, Plus } from "lucide-react";
import { cachedGet } from "./cachedGet";
import { HOTEL_GUEST_LIMITS, StaySearch, nightsBetween, searchToQuery, todayISO } from "./types";

interface Props {
  initial?: Partial<StaySearch>;
  /** "hero" = big floating card, "compact" = results bar, "hero-compact" = compact homepage bar */
  variant?: "hero" | "compact" | "hero-compact";
}

const Stepper = ({
  label, hint, value, min, max, onChange,
}: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="!text-sm !font-bold !text-slate-900">{label}</p>
      <p className="!text-xs !text-slate-400">{hint}</p>
    </div>
    <div className="flex items-center gap-3">
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40">
        <Minus className="w-4 h-4 text-slate-600" />
      </button>
      <span className="w-5 text-center text-sm font-bold text-slate-900">{value}</span>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40">
        <Plus className="w-4 h-4 text-slate-600" />
      </button>
    </div>
  </div>
);

const HotelSearchBar = ({ initial, variant = "hero" }: Props) => {
  const router = useRouter();
  const [city, setCity] = useState(initial?.city || "");
  const [checkIn, setCheckIn] = useState(initial?.checkIn || "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut || "");
  const [adults, setAdults] = useState(Math.min(HOTEL_GUEST_LIMITS.adults, Math.max(1, initial?.adults || 2)));
  const [children, setChildren] = useState(Math.min(HOTEL_GUEST_LIMITS.children, Math.max(0, initial?.children || 0)));
  const [rooms, setRooms] = useState(Math.min(HOTEL_GUEST_LIMITS.rooms, Math.max(1, initial?.rooms || 1)));

  const [cities, setCities] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cachedGet("/api/hotels/cities")
      .then((d) => d?.success && setCities(d.cities || []))
      .catch(() => {});
  }, []);

  // close dropdowns on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
        setShowGuests(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const suggestions = useMemo(() => {
    const q = city.trim().toLowerCase();
    const list = q ? cities.filter((c) => c.toLowerCase().includes(q)) : cities;
    return list.slice(0, 6);
  }, [city, cities]);

  const nights = nightsBetween(checkIn, checkOut);

  const submit = (cityOverride?: string) => {
    const destination = (cityOverride ?? city).trim();
    if (!destination) return;
    const query = searchToQuery({ city: destination, checkIn, checkOut, adults, children, rooms });
    router.push(`/hotels/search?${query}`);
  };

  const compact = variant !== "hero";
  const heroCompact = variant === "hero-compact";
  const canSearch = city.trim().length > 0;
  const fieldSpacing = heroCompact ? "gap-2 px-3 py-1.5 lg:gap-2.5 lg:px-4 lg:py-2" : `gap-3 px-4 ${compact ? "py-2.5" : "py-3.5"}`;
  const field = `flex items-center ${fieldSpacing} rounded-2xl hover:bg-slate-50 transition-colors min-w-0`;
  const label = `${heroCompact ? "!text-[10px] !leading-3" : "!text-[11px]"} !font-bold uppercase tracking-wider !text-slate-400`;
  const input = `w-full bg-transparent outline-none border-none p-0 ${heroCompact ? "!text-xs lg:!text-sm" : "mt-0.5 !text-sm"} !font-bold !text-slate-900 placeholder:!text-slate-400`;

  return (
    <div ref={wrapRef} className="w-full">
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className={`bg-white ${heroCompact ? "min-h-11 rounded-2xl md:h-11 md:rounded-full lg:h-14" : "rounded-2xl"} text-left ${compact && !heroCompact ? "shadow-md border border-slate-100 p-1.5" : !compact ? "shadow-2xl shadow-black/20 p-2" : ""}`}
      >
        <div className={`grid ${heroCompact ? "grid-cols-2 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto]" : "grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1.1fr_auto]"} items-stretch gap-1 md:gap-0 md:divide-x md:divide-slate-100`}>
          {/* Destination */}
          <div className={`relative min-w-0 ${heroCompact ? "col-span-2 md:col-span-1" : ""}`}>
            <label className={`${field} cursor-text`}>
              <MapPin className={`${heroCompact ? "w-4 h-4 lg:w-5 lg:h-5" : "w-5 h-5"} text-[#155dfc] flex-shrink-0`} />
              <span className="min-w-0 flex-1">
                <span className={`block ${label}`}>Destination</span>
                <input
                  type="text" value={city} autoComplete="off" placeholder="City or destination"
                  aria-label="Destination"
                  onChange={(e) => { setCity(e.target.value); setShowSuggest(true); }}
                  onFocus={() => { setShowSuggest(true); setShowGuests(false); }}
                  className={input}
                />
              </span>
            </label>
            {showSuggest && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {suggestions.map((c) => (
                  <li key={c}>
                    <button type="button" onClick={() => { setCity(c); setShowSuggest(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-sm font-semibold !text-slate-700 text-left">
                      <MapPin className="w-4 h-4 text-[#155dfc] flex-shrink-0" /> {c}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Check-in */}
          <label className={`${field} cursor-pointer`}>
            <CalendarDays className={`${heroCompact ? "w-4 h-4 lg:w-5 lg:h-5" : "w-5 h-5"} text-[#155dfc] flex-shrink-0`} />
            <span className="min-w-0 flex-1">
              <span className={`block ${label}`}>Check-in</span>
              <input type="date" value={checkIn} min={todayISO()}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut && e.target.value && checkOut <= e.target.value) setCheckOut("");
                }}
                className={`${input} cursor-pointer`} />
            </span>
          </label>

          {/* Check-out */}
          <label className={`${field} cursor-pointer`}>
            <CalendarDays className={`${heroCompact ? "w-4 h-4 lg:w-5 lg:h-5" : "w-5 h-5"} text-[#155dfc] flex-shrink-0`} />
            <span className="min-w-0 flex-1">
              <span className={`block ${label}`}>Check-out{nights > 0 ? ` · ${nights} night${nights > 1 ? "s" : ""}` : ""}</span>
              <input type="date" value={checkOut} min={checkIn || todayISO()}
                onChange={(e) => setCheckOut(e.target.value)}
                className={`${input} cursor-pointer`} />
            </span>
          </label>

          {/* Guests */}
          <div className={`relative min-w-0 ${heroCompact ? "col-span-2 md:col-span-1" : ""}`}>
            <button type="button" onClick={() => { setShowGuests((v) => !v); setShowSuggest(false); }}
              aria-expanded={showGuests} className={`${field} w-full text-left`}>
              <Users className={`${heroCompact ? "w-4 h-4 lg:w-5 lg:h-5" : "w-5 h-5"} text-[#155dfc] flex-shrink-0`} />
              <span className="min-w-0 flex-1">
                <span className={`block ${label}`}>Guests & rooms</span>
                <span className={`block mt-0.5 ${heroCompact ? "text-xs lg:text-sm" : "text-sm"} font-bold text-slate-900 truncate`}>
                  {adults + children} guest{adults + children > 1 ? "s" : ""}, {rooms} room{rooms > 1 ? "s" : ""}
                </span>
              </span>
            </button>
            {showGuests && (
              <div className="absolute top-full right-0 mt-4 w-full md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-50 divide-y divide-slate-100">
                <Stepper label="Adults" hint="Age 13+ (max 10)" value={adults} min={1} max={HOTEL_GUEST_LIMITS.adults} onChange={setAdults} />
                <Stepper label="Children" hint="Age 0–12 (max 12)" value={children} min={0} max={HOTEL_GUEST_LIMITS.children} onChange={setChildren} />
                <Stepper label="Rooms" hint="Number of rooms (max 6)" value={rooms} min={1} max={HOTEL_GUEST_LIMITS.rooms} onChange={setRooms} />
                <button type="button" onClick={() => setShowGuests(false)}
                  className="w-full mt-3 py-3 rounded-xl bg-[#155dfc] hover:bg-[#0f4ad1] text-white text-sm font-bold transition-colors">
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <button type="submit" disabled={!canSearch} title={!canSearch ? "Choose a destination to search" : undefined}
            className={`${heroCompact ? "col-span-2 h-9 w-full px-4 text-xs md:col-span-1 md:h-9 md:w-auto md:self-center lg:h-11 lg:px-5 lg:text-sm" : "md:ml-2 px-8 py-4 md:py-0 text-sm"} flex items-center justify-center gap-1.5 rounded-full bg-primary font-bold text-white shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none whitespace-nowrap`}>
            <Search className={`${heroCompact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelSearchBar;
