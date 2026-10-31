"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Globe2,
  Info,
  Luggage,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import CarouselArrows from "@/components/ui/CarouselArrows";
import SectionHeader from "@/components/ui/SectionHeader";
import PackageGallery from "@/components/packages/PackageGallery";
import FAQSection from "@/components/FAQSection";
import { normalizeRichTextHtml, preserveRichTextSpacing } from "@/lib/richText";
import { getImageUrl, getPackagePriceLabel } from "@/lib/utils";
import { toAmenities } from "@/lib/amenities";
import { COMPANY } from "@/lib/chat/company";
import MomentsStrip from "@/components/moments/MomentsStrip";

const PackageEnquiryModal = dynamic(() => import("@/components/packages/PackageEnquiryModal"), { ssr: false });
const PackageCard = dynamic(() => import("@/components/ui/PackageCard"), { ssr: false });

interface DayItinerary {
  day: number;
  title: string;
  activities: string[];
  accommodation: string;
  meals: string;
  image: string;
}

interface Package {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  priceType?: "per_person" | "per_couple";
  originalPrice?: number;
  discount: number;
  duration: string;
  destination: string;
  category: string;
  images: string[];
  imageAlt?: string;
  gallery?: string[];
  highlights: string[];
  itinerary: DayItinerary[];
  inclusions: string[];
  exclusions: string[];
  knowBeforeYouGo?: string[];
  thingsToCarry?: string[];
  rating: number;
  reviews: unknown[];
  isActive: boolean;
  isFeatured: boolean;
  holidayType?: string | { _id?: string; title?: string; slug?: string };
  tags?: Array<string | { _id?: string; name?: string; slug?: string }>;
  tourType?: "international" | "india";
  country?: string;
  state?: string;
  location?: string;
}

interface SimilarPackage {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
  image?: string;
  images?: string[];
  imageAlt?: string;
  price?: number;
  priceType?: string;
  duration?: string;
  location?: string;
  state?: string;
  country?: string;
  inclusions?: unknown[];
  isActive?: boolean;
  shortDescription?: string;
  description?: string;
}

interface ItineraryPageClientProps {
  packageData: Package;
  slug: string;
}

interface BreadcrumbSource {
  label: string;
  href: string;
}

// Payment and cancellation terms follow the Refund Policy page (Admin → Legal Pages, built-in wording in src/lib/legal/defaults.ts): keep them in step
const BOOKING_TERMS = [
  "Your booking is confirmed once the advance payment is received.",
  "The balance amount is to be paid before the trip starts.",
  "Dates, hotels and the itinerary can be changed before you confirm.",
];
const CANCELLATION_TERMS = [
  "30 days or more before departure: 25% of the package cost is charged.",
  "Within 15 days of departure, or no-show: no refund.",
  "Flights and hotels follow the airline's and hotel's own cancellation rules.",
  "Eligible refunds are processed within 45 working days.",
];

const RICH_TEXT =
  "text-[15px] leading-relaxed text-slate-700 [&_a]:!text-primary [&_a]:!underline [&_h1]:!m-0 [&_h1]:!text-xl [&_h1]:!font-bold [&_h1]:!text-heading [&_h2]:!m-0 [&_h2]:!text-lg [&_h2]:!font-bold [&_h2]:!text-heading [&_h3]:!m-0 [&_h3]:!text-base [&_h3]:!font-bold [&_h3]:!text-heading [&_li]:!m-0 [&_li]:!text-slate-700 [&_ol]:!list-decimal [&_ol]:!pl-5 [&_p]:!m-0 [&_p]:!text-[15px] [&_p]:!text-slate-700 [&_ul]:!list-disc [&_ul]:!pl-5 [&_ul_li::marker]:!text-primary [&_*]:!bg-transparent";

const stripHtmlTags = (value: string = "") =>
  value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

const containsHtml = (value: string = ""): boolean => /<\/?[a-z][\s\S]*>/i.test(value);

const toSlug = (value: string = "") =>
  value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const getDestinationBreadcrumb = (pkg: Package): BreadcrumbSource => {
  const primaryLocation = (pkg.state || pkg.country || pkg.destination || pkg.location || "").split(",")[0].trim();
  if (!primaryLocation) return { label: "Packages", href: "/package" };
  return {
    label: primaryLocation,
    href: `/package/${pkg.tourType === "international" ? "international" : "india"}/${toSlug(primaryLocation)}`,
  };
};

