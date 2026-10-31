"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LayerGroup, Map as LeafletMap, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowRight, Globe2, LocateFixed, MapPin, Maximize2, Minus, MousePointerClick, Plus, Search, X } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

type Mode = "international" | "domestic";

interface MapPackage {
  id: string;
  title: string;
  duration: string;
  price: number;
  slug: string;
}

interface Destination {
  key: string;
  name: string;
  mode: Mode;
  lat: number;
  lng: number;
  packages: MapPackage[];
  href: string;
}

const normalize = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

// Packages carry a country / state name but no coordinates, so pins are placed from this lookup.
// A destination that is not listed here is simply not drawn. Add a line to show it.
const COORDS: Record<string, [number, number]> = {
  // Europe
  europe: [48.9, 9.2], france: [46.6, 2.2], italy: [42.8, 12.5], switzerland: [46.8, 8.2], spain: [40.4, -3.7],
  greece: [39.1, 22.9], germany: [51.2, 10.4], austria: [47.5, 14.5], netherlands: [52.1, 5.3], portugal: [39.4, -8.2],
  "united kingdom": [54, -2], uk: [54, -2], england: [52.4, -1.5], scotland: [56.5, -4.2], ireland: [53.4, -8],
  iceland: [64.9, -19], norway: [60.5, 8.5], sweden: [62, 15], finland: [64, 26], denmark: [56, 10], turkey: [39, 35],
  croatia: [45.1, 15.2], czechia: [49.8, 15.5], "czech republic": [49.8, 15.5], hungary: [47.2, 19.5], russia: [61.5, 105],
  georgia: [42.3, 43.4], azerbaijan: [40.1, 47.6], armenia: [40.1, 45],
  // Asia & Middle East
  maldives: [3.2, 73.2], thailand: [15.9, 100.9], indonesia: [-0.8, 113.9], bali: [-8.4, 115.2], singapore: [1.35, 103.8],
  malaysia: [4.2, 102], vietnam: [14, 108], cambodia: [12.5, 104.9], laos: [19.9, 102.5], philippines: [12.9, 121.8],
  japan: [36.2, 138.3], "south korea": [36.5, 127.9], china: [35.9, 104.2], "hong kong": [22.3, 114.2], taiwan: [23.7, 121],
  "sri lanka": [7.9, 80.8], nepal: [28.4, 84.1], bhutan: [27.5, 90.4], tibet: [31.7, 88], mongolia: [46.9, 103.8],
  kazakhstan: [48, 67], uzbekistan: [41.4, 64.6], dubai: [25.2, 55.3], uae: [24.5, 54.4], "united arab emirates": [24.5, 54.4],
  "abu dhabi": [24.45, 54.4], oman: [21.5, 55.9], jordan: [31, 36.5], qatar: [25.3, 51.2], israel: [31, 35],
  // Africa, Oceania, Americas
  egypt: [26.8, 30.8], morocco: [31.8, -7.1], "south africa": [-30.6, 22.9], kenya: [-0.02, 37.9], tanzania: [-6.4, 34.9],
  mauritius: [-20.3, 57.6], seychelles: [-4.7, 55.5], australia: [-25.3, 133.8], "new zealand": [-41, 174], fiji: [-17.7, 178],
  usa: [39.8, -98.6], "united states": [39.8, -98.6], canada: [56.1, -106.3], mexico: [23.6, -102.5], peru: [-9.2, -75],
  brazil: [-14.2, -51.9], argentina: [-38.4, -63.6], chile: [-35.7, -71.5], antarctica: [-78, 20],
  // India
  uttarakhand: [30.1, 79], "himachal pradesh": [31.9, 77.2], "jammu and kashmir": [33.8, 76.6], kashmir: [34.1, 74.8],
  ladakh: [34.2, 77.6], rajasthan: [27, 74.2], goa: [15.3, 74.1], kerala: [10.5, 76.3], andaman: [11.7, 92.7],
  "andaman and nicobar islands": [11.7, 92.7], sikkim: [27.5, 88.5], "tamil nadu": [11.1, 78.7], karnataka: [15.3, 75.7],
  maharashtra: [19.7, 75.7], gujarat: [22.3, 71.2], punjab: [31.1, 75.3], "uttar pradesh": [26.8, 80.9],
  "west bengal": [23, 87.8], assam: [26.2, 92.9], meghalaya: [25.5, 91.4], "arunachal pradesh": [28.2, 94.7],
  nagaland: [26.2, 94.6], manipur: [24.7, 93.9], mizoram: [23.2, 92.8], tripura: [23.9, 91.7], odisha: [20.9, 84],
  "madhya pradesh": [23.5, 78.4], bihar: [25.1, 85.3], chhattisgarh: [21.3, 81.8], jharkhand: [23.6, 85.3],
  telangana: [17.9, 79.6], "andhra pradesh": [15.9, 79.7], delhi: [28.6, 77.2], haryana: [29.1, 76.1],
  lakshadweep: [10.6, 72.6], puducherry: [11.9, 79.8], chandigarh: [30.7, 76.8], jammu: [32.7, 74.9],
};

