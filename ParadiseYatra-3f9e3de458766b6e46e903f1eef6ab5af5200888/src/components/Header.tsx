
"use client";

import {
  Menu,
  ChevronDown,
  ChevronRight,
  MapPin,
  Search,
  LogOut,
  Ticket,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { useTourLocations } from "@/hooks/useTourLocations";
import {
  TOUR_MENUS,
  toLocationSlug,
  type TourMenuConfig,
  type TourMenuKey,
} from "@/lib/tourMenus";
import Image from "next/image";
import Link from "next/link";

const loadSidebar = () => import("./Sidebar");

const Sidebar = dynamic(loadSidebar, {
  ssr: false,
});

interface HeaderProps {
  transparentOnTop?: boolean;
  disableOffset?: boolean;
}

// Desktop navigation
type NavEntry =
  | { kind: "menu"; key: TourMenuKey }
  | { kind: "link"; label: string; href: string; tag?: string };

const NAV_ITEMS: NavEntry[] = [
  { kind: "menu", key: "international" },
  { kind: "menu", key: "india" },
  { kind: "link", label: "Fixed Departure", href: "/fixed-departures", tag: "2026" },
  { kind: "link", label: "Hotels", href: "/hotels" },
  { kind: "link", label: "About", href: "/about" },
  { kind: "link", label: "Blog", href: "/blog" },
];

// Only offer in-menu search when the list is long enough to need it
const MENU_SEARCH_THRESHOLD = 10;

interface TourMenuCardProps {
  menu: TourMenuConfig;
  locations: string[];
  loading: boolean;
  onNavigate: () => void;
}

const TourMenuCard = ({ menu, locations, loading, onNavigate }: TourMenuCardProps) => {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleLocations = normalizedQuery
    ? locations.filter((location) => location.toLowerCase().includes(normalizedQuery))
    : locations;
  const { Icon } = menu;

  return (
    // pt-3 (not mt-3) keeps the hover area continuous between the trigger and the card
    <div className="absolute left-0 top-full z-20 pt-3">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="w-[440px] overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
      >
        {/* Heading */}
        <div className="flex items-center gap-3.5 px-4 pb-4 pt-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-white shadow-md shadow-primary/25">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-tight text-slate-900">{menu.title}</p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {loading ? "Loading destinations..." : `${locations.length} ${menu.noun} to explore`}
            </p>
          </div>
        </div>

        {!loading && locations.length > MENU_SEARCH_THRESHOLD && (
          <div className="px-3 pb-2">
            <label className="relative block">
              <span className="sr-only">{menu.searchPlaceholder}</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={menu.searchPlaceholder}
                className="w-full rounded-full bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:bg-white focus:ring-primary/40"
              />
            </label>
          </div>
        )}

        <div className="mx-1 border-t border-slate-100" />

        {/* Destinations */}
        <div className="max-h-80 overflow-y-auto px-3 py-2">
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className={`flex items-center gap-3 px-1.5 py-2.5 ${index < 6 ? "border-b border-slate-100" : ""}`}>
                  <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-3 flex-1 animate-pulse rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : visibleLocations.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4">
              {visibleLocations.map((location, index) => {
                // No divider under the last row
                const lastRowStart = visibleLocations.length - (visibleLocations.length % 2 || 2);
                return (
                  <Link
                    key={location}
                    href={`${menu.basePath}/${toLocationSlug(location)}`}
                    onClick={onNavigate}
                    title={location}
                    className={`group flex items-center gap-3 px-1.5 py-2.5 transition-colors ${
                      index < lastRowStart ? "border-b border-slate-100" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-slate-700 transition-colors group-hover:text-primary">
                      {location}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-8 text-center text-sm font-medium text-slate-400">
              {normalizedQuery ? `No ${menu.noun} match "${query.trim()}"` : `No ${menu.noun} available yet`}
            </p>
          )}
        </div>

        <Link
          href={menu.basePath}
          onClick={onNavigate}
          className="group flex items-center justify-between rounded-2xl bg-primary-light px-5 py-3.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          View all {menu.label.toLowerCase()}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </div>
  );
};

const Header = ({
  transparentOnTop = false,
  disableOffset = false,
}: HeaderProps) => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<TourMenuKey | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shouldRenderSidebar, setShouldRenderSidebar] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const pathname = usePathname();
  const isHome = pathname === "/";
  const isTransparent = (isHome || transparentOnTop) && !isScrolled;
  const isOverlay = isHome || transparentOnTop || disableOffset;

  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // India states / international countries, fetched when a menu first opens
  const tourLocations = useTourLocations();

  const handleMouseEnter = (key: TourMenuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenMenu(key);
    tourLocations.load();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 200);
  };

  const closeMenu = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenMenu(null);
  };

  // Close the dropdown on route change and on Escape
  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!openMenu) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openMenu]);

  // Function to stop navigation loading
  const stopNavigationLoading = () => {
    setIsNavigating(false);
  };

  // Expose the function globally so other components can call it
  useEffect(() => {
    (window as { stopHeaderLoading?: () => void }).stopHeaderLoading =
      stopNavigationLoading;

    // Also listen for route changes to automatically stop loading
    const handleRouteChange = () => {
      setIsNavigating(false);
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      delete (window as { stopHeaderLoading?: () => void }).stopHeaderLoading;
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    let rafId: number | null = null;
    let lastValue = window.scrollY > 10;

    setIsScrolled(lastValue);

    const updateScrolled = () => {
      const nextValue = window.scrollY > 10;
      if (nextValue !== lastValue) {
        lastValue = nextValue;
        setIsScrolled(nextValue);
      }
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateScrolled();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Handle navigation loading state
  useEffect(() => {
    if (isNavigating) {
      // Set a timeout to automatically hide loading after 5 seconds as fallback
      const timeout = setTimeout(() => {
        setIsNavigating(false);
      }, 5000);

      // Also listen for page load events
      const handlePageLoad = () => {
        // Small delay to ensure the page is fully rendered
        setTimeout(() => setIsNavigating(false), 500);
      };

      // Listen for when the page finishes loading
      if (document.readyState === "complete") {
        handlePageLoad();
      } else {
        window.addEventListener("load", handlePageLoad);
      }

      return () => {
        clearTimeout(timeout);
        window.removeEventListener("load", handlePageLoad);
      };
    }
  }, [isNavigating]);

  // Handle Sidebar scroll lock - uses position:fixed rather than
  // overflow:hidden, which is what was causing the lag/jump on mobile when
  // the menu opened (overflow:hidden alone doesn't reliably stop background
  // scroll on iOS Safari and causes a visible snap as the scrollbar hides).
  useEffect(() => {
    if (isSidebarOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.dataset.scrollY = String(scrollY);
    } else {
      const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      delete document.body.dataset.scrollY;
      window.scrollTo(0, scrollY);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isSidebarOpen) {
      setShouldRenderSidebar(true);
    }
  }, [isSidebarOpen]);

  // Warm the Sidebar's lazy-loaded chunk ahead of time (idle time, or shortly
  // after mount as a fallback) so opening it is never gated on a fresh
  // download - this is what was causing the perceptible lag before the first
  // open on mobile.
  useEffect(() => {
    const warm = () => {
      loadSidebar().catch(() => {});
    };
    if ("requestIdleCallback" in window) {
      const id = (window as Window & { requestIdleCallback: Function }).requestIdleCallback(warm, { timeout: 2000 });
      return () => (window as Window & { cancelIdleCallback: Function }).cancelIdleCallback(id);
    }
    const t = setTimeout(warm, 1200);
    return () => clearTimeout(t);
  }, []);

  const navItemClass = (highlighted: boolean) =>
    `flex items-center gap-1 rounded-full px-3 xl:px-3.5 py-2 transition-colors cursor-pointer ${
      isTransparent
        ? highlighted
          ? "bg-white/15 text-white"
          : "text-white/85 hover:bg-white/10 hover:text-white"
        : highlighted
          ? "bg-primary-light text-primary"
          : "text-slate-600 hover:bg-slate-100 hover:text-heading"
    }`;

  return (
    <>
    {/* Simple header  */}

      <header
        className={`${isOverlay ? "fixed" : "sticky"} top-[var(--offer-bar-h,0px)] left-0 right-0 z-[60] w-full font-plus-jakarta-sans transition-all duration-300 ${
          isTransparent
            ? "bg-transparent border-transparent shadow-none"
            : "bg-white border-b border-slate-100/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
              <div className="mx-auto max-w-7xl px-4 md:px-8">
                <div
                  className={`flex items-center justify-between transition-all duration-300 ${
                    isHome ? "py-3" : "py-2"
                  }`}
                >

                {/* Logo - Left side */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="group flex cursor-pointer items-center gap-2.5"
                  >
                    <span className="relative block h-8 w-8 md:h-10 md:w-10 shrink-0 overflow-hidden rounded-lg md:rounded-xl transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src="/favicon.png"
                        alt="Paradise Yatra"
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    </span>
                    <span className="text-left leading-none">
                      <span className={`!text-[15px] md:!text-[18px] !font-extrabold tracking-tight block whitespace-nowrap ${isTransparent ? "!text-white" : "text-slate-900"}`}>
                        Paradise Yatra
                      </span>
                      <span className={`mt-0.5 md:mt-1 block text-[9px] md:text-[10.5px] !font-bold uppercase tracking-[0.1em] md:tracking-[0.14em] whitespace-nowrap ${isTransparent ? "!text-white/80" : "!text-blue-600"}`}>
                        Yatra To Paradise
                      </span>
                    </span>
                  </button>
                </div>

                {/* Navigation - Desktop - Centered */}
                <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-sm font-semibold" aria-label="Main">
                  {NAV_ITEMS.map((item) => {
                    if (item.kind === "menu") {
                      const menu = TOUR_MENUS[item.key];
                      const isOpen = openMenu === item.key;
                      const active = pathname.startsWith(menu.basePath);
                      return (
                        <div
                          key={item.key}
                          className="relative"
                          onMouseEnter={() => handleMouseEnter(item.key)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-haspopup="true"
                            onClick={() => (isOpen ? closeMenu() : handleMouseEnter(item.key))}
                            className={navItemClass(isOpen || active)}
                          >
                            <span className="xl:hidden">{menu.shortLabel}</span>
                            <span className="hidden xl:inline">{menu.label}</span>
                            <ChevronDown
                              className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            />
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <TourMenuCard
                                menu={menu}
                                locations={item.key === "india" ? tourLocations.indiaStates : tourLocations.internationalCountries}
                                loading={tourLocations.loading}
                                onNavigate={closeMenu}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link key={item.href} href={item.href} className={navItemClass(active)}>
                        {item.label}
                        {item.tag && (
                          <span className="ml-1 hidden xl:inline rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            {item.tag}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="flex items-center gap-2.5">
                  {/* Desktop specific buttons */}
                  <div className="hidden lg:flex items-center text-sm font-bold">
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => router.push("/contact")}
                      className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover cursor-pointer"
                    >
                      Plan My Trip
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {/* Mobile Actions */}
                  <div className="lg:hidden flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => router.push("/contact")}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 cursor-pointer"
                      >
                        Plan Trip
                      </button>
                    {user ? (
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        onPointerDown={loadSidebar}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 cursor-pointer ${
                          isTransparent
                            ? "border-white/40 bg-white/10 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                        aria-label="Account menu"
                      >
                        <span className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-600 to-[#000945] flex items-center justify-center text-[10px] text-white font-bold capitalize">
                          {user.name.charAt(0)}
                        </span>
                      </motion.button>
                    ) : null}

                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-300 cursor-pointer ${
                        isTransparent
                          ? "border-white/40 bg-white/10 text-white active:bg-white/20"
                          : "border-slate-200 bg-slate-50 text-slate-700 active:bg-slate-100"
                      }`}
                      onClick={() => {
                        tourLocations.load();
                        setIsSidebarOpen(true);
                      }}
                      onPointerDown={loadSidebar}
                      aria-label="Menu"
                    >
                      <Menu className="h-5 w-5" />
                    </motion.button>

                  </div>
                </div>
              </div>

              {user && showUserMenu && (
                <div className="lg:hidden absolute right-4 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 px-1 py-1">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <p className="text-sm font-black !text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] font-medium !text-slate-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-blue-600" />
                    <span className="font-bold">My Bookings</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-bold">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
      </header>

      {shouldRenderSidebar && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          indiaStates={tourLocations.indiaStates}
          internationalCountries={tourLocations.internationalCountries}
          locationsLoading={tourLocations.loading}
        />
      )}

    </>
  );
};

export default Header;
