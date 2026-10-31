"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    X,
    Phone,
    Globe,
    Calendar,
    Mail,
    Star,
    CreditCard,
    LogOut,
    Building,
    ArrowRight,
    Headset,
    type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TOUR_MENUS, toLocationSlug, type TourMenuKey } from "@/lib/tourMenus";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    indiaStates: string[];
    internationalCountries: string[];
    locationsLoading: boolean;
}

// Locations shown inside an expanded menu before "View all"
const MENU_PREVIEW_COUNT = 12;

const EXPLORE_LINKS: { name: string; href: string; icon: LucideIcon; tag?: string }[] = [
    { name: "Fixed Departures", href: "/fixed-departures", icon: Calendar, tag: "2026" },
    { name: "Hotels", href: "/hotels", icon: Building },
    { name: "Why Choose Us", href: "/why-choose-us", icon: Star },
    { name: "About Us", href: "/about", icon: Globe },
    { name: "Travel Blog", href: "/blog", icon: Mail },
    { name: "Contact", href: "/contact", icon: Phone },
    { name: "Payment", href: "/payment", icon: CreditCard },
];

const Sidebar = ({ isOpen, onClose, indiaStates, internationalCountries, locationsLoading }: SidebarProps) => {
    const { user, logout, isLoading } = useAuth();
    const [openMenu, setOpenMenu] = useState<TourMenuKey | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-[90] transform-gpu cursor-pointer"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 32, stiffness: 350, mass: 0.8 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Site menu"
                        className="fixed top-0 right-0 h-full w-[88vw] max-w-[360px] bg-white z-[100] flex flex-col font-plus-jakarta-sans transform-gpu will-change-transform shadow-[-20px_0_60px_rgba(15,23,42,0.18)]"
                        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
                    >
                        {/* Top bar */}
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                            <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                                <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                                    <Image src="/favicon.png" alt="Paradise Yatra" fill sizes="36px" className="object-contain p-1" />
                                </span>
                                <span className="leading-none">
                                    <span className="block text-base font-extrabold tracking-tight text-slate-900">Paradise Yatra</span>
                                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                                        {!isLoading && user ? `Hi, ${user.name.split(' ')[0]}` : "Yatra To Paradise"}
                                    </span>
                                </span>
                            </Link>
                            <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={onClose}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                                aria-label="Close menu"
                            >
                                <X className="h-[18px] w-[18px]" />
                            </motion.button>
                        </div>

                        {/* Scrolling content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y scrollbar-hide">
                            <div className="space-y-7 px-5 py-5 transform-gpu">

                                {!isLoading && user && (
                                    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-sm font-bold text-white">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="flex min-w-0 flex-col">
                                                <span className="truncate text-sm font-bold text-slate-900">{user.name}</span>
                                                <span className="truncate text-[11px] text-slate-500">{user.email}</span>
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => { logout(); onClose(); }}
                                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 cursor-pointer"
                                            aria-label="Sign out"
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Holiday packages */}
                                <section className="space-y-3">
                                    <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Holiday packages</h4>
                                    <div className="space-y-2.5">
                                        {(Object.keys(TOUR_MENUS) as TourMenuKey[]).map((key) => {
                                            const menu = TOUR_MENUS[key];
                                            const locations = key === "india" ? indiaStates : internationalCountries;
                                            const isMenuOpen = openMenu === key;
                                            const { Icon } = menu;
                                            return (
                                                <div
                                                    key={key}
                                                    className={`overflow-hidden rounded-2xl border transition-colors ${
                                                        isMenuOpen ? "border-primary/20 bg-primary-light/40" : "border-slate-100 bg-white"
                                                    }`}
                                                >
                                                    <button
                                                        onClick={() => setOpenMenu(isMenuOpen ? null : key)}
                                                        aria-expanded={isMenuOpen}
                                                        className="flex w-full items-center gap-3 p-3 text-left cursor-pointer"
                                                    >
                                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                                            isMenuOpen ? "bg-primary text-white" : "bg-primary-light text-primary"
                                                        }`}>
                                                            <Icon className="h-5 w-5" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block text-[15px] font-bold text-slate-900">{menu.label}</span>
                                                            <span className="block text-xs font-medium text-slate-500">
                                                                {locationsLoading ? "Loading destinations..." : `${locations.length} ${menu.noun}`}
                                                            </span>
                                                        </span>
                                                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isMenuOpen ? "rotate-180 text-primary" : "text-slate-400"}`} />
                                                    </button>

                                                    <AnimatePresence initial={false}>
                                                        {isMenuOpen && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.22 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-3 pb-3">
                                                                    {locationsLoading ? (
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {Array.from({ length: 6 }).map((_, index) => (
                                                                                <div key={index} className="h-9 animate-pulse rounded-xl bg-white" />
                                                                            ))}
                                                                        </div>
                                                                    ) : locations.length > 0 ? (
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {locations.slice(0, MENU_PREVIEW_COUNT).map((location) => (
                                                                                <Link
                                                                                    key={location}
                                                                                    href={`${menu.basePath}/${toLocationSlug(location)}`}
                                                                                    onClick={onClose}
                                                                                    className="truncate rounded-xl border border-slate-100 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700 transition-colors active:bg-primary-light hover:text-primary"
                                                                                >
                                                                                    {location}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    ) : null}

                                                                    <Link
                                                                        href={menu.basePath}
                                                                        onClick={onClose}
                                                                        className="mt-2.5 flex items-center justify-between rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-colors hover:bg-primary-hover"
                                                                    >
                                                                        {locations.length > MENU_PREVIEW_COUNT
                                                                            ? `View all ${locations.length} ${menu.noun}`
                                                                            : `View all ${menu.label.toLowerCase()}`}
                                                                        <ArrowRight className="h-4 w-4" />
                                                                    </Link>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Explore */}
                                <section className="space-y-2">
                                    <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Explore</h4>
                                    <div className="space-y-0.5">
                                        {EXPLORE_LINKS.map((item) => {
                                            const active = isActive(item.href);
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={onClose}
                                                    className={`group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${
                                                        active ? "bg-primary-light" : "hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                        active ? "bg-primary text-white" : "bg-slate-50 text-slate-500 group-hover:text-primary"
                                                    }`}>
                                                        <item.icon className="h-4 w-4" />
                                                    </span>
                                                    <span className={`flex-1 text-[14px] font-semibold ${active ? "text-primary" : "text-slate-800"}`}>
                                                        {item.name}
                                                    </span>
                                                    {item.tag && (
                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                            {item.tag}
                                                        </span>
                                                    )}
                                                    <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Support card */}
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-strong to-[#0b1a4a] p-5 text-white">
                                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                                    <Headset className="pointer-events-none absolute right-4 top-4 h-10 w-10 text-white/15" />
                                    <div className="relative">
                                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            Online support
                                        </span>
                                        <p className="mt-2 text-base font-extrabold text-white">Need expert advice?</p>
                                        <p className="mt-1 text-xs leading-relaxed text-white/75">
                                            Talk to our travel curators for a personalised holiday plan.
                                        </p>
                                        <a
                                            href="tel:+918979396413"
                                            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/15 py-2.5 text-[13px] font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
                                        >
                                            <Phone className="h-4 w-4" />
                                            +91 89793 96413
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky CTA */}
                        <div className="shrink-0 border-t border-slate-100 bg-white p-4">
                            <Link
                                href="/contact"
                                onClick={onClose}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover"
                            >
                                Plan My Trip
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
