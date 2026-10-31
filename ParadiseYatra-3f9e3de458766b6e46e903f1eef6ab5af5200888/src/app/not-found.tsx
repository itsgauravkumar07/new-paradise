import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Globe2, MapPinned, Newspaper, Phone, Users } from "lucide-react";
import Header from "@/components/Header";
import { COMPANY } from "@/lib/chat/company";

// Shown with a real 404 status whenever a page calls notFound() or the URL matches nothing (Next.js adds noindex itself)
export const metadata: Metadata = {
  title: "Page not found | Paradise Yatra",
};

const LINKS = [
  { href: "/package/india", label: "India tour packages", Icon: MapPinned },
  { href: "/package/international", label: "International packages", Icon: Globe2 },
  { href: "/fixed-departures", label: "Fixed departure group trips", Icon: Users },
  { href: "/blog", label: "Travel guides & blog", Icon: Newspaper },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Compass className="h-8 w-8" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-primary">Error 404</p>
        <h1 className="mt-2 !text-3xl font-extrabold text-heading md:!text-4xl">This page has wandered off</h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist or has moved. These might help you find your next trip:
        </p>

        <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2">
          {LINKS.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 font-semibold text-heading shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Icon className="h-5 w-5 shrink-0 text-primary" /> {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-white hover:bg-primary-hover">
            Back to home <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-heading hover:border-primary hover:text-primary"
          >
            <Phone className="h-4 w-4" /> {COMPANY.phone}
          </a>
        </div>
      </main>
    </div>
  );
}
