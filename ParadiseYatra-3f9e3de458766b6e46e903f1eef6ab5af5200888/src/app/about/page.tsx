"use client";

import { memo, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Clock,
  Compass,
  FileCheck2,
  HeartHandshake,
  Headphones,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Quote,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { LazyHeader } from "@/components/lazy-components";
import SectionHeader from "@/components/ui/SectionHeader";
import PerformanceMonitor from "@/components/ui/PerformanceMonitor";
import { COMPANY } from "@/lib/chat/company";

const LeadCaptureForm = dynamic(() => import("@/components/LeadCaptureForm"), { ssr: false });

const OFFICE_PHONE = "+91 89793 96413";
const MAPS_URL = "https://maps.app.goo.gl/UKUXKaedF9Naf4i28";

const STATS = [
  { value: COMPANY.yearsOfExperience, label: "Years of planning trips", Icon: CalendarCheck },
  { value: COMPANY.places, label: "Destinations covered", Icon: MapPin },
  { value: COMPANY.clients, label: "Travellers hosted", Icon: Users },
  { value: "Govt.", label: "Registered with Uttarakhand Tourism", Icon: ShieldCheck },
];

// Dates come from the company's own records (founded 2020; Tourism registration no. .../08-2021/...)
const MILESTONES = [
  { year: COMPANY.foundedYear, title: "Started in Dehradun", text: "Paradise Yatra began with Uttarakhand trips planned one family at a time." },
  { year: "2021", title: "Registered with Uttarakhand Tourism", text: `Officially registered (${COMPANY.uttarakhandTourism}), a mark of a trusted local operator.` },
  { year: "Today", title: `${COMPANY.places} destinations`, text: `Holidays across India and abroad, with ${COMPANY.clients} travellers hosted so far.` },
];

const VALUES = [
  {
    Icon: Compass,
    title: "Personalised itineraries",
    text: "Every trip is designed around your pace, interests and budget, not a one-size-fits-all template.",
    points: ["Routes built around you", "Duration, pace and stays tailored"],
  },
  {
    Icon: FileCheck2,
    title: "Transparent planning",
    text: "Before you book, you know exactly what is included, what is optional and how each day runs.",
    points: ["Inclusions and exclusions upfront", "Day-wise plans you can picture"],
  },
  {
    Icon: Headphones,
    title: "Reliable support",
    text: "Our team stays connected from your first enquiry to your safe return home.",
    points: ["Quick help on call and chat", "Trusted ground teams on every trip"],
  },
  {
    Icon: Sparkles,
    title: "Authentic experiences",
    text: "Popular highlights blended with local culture, regional food and less crowded corners.",
    points: ["Local heritage and flavours", "Hidden gems beyond the usual route"],
  },
  {
    Icon: HeartHandshake,
    title: "Built on trust",
    text: "Honest advice and consistent quality. Much of our growth comes from repeat travellers and referrals.",
    points: ["Advice for you, not upselling", "Clear updates at every stage"],
  },
];

const STEPS = [
  { Icon: MessageSquareText, title: "Tell us your plan", text: "Share where, when, who's travelling and your budget, by form, call or chat." },
  { Icon: Route, title: "Get a custom itinerary", text: "A trip expert designs a day-by-day plan with hotels, transfers and sightseeing." },
  { Icon: BadgeCheck, title: "Fine-tune and confirm", text: "Change anything you like. You confirm only when the plan feels right." },
  { Icon: Headphones, title: "Travel with support", text: "We stay reachable throughout the trip, with local teams on the ground." },
];

const REGISTRATIONS = [
  { label: "Uttarakhand Tourism", value: COMPANY.uttarakhandTourism },
  { label: "Udyam (MSME)", value: COMPANY.udyam },
  { label: "GSTIN", value: COMPANY.gstin },
];

const AboutPage = memo(() => {
  const reduceMotion = useReducedMotion();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const lifeSectionRef = useRef<HTMLElement | null>(null);
  const [playReels, setPlayReels] = useState(false);
  const [loadReels, setLoadReels] = useState(false);

  // Load the office reels only when the gallery is near view, and pause them when it isn't
  useEffect(() => {
    const section = lifeSectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLoadReels(true);
        setPlayReels(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "250px 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = lifeSectionRef.current;
    if (!section) return;
    section.querySelectorAll<HTMLVideoElement>("video[data-life-reel='true']").forEach((video) => {
      if (playReels && !reduceMotion) {
        video.play().catch(() => {
          // Autoplay can be blocked (e.g. data saver); the poster frame stays
        });
      } else {
        video.pause();
      }
    });
  }, [playReels, loadReels, reduceMotion]);

  const reel = (src: string, label: string) => (
    <video
      data-life-reel="true"
      aria-label={label}
      className="h-full w-full object-cover"
      muted
      loop
      playsInline
      preload={loadReels ? "metadata" : "none"}
    >
      {loadReels && <source src={src} type="video/mp4" />}
    </video>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <LazyHeader />

      <main aria-label="About Paradise Yatra">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/70 to-background">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary shadow-sm">
                <Building2 className="h-3.5 w-3.5" /> About Paradise Yatra
              </span>
              <h1 className="!text-[32px] font-extrabold !leading-[1.1] tracking-tight text-heading sm:!text-5xl lg:!text-[56px]">
                We plan trips that feel <span className="text-primary">personal</span>, not packaged.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                Paradise Yatra is a Dehradun-based travel company. Since {COMPANY.foundedYear}, our team has been designing
                holidays across India and abroad, with honest advice, clear plans and real people on call from your first
                enquiry to your return home.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeadForm(true)}
                  className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover"
                >
                  Plan my trip <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-heading transition-colors hover:border-primary hover:text-primary"
                >
                  <Phone className="h-4 w-4" /> {COMPANY.phone}
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/15">
                <Image
                  src="/About/Hero/Untitled design.png"
                  alt="The Paradise Yatra team"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 620px"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl sm:left-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-heading">Registered operator</span>
                  <span className="block text-xs text-slate-500">Uttarakhand Tourism</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 md:px-8">
          <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm md:grid-cols-4 md:gap-0 md:divide-x md:divide-slate-100 md:p-2">
            {STATS.map(({ value, label, Icon }) => (
              <li key={label} className="flex items-center gap-3 rounded-2xl p-3 md:justify-center md:rounded-none md:p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-2xl font-extrabold leading-none text-heading">{value}</span>
                  <span className="mt-1 block text-xs font-medium text-slate-500">{label}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Founder + story */}
        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="relative mx-auto w-full max-w-md lg:mx-0">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/15">
                <Image
                  src="/About/Founder/dikshant-sharma.webp"
                  alt="Dikshant Sharma, Founder & CEO of Paradise Yatra"
                  fill
                  sizes="(max-width: 1024px) 90vw, 448px"
                  className="object-cover object-[50%_20%]"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-200">{COMPANY.founderTitle}</p>
                  <p className="text-2xl font-extrabold">{COMPANY.founder}</p>
                </div>
              </div>
              <div className="absolute -right-3 bottom-28 hidden max-w-[220px] rounded-2xl bg-white p-4 shadow-xl sm:block lg:-right-10">
                <Quote className="h-6 w-6 text-primary" />
                <p className="mt-2 text-sm font-medium italic leading-relaxed text-slate-700">
                  Make every journey meaningful, and every traveller feel taken care of.
                </p>
              </div>
            </div>

            <div>
              <SectionHeader
                eyebrow="Our story"
                eyebrowIcon={<Sparkles />}
                title="Started with one promise: travel should feel personal"
                titleClassName="!text-[26px] sm:!text-4xl"
                className="!mb-5"
              />
              <div className="space-y-4 text-base leading-relaxed text-slate-600">
                <p>
                  {COMPANY.founder} started Paradise Yatra in Dehradun in {COMPANY.foundedYear} with a simple belief: a holiday
                  should be planned around the people taking it. From the first Uttarakhand itineraries to holidays across
                  India and abroad, that belief still shapes every trip we plan.
                </p>
                <p>
                  Today our team combines local know-how with careful planning, so you get honest advice, a clear day-by-day
                  plan, and someone to call whenever you need help.
                </p>
              </div>

              {/* Milestones */}
              <ol className="mt-8 space-y-5 border-l-2 border-primary/20 pl-6">
                {MILESTONES.map((m) => (
                  <li key={m.title} className="relative">
                    <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-white bg-primary shadow" />
                    <p className="text-xs font-extrabold uppercase tracking-widest text-primary">{m.year}</p>
                    <p className="mt-0.5 font-bold text-heading">{m.title}</p>
                    <p className="text-sm text-slate-600">{m.text}</p>
                  </li>
                ))}
              </ol>

              <a
                href={`mailto:${COMPANY.founderEmail}`}
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-heading px-6 text-sm font-bold text-white transition-colors hover:bg-primary"
              >
                <Mail className="h-4 w-4" /> Write to the founder
              </a>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-slate-50 px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              align="center"
              eyebrow="What we stand for"
              eyebrowIcon={<HeartHandshake />}
              title="The way we plan every trip"
              description="Five things you can expect from us, whichever trip you choose."
              titleClassName="!text-[26px] sm:!text-4xl"
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              {VALUES.map(({ Icon, title, text, points }, i) => (
                <article
                  key={title}
                  className={`group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg md:p-7 ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-heading">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <BadgeCheck className="h-4 w-4 shrink-0 text-primary" /> {p}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="How it works"
              eyebrowIcon={<Route />}
              title="From first message to the trip of your life"
              titleClassName="!text-[26px] sm:!text-4xl"
              action={
                <button
                  type="button"
                  onClick={() => setShowLeadForm(true)}
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover"
                >
                  Start planning <ArrowRight className="h-4 w-4" />
                </button>
              }
            />
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(({ Icon, title, text }, i) => (
                <li key={title} className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <span className="absolute right-5 top-4 text-5xl font-black text-slate-100">{String(i + 1).padStart(2, "0")}</span>
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-heading text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="relative mt-5 text-base font-extrabold text-heading">{title}</h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Life at Paradise Yatra */}
        <section ref={lifeSectionRef} className="bg-heading px-4 py-16 text-white md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-300">Life at Paradise Yatra</p>
                <h2 className="!text-[26px] font-extrabold !text-white sm:!text-4xl">The people behind your trips</h2>
              </div>
              <p className="max-w-md text-sm text-slate-300">
                More than a team, a family of explorers: planning, celebrating and travelling together.
              </p>
            </div>

            <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4 md:gap-4">
              <div className="relative col-span-2 row-span-2 overflow-hidden rounded-3xl bg-white/5">
                <Image src="/About/Life At Paradise Yatra/Image 1.jpeg" alt="Paradise Yatra team on an outing" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className="relative row-span-2 overflow-hidden rounded-3xl bg-white/5">
                {reel("/About/Life%20At%20Paradise%20Yatra/Reel%201.mp4", "A day at the Paradise Yatra office")}
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-white/5">
                <Image src="/About/Life At Paradise Yatra/Image 3.jpg" alt="Music at the office" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-white/5">
                <Image src="/About/Life At Paradise Yatra/Image 2.jpg" alt="Christmas celebrations at the office" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
              <div className="relative col-span-2 overflow-hidden rounded-3xl bg-white/5 md:col-span-2">
                {reel("/About/Life%20At%20Paradise%20Yatra/Reel%202.mp4", "Outside the Paradise Yatra office")}
              </div>
              <div className="col-span-2 flex flex-col justify-center rounded-3xl bg-primary p-6 md:col-span-2">
                <p className="text-xl font-extrabold leading-snug md:text-2xl">Want to travel with a team that genuinely cares?</p>
                <button
                  type="button"
                  onClick={() => setShowLeadForm(true)}
                  className="mt-4 inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-primary hover:bg-primary-light"
                >
                  Talk to us <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Registrations */}
        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:items-center">
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <h2 className="mt-4 !text-2xl font-extrabold text-heading md:!text-3xl">A registered, accountable company</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {COMPANY.legalName} is registered with Uttarakhand Tourism and as an MSME, so you
                  always know who you&apos;re booking with.
                </p>
              </div>
              <dl className="grid gap-3 sm:grid-cols-3">
                {REGISTRATIONS.map((r) => (
                  <div key={r.label} className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{r.label}</dt>
                    <dd className="mt-1 break-all text-sm font-bold text-heading">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Visit us */}
        <section className="px-4 pb-16 md:px-8 md:pb-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="flex flex-col gap-4">
              <SectionHeader eyebrow="Visit us" eyebrowIcon={<MapPin />} title="Come say hello in Dehradun" titleClassName="!text-[26px] sm:!text-3xl" className="!mb-2" />
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-primary/40">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>
                  <span className="block font-bold text-heading">Head office</span>
                  <span className="block text-sm text-slate-600">{COMPANY.address}</span>
                </span>
              </a>
              <div className="grid gap-4 sm:grid-cols-2">
                <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-primary/40">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Travel helpline</span>
                    <span className="block font-bold text-heading">{COMPANY.phone}</span>
                  </span>
                </a>
                <a href={`tel:${OFFICE_PHONE.replace(/\s/g, "")}`} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-primary/40">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Office</span>
                    <span className="block font-bold text-heading">{OFFICE_PHONE}</span>
                  </span>
                </a>
                <a href={`mailto:${COMPANY.email}`} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-primary/40">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email</span>
                    <span className="block break-all font-bold text-heading">{COMPANY.email}</span>
                  </span>
                </a>
                <div className="flex items-start gap-3 rounded-2xl bg-heading p-4 text-white">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
                  <span className="text-sm">
                    <span className="block text-xs font-bold uppercase tracking-wider text-blue-200">Office hours</span>
                    <span className="block font-bold">Mon–Sat, 10:00 AM – 6:30 PM</span>
                    <span className="block text-white/70">Sunday closed</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-slate-100 shadow-sm lg:min-h-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1388.6582464962262!2d78.03477118988253!3d30.327473883386677!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092a19318db8c3%3A0xd8c55020cab7d0c4!2sParadise%20Yatra!5e0!3m2!1sen!2sin!4v1772634410746!5m2!1sen!2sin"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Paradise Yatra office on Google Maps"
              />
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-4 pb-20 md:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-strong to-primary px-6 py-10 text-white md:px-12 md:py-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="!text-[26px] font-extrabold !text-white md:!text-4xl">Let&apos;s plan your next trip</h2>
                <p className="mt-2 max-w-lg text-white/85">Tell us where you&apos;d like to go. A trip expert will send you a plan made for you, free.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeadForm(true)}
                  className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-primary hover:bg-primary-light"
                >
                  Plan my trip <ArrowRight className="h-4 w-4" />
                </button>
                <Link href="/package" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-bold text-white hover:bg-white/10">
                  Browse packages
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PerformanceMonitor showInProduction={false} />

      {showLeadForm && <LeadCaptureForm isOpen={showLeadForm} onClose={() => setShowLeadForm(false)} />}
    </div>
  );
});

AboutPage.displayName = "AboutPage";

export default AboutPage;
