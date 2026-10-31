"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface CarouselArrowsProps {
    onPrevious: () => void;
    onNext: () => void;
    canScrollLeft: boolean;
    canScrollRight: boolean;
    variant?: 'default' | 'compact';
}

const CarouselArrows: React.FC<CarouselArrowsProps> = ({
    onPrevious,
    onNext,
    canScrollLeft,
    canScrollRight,
    variant = 'default'
}) => {
    const isCompact = variant === 'compact';

    // design.md "Circular Floating Controls": previous = white, next = solid primary.
    const base =
        "w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl";
    const prevClasses = `${base} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
    const nextClasses = `${base} bg-primary text-primary-foreground shadow-blue-600/25 hover:bg-primary-hover`;
    const floating =
        "absolute top-[48%] -translate-y-1/2 z-40 hidden md:flex group-hover/carousel:opacity-100 disabled:opacity-0 disabled:pointer-events-none";
    const iconClasses = "h-5 w-5";

    if (isCompact) {
        return (
            <div className="flex gap-2">
                <button onClick={onPrevious} disabled={!canScrollLeft} className={prevClasses} aria-label="Previous">
                    <ArrowLeft className={iconClasses} />
                </button>
                <button onClick={onNext} disabled={!canScrollRight} className={nextClasses} aria-label="Next">
                    <ArrowRight className={iconClasses} />
                </button>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={onPrevious}
                disabled={!canScrollLeft}
                className={`${prevClasses} ${floating} left-0 md:-left-6`}
                aria-label="Previous"
            >
                <ArrowLeft className={iconClasses} />
            </button>

            <button
                onClick={onNext}
                disabled={!canScrollRight}
                className={`${nextClasses} ${floating} right-0 md:-right-6`}
                aria-label="Next"
            >
                <ArrowRight className={iconClasses} />
            </button>
        </>
    );
};

export default CarouselArrows;