"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Facebook,
  Link2,
  ListOrdered,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import FAQSection from "@/components/FAQSection";
import { BLOG_CARD_IMAGE_OPTIONS, BLOG_HERO_IMAGE_OPTIONS } from "@/lib/blogImageOptions";
import { getImageUrl } from "@/lib/utils";
import { preserveRichTextSpacing } from "@/lib/richText";
import { withHeadingIds, type TocHeading } from "@/lib/blogToc";
import { SITE_URL } from "@/lib/seo";
import { COMPANY } from "@/lib/chat/company";

const LeadCaptureForm = dynamic(() => import("@/components/LeadCaptureForm"), { ssr: false });

interface BlogFAQ {
  question: string;
  answer: string;
  order?: number;
}

interface BlogPost {
  _id: string;
  slug?: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  image: string;
  imageAlt?: string;
  category: string;
  readTime: number;
  views: number;
  likes: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
  publishDate?: string;
  faqs?: BlogFAQ[];
}

interface BlogDetailClientProps {
  post: BlogPost;
  slug: string;
}

const FALLBACK_IMAGE = "/images/placeholder-travel.jpg";

const slugOf = (post: Pick<BlogPost, "slug" | "title">) =>
  post.slug ||
  post.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })
    : "";

const plain = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

// Typography for the article body (HTML written in the admin editor)
const PROSE = [
  "blog-content min-w-0 text-[17px] leading-[1.85] text-slate-700",
  "[&_.editor-spacer]:!hidden [&_h2:first-child]:!mt-0 [&_h3:first-child]:!mt-0",
  "[&_h2]:!mt-12 [&_h2]:scroll-mt-28 [&_h2]:!text-[24px] md:[&_h2]:!text-[30px] [&_h2]:!font-extrabold [&_h2]:!leading-tight [&_h2]:tracking-tight [&_h2]:!text-heading",
  "[&_h3]:!mt-8 [&_h3]:scroll-mt-28 [&_h3]:!text-[20px] md:[&_h3]:!text-[22px] [&_h3]:!font-bold [&_h3]:!leading-snug [&_h3]:!text-heading",
  "[&_h4]:!mt-6 [&_h4]:!text-lg [&_h4]:!font-bold [&_h4]:!text-heading",
  "[&_p]:!my-0 [&_p]:!text-[17px] [&_p]:!leading-[1.85] [&_p]:!text-slate-700 [&_p:not(:first-child)]:!mt-5",
  "[&_ul]:!my-5 [&_ul]:!list-disc [&_ul]:!pl-6 [&_ol]:!my-5 [&_ol]:!list-decimal [&_ol]:!pl-6 [&_li]:!mt-2 [&_li]:!text-[17px] [&_li]:!leading-[1.8] [&_li]:!text-slate-700 [&_li::marker]:!text-primary [&_li_p]:!m-0",
  "[&_strong]:!font-bold [&_strong]:!text-heading [&_span]:!text-inherit",
  "[&_a]:!font-semibold [&_a]:!text-primary [&_a]:!underline [&_a]:decoration-primary/30 [&_a]:underline-offset-2 hover:[&_a]:decoration-primary",
  "[&_blockquote]:!my-8 [&_blockquote]:!rounded-r-2xl [&_blockquote]:!border-l-4 [&_blockquote]:!border-primary [&_blockquote]:!bg-primary-light/50 [&_blockquote]:!px-6 [&_blockquote]:!py-4 [&_blockquote]:!text-lg [&_blockquote]:!italic [&_blockquote]:!text-heading",
  "[&_img]:!my-8 [&_img]:!h-auto [&_img]:!max-w-full [&_img]:!rounded-2xl",
  "[&_table]:!my-8 [&_table]:!block [&_table]:!max-w-full [&_table]:!overflow-x-auto md:[&_table]:!table [&_table]:!w-full [&_table]:!border-collapse [&_table]:!text-sm [&_th]:!bg-slate-100 [&_th]:!px-3 [&_th]:!py-2 [&_th]:!text-left [&_th]:!font-bold [&_th]:!text-heading [&_td]:!border-t [&_td]:!border-slate-200 [&_td]:!px-3 [&_td]:!py-2",
  "[&_iframe]:!my-8 [&_iframe]:!aspect-video [&_iframe]:!h-auto [&_iframe]:!w-full [&_iframe]:!rounded-2xl",
].join(" ");

