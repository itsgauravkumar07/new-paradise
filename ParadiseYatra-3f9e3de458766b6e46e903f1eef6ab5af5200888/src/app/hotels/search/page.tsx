import { Suspense } from "react";
import type { Metadata } from "next";
import { buildStaticMetadata } from "@/lib/seo";
import HotelSearchClient from "./HotelSearchClient";

export const metadata: Metadata = buildStaticMetadata("/hotels/search");

export default function HotelSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <HotelSearchClient />
    </Suspense>
  );
}
