"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SearchFilterSidebarProps {
    durationFilter: string;
    setDurationFilter: (value: string) => void;
    priceFilter: string;
    setPriceFilter: (value: string) => void;
    onClearFilters: () => void;
    onClose?: () => void;
    onApply?: () => void;
    /** Pass the (unfiltered) packages to show how many match each budget band */
    items?: any[];
}

export const DURATIONS = [
    { value: "all", label: "Any" },
    { value: "1-3", label: "1-3 Days" },
    { value: "4-6", label: "4-6 Days" },
    { value: "7-9", label: "7-9 Days" },
    { value: "10-12", label: "10-12 Days" },
    { value: "13+", label: "13+ Days" },
];

/** Number of days in a duration string like "5N/6D" or "6 Days" (0 when unknown). */
export const durationInDays = (duration: string = ""): number => {
    const match = duration.match(/(\d+)\s*(?:Days?|D)/i);
    if (match) return parseInt(match[1], 10);
    const firstNumber = duration.match(/\d+/);
    return firstNumber ? parseInt(firstNumber[0], 10) : 0;
};

/** Whether a package duration falls in one of the DURATIONS bands. */
export const matchesDuration = (duration: string, band: string): boolean => {
    if (band === "all") return true;
    const days = durationInDays(duration);
    if (band === "13+") return days >= 13;
    const [min, max] = band.split("-").map(Number);
    return days >= min && days <= max;
};

export const PRICES = [
    { value: "all", label: "Any budget", test: () => true },
    { value: "0-10000", label: "Up to ₹10,000", test: (p: number) => p >= 0 && p <= 10000 },
    { value: "10000-20000", label: "₹10,000 - ₹20,000", test: (p: number) => p > 10000 && p <= 20000 },
    { value: "20000-35000", label: "₹20,000 - ₹35,000", test: (p: number) => p > 20000 && p <= 35000 },
    { value: "35000-50000", label: "₹35,000 - ₹50,000", test: (p: number) => p > 35000 && p <= 50000 },
    { value: "50000+", label: "Above ₹50,000", test: (p: number) => p > 50000 },
];

const SearchFilterSidebar: React.FC<SearchFilterSidebarProps> = ({
    durationFilter,
    setDurationFilter,
    priceFilter,
    setPriceFilter,
    onClearFilters,
    onClose,
    onApply,
    items,
}) => {
    const counts = (test: (p: number) => boolean) =>
        items ? items.filter((i) => test(Number(i.price) || 0)).length : undefined;

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-shrink-0 items-center justify-between p-6 pb-2">
                <h2 className="text-lg font-bold text-heading">Filter by</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClearFilters}
                        className="cursor-pointer text-xs font-bold text-primary hover:underline"
                    >
                        Reset all
                    </button>
                    {onClose && (
                        <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-slate-500 lg:hidden" aria-label="Close filters">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-4">
                {/* Budget */}
                <div className="mb-6 mt-3">
                    <h3 className="mb-3 text-sm font-bold text-heading">Budget per person</h3>
                    <ul className="flex flex-col gap-1">
                        {PRICES.map((opt) => {
                            const active = priceFilter === opt.value;
                            const count = opt.value === "all" ? undefined : counts(opt.test);
                            return (
                                <li key={opt.value}>
                                    <button
                                        onClick={() => setPriceFilter(opt.value)}
                                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                                            active ? "bg-primary-light font-semibold text-primary" : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <span
                                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                                active ? "border-primary bg-primary text-white" : "border-slate-300 bg-white"
                                            }`}
                                        >
                                            {active && <Check className="h-3 w-3" strokeWidth={3} />}
                                        </span>
                                        <span className="flex-1">{opt.label}</span>
                                        {count !== undefined && <span className="text-xs text-slate-400">{count}</span>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Duration */}
                <div className="mb-2">
                    <h3 className="mb-3 text-sm font-bold text-heading">Duration</h3>
                    <div className="flex flex-wrap gap-2">
                        {DURATIONS.map((opt) => {
                            const active = durationFilter === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setDurationFilter(opt.value)}
                                    className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                                        active ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-primary-light text-primary hover:bg-primary/15"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {onApply && (
                <div className="flex-shrink-0 border-t border-slate-200 p-6 pt-4 lg:hidden">
                    <Button className="w-full" onClick={onApply}>
                        Apply Filters
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SearchFilterSidebar;