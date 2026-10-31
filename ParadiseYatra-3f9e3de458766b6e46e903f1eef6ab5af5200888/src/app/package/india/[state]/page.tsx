import type { Metadata } from "next";
import DedicatedPackagesPageClient from "../../StatePackagesPageClient";
import { DestinationJsonLd, destinationMetadata, loadDestination } from "@/lib/server/destinations";

// Packages are read on the server (and refreshed at most every 60s) so they're in the HTML search engines get
export const revalidate = 60;

interface PageProps {
    params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { state } = await params;
    return destinationMetadata("india", decodeURIComponent(state));
}

export default async function IndiaStatePage({ params }: PageProps) {
    const state = decodeURIComponent((await params).state);
    const data = await loadDestination("india", state);

    return (
        <>
            <DestinationJsonLd tourType="india" area={state} data={data} />
            <DedicatedPackagesPageClient
                tourType="india"
                state={state}
                displayName={data.name}
                initialPackages={data.packages ?? undefined}
                initialContent={data.content}
                initialFaqs={data.faqs}
            />
        </>
    );
}
