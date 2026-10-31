// Server-side data for the destination pages (/package/india, /package/india/<state>, /package/international[/<country>]).
// Loading it here puts the package list, overview and FAQs into the HTML that search engines receive.
import type { Metadata } from "next";
import { cache } from "react";
import type { ListingPackage } from "@/components/packages/DestinationPackageCard";
import { buildMetadata, isSampleContent, SITE_URL, stripHtml } from "@/lib/seo";
import { backendJsonSafe, listFrom } from "./backend";

export type TourType = "india" | "international";
export interface PageContent {
  content?: string;
  image?: string;
  title?: string;
}
export interface FaqItem {
  question: string;
  answer: string;
}
export interface DestinationData {
  /** null when the backend couldn't be reached: the page then loads the list in the browser as before */
  packages: ListingPackage[] | null;
  content: PageContent | null;
  faqs: FaqItem[];
  /** Display name from the data, e.g. "Jammu and Kashmir" for the slug "jammu-and-kashmir" */
  name: string;
}

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

// Same rule as the client's durationInDays ("5N/6D" or "6 Days" -> 6). Kept here because that one lives in a client file.
const daysOf = (duration = ""): number => {
  const match = duration.match(/(\d+)\s*(?:Days?|D)/i) || duration.match(/\d+/);
  return match ? parseInt(match[1] ?? match[0], 10) : 0;
};

const titleCase = (slug: string) =>
  decodeURIComponent(slug)
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Only the fields the listing cards and filters use, so the HTML doesn't carry whole itineraries. */
export function toListing(pkg: Record<string, unknown>): ListingPackage {
  const strings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);
  return {
    _id: String(pkg._id),
    name: pkg.name as string | undefined,
    title: pkg.title as string | undefined,
    slug: pkg.slug as string | undefined,
    image: pkg.image as string | undefined,
    imageAlt: pkg.imageAlt as string | undefined,
    price: pkg.price as number | undefined,
    originalPrice: pkg.originalPrice as number | undefined,
    discount: pkg.discount as number | undefined,
    priceType: pkg.priceType as string | undefined,
    duration: pkg.duration as string | undefined,
    state: pkg.state as string | undefined,
    country: pkg.country as string | undefined,
    location: pkg.location as string | undefined,
    highlights: strings(pkg.highlights).slice(0, 3),
    inclusions: strings(pkg.inclusions),
    isFeatured: pkg.isFeatured as boolean | undefined,
    visitCount: pkg.visitCount as number | undefined,
    tags: (Array.isArray(pkg.tags) ? pkg.tags : []).map((t) => (typeof t === "string" ? t : (t as { _id?: string })?._id)).filter(Boolean),
  };
}

const getPackages = cache(async (tourType: TourType, state: string, country: string): Promise<ListingPackage[] | null> => {
  const params = new URLSearchParams({ tourType, isActive: "true", limit: "100" });
  if (state) params.set("state", state);
  if (country) params.set("country", country);
  const data = await backendJsonSafe<unknown>(`/api/all-packages?${params}`, { revalidate: 60 });
  if (data === null) return null;
  return listFrom<Record<string, unknown>>(data, ["packages"])
    .filter((p) => p.isActive !== false && !isSampleContent(p.name as string, p.slug as string))
    .map(toListing);
});

/** Admin > Page Content for a page key (e.g. "uttarakhand", "char-dham-yatra") */
export const getPageContent = cache(async (key: string): Promise<PageContent | null> => {
  const data = await backendJsonSafe<{ success?: boolean; data?: PageContent }>(`/api/page-content/${encodeURIComponent(key)}`, {
    revalidate: 300,
  });
  return data?.success && data.data ? { content: data.data.content, image: data.data.image, title: data.data.title } : null;
});

/** Admin > Destination FAQs for a destination or theme name */
export const getFaqs = cache(async (destination: string, tourType: TourType): Promise<FaqItem[]> => {
  const params = new URLSearchParams({ destination: destination.replace(/-/g, " "), tourType });
  const data = await backendJsonSafe<{
    success?: boolean;
    destinationFaq?: { isActive?: boolean; faqs?: Array<FaqItem & { order?: number }> };
  }>(`/api/destination-faqs?${params}`, { revalidate: 300 });
  const block = data?.success ? data.destinationFaq : null;
  if (!block?.isActive || !block.faqs?.length) return [];
  return [...block.faqs]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((f) => f.question && f.answer)
    .map(({ question, answer }) => ({ question, answer }));
});

