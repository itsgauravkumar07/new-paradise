"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import SectionHeader from "./ui/SectionHeader";
import CarouselArrows from "./ui/CarouselArrows";
import { VIDEO_TESTIMONIALS as TESTIMONIALS } from "@/lib/videoTestimonials";

const TestimonialsSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isInView, setIsInView] = useState(false);
    const [hasEnteredView, setHasEnteredView] = useState(false);

    const updateScrollState = () => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        setCanScrollLeft(carousel.scrollLeft > 0);
        setCanScrollRight(carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 1);
    };

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        carousel.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);
        updateScrollState();
        return () => {
            carousel.removeEventListener("scroll", updateScrollState);
            window.removeEventListener("resize", updateScrollState);
        };
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const visible = entry.isIntersecting;
                setIsInView(visible);
                if (visible) setHasEnteredView(true);
            },
            { threshold: 0.35, rootMargin: "150px 0px" }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!hasEnteredView) return;

        videoRefs.current.forEach((video) => {
            if (!video) return;
            if (isInView) {
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(() => {
                        // Playback may fail until browser confirms auto-play policy.
                    });
                }
            } else {
                video.pause();
            }
        });
    }, [isInView, hasEnteredView]);

    const scrollByStep = (direction: 1 | -1) => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        const card = carousel.querySelector(".flex-shrink-0");
        const step = (card?.getBoundingClientRect().width ?? 280) + 24;
        carousel.scrollBy({ left: direction * step, behavior: "smooth" });
    };

      return (
        <section ref={sectionRef} className="relative overflow-hidden bg-background py-16">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <SectionHeader
                    titleClassName="!text-[20px] sm:!text-3xl md:!text-3xl"
                    align="center"
                    title="A Simply Amazing Experience"
                    description={
                        <>
                            <span className="md:hidden">Real stories from our happy travelers.</span>
                            <span className="hidden md:inline">
                                Watch how fellow adventurers experienced unforgettable journeys, flawless arrangements, and heartfelt hospitality with Paradise Yatra.
                            </span>
                        </>
                    }
                />

                <div className="relative group/carousel">
                    <div className="hidden md:block">
                        <CarouselArrows
                            onPrevious={() => scrollByStep(-1)}
                            onNext={() => scrollByStep(1)}
                            canScrollLeft={canScrollLeft}
                            canScrollRight={canScrollRight}
                        />
                    </div>
                    <div
                        ref={carouselRef}
                        className="flex gap-6 overflow-x-auto px-2 pb-8 pt-2 snap-x snap-mandatory scroll-smooth scrollbar-hide"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {TESTIMONIALS.map((t) => (
                            <article
                                key={t.id}
                                className="flex-shrink-0 w-[250px] snap-center overflow-hidden rounded-3xl border border-slate-100 bg-white card-lift md:w-[270px]"
                            >
                                <div className="relative h-[380px] overflow-hidden bg-slate-900" style={{ isolation: "isolate" }}>
                                    <video
                                        ref={(el) => { videoRefs.current[t.id - 1] = el; }}
                                        src={hasEnteredView ? t.video : undefined}
                                        muted
                                        loop
                                        playsInline
                                        preload={hasEnteredView ? "metadata" : "none"}
                                        className="absolute inset-0 z-0 h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 z-10 image-scrim" />
                                    {t.rating !== undefined && (
                                        <span className="glass-pill absolute left-3 top-3 z-20">
                                            <Star className="h-3 w-3 fill-tertiary text-tertiary" /> {t.rating.toFixed(1)}
                                        </span>
                                    )}
                                    <p className="absolute inset-x-4 bottom-4 z-20 line-clamp-2 text-xs font-semibold leading-snug !text-white md:line-clamp-3 md:text-sm">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                </div>
                                <div className="p-4">
                                    <h4 className="text-sm font-bold text-heading">{t.name}</h4>
                                    <p className="text-xs text-muted-foreground">Trip to {t.destination}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
