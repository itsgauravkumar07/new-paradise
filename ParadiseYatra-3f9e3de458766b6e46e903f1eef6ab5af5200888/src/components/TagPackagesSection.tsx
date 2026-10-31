"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDestinationWebp, getImageUrl } from "@/lib/utils";
import PackageCard from "@/components/ui/PackageCard";
import SectionHeader from "@/components/ui/SectionHeader";
import CarouselArrows from "@/components/ui/CarouselArrows";
import { Button } from "@/components/ui/button";

interface TagPackagesSectionProps {
  /** Slug of the tag created in Admin > Tags. The section hides itself if the tag has no packages. */
  tagSlug: string;
  title: string;
  description?: string;
  eyebrow?: string;
  priceLabel?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
}

interface Item {
  id: string;
  destination: string;
  duration: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  rating?: number;
  inclusions?: string[];
}

/** Generic "packages from an admin tag" carousel. Reuse it for any curated list. */
const TagPackagesSection = ({
  tagSlug,
  title,
  description,
  eyebrow,
  priceLabel = "Per Person",
  viewAllHref,
  viewAllLabel = "View All",
  className = "bg-surface-subtle",
}: TagPackagesSectionProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/tags/slug/${tagSlug}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const list: any[] = json?.success && json?.data?.packages ? json.data.packages : [];
        if (!mounted) return;
        setItems(
          list.map((pkg) => {
            const destination = pkg.location || pkg.destination || "India";
            return {
              id: pkg._id,
              destination,
              duration: pkg.duration || "",
              title: pkg.name || pkg.title || "Package",
              price: pkg.price || 0,
              image: getImageUrl(pkg.image) || getImageUrl(pkg.images?.[0]) || getDestinationWebp(destination) || "",
              slug: pkg.slug || pkg._id,
              rating: typeof pkg.rating === "number" ? pkg.rating : undefined,
              inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : undefined,
            };
          })
        );
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [tagSlug]);

  const updateScroll = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      el.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [items.length, updateScroll]);

  const scrollCards = (dir: 1 | -1) => railRef.current?.scrollBy({ left: dir * 304, behavior: "smooth" });

  // Nothing until the packages are known: an empty tag never takes up space, and a filled one appears at
  // full size instead of swapping a skeleton for cards while the reader scrolls past
  if (loading || items.length === 0) return null;

  return (
    <section className={`py-16 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
                  titleClassName="!text-[20px] sm:!text-3xl md:!text-3xl"
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={
            <div className="hidden md:block">
              <CarouselArrows
                variant="compact"
                onPrevious={() => scrollCards(-1)}
                onNext={() => scrollCards(1)}
                canScrollLeft={canLeft}
                canScrollRight={canRight}
              />
            </div>
          }
        />
        <div ref={railRef} className="flex gap-6 overflow-x-auto px-1 pb-8 pt-2 snap-x scrollbar-hide">
          {items.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  id={pkg.id}
                  destination={pkg.destination}
                  duration={pkg.duration}
                  title={pkg.title}
                  price={pkg.price}
                  image={pkg.image}
                  slug={pkg.slug}
                  hrefPrefix="/package"
                  priceLabel={priceLabel}
                  rating={pkg.rating}
                  inclusions={pkg.inclusions}
                  className="snap-start"
                />
          ))}
        </div>
        {viewAllHref && (
          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href={viewAllHref}>
                {viewAllLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TagPackagesSection;