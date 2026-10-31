import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Cookie,
  FileText,
  ListChecks,
  ListOrdered,
  Mail,
  MessageCircleQuestion,
  Phone,
  ReceiptIndianRupee,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { SITE_URL } from "@/lib/seo";
import { legalIcon } from "@/lib/legal/icons";
import { formatLegalDate, LEGAL_KINDS, type LegalKind, type LegalPageData } from "@/lib/legal/types";
import LegalIllustration from "./LegalIllustration";
import LegalBlocks from "./LegalBlocks";
import LegalToc from "./LegalToc";

// The contact details the policies themselves give (Privacy Policy: Grievance Officer)
const LEGAL_EMAIL = "info@paradiseyatra.com";
const LEGAL_PHONE = "+918979396413";
const LEGAL_PHONE_DISPLAY = "+91 89793 96413";

export const LEGAL_PAGES: Record<LegalKind, { href: string; title: string; label: string; blurb: string; Icon: LucideIcon; photo: string; photoAlt: string }> = {
  privacy: {
    href: "/privacy-policy",
    title: "Privacy Policy",
    label: "Privacy",
    blurb: "How we collect, use and protect your personal data.",
    Icon: ShieldCheck,
    photo: "/Legal/Privacy%20Policy/Hero%20Image.jpg",
    photoAlt: "A traveler enjoying a peaceful destination",
  },
  terms: {
    href: "/terms-and-conditions",
    title: "Terms & Conditions",
    label: "Terms",
    blurb: "The terms for using our website and booking with us.",
    Icon: FileText,
    photo: "/Legal/Terms%20And%20Conditions/Hero%20Image.png",
    photoAlt: "Travelers on a guided trip",
  },
  cookie: {
    href: "/cookie-policy",
    title: "Cookie Policy",
    label: "Cookies",
    blurb: "How cookies help our website work, and your choices.",
    Icon: Cookie,
    photo: "/Legal/Cookie%20Policy/Image.webp",
    photoAlt: "Travelers exploring a destination",
  },
  refund: {
    href: "/refund-policy",
    title: "Refund Policy",
    label: "Refunds",
    blurb: "Cancellation charges, supplier rules and refund timelines.",
    Icon: ReceiptIndianRupee,
    photo: "/Legal/Refund%20Policy/Hero%20Image.jpg",
    photoAlt: "Travelers preparing for a trip",
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

const GLANCE_TONES = ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-violet-100 text-violet-700"];

export default function LegalPage({ data }: { data: LegalPageData }) {
  const { kind, title, description, lastUpdated, glance, sections } = data;
  const page = LEGAL_PAGES[kind];
  const others = LEGAL_KINDS.filter((k) => k !== kind);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: title, item: `${SITE_URL}${page.href}` },
    ],
  };

  return (
    <main className="min-h-screen bg-white font-plus-jakarta-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-light via-primary-light/40 to-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#bfdbfe_1.2px,transparent_1.2px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-4 pb-8 pt-6 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-12 lg:pt-8">
          <div>
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
                <li>
                  <Link href="/" className="hover:text-primary">Home</Link>
                </li>
                <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
                <li>Legal</li>
                <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
                <li aria-current="page" className="font-semibold text-heading">{title}</li>
              </ol>
            </nav>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary shadow-sm ring-1 ring-primary/10">
              <page.Icon className="h-3.5 w-3.5" /> Legal · {page.label}
            </span>
            <h1 className="mt-4 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-heading sm:text-5xl lg:text-[3.6rem]">{title}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">{description}</p>

            <div className="mt-6 flex flex-wrap gap-2.5 text-[13px] font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-heading shadow-sm ring-1 ring-slate-200/70">
                <CalendarDays className="h-4 w-4 text-primary" /> Last updated <time dateTime={lastUpdated}>{formatLegalDate(lastUpdated)}</time>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-heading shadow-sm ring-1 ring-slate-200/70">
                <ListChecks className="h-4 w-4 text-primary" /> {sections.length} sections
              </span>
              <a href="#policy-help" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover">
                <MessageCircleQuestion className="h-4 w-4" /> Have a question?
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[470px]">
            <LegalIllustration kind={kind} className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* At a glance */}
      {glance.length > 0 && (
        <section aria-labelledby="glance-title" className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <h2 id="glance-title" className="text-lg font-extrabold sm:text-xl">At a glance</h2>
              <p className="text-xs text-slate-500">A quick summary. The full policy below is what applies.</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {glance.map((item, i) => {
                const Icon = legalIcon(item.icon);
                return (
                  <li key={i} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${GLANCE_TONES[i % GLANCE_TONES.length]}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-snug text-heading">{item.title}</p>
                      <p className="mt-1 text-[13px] leading-snug text-slate-600">{item.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Policy */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-10 lg:py-14">
        <aside className="hidden lg:block">
          <LegalToc items={sections.map(({ id, title: sectionTitle }) => ({ id, title: sectionTitle }))} />
        </aside>

        <div className="min-w-0">
          <details className="group mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-bold text-heading [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-primary" /> On this page
                <span className="rounded-full bg-primary-light px-2 py-0.5 text-[11px] text-primary">{sections.length}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <ol className="grid gap-0.5 border-t border-slate-100 p-2 sm:grid-cols-2">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-3 rounded-xl px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-heading">
                    <span className="text-xs font-bold tabular-nums text-primary">{pad(i + 1)}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <div className="space-y-5">
            {sections.map((section, i) => {
              const Icon = legalIcon(section.icon);
              return (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
                  <header className="mb-4 flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-white shadow-md shadow-primary/25">
                      <Icon className="h-[22px] w-[22px]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80">Section {pad(i + 1)}</p>
                      <h2 id={`${section.id}-title`} className="text-xl font-extrabold leading-tight sm:text-2xl">{section.title}</h2>
                    </div>
                  </header>
                  <div className="space-y-4 text-[15px] leading-7 text-slate-600">
                    <LegalBlocks blocks={section.blocks} />
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* Questions */}
      <section id="policy-help" aria-labelledby="policy-help-title" className="mx-auto max-w-7xl scroll-mt-28 px-4 md:px-8">
        <div className="grid overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-strong to-primary text-white shadow-xl shadow-blue-900/15 md:grid-cols-[1fr_1.15fr]">
          <div className="relative min-h-[190px] md:min-h-[320px]">
            <Image src={page.photo} alt={page.photoAlt} fill sizes="(min-width: 1280px) 600px, (min-width: 768px) 45vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-strong/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-primary-strong/40" />
          </div>
          <div className="relative overflow-hidden p-6 sm:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border-[28px] border-white/5" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5" />
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white ring-1 ring-white/20">
              <MessageCircleQuestion className="h-3.5 w-3.5" /> Need help?
            </span>
            <h2 id="policy-help-title" className="relative mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              Questions about this policy?
            </h2>
            <p className="relative mt-2 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              Write to us or give us a call. Our team is happy to explain anything on this page.
            </p>
            <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={`mailto:${LEGAL_EMAIL}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-primary transition-colors hover:bg-primary-light">
                <Mail className="h-4 w-4" /> {LEGAL_EMAIL}
              </a>
              <a href={`tel:${LEGAL_PHONE}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 px-5 text-sm font-bold text-white transition-colors hover:bg-white/10">
                <Phone className="h-4 w-4" /> {LEGAL_PHONE_DISPLAY}
              </a>
            </div>
            <Link href="/contact" className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white hover:underline">
              All contact options <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Other policies */}
      <section aria-labelledby="other-policies-title" className="mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-8">
        <h2 id="other-policies-title" className="text-xl font-extrabold sm:text-2xl">More legal information</h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {others.map((k) => {
            const other = LEGAL_PAGES[k];
            return (
              <li key={k}>
                <Link
                  href={other.href}
                  className="group flex h-full items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-slate-900/5"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-light to-blue-100 text-primary">
                    <other.Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-heading group-hover:text-primary">{other.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{other.blurb}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-primary" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
