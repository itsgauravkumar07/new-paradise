"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, MapPin, Users, Wallet } from "lucide-react";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import { Button } from "@/components/ui/button";

interface CTAContent {
  title?: string;
  description?: string;
}

const TRAVELLERS = ["1 Adult", "2 Adults", "2 Adults, 1 Child", "3-4 Travellers", "5-8 Travellers", "9+ Group"];
const BUDGETS = ["Under ₹25,000", "₹25,000 - ₹50,000", "₹50,000 - ₹1,00,000", "₹1,00,000+"];

const fieldWrap = "flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left";
const label = "block text-[10px] font-bold uppercase tracking-wider text-slate-400";
const control =
  "w-full cursor-pointer appearance-none bg-transparent p-0 text-sm font-semibold text-heading outline-none placeholder:font-medium placeholder:text-slate-400";

/** "Customize Your Travel Package!" planner (design.md). Sends the request through the lead form. */
const CTASection = () => {
  const [content, setContent] = useState<CTAContent | null>(null);
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState("");
  const [travellers, setTravellers] = useState(TRAVELLERS[1]);
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [formOpen, setFormOpen] = useState(false);

  // Title / description stay editable from Admin > CTA Section
  useEffect(() => {
    fetch("/api/cta")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setContent(d))
      .catch(() => {});
  }, []);

  // Next 12 months for the date dropdown
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    });
  }, []);

  const message = [
    "Custom trip request from the homepage planner.",
    destination.trim() && `Destination: ${destination.trim()}`,
    month && `Travel month: ${month}`,
    `Travellers: ${travellers}`,
    `Budget per person: ${budget}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <section className="bg-primary-light/60 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary-strong via-primary to-blue-600 px-5 py-10 text-center text-white shadow-2xl shadow-blue-900/20 md:px-12 md:py-14">
          {/* World border outline over the blue, behind the content */}
          <Image
            src="/images/world-map-outline.svg"
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            sizes="100vw"
            className="pointer-events-none -z-10 select-none object-cover object-[70%_center] opacity-15 md:object-center"
          />
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md">
            Tailor-made journey concierge
          </span>
          <h2 className="mt-4 !text-[20px] font-extrabold leading-tight !text-white sm:!text-3xl">
            {content?.title?.trim() || "Customize Your Travel Package!"}
          </h2>
          {content?.description?.trim() && (
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85 md:text-base">
              <span className="md:hidden">Tell us your travel plans—we’ll create a trip around you.</span>
              <span className="hidden md:inline">{content.description}</span>
            </p>
          )}

          {/* Planner bar */}
          <div className="mx-auto mt-8 flex max-w-5xl flex-col gap-1 rounded-3xl bg-white p-2 text-slate-900 shadow-2xl shadow-black/20 md:flex-row md:items-center md:gap-0 md:rounded-full">
            <label className={fieldWrap}>
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className={label}>Destination</span>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where do you want to go?"
                  className={control}
                />
              </span>
            </label>

            <label className={`${fieldWrap} md:border-l md:border-slate-100`}>
              <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className={label}>Travel dates</span>
                <select value={month} onChange={(e) => setMonth(e.target.value)} className={control}>
                  <option value="">Select month</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </span>
            </label>

            <label className={`${fieldWrap} md:border-l md:border-slate-100`}>
              <Users className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className={label}>Travellers</span>
                <select value={travellers} onChange={(e) => setTravellers(e.target.value)} className={control}>
                  {TRAVELLERS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </span>
            </label>

            <label className={`${fieldWrap} md:border-l md:border-slate-100`}>
              <Wallet className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className={label}>Budget per person</span>
                <select value={budget} onChange={(e) => setBudget(e.target.value)} className={control}>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </span>
            </label>

            <Button size="lg" className="m-1 shrink-0 md:px-7" onClick={() => setFormOpen(true)}>
              Plan My Trip <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-white/90">
            {["Make your favourite package", "Easily customize tours", "Enjoy your trip"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-300" /> {t}
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-2 text-xs text-white/85 backdrop-blur-md">
            Contact us for further information
            <Link href="/contact" className="font-bold text-white underline underline-offset-2">
              Contact now
            </Link>
          </p>
        </div>
      </div>

      <LeadCaptureForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        packageTitle="Custom trip request"
        initialMessage={message}
        heading="Plan your trip"
        subheading="Share your details and our travel expert will get back to you."
        submitLabel="Send Enquiry"
      />
    </section>
  );
};

export default CTASection;