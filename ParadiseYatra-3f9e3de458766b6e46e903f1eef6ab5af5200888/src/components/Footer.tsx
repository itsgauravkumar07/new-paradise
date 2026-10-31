"use client";

import { ArrowRight, ChevronDown, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, ShieldCheck, Youtube } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import NewsletterSubscribe from "./NewsLetter";
import { fetchTourLocations } from "@/hooks/useTourLocations";
import { COMPANY } from "@/lib/chat/company";

interface FooterContent {
  companyInfo?: { name?: string; phone?: string; email?: string };
}

interface FooterNavLink {
  name: string;
  href: string;
}

interface FooterColumn {
  key: string;
  label: string;
  links: FooterNavLink[];
  /** Optional "View all" link under the column */
  more?: FooterNavLink;
}

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SOCIALS = [
  { Icon: Facebook, href: "https://www.facebook.com/paradiseyatra/", label: "Facebook" },
  { Icon: XIcon, href: "https://x.com/ParadiseYatra", label: "X" },
  { Icon: Instagram, href: "https://www.instagram.com/paradiseyatra/", label: "Instagram" },
  { Icon: Linkedin, href: "https://www.linkedin.com/company/paradise-yatra", label: "LinkedIn" },
  { Icon: Youtube, href: "https://www.youtube.com/@ParadiseYatra", label: "YouTube" },
];

// Shown until the live list of destinations with packages has loaded
const FALLBACK_INDIA = ["Jammu and Kashmir", "Himachal Pradesh", "Uttarakhand", "Rajasthan", "Kerala", "Goa", "Sikkim", "Ladakh"];
const FALLBACK_INTERNATIONAL = ["Bali", "Dubai", "Maldives", "Singapore", "Thailand", "Malaysia", "Sri Lanka", "Japan"];

