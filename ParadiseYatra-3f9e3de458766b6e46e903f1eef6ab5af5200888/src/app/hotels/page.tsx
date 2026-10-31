import type { Metadata } from "next";
import { buildStaticMetadata } from "@/lib/seo";
import HotelsPageClient from "./HotelsPageClient";

export const metadata: Metadata = buildStaticMetadata("/hotels");

export default function HotelsPage() {
  return <HotelsPageClient />;
}