// The map can never be dragged outside the world, so the grey "edge of the map" is never visible.
const WORLD: [[number, number], [number, number]] = [[-85, -180], [85, 180]];

const VIEWS: Record<Mode, { center: [number, number]; zoom: number; mobileCenter: [number, number]; mobileZoom: number }> = {
  international: { center: [25, 15], zoom: 2, mobileCenter: [22, 40], mobileZoom: 1.5 },
  domestic: { center: [22.5, 79], zoom: 5, mobileCenter: [22.5, 79], mobileZoom: 4 },
};

const TILES = {
  street: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 18,
  },
};

const buildDestinations = (packages: any[], key: "country" | "state", mode: Mode): Destination[] => {
  const groups = new Map<string, { name: string; pkgs: MapPackage[] }>();
  packages.forEach((pkg) => {
    const name = typeof pkg[key] === "string" ? pkg[key].trim() : "";
    if (!name) return;
    const k = normalize(name);
    if (!COORDS[k]) return;
    const entry = groups.get(k) || { name, pkgs: [] };
    entry.pkgs.push({
      id: String(pkg._id),
      title: pkg.name || pkg.title || "Package",
      duration: pkg.duration || "",
      price: Number(pkg.price) || 0,
      slug: pkg.slug || String(pkg._id),
    });
    groups.set(k, entry);
  });
  return Array.from(groups.entries())
    .map(([k, g]) => ({
      key: `${mode}-${k}`,
      name: g.name,
      mode,
      lat: COORDS[k][0],
      lng: COORDS[k][1],
      packages: g.pkgs,
      href: `/package/${mode === "domestic" ? "india" : "international"}/${slugify(g.name)}`,
    }))
    .sort((a, b) => b.packages.length - a.packages.length);
};

const pinHtml = (d: Destination, active: boolean) =>
  `<div class="map-pin ${active ? "is-active" : ""}" data-key="${d.key}">
     <span class="map-pin-ring"></span>
     <span class="map-pin-bubble">${d.packages.length}</span>
     <span class="map-pin-label">${escapeHtml(d.name)}</span>
   </div>`;

const controlBtn =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur-md transition-colors hover:text-primary";

const GlobalPackagesMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const pendingSelectRef = useRef<string | null>(null);

  const [data, setData] = useState<Record<Mode, Destination[]>>({ international: [], domestic: [] });
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("international");
  const [selected, setSelected] = useState<Destination | null>(null);
  const [tileType, setTileType] = useState<"street" | "satellite">("street");
  const [query, setQuery] = useState("");
  const [noMatch, setNoMatch] = useState(false);

  // 1. Load real packages
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [intl, india] = await Promise.all([
          fetch("/api/all-packages?tourType=international&limit=200&isActive=true&minimal=true"),
          fetch("/api/all-packages?tourType=india&limit=200&isActive=true&minimal=true"),
        ]);
        const intlPkgs = intl.ok ? (await intl.json()).packages || [] : [];
        const indiaPkgs = india.ok ? (await india.json()).packages || [] : [];
        if (!mounted) return;
        const next = {
          international: buildDestinations(intlPkgs, "country", "international"),
          domestic: buildDestinations(indiaPkgs, "state", "domestic"),
        };
        setData(next);
        if (next.international.length === 0 && next.domestic.length > 0) setMode("domestic");
      } catch (e) {
        console.error("Error loading map packages:", e);
      } finally {
        if (mounted) setLoaded(true);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const hasData = data.international.length + data.domestic.length > 0;

  // 2. Create the map once there is something to show (Leaflet needs the browser)
  useEffect(() => {
    if (!hasData || !mapElRef.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapElRef.current) return;
      leafletRef.current = L;
      const mobile = window.innerWidth < 640;
      const v = VIEWS.international;

        const map = L.map(mapElRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 1,
        maxZoom: 16,
        zoomSnap: 0.5,
        maxBounds: WORLD,
        maxBoundsViscosity: 1,
        scrollWheelZoom: false, // page scrolling is never hijacked; wheel zoom turns on after a click
      });
      // Smallest zoom at which the world still fills the frame (no empty space)
      const fitZoom = () => map.getBoundsZoom(WORLD, true);
      map.setMinZoom(fitZoom());
      map.setView(mobile ? v.mobileCenter : v.center, Math.max(mobile ? v.mobileZoom : v.zoom, fitZoom()));
      map.on("click", () => map.scrollWheelZoom.enable());
      map.getContainer().addEventListener("mouseleave", () => map.scrollWheelZoom.disable());
      tileRef.current = L.tileLayer(TILES.street.url, { maxZoom: TILES.street.maxZoom, noWrap: true, bounds: WORLD }).addTo(map);
      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
      setTimeout(() => map.invalidateSize(), 300);
    })();


    const onResize = () => {
      const m = mapRef.current;
      if (!m) return;
      m.invalidateSize();
      m.setMinZoom(m.getBoundsZoom(WORLD, true));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
      setReady(false);
    };
  }, [hasData]);

  const flyTo = useCallback((lat: number, lng: number, minZoom: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([lat, lng], Math.max(map.getZoom(), minZoom), { duration: 0.8, easeLinearity: 0.25 });
  }, []);

  // 3. Draw pins whenever the data or the International / Domestic tab changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = markersRef.current;
    if (!ready || !L || !map || !layer) return;

    layer.clearLayers();
    const list = data[mode];
    list.forEach((d) => {
      const marker = L.marker([d.lat, d.lng], {
        icon: L.divIcon({ className: "map-pin-icon", html: pinHtml(d, false), iconSize: [32, 32], iconAnchor: [16, 16] }),
      });
      marker.on("click", () => {
        setSelected(d);
        flyTo(d.lat, d.lng, 3);
      });
      marker.addTo(layer);
    });

    const mobile = window.innerWidth < 640;
    const v = VIEWS[mode];
    const pending = pendingSelectRef.current ? list.find((d) => d.key === pendingSelectRef.current) : null;
    pendingSelectRef.current = null;
    if (pending) {
      setSelected(pending);
      map.flyTo([pending.lat, pending.lng], mobile ? 4.5 : 5, { duration: 1 });
    } else {
      map.flyTo(mobile ? v.mobileCenter : v.center, Math.max(mobile ? v.mobileZoom : v.zoom, map.getMinZoom()), { duration: 1 });
      setSelected(null); // the package list only opens when the visitor clicks a pin
    }
  }, [ready, data, mode, flyTo]);

  // 4. Highlight the selected pin
  useEffect(() => {
    const layer = markersRef.current;
    if (!layer) return;
    layer.eachLayer((m: any) => {
      const el: HTMLElement | undefined = m.getElement?.()?.querySelector(".map-pin");
      if (el) el.classList.toggle("is-active", el.dataset.key === selected?.key);
    });
  }, [selected, ready, mode, data]);

  // Map / Satellite
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;
    tileRef.current?.remove();
    tileRef.current = L.tileLayer(TILES[tileType].url, { maxZoom: TILES[tileType].maxZoom, noWrap: true, bounds: WORLD }).addTo(map);
    tileRef.current.bringToBack();
  }, [tileType, ready]);

  const focusDestination = (match: Destination) => {
    if (match.mode !== mode) {
      pendingSelectRef.current = match.key;
      setMode(match.mode);
    } else {
      setSelected(match);
      mapRef.current?.flyTo([match.lat, match.lng], window.innerWidth < 640 ? 4.5 : 5, { duration: 1 });
    }
  };

  const handleSearch = () => {
    const q = query.toLowerCase().trim();
    if (!q) return;
    const all = [...data.international, ...data.domestic];
    const match = all.find(
      (d) => d.name.toLowerCase().includes(q) || d.packages.some((p) => p.title.toLowerCase().includes(q))
    );
    setNoMatch(!match);
    if (match) focusDestination(match);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
    setTimeout(() => mapRef.current?.invalidateSize(), 350);
  };

  const recenter = () => {
    const mobile = window.innerWidth < 640;
    const v = VIEWS[mode];
    const m = mapRef.current;
    m?.flyTo(mobile ? v.mobileCenter : v.center, Math.max(mobile ? v.mobileZoom : v.zoom, m.getMinZoom()), { duration: 1 });    
};

  if (loaded && !hasData) return null;

  const totalPackages = (m: Mode) => data[m].reduce((n, d) => n + d.packages.length, 0);
  const destinationCount = data.international.length + data.domestic.length;
  const packageCount = totalPackages("international") + totalPackages("domestic");
  const quickPicks = data[mode].slice(0, 8);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
          eyebrow="Explore on the map"
          eyebrowIcon={<Globe2 />}
          titleClassName="!text-[24px] font-extrabold sm:!text-3xl"
          title="Explore Global Packages"
          description="Every pin is a destination we travel to. Tap one to see its packages, or search for a place you have in mind."
          action={
            hasData ? (
              <div className="flex gap-2 sm:gap-2.5">
                <div className="flex items-baseline gap-1.5 rounded-full border border-slate-100 bg-primary-light/60 px-3 py-1.5 sm:block sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-center">
                  <p className="text-sm font-extrabold leading-none text-primary sm:text-xl">{destinationCount}</p>
                  <p className="text-xs font-semibold text-slate-500 sm:mt-1 sm:text-[11px] sm:uppercase sm:tracking-wide">Destinations</p>
                </div>
                <div className="flex items-baseline gap-1.5 rounded-full border border-slate-100 bg-primary-light/60 px-3 py-1.5 sm:block sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-center">
                  <p className="text-sm font-extrabold leading-none text-primary sm:text-xl">{packageCount}</p>
                  <p className="text-xs font-semibold text-slate-500 sm:mt-1 sm:text-[11px] sm:uppercase sm:tracking-wide">Packages</p>
                </div>
              </div>
            ) : null
          }
        />

        <div
          ref={containerRef}
          className="relative isolate z-0 h-[62vh] min-h-[420px] w-full select-none overflow-hidden rounded-3xl border border-slate-100 bg-primary-light shadow-[0_20px_50px_rgba(37,99,235,0.12)] sm:h-[440px] lg:h-[480px]"
        >
          {!loaded && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
          <div ref={mapElRef} className="absolute inset-0 z-0" />

          {/* Top controls */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex flex-col gap-2.5 sm:inset-x-4 sm:top-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="pointer-events-auto flex w-full items-center gap-2 sm:w-auto">
              <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2 shadow-sm backdrop-blur-md focus-within:ring-2 focus-within:ring-primary sm:flex-initial">
                <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setNoMatch(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search a destination or package"
                  className="w-full bg-transparent text-xs font-medium text-heading outline-none placeholder:text-slate-400 sm:w-48 sm:text-sm md:w-60"
                />
              </div>
              <div className="hidden shrink-0 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur-md md:flex">
                {(["street", "satellite"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTileType(t)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      tileType === t ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:text-heading"
                    }`}
                  >
                    {t === "street" ? "Map" : "Satellite"}
                  </button>
                ))}
              </div>
            </div>

            <div className="pointer-events-auto flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
              <div role="tablist" aria-label="Package regions" className="inline-flex w-full rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur-md sm:w-auto">
                {([
                  { key: "international", label: "International" },
                  { key: "domestic", label: "Domestic" },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={mode === t.key}
                    disabled={data[t.key].length === 0}
                    onClick={() => setMode(t.key)}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 sm:flex-initial sm:px-4 sm:py-2 sm:text-sm ${
                      mode === t.key ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:text-heading"
                    }`}
                  >
                    {t.label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${mode === t.key ? "bg-white text-primary" : "bg-slate-200 text-slate-700"}`}>
                      {totalPackages(t.key)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="hidden shrink-0 items-center gap-1.5 md:flex">
                <button onClick={toggleFullscreen} aria-label="Toggle fullscreen" title="Full screen" className={controlBtn}>
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button onClick={recenter} aria-label="Recenter map" title="Recenter" className={controlBtn}>
                  <LocateFixed className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search feedback */}
          {noMatch && (
            <div className="absolute left-1/2 top-28 z-[500] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-lg sm:top-20">
              No destination matches &ldquo;{query.trim()}&rdquo;
            </div>
          )}

          {/* Hint until a pin is chosen */}
          {ready && !selected && !noMatch && (
            <div className="pointer-events-none absolute bottom-4 left-3 z-[500] hidden items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-slate-600 shadow-lg backdrop-blur-md sm:left-4 sm:flex">
              <MousePointerClick className="h-4 w-4 text-primary" />
              Tap a pin to see its packages
            </div>
          )}

          {/* Bottom dock: packages of the selected destination */}
          {selected && (
            <div className="absolute inset-x-3 bottom-4 z-[500] sm:inset-x-auto sm:left-4 sm:w-[380px]">
              <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
                <div className="mb-2.5 flex items-start justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-primary">
                      {selected.mode === "domestic" ? "India" : "International"}
                    </span>
                    <h3 className="mt-0.5 flex items-center gap-2 !text-base font-extrabold text-heading">
                      {selected.name}
                      <span className="rounded bg-primary-light px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        {selected.packages.length} {selected.packages.length === 1 ? "Tour" : "Tours"}
                      </span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    aria-label="Close"
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <ul className="max-h-[190px] space-y-2 overflow-y-auto pr-0.5 scrollbar-hide sm:max-h-[220px]">
                  {selected.packages.slice(0, 6).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2.5 rounded-xl border border-slate-100 bg-surface-subtle p-2.5 transition-colors hover:bg-primary-light/70"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate !text-xs !font-bold leading-tight text-heading">{p.title}</h4>
                        <div className="mt-1 flex items-center gap-2">
                          {p.duration && (
                            <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {p.duration}
                            </span>
                          )}
                          {p.price > 0 && (
                            <span className="text-xs font-extrabold text-primary">₹{p.price.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/package/${p.slug}`}
                        className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
                      >
                        Enquire <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                  <span className="text-slate-400">
                    {selected.packages.length > 6 ? `Showing 6 of ${selected.packages.length}` : "All tours shown"}
                  </span>
                  <Link href={selected.href} className="font-bold text-primary hover:underline">
                    View all {selected.name} tours →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Zoom */}
          <div className="absolute bottom-4 right-3 z-[500] flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-md backdrop-blur-md sm:right-4 sm:bottom-6">
            <button onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in" className="flex h-9 w-9 cursor-pointer items-center justify-center border-b border-slate-100 text-slate-700 hover:bg-primary-light">
              <Plus className="h-4 w-4" />
            </button>
            <button onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out" className="flex h-9 w-9 cursor-pointer items-center justify-center text-slate-700 hover:bg-primary-light">
              <Minus className="h-4 w-4" />
            </button>
          </div>

          {/* Attribution (required by the tile provider) */}
          <div className="pointer-events-none absolute bottom-1 left-1/2 z-[450] -translate-x-1/2 rounded bg-white/80 px-2 py-0.5 text-[10px] text-slate-500 sm:left-auto sm:right-16 sm:translate-x-0">
            Tiles © Esri
          </div>
        </div>

        {/* Quick picks: the most popular destinations of the current tab (not on phones) */}
        {quickPicks.length > 0 && (
          <div className="mt-5 hidden flex-wrap items-center gap-2 sm:flex">
            <span className="mr-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              Popular {mode === "domestic" ? "in India" : "worldwide"}:
            </span>
            {quickPicks.map((d) => {
              const active = selected?.key === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => focusDestination(d)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {d.name}
                  <span className={`text-[10px] font-bold ${active ? "text-white/80" : "text-slate-400"}`}>
                    {d.packages.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default GlobalPackagesMap;