const COMPANY_LINKS: FooterNavLink[] = [
  { name: "About Us", href: "/about" },
  { name: "Why Choose Us", href: "/why-choose-us" },
  { name: "Traveller Stories", href: "/traveller-stories" },
  { name: "Travel Blog", href: "/blog" },
  { name: "Contact Us", href: "/contact" },
  { name: "Terms & Conditions", href: "/terms-and-conditions" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Cookie Policy", href: "/cookie-policy" },
  { name: "Refund Policy", href: "/refund-policy" },
];

const EXPLORE_LINKS: FooterNavLink[] = [
  { name: "All Packages", href: "/package" },
  { name: "Fixed Departures", href: "/fixed-departures" },
  { name: "Hotels", href: "/hotels" },
  { name: "Trending Packages", href: "/package/theme/trending" },
  { name: "Honeymoon Packages", href: "/package/theme/honeymoon" },
  { name: "Char Dham Yatra", href: "/package/theme/char-dham-yatra" },
  { name: "Luxury Packages", href: "/package/theme/luxury" },
  { name: "Spiritual Packages", href: "/package/theme/spiritual" },
];

const REGISTRATIONS = [
  `GSTIN: ${COMPANY.gstin}`,
  `Udyam: ${COMPANY.udyam}`,
  `Uttarakhand Tourism: ${COMPANY.uttarakhandTourism}`,
];

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");

const Footer = () => {
  const [footerData, setFooterData] = useState<FooterContent | null>(null);
  const [indiaStates, setIndiaStates] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [openColumn, setOpenColumn] = useState<string | null>(null);

  // This component is only mounted once the footer scrolls near view (LazyFooter), so load straight away.
  useEffect(() => {
    let mounted = true;
    fetch("/api/footer")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => mounted && data && setFooterData(data))
      .catch((error) => console.error("Error fetching footer data:", error));
    // Same cached request the header menu uses, so it's usually free
    fetchTourLocations()
      .then(({ indiaStates, internationalCountries }) => {
        if (!mounted) return;
        setIndiaStates(indiaStates);
        setCountries(internationalCountries);
      })
      .catch((error) => console.error("Error fetching footer destinations:", error));
    return () => {
      mounted = false;
    };
  }, []);

  const phone = footerData?.companyInfo?.phone || COMPANY.phone;
  const email = footerData?.companyInfo?.email || COMPANY.email;
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

  const columns = useMemo<FooterColumn[]>(() => {
    const india = (indiaStates.length ? indiaStates : FALLBACK_INDIA).slice(0, 8);
    const abroad = (countries.length ? countries : FALLBACK_INTERNATIONAL).slice(0, 8);
    return [
      {
        key: "india",
        label: "India Tour Packages",
        links: india.map((s) => ({ name: s, href: `/package/india/${slugify(s)}` })),
        more: { name: "All India tours", href: "/package/india" },
      },
      {
        key: "international",
        label: "International Tours",
        links: abroad.map((c) => ({ name: c, href: `/package/international/${slugify(c)}` })),
        more: { name: "All international tours", href: "/package/international" },
      },
      { key: "explore", label: "Explore", links: EXPLORE_LINKS },
      { key: "company", label: "Company", links: COMPANY_LINKS },
    ];
  }, [indiaStates, countries]);

  return (
    <footer className="bg-background">
      {/* Newsletter card overlaps the top of the dark footer */}
      <div className="relative z-10 mx-auto -mb-16 max-w-7xl px-4 md:px-8">
        <NewsletterSubscribe />
      </div>

      <div className="bg-slate-900 pt-24 text-white md:pt-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 pb-8 lg:grid-cols-[1.25fr_3fr] lg:gap-12 lg:pb-10">
            {/* Brand + contact */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Paradise Yatra home">
                <Image src="/favicon.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
                <span>
                  <span className="block text-lg font-extrabold leading-tight text-white">Paradise Yatra</span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Yatra to Paradise</span>
                </span>
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
                Tailor-made holidays across India and abroad, planned by real travel experts since {COMPANY.foundedYear}.
              </p>

              <ul className="mt-5 space-y-2.5 text-sm">
                <li>
                  <a href={phoneHref} className="flex items-center gap-2.5 font-bold text-white hover:text-blue-300">
                    <Phone className="h-4 w-4 shrink-0 text-blue-400" /> {phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-slate-300 hover:text-white">
                    <Mail className="h-4 w-4 shrink-0 text-blue-400" /> {email}
                  </a>
                </li>
                <li>
                  <a
                    href="https://maps.app.goo.gl/UKUXKaedF9Naf4i28"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-slate-300 hover:text-white"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                    <span>{COMPANY.address}</span>
                  </a>
                </li>
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {SOCIALS.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Paradise Yatra on ${label}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/15 transition-colors hover:bg-primary hover:text-white hover:ring-primary"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns: accordion on phones, four columns from tablet up */}
            <div className="grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-8 sm:border-0 lg:grid-cols-4 lg:gap-x-6">
              {columns.map((col) => {
                const open = openColumn === col.key;
                return (
                  <nav key={col.key} aria-label={col.label} className="border-b border-white/10 sm:border-0">
                    <button
                      type="button"
                      onClick={() => setOpenColumn(open ? null : col.key)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between py-3.5 text-left sm:pointer-events-none sm:py-0 sm:pb-3"
                    >
                      <h3 className="text-xs font-bold uppercase tracking-widest !text-white">{col.label}</h3>
                      <ChevronDown className={`h-4 w-4 text-white/60 transition-transform sm:hidden ${open ? "rotate-180" : ""}`} />
                    </button>
                    <ul className={`${open ? "grid" : "hidden"} grid-cols-2 gap-x-4 gap-y-2 pb-4 sm:grid sm:grid-cols-1 sm:pb-0`}>
                      {col.links.map((link) => (
                        <li key={`${col.key}-${link.href}`}>
                          <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                            {link.name}
                          </Link>
                        </li>
                      ))}
                      {col.more && (
                        <li className="col-span-2 sm:col-span-1">
                          <Link href={col.more.href} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-300 hover:text-white">
                            {col.more.name} <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </li>
                      )}
                    </ul>
                  </nav>
                );
              })}
            </div>
          </div>

          {/* Registrations, grievance officer, partner logo */}
          <div className="flex flex-col gap-5 border-t border-white/10 py-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 text-xs leading-relaxed text-slate-400">
              <p className="flex items-center gap-1.5 font-semibold text-slate-200">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" /> Registered with Uttarakhand Tourism
              </p>
              <p className="flex flex-wrap gap-x-3 gap-y-0.5">
                {REGISTRATIONS.map((r, i) => (
                  <span key={r} className="flex items-center gap-3">
                    {i > 0 && <span className="hidden text-slate-600 sm:inline" aria-hidden="true">|</span>}
                    {r}
                  </span>
                ))}
              </p>
              <p>
                Grievance officer: <span className="font-semibold text-slate-200">{COMPANY.founder}</span> ·{" "}
                <a href="tel:+918979269388" className="hover:text-white">+91 89792 69388</a> ·{" "}
                <a href={`mailto:${COMPANY.founderEmail}`} className="hover:text-white">{COMPANY.founderEmail}</a>
              </p>
            </div>

            {/* Phones/tablets: official horizontal logo on a white badge */}
            <div className="w-fit shrink-0 rounded-xl bg-white px-3 py-2 shadow-sm md:hidden">
              <Image src="/Footer/Uttarakhand%20Tourism%20Logo%20Horizontal.png" alt="Uttarakhand Tourism – Simply Heaven!" width={208} height={57} className="h-8 w-auto" />
            </div>
            {/* Desktop: the square logo as a white silhouette (mask in globals.css) */}
            <div className="footer-partner-logo hidden shrink-0 opacity-80 md:block" role="img" aria-label="Uttarakhand Tourism" />
          </div>

          <div className="flex flex-col gap-2 border-t border-white/10 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {COMPANY.legalName.replace(/\.$/, "")}. All rights reserved.</p>
            <p className="flex gap-4">
              <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
              <Link href="/terms-and-conditions" className="hover:text-white">Terms</Link>
              <Link href="/refund-policy" className="hover:text-white">Refunds</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
