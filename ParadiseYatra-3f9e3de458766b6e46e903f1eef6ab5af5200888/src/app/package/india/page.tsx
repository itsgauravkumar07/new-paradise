import { Metadata } from "next";
import { buildStaticMetadata } from "@/lib/seo";
import DedicatedPackagesPageClient from "../StatePackagesPageClient";
import { DestinationJsonLd, loadDestination } from "@/lib/server/destinations";

export const metadata: Metadata = buildStaticMetadata("/package/india");

// Packages are read on the server (and refreshed at most every 60s) so they're in the HTML search engines get
export const revalidate = 60;

export default async function IndiaPackagesPage() {
    const data = await loadDestination("india");
    return (
        <>
            <DestinationJsonLd tourType="india" data={data} />
            <DedicatedPackagesPageClient
                tourType="india"
                initialPackages={data.packages ?? undefined}
                initialContent={data.content}
            />
        </>
    );
}
