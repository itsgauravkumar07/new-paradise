import Image from "next/image";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

// Real registrations (same numbers as the footer). Images live in /public/Why Choose Us/Certifications.
const CERTIFICATES = [
  {
    title: "GST Registration",
    issuer: "Govt. of India",
    regLabel: "Reg",
    regNo: "05IYCPS1101L2ZG",
    image: "/Why Choose Us/Certifications/GST Certificate.webp",
  },
  {
    title: "Udyam Registration",
    issuer: "Ministry of MSME",
    regLabel: "Reg",
    regNo: "UDYAM-UK-05-0046271",
    image: "/Why Choose Us/Certifications/Udyam Certificate.webp",
  },
  {
    title: "Uttarakhand Tourism",
    issuer: "Uttarakhand Tourism Development Board",
    regLabel: "Lic",
    regNo: "UTTR/DEHRADUN/08-2021/004728",
    image: "/Why Choose Us/Certifications/Uttarakhand Tourism.webp",
  },
];

const CHIPS = ["GST Registered", "MSME Registered", "Uttarakhand Tourism Registered"];

const VerifiedConfidenceSection = () => (
  <section className="bg-background py-16">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <SectionHeader
              titleClassName="!text-[20px] sm:!text-3xl md:!text-3xl"
        align="center"
        title="Travel With Verified Confidence"
        description={
          <>
            <span className="md:hidden">Licensed, compliant, and officially recognized.</span>
            <span className="hidden md:inline">
              Paradise Yatra operates with active statutory licenses, taxation compliance, and recognized state approvals.
            </span>
          </>
        }
      />

      <ul className="-mt-2 mb-10 flex flex-wrap justify-center gap-2">
        {CHIPS.map((chip) => (
          <li
            key={chip}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-badge-emerald" /> {chip}
          </li>
        ))}
      </ul>

      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-4 pt-3 scrollbar-hide md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
        {CERTIFICATES.map((c) => (
          <article key={c.title} className="flex w-[85%] shrink-0 snap-start flex-col rounded-3xl border border-slate-100 bg-white p-4 card-lift md:w-auto">
            <a
              href={encodeURI(c.image)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block h-56 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
              aria-label={`View ${c.title} document`}
            >
              <Image
                src={encodeURI(c.image)}
                alt={`${c.title} certificate`}
                fill
                sizes="(max-width: 768px) 90vw, 33vw"
                className="object-cover object-top"
              />
            </a>
            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">{c.issuer}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-bold text-primary">
                Registered
              </span>
            </div>
            <h3 className="mt-1 text-lg font-bold text-heading">{c.title}</h3>
            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
              {c.regLabel}: {c.regNo}
            </p>
            <a
              href={encodeURI(c.image)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 border-t border-slate-100 pt-4 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              View Document <ArrowUpRight className="h-4 w-4" />
            </a>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default VerifiedConfidenceSection;