import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { buildMetadata, stripHtml, truncateText } from "@/lib/seo";
import { backendJson } from "@/lib/server/backend";

type HolidayTypeRecord = {
  title?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  badge?: string;
  category?: string;
};

// null = the backend confirmed there is no such holiday type (the page then returns a real 404)
const getHolidayType = cache(async (slug: string): Promise<HolidayTypeRecord | null> => {
  const data = await backendJson<{ data?: HolidayTypeRecord } & HolidayTypeRecord>(
    `/api/holiday-types/slug/${encodeURIComponent(slug)}`,
    { revalidate: 3600 }
  );
  return data ? ((data.data || data) as HolidayTypeRecord) : null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const holidayType = await getHolidayType(slug);
  const path = `/holiday-types/${slug}`;

  if (!holidayType) {
    return buildMetadata({
      title: "Holiday Packages | Paradise Yatra",
      description:
        "Discover curated holiday styles and travel experiences from Paradise Yatra.",
      path,
      keywords: ["holiday packages", "travel styles", "Paradise Yatra"],
      index: false,
      follow: true,
    });
  }

  const title = holidayType.title || "Holiday Type";
  const description = truncateText(
    stripHtml(holidayType.shortDescription || holidayType.description || "") ||
      `Discover curated ${title.toLowerCase()} travel experiences with Paradise Yatra.`,
    155
  );

  return buildMetadata({
    title: `${title} Packages | Paradise Yatra`,
    description,
    path,
    image: holidayType.image || "/bannerCTA.jpeg",
    keywords: [
      `${title} packages`,
      `${title} holidays`,
      holidayType.badge || `${title} travel`,
      holidayType.category || title,
      "Paradise Yatra",
    ].filter(Boolean),
  });
}

export default async function HolidayTypeDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getHolidayType(slug))) notFound();
  return children;
}
