import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { buildMetadata, stripHtml, truncateText } from "@/lib/seo";
import { backendJson } from "@/lib/server/backend";

type DestinationRecord = {
  name?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  location?: string;
  country?: string;
  state?: string;
  category?: string;
};

function normalizeDestination(payload: unknown): DestinationRecord | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  return (record.destination as DestinationRecord | undefined) || (record.data as DestinationRecord | undefined) || (record as DestinationRecord);
}

// null = the backend confirmed there is no such destination (the page then returns a real 404)
const getDestination = cache(async (slug: string): Promise<DestinationRecord | null> => {
  const data = await backendJson<unknown>(`/api/destinations/${encodeURIComponent(slug)}`, { revalidate: 3600 });
  return data ? normalizeDestination(data) : null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestination(slug);
  const path = `/destinations/${slug}`;

  if (!destination) {
    return buildMetadata({
      title: "Destination Packages | Paradise Yatra",
      description:
        "Explore curated destination packages across India and international locations with Paradise Yatra.",
      path,
      keywords: ["travel destinations", "destination packages", "Paradise Yatra"],
      index: false,
      follow: true,
    });
  }

  const name = destination.name || "Destination";
  const description = truncateText(
    stripHtml(destination.shortDescription || destination.description || "") ||
      `Explore ${name} with curated travel experiences and tour planning from Paradise Yatra.`,
    155
  );

  return buildMetadata({
    title: `${name} Tour Packages | Paradise Yatra`,
    description,
    path,
    image: destination.image || "/bannerCTA.jpeg",
    keywords: [
      `${name} tour packages`,
      `${name} travel package`,
      destination.location || `${name} destination`,
      destination.country || destination.state || name,
      destination.category || "travel destination",
      "Paradise Yatra",
    ].filter(Boolean),
  });
}

export default async function DestinationDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getDestination(slug))) notFound();
  return children;
}
