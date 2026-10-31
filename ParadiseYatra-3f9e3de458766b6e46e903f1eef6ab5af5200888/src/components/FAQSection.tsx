"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, HelpCircle, MessageCircle, Phone, Search } from "lucide-react";
import { COMPANY } from "@/lib/chat/company";

type FAQ = { question: string; answer: string };

// Shown when a destination has no FAQs of its own in Admin > Destination FAQs
const defaultFaqs: FAQ[] = [
    {
        question: "How long can I stay?",
        answer: "Our packages range from 2-day weekend getaways to 15-day tours. Any package can be made longer or shorter. Tell us your dates and we'll adjust the itinerary.",
    },
    {
        question: "Can I book from this site?",
        answer: "Yes. Send an enquiry from any package and one of our travel experts will call you to confirm dates, hotels and the final price before you pay anything.",
    },
    {
        question: "Is the price shown the final price?",
        answer: "The price shown is the starting price for that package. The final price depends on your travel dates, hotel category and group size, and is confirmed in writing before you pay, with no hidden charges.",
    },
    {
        question: "What's included?",
        answer: "Most packages include hotel stays, private cab transfers, sightseeing and daily breakfast. Every package page lists exactly what's included and what isn't.",
    },
    {
        question: "What if I need to cancel?",
        answer: "Cancellation charges depend on how close to the travel date you cancel and on the hotel and transport policies. The exact terms are shared before you pay. See our Refund Policy page for details.",
    },
];

const SEARCH_FROM = 7; // show a search box when there are this many questions or more

interface FAQSectionProps {
    /** Load this destination's FAQs from Admin > Destination FAQs (with tourType) */
    destination?: string;
    tourType?: string;
    /** Use these questions instead of loading any */
    faqs?: FAQ[];
    /** "blog": a compact single column that sits inside an article */
    variant?: "default" | "blog";
    title?: string;
    description?: string;
    className?: string;
}

function FAQRow({ faq, index, open, onToggle }: { faq: FAQ; index: number; open: boolean; onToggle: () => void }) {
    const id = `faq-${index}`;
    return (
        <li className={`relative transition-colors ${open ? "bg-primary-light/40" : "hover:bg-slate-50/70"}`}>
            <span className={`absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={`${id}-answer`}
                id={`${id}-question`}
                className="group flex w-full cursor-pointer items-start gap-4 px-5 py-5 text-left md:px-7"
            >
                <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold transition-colors ${
                        open ? "bg-primary text-white" : "bg-slate-100 text-slate-500 group-hover:bg-primary-light group-hover:text-primary"
                    }`}
                >
                    {String(index + 1).padStart(2, "0")}
                </span>
                <span className={`flex-1 text-[15px] font-bold leading-snug md:text-base ${open ? "text-primary" : "text-heading"}`}>
                    {faq.question}
                </span>
                <ChevronDown
                    className={`mt-0.5 h-5 w-5 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-primary" : "text-slate-400"}`}
                />
            </button>
            <div
                id={`${id}-answer`}
                role="region"
                aria-labelledby={`${id}-question`}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
                <div className="overflow-hidden">
                    <p className="whitespace-pre-line pb-6 pl-[4.25rem] pr-5 text-sm leading-relaxed text-slate-600 md:pl-[4.75rem] md:pr-7 md:text-[15px]">
                        {faq.answer}
                    </p>
                </div>
            </div>
        </li>
    );
}