function ShareButtons({ title, compact = false }: { title: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: nothing else to do
    }
  };

  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);
  const btn = `flex ${compact ? "h-9 w-9" : "h-10 w-10"} cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors`;
  return (
    <div className="flex items-center gap-2">
      <a href={`https://wa.me/?text=${text}%20${link}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className={`${btn} hover:border-emerald-500 hover:text-emerald-600`}>
        <MessageCircle className="h-4 w-4" />
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${link}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className={`${btn} hover:border-blue-600 hover:text-blue-600`}>
        <Facebook className="h-4 w-4" />
      </a>
      <a href={`https://x.com/intent/post?text=${text}&url=${link}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={`${btn} hover:border-slate-900 hover:text-slate-900`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <button type="button" onClick={copy} aria-label="Copy link" className={`${btn} ${copied ? "border-emerald-500 text-emerald-600" : "hover:border-primary hover:text-primary"}`}>
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

function TocList({ headings, active, onPick }: { headings: TocHeading[]; active: string; onPick: (id: string) => void }) {
  return (
    <ol className="space-y-0.5">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              onPick(h.id);
            }}
            className={`block rounded-lg border-l-2 py-1.5 pr-2 text-[13px] leading-snug transition-colors ${h.level === 3 ? "pl-6" : "pl-3 font-semibold"} ${
              active === h.id ? "border-primary bg-primary-light/60 text-primary" : "border-transparent text-slate-600 hover:text-heading"
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

const BlogDetailClient = ({ post, slug }: BlogDetailClientProps) => {
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  const { html, headings } = useMemo(() => withHeadingIds(preserveRichTextSpacing(post.content || "")), [post.content]);
  // Long articles: list main sections only, so the contents stay short
  const toc = useMemo(() => {
    const h2s = headings.filter((h) => h.level === 2);
    return h2s.length >= 3 ? h2s : headings;
  }, [headings]);

  const faqItems = (post.faqs || [])
    .filter((f) => f.question && f.answer)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((f) => ({ question: f.question, answer: f.answer }));

  const published = post.publishDate || post.createdAt;
  const updated = post.updatedAt && new Date(post.updatedAt).getTime() - new Date(published).getTime() > 86400000 ? post.updatedAt : undefined;
  const url = `${SITE_URL}/blog/${slug}`;
  const heroImage = brokenImages.has(post._id) ? FALLBACK_IMAGE : getImageUrl(post.image || null, BLOG_HERO_IMAGE_OPTIONS) || FALLBACK_IMAGE;
  const cardImage = (p: BlogPost) => (brokenImages.has(p._id) ? FALLBACK_IMAGE : getImageUrl(p.image || null, BLOG_CARD_IMAGE_OPTIONS) || FALLBACK_IMAGE);
  const onImgError = (id: string) => setBrokenImages((prev) => new Set(prev).add(id));

  // Related reading: same topic first, then the newest articles
  useEffect(() => {
    const controller = new AbortController();
    const list = async (query: string) => {
      const res = await fetch(`/api/blogs?${query}`, { signal: controller.signal });
      const data = res.ok ? await res.json() : {};
      return (Array.isArray(data) ? data : data.blogs || []) as BlogPost[];
    };
    (async () => {
      try {
        let picks = (await list(`published=true&minimal=true&limit=6&category=${encodeURIComponent(post.category || "")}`)).filter((b) => b._id !== post._id);
        if (picks.length < 3) {
          const seen = new Set(picks.map((b) => b._id));
          picks = [...picks, ...(await list("published=true&minimal=true&limit=6")).filter((b) => b._id !== post._id && !seen.has(b._id))];
        }
        setRelated(picks.slice(0, 3));
      } catch (e) {
        if (!(e instanceof Error && e.name === "AbortError")) console.error("Error fetching related articles:", e);
      }
    })();
    return () => controller.abort();
  }, [post._id, post.category]);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      setProgress(Math.min(100, Math.max(0, (-rect.top / Math.max(total, 1)) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Highlight the section being read in the contents
  useEffect(() => {
    const els = toc.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHeading(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -65% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
    setTocOpen(false);
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: plain(post.excerpt) || plain(post.content).slice(0, 160),
    image: getImageUrl(post.image || null, BLOG_HERO_IMAGE_OPTIONS) || undefined,
    author: { "@type": "Organization", name: post.author || "Paradise Yatra", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Paradise Yatra", logo: { "@type": "ImageObject", url: `${SITE_URL}/headerLogo.png` } },
    datePublished: new Date(published).toISOString(),
    dateModified: new Date(post.updatedAt || published).toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: post.category,
    wordCount: plain(post.content).split(" ").length,
    timeRequired: `PT${post.readTime || 5}M`,
    inLanguage: "en-IN",
  };
  const faqSchema = faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c") }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />}

      {/* Reading progress */}
      <div className="fixed inset-x-0 top-0 z-[70] h-1 bg-transparent" aria-hidden="true">
        <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pb-16">
          {/* Title block */}
          <header className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-10">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <Link href="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/blog" className="hover:text-primary">Blog</Link>
              {post.category && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="font-semibold text-heading hover:text-primary">{post.category}</Link>
                </>
              )}
            </nav>

            <h1 className="mt-5 !text-[30px] font-extrabold !leading-[1.15] tracking-tight text-heading sm:!text-4xl md:!text-[46px]">{post.title}</h1>
            {post.excerpt && <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">{plain(post.excerpt)}</p>}

            <div className="mt-6 flex flex-col gap-4 border-y border-slate-200 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-primary-light ring-2 ring-white">
                  <Image src="/favicon.png" alt="" fill sizes="44px" className="object-contain p-1.5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-heading">{post.author || "Paradise Yatra"}</p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(published)}</span>
                    <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {post.readTime || 5} min read</span>
                    {updated && <span>Updated {formatDate(updated)}</span>}
                  </p>
                </div>
              </div>
              <ShareButtons title={post.title} compact />
            </div>
          </header>

          {/* Cover photo: shown whole (many covers have text on them) over a blurred copy */}
          <div className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-slate-900 shadow-lg">
              <Image src={heroImage} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-50 blur-2xl" aria-hidden="true" />
              <Image
                src={heroImage}
                alt={post.imageAlt || post.title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1200px"
                onError={() => onImgError(post._id)}
                className="object-contain"
              />
            </div>
          </div>

          {/* Article + sidebar */}
          <div className="mx-auto mt-10 grid max-w-6xl gap-10 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
            <div ref={articleRef} className="min-w-0">
              {toc.length >= 3 && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white lg:hidden">
                  <button
                    type="button"
                    onClick={() => setTocOpen((o) => !o)}
                    aria-expanded={tocOpen}
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left text-sm font-bold text-heading"
                  >
                    <span className="flex items-center gap-2"><ListOrdered className="h-4 w-4 text-primary" /> In this article ({toc.length})</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${tocOpen ? "rotate-180" : ""}`} />
                  </button>
                  {tocOpen && (
                    <div className="border-t border-slate-100 px-2 py-2">
                      <TocList headings={toc} active={activeHeading} onPick={goTo} />
                    </div>
                  )}
                </div>
              )}

              <div suppressHydrationWarning className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />

              {/* End of article */}
              <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-heading">Found this useful?</p>
                  <p className="text-sm text-slate-500">Share it with someone planning a trip.</p>
                </div>
                <ShareButtons title={post.title} />
              </div>

              {faqItems.length > 0 && (
                <div className="mt-12">
                  <FAQSection faqs={faqItems} variant="blog" />
                </div>
              )}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col gap-5">
                {toc.length >= 3 && (
                  <nav aria-label="Table of contents" className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <ListOrdered className="h-4 w-4 text-primary" /> In this article
                    </p>
                    <div className="min-h-0 overflow-y-auto pr-1 scrollbar-hide">
                      <TocList headings={toc} active={activeHeading} onPick={goTo} />
                    </div>
                  </nav>
                )}
                <div className="shrink-0 rounded-2xl bg-gradient-to-br from-primary-strong to-primary p-5 text-white shadow-lg shadow-blue-900/15">
                  <Sparkles className="h-6 w-6 text-blue-200" />
                  <p className="mt-2 text-lg font-extrabold leading-snug">Inspired to go?</p>
                  <p className="mt-1 text-sm text-white/85">Our travel experts will plan this trip around your dates and budget, free.</p>
                  <button
                    type="button"
                    onClick={() => setLeadOpen(true)}
                    className="mt-4 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white text-sm font-bold text-primary hover:bg-primary-light"
                  >
                    Plan my trip <ArrowRight className="h-4 w-4" />
                  </button>
                  <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white">
                    <Phone className="h-3.5 w-3.5" /> {COMPANY.phone}
                  </a>
                </div>
              </div>
            </aside>
          </div>

          {/* Plan-a-trip band (phones and tablets; the sidebar has it on desktop) */}
          <div className="mx-auto mt-12 max-w-6xl px-4 md:px-8 lg:hidden">
            <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-primary-strong to-primary p-6 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-extrabold">Inspired to go?</p>
                <p className="text-sm text-white/85">Our experts will plan this trip around your dates and budget, free.</p>
              </div>
              <button type="button" onClick={() => setLeadOpen(true)} className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-primary">
                Plan my trip <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Keep reading */}
          {related.length > 0 && (
            <section className="mx-auto mt-16 max-w-6xl px-4 md:px-8">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Keep reading</p>
                  <h2 className="mt-1 !text-[24px] font-extrabold text-heading md:!text-3xl">You might also like</h2>
                </div>
                <Link href="/blog" className="hidden items-center gap-1 text-sm font-bold text-primary hover:underline sm:flex">
                  All articles <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <Link key={p._id} href={`/blog/${slugOf(p)}`} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <Image src={cardImage(p)} alt={p.title} fill sizes="(max-width: 640px) 100vw, 400px" onError={() => onImgError(p._id)} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-heading">{p.category || "Travel"}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(p.publishDate || p.createdAt)}</span>
                        <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {p.readTime || 5} min</span>
                      </p>
                      <h3 className="mt-2 line-clamp-2 !text-[17px] font-bold !leading-snug text-heading transition-colors group-hover:text-primary">{p.title}</h3>
                      {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{plain(p.excerpt)}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {leadOpen && (
        <LeadCaptureForm
          isOpen={leadOpen}
          onClose={() => setLeadOpen(false)}
          heading="Plan this trip with us"
          subheading="Share a few details and a trip expert will send you a plan made for you."
          initialMessage={`I read "${post.title}" and would like help planning a similar trip.`}
        />
      )}
    </>
  );
};

export default BlogDetailClient;
