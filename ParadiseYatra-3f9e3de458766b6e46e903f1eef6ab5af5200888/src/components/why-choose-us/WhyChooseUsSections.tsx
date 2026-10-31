"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Car,
  CheckCircle2,
  ClipboardList,
  Headphones,
  Lock,
  MessageCircle,
  Route,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import FAQSection from "@/components/FAQSection";

const GOOGLE_REVIEWS_URL = "https://share.google/S4dPaG2OsWTy0N1YJ";
const WHATSAPP_URL = "https://wa.me/919873391733"; // country code added so the link opens correctly

/* ------------------------------------------------------------------ */
/* 1. Hero                                                             */
/* ------------------------------------------------------------------ */
export const WhyHero = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-primary-light via-background to-background">
    <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-tertiary/10 blur-3xl" />

    <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-1.5 text-xs font-bold text-primary shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-tertiary" /> Why Paradise Yatra
        </span>
        <h1 className="mt-5 !text-4xl font-extrabold leading-[1.08] text-heading md:!text-6xl">
          Travel planned{" "}
          <span className="bg-gradient-to-r from-primary-strong to-primary bg-clip-text text-transparent">the honest way</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-slate-600 md:text-lg">
          Clear prices, real hotels and a team that stays with you from the first call to the last day of your trip.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/contact">
              Plan my trip <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/package">See packages</Link>
          </Button>
        </div>

        <ul className="mt-8 flex flex-wrap gap-2.5">
          {["Price locked once paid", "Real hotel details upfront", "Direct on-trip support"].map((t) => (
            <li
              key={t}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-badge-emerald" /> {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Collage */}
      <div className="relative mx-auto h-[400px] w-full max-w-md sm:h-[460px] lg:h-[500px]">
        <div className="absolute left-0 top-10 h-[68%] w-[44%] overflow-hidden rounded-full shadow-2xl shadow-slate-900/15">
          <Image src="/Destination%20Pages/Uttarakhand.webp" alt="Uttarakhand" fill sizes="200px" className="object-cover" priority />
        </div>
        <div className="absolute right-0 top-0 h-[56%] w-[50%] overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/15">
          <Image src="/Destination%20Pages/Kerala.webp" alt="Kerala" fill sizes="240px" className="object-cover" />
        </div>
        <div className="absolute bottom-0 right-6 h-[38%] w-[44%] overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/15">
          <Image src="/Destination%20Pages/Himachal%20Pradesh.webp" alt="Himachal Pradesh" fill sizes="220px" className="object-cover" />
        </div>

        <div className="absolute bottom-6 left-0 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
            <BedDouble className="h-5 w-5" />
          </span>
          <p className="text-xs font-bold leading-snug text-heading">
            Real hotel photos
            <span className="block font-medium text-muted-foreground">before you confirm</span>
          </p>
        </div>
        <div className="absolute left-[38%] top-2 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-xl">
          <Headphones className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-heading">Call &amp; WhatsApp support</span>
        </div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 2. Promises (taken from the FAQ answers already on the old page)    */
/* ------------------------------------------------------------------ */
const PROMISES = [
  {
    icon: Lock,
    title: "No price surprises",
    text: "Once your package is confirmed and payment is received, the price is locked. Seasonal demand or hotel rate hikes are not pushed onto you later.",
  },
  {
    icon: BedDouble,
    title: "Real hotels, shown upfront",
    text: "We share the exact hotel name, Google Maps location and real photos or videos before confirmation.",
  },
  {
    icon: Headphones,
    title: "Someone on your side",
    text: "Direct on-trip support via call and WhatsApp. Hotel, driver, timing or service issues are handled by our team.",
  },
  {
    icon: Wallet,
    title: "Honest refund terms",
    text: "No fake promises of 100% refunds. Terms are clearly explained before payment so there are no surprises.",
  },
  {
    icon: Car,
    title: "Pre-briefed drivers",
    text: "Drivers get your itinerary in advance. Unapproved route changes, extra demands or misbehaviour are not acceptable.",
  },
];

export const PromiseGrid = () => (
  <section className="bg-background py-16">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <SectionHeader
        align="center"
        eyebrow="Our promises"
        title="What you can count on"
        description="Five commitments we make before you pay, and keep after you do."
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
        {PROMISES.map((p, i) => {
          const Icon = p.icon;
          const featured = i === 0;
          return (
            <article
              key={p.title}
              className={`relative overflow-hidden rounded-3xl p-7 card-lift ${
                featured
                  ? "bg-gradient-to-br from-primary-strong to-primary text-white md:col-span-2 lg:col-span-1 lg:row-span-2 lg:p-9"
                  : "border border-slate-100 bg-white"
              }`}
            >
              {featured && <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10" />}
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  featured ? "bg-white/15 text-white" : "bg-primary-light text-primary"
                }`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <h3 className={`mt-5 text-xl font-extrabold ${featured ? "!text-white lg:!text-2xl" : "text-heading"}`}>{p.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${featured ? "text-white/85 lg:text-base" : "text-slate-600"}`}>{p.text}</p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 3. How it works                                                     */
/* ------------------------------------------------------------------ */
const STEPS = [
  { icon: ClipboardList, title: "Tell us your plan", text: "Share your dates, group size and budget with our team." },
  { icon: Route, title: "Get a tailored itinerary", text: "We customize the trip around your preferences." },
  { icon: BedDouble, title: "Check the real details", text: "See the exact hotels, locations and photos before you confirm." },
  { icon: Headphones, title: "Travel with support", text: "Direct help on call and WhatsApp until you are back home." },
];

export const HowItWorks = () => (
  <section className="bg-surface-subtle py-16">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <SectionHeader align="center" eyebrow="How it works" title="From first message to safe return" />
      <ol className="relative grid gap-6 md:grid-cols-4">
        <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 hidden border-t-2 border-dashed border-blue-200 md:block" />
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="relative text-center">
              <span className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25">
                <Icon className="h-6 w-6" />
              </span>
              <span className="mt-4 block text-[11px] font-extrabold uppercase tracking-widest text-primary">Step {i + 1}</span>
              <h3 className="mt-1 text-lg font-bold text-heading">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm text-slate-600">{s.text}</p>
            </li>
          );
        })}
      </ol>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 4. Google reviews (same three reviews as the old page)             */
/* ------------------------------------------------------------------ */
const REVIEWS = [
  {
    name: "Babul Dutta",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjUu7I4PAUwK1I3z4TLYdu_YFV9wBMAQ5K6U-3LnMvCxxh_LvES4=w144-h144-p-rp-mo-ba2-br100",
    text: "Whatever commitment was made, I got it. The car driver was good, he drove very carefully, the hotel was also better than expected, a big thank you to Paradise Yatra from my side.",
  },
  {
    name: "Prasanna Ghurde",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXlhUCPz4P4FxnwOf2IZQH1RnOCLMdbQtSAvPKsQvXvwjeqq823=w144-h144-p-rp-mo-br100",
    text: "Our 7-night, 8-day Kerala trip with Paradise Yatra was simply amazing! A special thanks to Shivani, who did all the planning and perfectly customized our itinerary as per our preferences.",
  },
  {
    name: "Madhu Mita",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjV9INzuYfxGCYtjOFcN4y980uN8A53XxfYP3CeJxNSW8jeQE6XO=w144-h144-p-rp-mo-br100",
    text: "I recently made a tour to Uttarakhand, while planning for an expedition I came across with paradise yatra and put a try on it and made a query about their packages and itinerary. After completion of tour, My Experience was Awesome in terms …",
  },
];

export const GoogleReviews = () => (
  <section className="bg-background py-16">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <SectionHeader
        eyebrow="Words from travellers"
        title="What guests say on Google"
        action={
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary"
          >
            Read all reviews <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        }
      />
      <div className="grid gap-6 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <article key={r.name} className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 card-lift">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.avatar} alt={r.name} referrerPolicy="no-referrer" className="h-11 w-11 rounded-full object-cover ring-2 ring-primary-light" />
              <div>
                <p className="text-sm font-bold text-heading">{r.name}</p>
                <p className="text-xs text-muted-foreground">Google review</p>
              </div>
            </div>
            <div className="mt-4 flex gap-0.5" aria-label="5 out of 5 stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-tertiary text-tertiary" />
              ))}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{r.text}&rdquo;</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 5. Life at Paradise Yatra (same photos and reels as the old page)   */
/* ------------------------------------------------------------------ */
const LIFE = "/About/Life At Paradise Yatra";

export const LifeAtParadise = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLoad(true);
        el.querySelectorAll<HTMLVideoElement>("video[data-reel]").forEach((v) => {
          if (entry.isIntersecting) void v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.3, rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [load]);

  const tile = "relative overflow-hidden rounded-3xl bg-slate-200";
  const reel = (n: number) => (
    <video data-reel muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover">
      {load && <source src={`${LIFE}/Reel ${n}.mp4`} type="video/mp4" />}
    </video>
  );

  return (
    <section ref={sectionRef} className="bg-surface-subtle py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
          align="center"
          eyebrow="The team"
          title="Life at Paradise Yatra"
          description="The people behind your itinerary, on the road and in the office."
        />
        <div className="grid auto-rows-[150px] grid-cols-2 gap-4 sm:auto-rows-[190px] md:grid-cols-4">
          <div className={`${tile} col-span-2 row-span-2`}>
            <Image src={`${LIFE}/Image 1.jpeg`} alt="Paradise Yatra team collaborating" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className={`${tile} row-span-2`}>{reel(1)}</div>
          <div className={tile}>
            <Image src={`${LIFE}/Image 2.jpg`} alt="Paradise Yatra field experience" fill sizes="25vw" className="object-cover" />
          </div>
          <div className={tile}>
            <Image src={`${LIFE}/Image 3.jpg`} alt="Paradise Yatra travel moments" fill sizes="25vw" className="object-cover" />
          </div>
          <div className={`${tile} col-span-2`}>{reel(2)}</div>
          <div className="col-span-2 flex items-center rounded-3xl bg-gradient-to-br from-primary-strong to-primary p-7">
            <p className="text-lg font-bold leading-snug !text-white md:text-xl">
              Every frame here is a glimpse of the energy, creativity and teamwork behind Paradise Yatra.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* 6. FAQ (same five questions as the old page)                        */
/* ------------------------------------------------------------------ */
const FAQS = [
  {
    question: "Will the price increase after I book?",
    answer: "No. Once your package is confirmed and payment is received, the price is locked. Seasonal demand or hotel rate hikes won't be pushed onto you later.",
  },
  {
    question: "Are the hotel photos and locations genuine?",
    answer: "Yes. We share the exact hotel name, Google Maps location, and real photos/videos before confirmation. If you're not satisfied, the hotel can be changed before booking.",
  },
  {
    question: "Who supports us if something goes wrong during the trip?",
    answer: "Paradise Yatra provides direct on-trip support via call and WhatsApp. Any issue (hotel, driver, timing, or service) is handled by our team. You don't have to argue with vendors yourself.",
  },
  {
    question: "What happens to my money if the trip gets canceled?",
    answer: "Refunds depend on hotel and transport cancellation policies. We do not make fake promises of 100% refunds. All terms are clearly explained before payment so there are no surprises.",
  },
  {
    question: "What if the driver skips sightseeing or asks for extra money?",
    answer: "All drivers are pre-briefed with your itinerary. Unapproved route changes, extra demands, or misbehavior are not acceptable. If an issue arises, we intervene immediately.",
  },
];

export const WhyFaq = () => (
  <FAQSection
    faqs={FAQS}
    title="Questions, answered straight"
    description="The things people ask us most before booking, with no fine print."
  />
);

/* ------------------------------------------------------------------ */
/* 7. Support call-to-action                                           */
/* ------------------------------------------------------------------ */
export const SupportCta = () => (
  <section className="bg-surface-subtle py-16">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-strong via-primary to-blue-600 p-8 text-white shadow-2xl shadow-blue-900/20 md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="!text-3xl font-extrabold !text-white md:!text-5xl">Ready to get started?</h2>
            <p className="mt-4 max-w-lg text-white/85 md:text-lg">
              No chatbots, no automated menus. Just a travel expert who answers.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg transition-colors hover:bg-primary-light"
              >
                <MessageCircle className="h-4 w-4" /> Chat with support
              </a>
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Read 150+ reviews
              </a>
            </div>
          </div>
          <ul className="space-y-4">
            {["24/7 dedicated on-trip support", "Direct access to travel experts", "Quick and reliable issue resolution"].map((t) => (
              <li key={t} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-semibold backdrop-blur-md">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);