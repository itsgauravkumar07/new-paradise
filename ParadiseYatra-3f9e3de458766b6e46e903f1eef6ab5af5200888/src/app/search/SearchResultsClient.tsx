"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, MapPin, Search, SearchX, Sparkles } from "lucide-react";
import DestinationPackageCard, { type ListingPackage } from "@/components/packages/DestinationPackageCard";

const PackageEnquiryModal = dynamic(() => import("@/components/packages/PackageEnquiryModal"), { ssr: false });
const LeadCaptureForm = dynamic(() => import("@/components/LeadCaptureForm"), { ssr: false });

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// Shown when a search finds nothing, so visitors can carry on browsing
const POPULAR = [
  { name: "Kashmir", href: "/package/india/jammu-and-kashmir" },
  { name: "Kerala", href: "/package/india/kerala" },
  { name: "Himachal", href: "/package/india/himachal-pradesh" },
  { name: "Andaman", href: "/package/india/andaman-and-nicobar-islands" },
  { name: "Thailand", href: "/package/international/thailand" },
  { name: "Bali", href: "/package/international/indonesia" },
];

export default function SearchResultsClient({ query, packages }: { query: string; packages: ListingPackage[] }) {
  const router = useRouter();
  const [text, setText] = useState(query);
  const [enquiry, setEnquiry] = useState<ListingPackage | null>(null);
  const [planOpen, setPlanOpen] = useState(false);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const next = text.trim();
    if (next && next !== query) router.push(`/search?q=${encodeURIComponent(next)}`);
  };

  const places = new Set(packages.map((p) => p.state || p.country).filter(Boolean));

  return (
    <main className="min-h-screen bg-background">
      {/* Search header */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-primary-light via-primary-light/40 to-background">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-heading">Search</span>
          </nav>

          <form onSubmit={search} role="search" className="flex h-14 max-w-3xl items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-4 pr-1 shadow-lg shadow-slate-900/5">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              type="search"
              enterKeyHint="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Search destinations or packages"
              placeholder="Destination, package or theme"
              className="h-full min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden"
            />
            <button type="submit" className="flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-hover">
              Search
            </button>
          </form>

          {query && (
            <h1 className="mt-6 !text-2xl font-extrabold leading-tight sm:!text-3xl">
              {packages.length > 0 ? (
                <>
                  {packages.length} {packages.length === 1 ? "trip" : "trips"} for <span className="text-primary">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                <>
                  No trips for <span className="text-primary">&ldquo;{query}&rdquo;</span> yet
                </>
              )}
            </h1>
          )}
          {packages.length > 0 && places.size > 1 && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-primary" /> Across {places.size} destinations
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        {!query ? (
          <p className="text-slate-500">Type a destination, package name or theme above, for example &ldquo;honeymoon&rdquo; or &ldquo;Kashmir&rdquo;.</p>
        ) : packages.length > 0 ? (
          <ul className="space-y-4">
            {packages.map((pkg) => (
              <li key={pkg._id}>
                <DestinationPackageCard pkg={pkg} onEnquire={setEnquiry} showLocation />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <SearchX className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-xl font-extrabold">We can still plan it for you</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              We don&apos;t have a ready package matching &ldquo;{query}&rdquo;, but our travel experts plan custom trips every day.
            </p>
            <button
              type="button"
              onClick={() => setPlanOpen(true)}
              className="mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-hover"
            >
              <Sparkles className="h-4 w-4" /> Plan a custom trip
            </button>
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Or explore popular destinations</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {POPULAR.map((p) => (
                  <Link key={p.name} href={p.href} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                    {p.name} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {enquiry && (
        <PackageEnquiryModal
          open
          onClose={() => setEnquiry(null)}
          packageTitle={enquiry.name || enquiry.title || "Tour package"}
          priceLabel={Number(enquiry.price) > 0 ? `${inr(Number(enquiry.price))} per person` : undefined}
          destination={enquiry.state || enquiry.country}
        />
      )}
      {planOpen && <LeadCaptureForm isOpen onClose={() => setPlanOpen(false)} initialMessage={`Looking for: ${query}`} />}
    </main>
  );
}
