import type { Metadata } from "next";
import DedicatedPackagesPageClient from "../../StatePackagesPageClient";
import { DestinationJsonLd, destinationMetadata, loadDestination } from "@/lib/server/destinations";

// Packages are read on the server (and refreshed at most every 60s) so they're in the HTML search engines get
export const revalidate = 60;

interface PageProps {
    params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country } = await params;
    return destinationMetadata("international", decodeURIComponent(country));
}

export default async function InternationalCountryPage({ params }: PageProps) {
    const country = decodeURIComponent((await params).country);
    const data = await loadDestination("international", country);

    return (
        <>
            <DestinationJsonLd tourType="international" area={country} data={data} />
            <DedicatedPackagesPageClient
                tourType="international"
                country={country}
                displayName={data.name}
                initialPackages={data.packages ?? undefined}
                initialContent={data.content}
                initialFaqs={data.faqs}
            />
        </>
    );
}