const HIGHLIGHTS_PREVIEW = 8;

const inr = (value: number) =>`₹${value.toLocaleString("en-IN")}`;

function Section({ id, title, icon, children, action }: { id: string; title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section id={id} data-section={id} className="scroll-mt-40 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 !text-lg font-extrabold text-heading md:!text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary [&_svg]:h-[18px] [&_svg]:w-[18px]">{icon}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

interface TourCarouselProps {
  eyebrow: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  tours: SimilarPackage[];
  viewAll?: { href: string; label: string };
  className?: string;
}

/** One row of package cards that scrolls sideways, with its own arrows. */
function TourCarousel({ eyebrow, icon, title, description, tours, viewAll, className = "" }: TourCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const timer = setTimeout(update, 400);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [tours]);

  const step = (dir: 1 | -1) => {
    const card = railRef.current?.querySelector("article");
    railRef.current?.scrollBy({ left: dir * ((card?.getBoundingClientRect().width ?? 290) + 24), behavior: "smooth" });
  };

  return (
    <section className={`px-4 pb-4 pt-10 md:px-8 md:pb-8 md:pt-12 ${className}`}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow={eyebrow}
          eyebrowIcon={icon}
          title={title}
          description={description}
          titleClassName="!text-[22px] sm:!text-3xl"
          className="!mb-6"
          action={
            viewAll ? (
              <Link href={viewAll.href} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                {viewAll.label} <ChevronRight className="h-4 w-4" />
              </Link>
            ) : undefined
          }
        />
        <div className="group/carousel relative -mx-4 px-4 md:mx-0 md:px-0">
          {tours.length > 1 && <CarouselArrows onPrevious={() => step(-1)} onNext={() => step(1)} canScrollLeft={canLeft} canScrollRight={canRight} />}
          <div ref={railRef} className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-2 pb-6 pt-2 scrollbar-hide">
            {tours.map((pkg) => (
              <PackageCard
                key={pkg._id}
                id={pkg._id}
                destination={pkg.state || pkg.location?.split(",")[0].trim() || pkg.country || ""}
                duration={pkg.duration || ""}
                title={pkg.name || pkg.title || ""}
                price={Number(pkg.price) || 0}
                image={getImageUrl(pkg.image || pkg.images?.[0] || null) || pkg.image || ""}
                imageAlt={pkg.imageAlt || pkg.name || pkg.title}
                slug={pkg.slug || pkg._id}
                hrefPrefix="/package"
                priceLabel={getPackagePriceLabel(pkg.priceType)}
                inclusions={Array.isArray(pkg.inclusions) ? (pkg.inclusions as string[]) : undefined}
                description={pkg.shortDescription || pkg.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const ItineraryPageClient = ({ packageData, slug }: ItineraryPageClientProps) => {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [dynamicDescription, setDynamicDescription] = useState<string | null>(null);
  const [dynamicImage, setDynamicImage] = useState<string | null>(null);
  const [breadcrumbSource, setBreadcrumbSource] = useState<BreadcrumbSource>(() => getDestinationBreadcrumb(packageData));
  const [themeChip, setThemeChip] = useState<BreadcrumbSource | null>(null);
  const [nearbyTours, setNearbyTours] = useState<SimilarPackage[]>([]);
  const [otherTours, setOtherTours] = useState<SimilarPackage[]>([]);
  const [openDays, setOpenDays] = useState<number[]>([0]);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [overviewLong, setOverviewLong] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(72);
  const [activeSection, setActiveSection] = useState("overview");
  const overviewRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const title = packageData.title || "Tour package";
  // The state (India) or country (abroad) this package belongs to, used for the "More X tours" section
  const areaName = (packageData.state || packageData.country || "").trim();
  const areaHref = areaName
    ? `/package/${packageData.tourType === "international" ? "international" : "india"}/${toSlug(areaName)}`
    : "";
  const place = (packageData.state || packageData.destination || packageData.location || packageData.country || "").split(",")[0].trim();
  const itinerary = useMemo(() => (Array.isArray(packageData.itinerary) ? packageData.itinerary : []), [packageData.itinerary]);
  const inclusions = Array.isArray(packageData.inclusions) ? packageData.inclusions.filter(Boolean) : [];
  const exclusions = Array.isArray(packageData.exclusions) ? packageData.exclusions.filter(Boolean) : [];
  const highlights = (packageData.highlights || []).map((h) => stripHtmlTags(h)).filter(Boolean);
  const knowBefore = (packageData.knowBeforeYouGo || []).filter(Boolean);
  const toCarry = (packageData.thingsToCarry || []).filter(Boolean);
  const description = dynamicDescription || packageData.description || "";
  const amenities = toAmenities(inclusions, 6);

  const price = Number(packageData.price) || 0;
  const original = Number(packageData.originalPrice) || 0;
  const saving = original > price && price > 0 ? Math.round(((original - price) / original) * 100) : Number(packageData.discount) || 0;
  const unit = getPackagePriceLabel(packageData.priceType).replace(/^per\s+/i, "").toLowerCase() || "person";
  const priceLabel = price > 0 ? `${inr(price)} per ${unit}` : undefined;

  // Main photo, then the admin gallery, then itinerary day photos (no repeats)
  const photos = useMemo(() => {
    const opts = { width: 1400, height: 900, crop: "fill", gravity: "auto", quality: "good" } as const;
    const sources = [
      dynamicImage || packageData.images?.[0],
      ...(packageData.gallery || []),
      ...(packageData.images || []).slice(1),
      ...itinerary.map((d) => d.image),
    ].filter((s): s is string => typeof s === "string" && s.trim() !== "");
    return Array.from(new Set(sources)).map((src) => getImageUrl(src, opts) || src);
  }, [dynamicImage, packageData.images, packageData.gallery, itinerary]);

  const sections = useMemo(
    () =>
      [
        description && { id: "overview", label: "Overview" },
        highlights.length && { id: "highlights", label: "Highlights" },
        itinerary.length && { id: "itinerary", label: "Itinerary" },
        (inclusions.length || exclusions.length) && { id: "inclusions", label: "Inclusions" },
        (knowBefore.length || toCarry.length) && { id: "before-you-go", label: "Know before you go" },
        { id: "policies", label: "Booking & cancellation" },
        { id: "faqs", label: "FAQs" },
      ].filter((s): s is { id: string; label: string } => Boolean(s)),
    [description, highlights.length, itinerary.length, inclusions.length, exclusions.length, knowBefore.length, toCarry.length]
  );

  // Admin > Page Content can override the description and main photo for this package
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/page-content/${slug.toLowerCase().replace(/\s+/g, "-")}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted || !data.success || !data.data) return;
        if (data.data.content) setDynamicDescription(data.data.content);
        if (data.data.image) setDynamicImage(data.data.image);
      } catch (e) {
        console.error("Failed to fetch dynamic package content", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // Theme (first tag) for the chip under the title
  useEffect(() => {
    let mounted = true;
    const firstTag = Array.isArray(packageData.tags) ? packageData.tags[0] : null;
    (async () => {
      if (firstTag && typeof firstTag === "object" && firstTag.name && firstTag.slug) {
        setThemeChip({ label: firstTag.name, href: `/package/theme/${firstTag.slug}` });
        return;
      }
      if (typeof firstTag === "string") {
        try {
          const res = await fetch(`/api/tags/${firstTag}`, { cache: "no-store" });
          const tag = res.ok ? (await res.json())?.data : null;
          if (mounted && tag?.name && tag?.slug) setThemeChip({ label: tag.name, href: `/package/theme/${tag.slug}` });
        } catch (e) {
          console.error("Error fetching tag:", e);
        }
      }
    })();
    setBreadcrumbSource(getDestinationBreadcrumb(packageData));
    return () => {
      mounted = false;
    };
  }, [packageData]);

  // End of page: (1) other tours in the same state / country, (2) tours elsewhere ("You might also like")
  useEffect(() => {
    let mounted = true;
    const list = async (query: string): Promise<SimilarPackage[]> => {
      const res = await fetch(`/api/all-packages?${query}`, { cache: "no-store" });
      const data = res.ok ? await res.json() : {};
      const items: SimilarPackage[] = Array.isArray(data) ? data : Array.isArray(data?.packages) ? data.packages : [];
      return items.filter((p) => p._id !== packageData._id && p.isActive !== false);
    };
    (async () => {
      try {
        let sameArea: SimilarPackage[] = [];
        if (areaName) {
          const params = new URLSearchParams({ isActive: "true", limit: "12" });
          if (packageData.tourType) params.set("tourType", packageData.tourType);
          params.set(packageData.state ? "state" : "country", areaName);
          sameArea = (await list(params.toString())).slice(0, 9);
        }
        const seen = new Set(sameArea.map((p) => p._id));
        const elsewhere = (await list("isActive=true&limit=24")).filter((p) => !seen.has(p._id)).slice(0, 9);
        if (!mounted) return;
        setNearbyTours(sameArea);
        setOtherTours(elsewhere);
      } catch (e) {
        console.error("Error fetching more tours:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [packageData._id, packageData.tourType, packageData.state, packageData.country, areaName]);

  // Phones/tablets have the price bar fixed to the bottom: tell the page (spacing) and the chat button (moves up)
  useEffect(() => {
    document.body.dataset.bottomBar = "true";
    return () => {
      delete document.body.dataset.bottomBar;
    };
  }, []);

  // Header height, so the section tabs stick right below it
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const update = () => setHeaderHeight(Math.round(header.getBoundingClientRect().height || 72));
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(header);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Highlight the tab of the section being read
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: `-${headerHeight + 70}px 0px -55% 0px` }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections, headerHeight]);

  // Keep the active tab in view in the scrolling tab bar
  useEffect(() => {
    const bar = navRef.current;
    const tab = bar?.querySelector<HTMLElement>(`[data-tab="${activeSection}"]`);
    if (bar && tab) bar.scrollTo({ left: tab.offsetLeft - 16, behavior: "smooth" });
  }, [activeSection]);

  // "See more" only when the description is longer than the preview
  useEffect(() => {
    const el = overviewRef.current;
    if (!el || overviewOpen) return;
    const measure = () => setOverviewLong(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = typeof ResizeObserver !== "undefined" && el.firstElementChild ? new ResizeObserver(measure) : null;
    if (el.firstElementChild) observer?.observe(el.firstElementChild);
    return () => observer?.disconnect();
  }, [description, overviewOpen]);

  useEffect(() => {
    if (!shareNote) return;
    const t = setTimeout(() => setShareNote(null), 2500);
    return () => clearTimeout(t);
  }, [shareNote]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 64;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share && window.matchMedia("(max-width: 768px)").matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied");
    } catch {
      // Share sheet dismissed, or clipboard blocked: nothing to do
    }
  };

  const openEnquiry = useCallback(() => setEnquiryOpen(true), []);
  const closeEnquiry = useCallback(() => setEnquiryOpen(false), []);
  const allDaysOpen = itinerary.length > 0 && openDays.length === itinerary.length;
  const whatsappText = encodeURIComponent(`Hi, I'm interested in the "${title}" package. Please share details.`);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <div className="mx-auto max-w-7xl px-4 pt-3 md:px-8 md:pt-5">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 overflow-hidden text-xs text-slate-500">
            <Link href="/" className="shrink-0 hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href={breadcrumbSource.href} className="shrink-0 hover:text-primary">{breadcrumbSource.label}</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate font-semibold text-heading">{title}</span>
          </nav>

          <PackageGallery images={photos} alt={packageData.imageAlt || title} />

          {/* Title */}
          <div className="mt-5 flex flex-col gap-4 md:mt-7 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {packageData.isFeatured && (
                  <span className="rounded-full bg-tertiary/15 px-3 py-1 text-xs font-bold text-amber-700">Featured</span>
                )}
                {themeChip && (
                  <Link href={themeChip.href} className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary hover:bg-primary/15">
                    {themeChip.label}
                  </Link>
                )}
                {packageData.rating > 0 && packageData.reviews?.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-heading">
                    <Star className="h-3.5 w-3.5 fill-tertiary text-tertiary" /> {packageData.rating.toFixed(1)}
                    <span className="font-medium text-muted-foreground">({packageData.reviews.length} reviews)</span>
                  </span>
                )}
              </div>
              <h1 className="!text-2xl font-extrabold !leading-tight text-heading md:!text-[34px]">{title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-slate-600">
                {packageData.duration && packageData.duration !== "N/A" && (
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {packageData.duration}</span>
                )}
                {place && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {place}</span>
                )}
                {itinerary.length > 0 && (
                  <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-primary" /> {itinerary.length}-day plan</span>
                )}
              </p>
            </div>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={share}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-heading transition-colors hover:border-primary hover:text-primary"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
              {shareNote && <span className="absolute right-0 top-12 whitespace-nowrap rounded-full bg-heading px-3 py-1 text-xs font-semibold text-white">{shareNote}</span>}
            </div>
          </div>

          {/* What's included at a glance */}
          {amenities.length > 0 && (
            <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
              {amenities.map(({ label, Icon }) => (
                <li key={label} className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light text-primary"><Icon className="h-4 w-4" /></span>
                  <span className="text-sm font-bold text-heading">{label} <span className="font-medium text-slate-500">included</span></span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Section tabs */}
        <div className="sticky z-40 mt-6 border-y border-slate-100 bg-white/95 backdrop-blur" style={{ top: headerHeight }}>
          <div ref={navRef} className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 scrollbar-hide md:px-8">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                data-tab={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`relative shrink-0 cursor-pointer whitespace-nowrap px-3.5 py-4 text-sm font-bold transition-colors ${
                  activeSection === s.id ? "text-primary" : "text-slate-500 hover:text-heading"
                }`}
              >
                {s.label}
                <span className={`absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-primary transition-opacity ${activeSection === s.id ? "opacity-100" : "opacity-0"}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-6">
            {/* Overview */}
            {description && (
              <Section id="overview" title="About this trip" icon={<FileText />}>
                <div ref={overviewRef} className={overviewOpen ? "" : "line-clamp-5"}>
                  <div suppressHydrationWarning className={RICH_TEXT} dangerouslySetInnerHTML={{ __html: normalizeRichTextHtml(description) }} />
                </div>
                {(overviewLong || overviewOpen) && (
                  <button type="button" onClick={() => setOverviewOpen((o) => !o)} className="mt-3 cursor-pointer text-sm font-bold text-primary hover:underline">
                    {overviewOpen ? "Show less" : "Read more"}
                  </button>
                )}
                <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
                  {[
                    { Icon: Clock, label: "Duration", value: packageData.duration !== "N/A" ? packageData.duration : "" },
                    { Icon: MapPin, label: "Destination", value: place },
                    { Icon: Globe2, label: "Trip type", value: packageData.tourType === "international" ? "International" : "Domestic" },
                    { Icon: Sparkles, label: "Customisable", value: "Dates, hotels & days" },
                  ]
                    .filter((f) => f.value)
                    .map(({ Icon, label, value }) => (
                      <div key={label} className="rounded-2xl bg-slate-50 p-3">
                        <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500"><Icon className="h-3.5 w-3.5" /> {label}</dt>
                        <dd className="mt-1 text-sm font-bold text-heading">{value}</dd>
                      </div>
                    ))}
                </dl>
              </Section>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <Section id="highlights" title="Trip highlights" icon={<Sparkles />}>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {(highlightsOpen ? highlights : highlights.slice(0, HIGHLIGHTS_PREVIEW)).map((h, i) => (
                    <li key={`${h}-${i}`} className="flex items-start gap-3 rounded-2xl bg-primary-light/50 px-4 py-3 text-sm font-medium text-heading">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {h}
                    </li>
                  ))}
                </ul>
                {highlights.length > HIGHLIGHTS_PREVIEW && (
                  <button type="button" onClick={() => setHighlightsOpen((o) => !o)} className="mt-4 cursor-pointer text-sm font-bold text-primary hover:underline">
                    {highlightsOpen ? "Show less" : `Show all ${highlights.length} highlights`}
                  </button>
                )}
              </Section>
            )}

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <Section
                id="itinerary"
                title="Day-wise itinerary"
                icon={<CalendarDays />}
                action={
                  itinerary.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setOpenDays(allDaysOpen ? [] : itinerary.map((_, i) => i))}
                      className="shrink-0 cursor-pointer rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold text-primary hover:bg-primary/15"
                    >
                      {allDaysOpen ? "Collapse all" : "Expand all"}
                    </button>
                  ) : undefined
                }
              >
                <ol className="relative">
                  {itinerary.map((day, index) => {
                    const open = openDays.includes(index);
                    const dayImage = day.image ? getImageUrl(day.image) || day.image : null;
                    const last = index === itinerary.length - 1;
                    return (
                      <li key={`${day.day}-${index}`} className="relative pb-4 pl-12 last:pb-0">
                        {!last && <span className="absolute bottom-0 left-[18px] top-10 w-0.5 bg-slate-200" aria-hidden="true" />}
                        <span
                          className={`absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-extrabold ring-4 ring-white ${
                            open ? "bg-primary text-white" : "bg-primary-light text-primary"
                          }`}
                        >
                          D{day.day || index + 1}
                        </span>
                        <div className={`overflow-hidden rounded-2xl border transition-colors ${open ? "border-primary/25 bg-white shadow-sm" : "border-slate-100 bg-slate-50/60"}`}>
                          <button
                            type="button"
                            aria-expanded={open}
                            onClick={() => setOpenDays((d) => (open ? d.filter((i) => i !== index) : [...d, index]))}
                            className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left"
                          >
                            <span className="min-w-0">
                              <span className="block text-[11px] font-bold uppercase tracking-wider text-primary">Day {day.day || index + 1}</span>
                              <span className="block text-[15px] font-bold leading-snug text-heading md:text-base">
                                {/* Titles are often typed as "Day 1 – Haridwar to Barkot"; the label above already says the day */}
                                {(day.title || "").replace(/^\s*day\s*\d+\s*[-–—:.|]\s*/i, "") || day.title}
                              </span>
                            </span>
                            <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180 text-primary" : ""}`} />
                          </button>
                          {open && (
                            <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                              {dayImage && (
                                <div className="relative mb-4 h-44 overflow-hidden rounded-xl bg-slate-100 md:h-56">
                                  <Image src={dayImage} alt={day.title} fill sizes="(max-width: 768px) 90vw, 700px" className="object-cover" />
                                </div>
                              )}
                              <div className="space-y-2">
                                {(day.activities || []).map((activity, i) =>
                                  containsHtml(activity) ? (
                                    <div key={i} className={RICH_TEXT} dangerouslySetInnerHTML={{ __html: preserveRichTextSpacing(activity) }} />
                                  ) : (
                                    <p key={i} className="text-[15px] leading-relaxed text-slate-700">{activity}</p>
                                  )
                                )}
                              </div>
                              {(day.accommodation || day.meals) && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {day.accommodation && (
                                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                                      <BedDouble className="h-3.5 w-3.5 text-primary" /> {day.accommodation}
                                    </span>
                                  )}
                                  {day.meals && (
                                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                                      <Utensils className="h-3.5 w-3.5 text-primary" /> {day.meals}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Section>
            )}

            {/* Inclusions / exclusions */}
            {(inclusions.length > 0 || exclusions.length > 0) && (
              <Section id="inclusions" title="What's inside the package" icon={<CheckCircle2 />}>
                <div className="grid gap-4 md:grid-cols-2">
                  {inclusions.length > 0 && (
                    <div className="rounded-2xl bg-emerald-50/60 p-4 md:p-5">
                      <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-emerald-700">Included</h3>
                      <ul className="space-y-2.5">
                        {inclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500"><Check className="h-2.5 w-2.5 text-white" strokeWidth={3} /></span>
                            <span dangerouslySetInnerHTML={{ __html: item }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exclusions.length > 0 && (
                    <div className="rounded-2xl bg-rose-50/60 p-4 md:p-5">
                      <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-rose-700">Not included</h3>
                      <ul className="space-y-2.5">
                        {exclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100"><X className="h-2.5 w-2.5 text-rose-600" strokeWidth={3} /></span>
                            <span dangerouslySetInnerHTML={{ __html: item }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Know before you go / Things to carry (filled in Admin > Itinerary) */}
            {(knowBefore.length > 0 || toCarry.length > 0) && (
              <Section id="before-you-go" title="Know before you go" icon={<Info />}>
                {knowBefore.length > 0 && (
                  <ul className="space-y-2.5">
                    {knowBefore.map((note, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {note}
                      </li>
                    ))}
                  </ul>
                )}
                {toCarry.length > 0 && (
                  <div className={knowBefore.length ? "mt-6 border-t border-slate-100 pt-5" : ""}>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-heading"><Luggage className="h-4 w-4 text-primary" /> Things to carry</h3>
                    <ul className="flex flex-wrap gap-2">
                      {toCarry.map((item, i) => (
                        <li key={i} className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Section>
            )}

            {/* Booking & cancellation */}
            <Section id="policies" title="Booking & cancellation" icon={<ShieldCheck />}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 md:p-5">
                  <h3 className="mb-3 text-sm font-extrabold text-heading">Booking & payment</h3>
                  <ul className="space-y-2.5">
                    {BOOKING_TERMS.map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-sm text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 md:p-5">
                  <h3 className="mb-3 text-sm font-extrabold text-heading">Cancellation</h3>
                  <ul className="space-y-2.5">
                    {CANCELLATION_TERMS.map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-sm text-slate-700"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" /> {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link href="/refund-policy" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                Read the full cancellation & refund policy <ChevronRight className="h-4 w-4" />
              </Link>
            </Section>
          </div>

          {/* Price card */}
          <aside className="hidden lg:block">
            <div className="sticky flex flex-col gap-4" style={{ top: headerHeight + 76 }}>
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-500">Starting from</p>
                  {saving > 0 && <span className="rounded-full bg-badge-emerald px-2.5 py-1 text-[11px] font-bold text-white">{saving}% OFF</span>}
                </div>
                {original > price && <p className="mt-1 text-sm text-slate-400 line-through">{inr(original)}</p>}
                <p className="text-3xl font-extrabold text-primary">
                  {price > 0 ? inr(price) : "On request"}
                  {price > 0 && <span className="ml-1 text-sm font-semibold text-slate-500">/ {unit}</span>}
                </p>
                <p className="mt-1 text-xs text-slate-500">{[packageData.duration !== "N/A" && packageData.duration, place].filter(Boolean).join(" · ")}</p>

                <button
                  type="button"
                  onClick={openEnquiry}
                  className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover"
                >
                  <Send className="h-4 w-4" /> Send enquiry
                </button>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="flex h-11 items-center justify-center gap-1.5 rounded-full border border-slate-200 text-sm font-bold text-heading transition-colors hover:border-primary hover:text-primary">
                    <Phone className="h-4 w-4" /> Call
                  </a>
                  <a
                    href={`https://wa.me/${COMPANY.phone.replace(/\D/g, "")}?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center gap-1.5 rounded-full border border-slate-200 text-sm font-bold text-heading transition-colors hover:border-emerald-500 hover:text-emerald-600"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
                <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No payment needed to enquire</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dates, hotels and days can be customised</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Registered with Uttarakhand Tourism</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Customer photos & videos from this state / country (hidden when there are none) */}
        <MomentsStrip location={areaName} className="mt-12" />

        <div id="faqs" data-section="faqs" className="scroll-mt-40">
          <FAQSection destination={packageData.state || packageData.country} tourType={packageData.tourType} />
        </div>

        {/* Same destination */}
        {nearbyTours.length > 0 && (
          <TourCarousel
            eyebrow="Same destination"
            icon={<MapPin />}
            title={`More ${areaName} tours`}
            description={`Other trips we plan in ${areaName}.`}
            tours={nearbyTours}
            viewAll={areaHref ? { href: areaHref, label: `All ${areaName} tours` } : undefined}
            className="border-t border-slate-100 bg-white"
          />
        )}

        {/* Everything else */}
        {otherTours.length > 0 && (
          <TourCarousel
            eyebrow="More to explore"
            icon={<Sparkles />}
            title="You might also like"
            description={
              nearbyTours.length > 0 || !areaName
                ? "Popular trips in other destinations."
                : `We don't have other ${areaName} tours yet. Here are more trips travellers love.`
            }
            tours={otherTours}
            viewAll={{ href: "/package", label: "Browse all packages" }}
            className={nearbyTours.length > 0 ? "bg-slate-50" : "border-t border-slate-100 bg-white"}
          />
        )}
      </main>

      {/* Phone / tablet price bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-6px_20px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Starting from {original > price && <span className="ml-1 font-semibold normal-case text-slate-400 line-through">{inr(original)}</span>}
          </p>
          <p className="text-xl font-extrabold leading-tight text-primary">
            {price > 0 ? inr(price) : "On request"}
            {price > 0 && <span className="ml-1 text-[11px] font-semibold text-slate-500">/ {unit}</span>}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} aria-label="Call us" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-primary">
            <Phone className="h-4 w-4" />
          </a>
          <button type="button" onClick={openEnquiry} className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white">
            <Send className="h-4 w-4" /> Enquire
          </button>
        </div>
      </div>

      <PackageEnquiryModal open={enquiryOpen} onClose={closeEnquiry} packageTitle={title} priceLabel={priceLabel} destination={place} />
    </div>
  );
};

export default ItineraryPageClient;
