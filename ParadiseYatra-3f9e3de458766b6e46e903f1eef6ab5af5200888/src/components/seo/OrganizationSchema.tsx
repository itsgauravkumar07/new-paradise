import { SITE_URL } from "@/lib/seo";
import { COMPANY } from "@/lib/chat/company";

// Who we are, for Google's business panel and local results. Only facts the site already publishes
// (About, Contact, footer). Keep in step with lib/chat/company.ts.
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const SOCIAL_PROFILES = [
  "https://www.facebook.com/paradiseyatra/",
  "https://x.com/ParadiseYatra",
  "https://www.instagram.com/paradiseyatra/",
  "https://www.linkedin.com/company/paradise-yatra",
  "https://www.youtube.com/@ParadiseYatra",
];

const phone = `+${COMPANY.phone.replace(/\D/g, "")}`;

const organization = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "@id": ORGANIZATION_ID,
  name: COMPANY.name,
  legalName: COMPANY.legalName.replace(/\.$/, ""),
  url: SITE_URL,
  logo: `${SITE_URL}/headerLogo.png`,
  image: `${SITE_URL}/bannerCTA.jpeg`,
  description:
    "Dehradun-based travel company planning customised India and international tour packages, fixed departure group trips, Char Dham Yatra and hotel stays.",
  telephone: phone,
  email: COMPANY.email,
  foundingDate: COMPANY.foundedYear,
  founder: { "@type": "Person", name: COMPANY.founder, jobTitle: COMPANY.founderTitle },
  address: {
    "@type": "PostalAddress",
    streetAddress: "108, Tagore Villa, Near Natraj Cinema, Chakrata Road",
    addressLocality: "Dehradun",
    addressRegion: "Uttarakhand",
    postalCode: "248001",
    addressCountry: "IN",
  },
  // From the office's Google Maps pin (also used on the About and Contact pages)
  geo: { "@type": "GeoCoordinates", latitude: 30.32747, longitude: 78.03477 },
  hasMap: "https://maps.app.goo.gl/UKUXKaedF9Naf4i28",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "18:30",
    },
  ],
  contactPoint: [
    { "@type": "ContactPoint", telephone: phone, email: COMPANY.email, contactType: "customer service", areaServed: "IN" },
  ],
  sameAs: SOCIAL_PROFILES,
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: COMPANY.name,
  inLanguage: "en-IN",
  publisher: { "@id": ORGANIZATION_ID },
};

/** Sitewide JSON-LD: the business (TravelAgency) and the website. Rendered once, in the root layout. */
export default function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([organization, website]).replace(/</g, "\\u003c") }}
    />
  );
}
