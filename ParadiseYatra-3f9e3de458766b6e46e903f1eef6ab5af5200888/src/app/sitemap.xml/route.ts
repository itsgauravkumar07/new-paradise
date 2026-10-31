import { NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";
import {
  getCanonicalBlogSlug,
  SITE_URL,
  getPublicStaticSitemapEntries,
  isSampleContent,
} from "@/lib/seo";

type SitemapEntry = {
  url: string;
  lastModified?: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

type ContentRecord = {
  _id?: string;
  name?: string;
  title?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  publishDate?: string;
  isActive?: boolean;
  isPublished?: boolean;
  tourType?: string;
  state?: string;
  country?: string;
  packages?: Array<string | { _id?: string }>;
};

function toAbsoluteUrl(path: string): string {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

function normalizeDate(value: unknown): string | undefined {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function extractArray(payload: unknown, keys: string[] = []): ContentRecord[] {
  if (Array.isArray(payload)) {
    return payload as ContentRecord[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  for (const key of ["data", "results", "items", ...keys]) {
    if (Array.isArray(record[key])) {
      return record[key] as ContentRecord[];
    }
  }

  return [];
}

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(`${API_CONFIG.BACKEND_URL}${path}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  return response.json();
}

function makeEntry(
  url: string,
  lastModified: string | undefined,
  changeFrequency: SitemapEntry["changeFrequency"],
  priority: number
): SitemapEntry {
  return {
    url,
    lastModified,
    changeFrequency,
    priority,
  };
}

function uniqueEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const map = new Map<string, SitemapEntry>();
  for (const entry of entries) {
    map.set(entry.url, entry);
  }

  return Array.from(map.values()).sort((a, b) => a.url.localeCompare(b.url));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isCleanSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function GET() {
  const staticEntries = getPublicStaticSitemapEntries().map((entry) =>
    makeEntry(toAbsoluteUrl(entry.path), undefined, entry.changeFrequency, entry.priority)
  );
  const renamedContentEntries = [
    makeEntry(
      toAbsoluteUrl("/blog/goa-or-kerala-which-is-better-for-your-vacation-in-india"),
      undefined,
      "weekly",
      0.7
    ),
    makeEntry(
      toAbsoluteUrl("/blog/chardham-yatra-tour-2025-a-divine-journey-to-the-abode-of-gods"),
      undefined,
      "weekly",
      0.7
    ),
    makeEntry(
      toAbsoluteUrl("/fixed-departures/manali-group-tour-3n-4d"),
      undefined,
      "weekly",
      0.7
    ),
  ];

  const dynamicEntries: SitemapEntry[] = [];

  // Each source on its own: one failing request must not drop every other URL from the sitemap
  const settled = await Promise.allSettled([
    fetchJson("/api/all-packages?limit=2000&isActive=true"),
    fetchJson("/api/tags"),
    fetchJson("/api/destinations"),
    fetchJson("/api/blogs?published=true&minimal=true&limit=2000"),
    fetchJson("/api/fixed-departures?limit=2000"),
    fetchJson("/api/holiday-types"),
    fetchJson("/api/hotels?limit=1000"),
  ]);
  settled.forEach((result) => {
    if (result.status === "rejected") console.error("Sitemap source failed:", result.reason);
  });
  const [
    packagesPayload,
    tagsPayload,
    destinationsPayload,
    blogsPayload,
    departuresPayload,
    holidayTypesPayload,
    hotelsPayload,
  ] = settled.map((result) => (result.status === "fulfilled" ? result.value : null));

  try {
    const packages = extractArray(packagesPayload, ["packages"]).filter(
      (item) => item.slug && isCleanSlug(item.slug) && item.isActive !== false && !isSampleContent(item.name, item.slug)
    );
    dynamicEntries.push(
      ...packages.map((item) =>
        makeEntry(
          toAbsoluteUrl(`/package/${item.slug}`),
          normalizeDate(item.updatedAt || item.createdAt),
          "weekly",
          0.8
        )
      )
    );

    // Destination landing pages (/package/india/<state>, /package/international/<country>):
    // one per state / country that has at least one active package. Same slug rule as the menus and footer.
    const destinationPages = new Map<string, string | undefined>();
    for (const item of packages) {
      const area = (item.tourType === "international" ? item.country : item.state)?.trim();
      if (!area) continue;
      const path = `/package/${item.tourType === "international" ? "international" : "india"}/${area.toLowerCase().replace(/\s+/g, "-")}`;
      const updated = normalizeDate(item.updatedAt || item.createdAt);
      const previous = destinationPages.get(path);
      destinationPages.set(path, previous && updated && previous > updated ? previous : updated || previous);
    }
    dynamicEntries.push(
      ...Array.from(destinationPages, ([path, lastModified]) => makeEntry(toAbsoluteUrl(path), lastModified, "weekly", 0.9))
    );

    // Theme pages only when the theme lists at least one active package (empty themes are thin pages)
    const activePackageIds = new Set(packages.map((item) => item._id).filter(Boolean));
    const tags = extractArray(tagsPayload, ["tags"]).filter(
      (item) =>
        item.slug &&
        isCleanSlug(item.slug) &&
        (item.packages || []).some((pkg) => activePackageIds.has(typeof pkg === "string" ? pkg : pkg?._id))
    );
    dynamicEntries.push(
      ...tags.map((item) =>
        makeEntry(
          toAbsoluteUrl(`/package/theme/${item.slug}`),
          normalizeDate(item.updatedAt || item.createdAt),
          "weekly",
          0.6
        )
      )
    );

    const hotels = extractArray(hotelsPayload, ["hotels"]).filter(
      (item) => item.slug && isCleanSlug(item.slug) && item.isActive !== false && !isSampleContent(item.name, item.slug)
    );
    dynamicEntries.push(
      ...hotels.map((item) =>
        makeEntry(toAbsoluteUrl(`/hotels/${item.slug}`), normalizeDate(item.updatedAt || item.createdAt), "weekly", 0.6)
      )
    );

    const destinations = extractArray(destinationsPayload, ["destinations"]).filter(
      (item) => item.slug && isCleanSlug(item.slug) && item.isActive !== false
    );
    dynamicEntries.push(
      ...destinations.map((item) =>
        makeEntry(
          toAbsoluteUrl(`/destinations/${item.slug}`),
          normalizeDate(item.updatedAt || item.createdAt),
          "weekly",
          0.8
        )
      )
    );

    const blogs = extractArray(blogsPayload, ["blogs"])
      .filter(
        (item) =>
          item.slug &&
          item.slug !== "goa-or-kerala:-which-is-better-for-your-vacation-in-india-" &&
          item.isPublished !== false
      )
      .map((item) => ({ ...item, slug: getCanonicalBlogSlug(item.slug!) }))
      .filter((item) => isCleanSlug(item.slug));
    dynamicEntries.push(
      ...blogs.map((item) =>
        makeEntry(
          toAbsoluteUrl(`/blog/${item.slug}`),
          normalizeDate(item.publishDate || item.updatedAt || item.createdAt),
          "weekly",
          0.7
        )
      )
    );

    const departures = extractArray(departuresPayload, ["fixedDepartures"])
      .filter((item) => item.slug && item.isActive !== false)
      .map((item) => ({
        ...item,
        slug: item.slug === "deployment-package" ? "manali-group-tour-3n-4d" : item.slug,
      }))
      .filter((item) => isCleanSlug(item.slug!));
    dynamicEntries.push(
      ...departures.map((item) =>
        makeEntry(
          toAbsoluteUrl(`/fixed-departures/${item.slug}`),
          normalizeDate(item.updatedAt || item.createdAt),
          "weekly",
          0.7
        )
      )
    );

    const holidayTypes = extractArray(holidayTypesPayload, ["holidayTypes"]).filter(
      (item) => item.slug && isCleanSlug(item.slug) && item.isActive !== false
    );
    dynamicEntries.push(
      ...holidayTypes.map((item) =>
        makeEntry(
          toAbsoluteUrl(`/holiday-types/${item.slug}`),
          normalizeDate(item.updatedAt || item.createdAt),
          "monthly",
          0.6
        )
      )
    );
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  const sitemapEntries = uniqueEntries([
    ...staticEntries,
    ...renamedContentEntries,
    ...dynamicEntries,
  ]);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries
    .map((entry) => {
      const lastmodTag = entry.lastModified ? `\n    <lastmod>${escapeXml(entry.lastModified)}</lastmod>` : "";
      return `  <url>\n    <loc>${escapeXml(entry.url)}</loc>${lastmodTag}\n    <changefreq>${entry.changeFrequency}</changefreq>\n    <priority>${entry.priority.toFixed(1)}</priority>\n  </url>`;
    })
    .join("\n")}\n</urlset>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
