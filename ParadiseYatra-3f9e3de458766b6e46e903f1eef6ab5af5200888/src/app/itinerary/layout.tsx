import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/itinerary");

export default function ItineraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
