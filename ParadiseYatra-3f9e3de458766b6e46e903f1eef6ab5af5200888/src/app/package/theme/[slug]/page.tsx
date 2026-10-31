import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import ThemePackagesPageClient from "./ThemePackagesPageClient";
import { backendJson } from "@/lib/server/backend";
import { getFaqs, getPageContent, toListing } from "@/lib/server/destinations";
import { buildMetadata, isSampleContent, SITE_URL, stripHtml } from "@/lib/seo";

// Packages are read on the server (and refreshed at most every 60s) so they're in the HTML search engines get
export const revalidate = 60;

interface PageProps {
    params: Promise<{ slug: string }>;
}

interface ThemeRecord {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    packages?: Array<Record<string, unknown>>;
}

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

// null = the backend confirmed there's no such theme (real 404). Backend errors are thrown (temporary error).
const getTheme = cache(async (slug: string) => {
    const data = await backendJson<{ success?: boolean; data?: ThemeRecord }>(`/api/tags/slug/${encodeURIComponent(slug)}`, { revalidate: 60 });
    const theme = data?.success && data.data ? data.data : null;
    if (!theme) return null;
    // Only packages that are switched on (and not demo records), trimmed to what the cards use
    const packages = (theme.packages || [])
        .filter((p) => p && p.isActive !== false && !isSampleContent(p.name as string, p.slug as string))
        .map(toListing);
    return { ...theme, packages };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const theme = await getTheme(slug);
    if (!theme) return { title: "Theme not found | Paradise Yatra" };

    const name = capitalize(theme.name);
    const prices = theme.packages.map((p) => Number(p.price) || 0).filter((p) => p > 0);
    const from = prices.length ? Math.min(...prices) : 0;
    const count = theme.packages.length;
    const description =
        stripHtml(theme.description || "") ||
        (count
            ? `Explore ${count} ${name} tour package${count === 1 ? "" : "s"}${from ? ` from ${inr(from)}` : ""} with hotels, transfers and sightseeing. Customise any trip free with Paradise Yatra.`
            : `Plan a ${name} trip with Paradise Yatra. Share your dates and budget and our travel experts will design it for you.`);

    return buildMetadata({
        title: from ? `${name} Tour Packages from ${inr(from)} | Paradise Yatra` : `${name} Tour Packages | Paradise Yatra`,
        description,
        path: `/package/theme/${slug}`,
        image: theme.image || theme.packages[0]?.image,
        keywords: [`${name} tour packages`, `${name} packages`, `${name} trips`, "Paradise Yatra"],
        // A theme with no packages yet is a thin page: keep it out of search until packages are added
        index: count > 0,
    });
}

export default async function ThemePage({ params }: PageProps) {
    const { slug } = await params;
    const theme = await getTheme(slug);
    if (!theme) notFound();

    const [content, faqs] = await Promise.all([
        getPageContent(slug.toLowerCase().replace(/\s+/g, "-")),
        getFaqs(theme.name, "india"),
    ]);

    const url = `${SITE_URL}/package/theme/${slug}`;
    const schema: Record<string, unknown>[] = [
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Packages", item: `${SITE_URL}/package` },
                { "@type": "ListItem", position: 3, name: capitalize(theme.name), item: url },
            ],
        },
    ];
    if (theme.packages.length) {
        schema.push({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${capitalize(theme.name)} tour packages`,
            url,
            numberOfItems: theme.packages.length,
            itemListElement: theme.packages.slice(0, 50).map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE_URL}/package/${p.slug || p._id}`,
                name: p.name || p.title,
            })),
        });
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
            <ThemePackagesPageClient slug={slug} initialTag={theme} initialContent={content} initialFaqs={faqs} />
        </>
    );
}
