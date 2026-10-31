import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import HomePageClient from "@/components/HomePageClient";

// Use ISR instead of force-dynamic - regenerate every 60 seconds
export const revalidate = 60;

// Function to fetch SEO data from API
async function getSEOMetadata(): Promise<Metadata> {
  const title = "Paradise Yatra | India & International Tour Packages";
  const description =
    "Book India & international tour packages with Paradise Yatra — Char Dham, Kerala, Kashmir, honeymoons & group tours. Trusted travel experts. Enquire today!";
  return {
    title,
    description,
    authors: [{ name: "Paradise Yatra" }],
    creator: "Paradise Yatra",
    publisher: "Paradise Yatra",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: "/",
      siteName: "Paradise Yatra",
      images: [
        {
          url: "/bannerCTA.jpeg",
          width: 1200,
          height: 630,
          alt: "Paradise Yatra - Your Trusted Travel Partner",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/bannerCTA.jpeg"],
      creator: "@paradiseyatra",
      site: "@paradiseyatra",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "BdQBvIBq9neLnNKB-UbBDMkLm47f_BupmJrmVr37QFE",
    },
  };
}

// Generate metadata dynamically
export async function generateMetadata(): Promise<Metadata> {
  return await getSEOMetadata();
}

export default function HomePage() {
  return <HomePageClient />;
}