/** FAQ accordion used across the site: destination, theme, blog and Why Choose Us pages. */
export default function FAQSection({
    destination,
    tourType,
    faqs: faqsOverride,
    variant = "default",
    title,
    description,
    className = "",
}: FAQSectionProps) {
    const isBlog = variant === "blog";
    const [faqs, setFaqs] = useState<FAQ[]>(faqsOverride?.length ? faqsOverride : defaultFaqs);
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [query, setQuery] = useState("");
    // Callers often build the list on every render; compare by content so the open question survives re-renders
    const overrideKey = JSON.stringify(faqsOverride ?? []);

    useEffect(() => {
        if (faqsOverride?.length) {
            setFaqs(faqsOverride);
            return;
        }
        if (!destination || !tourType) {
            setFaqs(defaultFaqs);
            return;
        }
        let mounted = true;
        (async () => {
            try {
                const res = await fetch(
                    `/api/destination-faqs?destination=${encodeURIComponent(destination.replace(/-/g, " "))}&tourType=${tourType}`
                );
                const data = res.ok ? await res.json() : null;
                const list = data?.success && data.destinationFaq?.isActive ? data.destinationFaq.faqs : null;
                if (!mounted) return;
                setFaqs(
                    Array.isArray(list) && list.length
                        ? [...list]
                              .sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))
                              .map((f: FAQ) => ({ question: f.question, answer: f.answer }))
                        : defaultFaqs
                );
            } catch (err) {
                console.error("Error fetching destination FAQs:", err);
                if (mounted) setFaqs(defaultFaqs);
            }
        })();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destination, tourType, overrideKey]);

    // New set of questions: start with the first one open
    useEffect(() => {
        setOpenIndex(0);
        setQuery("");
    }, [faqs]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return faqs
            .map((faq, index) => ({ faq, index }))
            .filter(({ faq }) => !q || `${faq.question} ${faq.answer}`.toLowerCase().includes(q));
    }, [faqs, query]);

    const heading = title || (isBlog ? "Frequently asked questions" : "Got questions? We have answers.");
    const intro =
        description ||
        (isBlog
            ? "Quick answers to common questions about this article."
            : destination
              ? `What travellers usually ask us before booking a ${destination.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} trip.`
              : "What travellers usually ask us before booking.");

    const list = (
        <div className="min-w-0">
            {faqs.length >= SEARCH_FROM && (
                <label className="mb-4 flex h-12 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 shadow-sm focus-within:border-primary">
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search questions"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                </label>
            )}
            {visible.length > 0 ? (
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                    {visible.map(({ faq, index }) => (
                        <FAQRow
                            key={`${index}-${faq.question}`}
                            faq={faq}
                            index={index}
                            open={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </ul>
            ) : (
                <p className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-muted-foreground">
                    No questions match &ldquo;{query}&rdquo;. Ask us directly instead, we&apos;re happy to help.
                </p>
            )}
        </div>
    );

    if (isBlog) {
        return (
            <section className={`rounded-3xl border border-slate-100 bg-slate-50/60 p-5 md:p-8 ${className}`}>
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                    <HelpCircle className="h-3.5 w-3.5" /> FAQs
                </span>
                <h2 className="!text-[24px] font-extrabold text-heading md:!text-3xl">{heading}</h2>
                <p className="mb-6 mt-2 text-sm text-muted-foreground md:text-base">{intro}</p>
                {list}
            </section>
        );
    }

    return (
        <section className={`bg-gradient-to-b from-white to-slate-50 px-4 py-14 md:px-8 md:py-20 ${className}`}>
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-14">
                <div className="lg:sticky lg:top-28 lg:self-start">
                    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                        <HelpCircle className="h-3.5 w-3.5" /> FAQs
                    </span>
                    <h2 className="!text-[26px] font-extrabold !leading-tight text-heading md:!text-4xl">{heading}</h2>
                    <p className="mt-3 text-sm text-muted-foreground md:text-base">{intro}</p>

                    {/* Help card (below the questions on phones) */}
                    <div className="mt-8 hidden rounded-3xl bg-gradient-to-br from-primary-strong to-primary p-6 text-white shadow-xl shadow-blue-900/15 lg:block">
                        <HelpCard />
                    </div>
                </div>

                {list}

                <div className="rounded-3xl bg-gradient-to-br from-primary-strong to-primary p-6 text-white shadow-xl shadow-blue-900/15 lg:hidden">
                    <HelpCard />
                </div>
            </div>
        </section>
    );
}

function HelpCard() {
    return (
        <>
            <p className="text-lg font-bold">Still have a question?</p>
            <p className="mt-1 text-sm text-white/85">Talk to a real travel expert, not a call centre.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row lg:flex-col">
                <a
                    href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                    className="flex h-11 shrink-0 items-center sm:flex-1 lg:flex-none justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-primary transition-colors hover:bg-primary-light"
                >
                    <Phone className="h-4 w-4" /> {COMPANY.phone}
                </a>
                <a
                    href={`https://wa.me/${COMPANY.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 shrink-0 items-center sm:flex-1 lg:flex-none justify-center gap-2 rounded-full border border-white/30 px-5 text-sm font-bold transition-colors hover:bg-white/10"
                >
                    <MessageCircle className="h-4 w-4" /> WhatsApp us
                </a>
            </div>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white">
                Other ways to reach us <ArrowRight className="h-4 w-4" />
            </Link>
        </>
    );
}
