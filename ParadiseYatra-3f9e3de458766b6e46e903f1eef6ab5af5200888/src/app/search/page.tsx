import type { Metadata } from "next";
import { LazyHeader } from "@/components/lazy-components";
import SearchResultsClient from "./SearchResultsClient";
import { backendJsonSafe, listFrom } from "@/lib/server/backend";
import { toListing } from "@/lib/server/destinations";

// Results for the home page search bar (/search?q=honeymoon). Not for search engines: endless query pages.
export const metadata: Metadata = {
  title: "Search tour packages | Paradise Yatra",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 80);
  const data = query
    ? await backendJsonSafe<unknown>(`/api/all-packages?q=${encodeURIComponent(query)}&isActive=true&limit=60`, { revalidate: 60 })
    : null;
  const packages = listFrom<Record<string, unknown>>(data, ["packages"]).map(toListing);

  return (
    <>
      <LazyHeader />
      <SearchResultsClient query={query} packages={packages} />
    </>
  );
}