/** Everything a destination page renders on the server. `area` is the URL slug ("uttarakhand"); omit it for the region pages. */
export const loadDestination = cache(async (tourType: TourType, area = ""): Promise<DestinationData> => {
  const isState = tourType === "india";
  const contentKey = (area || `${tourType}-packages`).toLowerCase().replace(/\s+/g, "-");
  const [packages, content, faqs] = await Promise.all([
    getPackages(tourType, isState ? area : "", isState ? "" : area),
    getPageContent(contentKey),
    area ? getFaqs(area, tourType) : Promise.resolve([] as FaqItem[]),
  ]);
  const fromData = packages?.find((p) => (isState ? p.state : p.country))?.[isState ? "state" : "country"];
  const name = area ? (fromData?.trim() || titleCase(area)) : isState ? "India" : "International";
  return { packages, content, faqs, name };
});

/** Title and description written from the real packages (count, starting price, trip lengths). */
export async function destinationMetadata(tourType: TourType, area: string): Promise<Metadata> {
  const { packages, content, name } = await loadDestination(tourType, area);
  const list = packages ?? [];
  const prices = list.map((p) => Number(p.price) || 0).filter((p) => p > 0);
  const days = list.map((p) => daysOf(p.duration)).filter((d) => d > 0);
  const from = prices.length ? Math.min(...prices) : 0;
  const minDays = days.length ? Math.min(...days) : 0;
  const maxDays = days.length ? Math.max(...days) : 0;
  const span = minDays ? (minDays === maxDays ? `${minDays}-day` : `${minDays} to ${maxDays} day`) : "";

  const facts = `Compare ${list.length} ${name} tour package${list.length === 1 ? "" : "s"}${from ? ` from ${inr(from)}` : ""}${
    span ? `: ${span} trips` : ""
  } with hotels, transfers and sightseeing.`;
  const closing = " Customise any itinerary free with Paradise Yatra.";
  const description = list.length
    ? facts.length + closing.length <= 160 ? facts + closing : facts
    : stripHtml(content?.content || "").slice(0, 150) ||
      `Plan a ${name} trip with Paradise Yatra. Share your dates and budget and our experts will design a custom itinerary.`;

  return buildMetadata({
    title: from ? `${name} Tour Packages from ${inr(from)} | Paradise Yatra` : `${name} Tour Packages | Paradise Yatra`,
    description,
    path: `/package/${tourType}/${area}`,
    image: content?.image || list[0]?.image,
    keywords: [`${name} tour packages`, `${name} holiday packages`, `${name} trip`, `${name} travel`, "Paradise Yatra"],
    // A destination with no packages is a thin page: keep it out of search until packages are added
    // (packages === null means the backend didn't answer, so don't de-index on a hiccup)
    index: packages === null || list.length > 0,
  });
}

/** Breadcrumbs plus the package list as an ItemList, for the destination and region pages. */
export function DestinationJsonLd({ tourType, area, data }: { tourType: TourType; area?: string; data: DestinationData }) {
  const region = tourType === "international" ? { name: "International Packages", path: "/package/international" } : { name: "India Packages", path: "/package/india" };
  const pagePath = area ? `${region.path}/${area}` : region.path;
  const crumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Packages", url: `${SITE_URL}/package` },
    { name: region.name, url: `${SITE_URL}${region.path}` },
    ...(area ? [{ name: data.name, url: `${SITE_URL}${pagePath}` }] : []),
  ];
  const packages = data.packages ?? [];
  const schema: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
    },
  ];
  if (packages.length) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${data.name} tour packages`,
      url: `${SITE_URL}${pagePath}`,
      numberOfItems: packages.length,
      itemListElement: packages.slice(0, 50).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/package/${p.slug || p._id}`,
        name: p.name || p.title,
      })),
    });
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
  );
}
