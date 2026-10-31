"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, ChevronDown, ChevronRight, Clock, Newspaper, Search, SearchX, X } from "lucide-react";
import Header from "@/components/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BLOG_CARD_IMAGE_OPTIONS, BLOG_HERO_IMAGE_OPTIONS } from "@/lib/blogImageOptions";
import { getImageUrl } from "@/lib/utils";
import { getCanonicalBlogSlug } from "@/lib/seo";
import { blogPostDate as dateOf, sortBlogPosts, type BlogPost } from "@/lib/blogPosts";

const PAGE_SIZE = 12;
const FALLBACK_IMAGE = "/images/placeholder-travel.jpg";
const HERO_IMAGE = "/Blog/Hero/Blog_hero.webp";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "popular", label: "Most read" },
];

// Always link the canonical address (a few old articles have legacy slugs with ":" in them)
const slugOf = (post: BlogPost) =>
  getCanonicalBlogSlug(
    post.slug ||
      post.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
  );


// Fixed time zone: the server and the browser must print the same date (no hydration mismatch)
const formatDate = (post: BlogPost) =>
  dateOf(post).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

const plain = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const normalise = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

function Meta({ post, light = false }: { post: BlogPost; light?: boolean }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium ${light ? "text-white/80" : "text-slate-500"}`}>
      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(post)}</span>
      {post.readTime ? <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime} min read</span> : null}
    </p>
  );
}

function CategoryChip({ label, light = false }: { label?: string; light?: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        light ? "bg-white/90 text-heading backdrop-blur" : "bg-primary-light text-primary"
      }`}
    >
      {label || "Travel"}
    </span>
  );
}

interface BlogListClientProps {
  /** Articles loaded on the server, so they're in the HTML; when missing they're fetched in the browser */
  initialPosts?: BlogPost[];
  /** Filters from the address (?q=, ?category=, ?sort=, ?page=), read on the server */
  initialQuery?: string;
  initialCategory?: string;
  initialSort?: string;
  initialPage?: number;
}

export default function BlogListClient({
  initialPosts,
  initialQuery = "",
  initialCategory = "all",
  initialSort = "newest",
  initialPage = 1,
}: BlogListClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts ?? []);
  const [loading, setLoading] = useState(!initialPosts);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [visible, setVisible] = useState(PAGE_SIZE * Math.max(1, initialPage));
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const deferredQuery = useDeferredValue(query);
  const pageCount = Math.ceil(visible / PAGE_SIZE);

  // Keep the address bar in step, so a filtered list (or "page 3") can be shared or bookmarked
  useEffect(() => {
    const params = new URLSearchParams();
    if (deferredQuery.trim()) params.set("q", deferredQuery.trim());
    if (category !== "all") params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    if (pageCount > 1) params.set("page", String(pageCount));
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState(window.history.state, "", next);
  }, [deferredQuery, category, sort, pageCount]);

  // Every published article, list fields only (no article body). Skipped when the server already loaded them.
  useEffect(() => {
    if (initialPosts) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    (async () => {
      try {
        const res = await fetch("/api/blogs?published=true&minimal=true&limit=500", { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        const list: BlogPost[] = Array.isArray(data) ? data : Array.isArray(data?.blogs) ? data.blogs : [];
        setPosts(sortBlogPosts(list));
        setError(null);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error && e.name === "AbortError" ? "This is taking longer than usual. Please refresh the page." : "We couldn't load the articles. Please refresh the page.");
      } finally {
        clearTimeout(timer);
        setLoading(false);
      }
    })();
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [initialPosts]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => {
      const c = (p.category || "Travel").trim();
      counts.set(c, (counts.get(c) || 0) + 1);
    });
    return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [posts]);

  const filtered = useMemo(() => {
    const q = normalise(deferredQuery);
    const list = posts.filter(
      (p) =>
        (category === "all" || (p.category || "Travel").trim() === category) &&
        (!q || normalise(`${p.title} ${plain(p.excerpt)} ${p.category || ""}`).includes(q))
    );
    if (sort === "oldest") return [...list].sort((a, b) => dateOf(a).getTime() - dateOf(b).getTime());
    if (sort === "popular") return [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
    return list;
  }, [posts, deferredQuery, category, sort]);

  // A new search, topic or sort starts again from the first page (but not on the first render, which may be ?page=3)
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setVisible(PAGE_SIZE);
  }, [deferredQuery, category, sort]);

  // "Load more" is a real link (?page=N) so crawlers can reach older articles; visitors just expand the list
  const nextPageParams = new URLSearchParams();
  if (deferredQuery.trim()) nextPageParams.set("q", deferredQuery.trim());
  if (category !== "all") nextPageParams.set("category", category);
  if (sort !== "newest") nextPageParams.set("sort", sort);
  nextPageParams.set("page", String(pageCount + 1));
  const nextPageHref = `/blog?${nextPageParams}`;

  const filtering = deferredQuery.trim() !== "" || category !== "all";
  // Top stories: featured articles first, then the newest
  const spotlight = useMemo(() => {
    const featured = posts.filter((p) => p.isFeatured);
    return [...featured, ...posts.filter((p) => !p.isFeatured)].slice(0, 4);
  }, [posts]);
  const [lead, ...side] = spotlight;

  const img = (post: BlogPost, hero = false) =>
    brokenImages.has(post._id)
      ? FALLBACK_IMAGE
      : getImageUrl(post.image || null, hero ? BLOG_HERO_IMAGE_OPTIONS : BLOG_CARD_IMAGE_OPTIONS) || FALLBACK_IMAGE;
  const onImgError = (id: string) => setBrokenImages((prev) => new Set(prev).add(id));

  const jumpToList = () => document.getElementById("all-articles")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setSort("newest");
  };
  const shown = filtered.slice(0, visible);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-heading text-white">
          <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/50 to-slate-950/85" />
          <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-5 sm:pb-12 sm:pt-6 md:px-8 md:pb-16 md:pt-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/75">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-white">Blog</span>
            </nav>
            {/* Phones: left-aligned and compact. Tablet and up: centred */}
            <div className="mt-6 max-w-3xl sm:mx-auto sm:mt-10 sm:text-center md:mt-14">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-[11px]">
                <BookOpen className="h-3.5 w-3.5" /> Paradise Yatra Journal
              </span>
              <h1 className="mt-3 text-balance !text-[28px] font-extrabold !leading-[1.15] !text-white sm:mt-4 sm:!text-[40px] md:!text-5xl">
                Travel stories, guides &amp; tips
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80 sm:mx-auto sm:mt-3 md:text-base">
                <span className="sm:hidden">Guides and travel tips from our experts.</span>
                <span className="hidden sm:inline">Destination guides, things to do and planning advice from our travel experts.</span>
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  jumpToList();
                }}
                className="mt-5 flex h-12 max-w-xl items-center gap-2 rounded-full bg-white p-1 pl-4 shadow-2xl sm:mx-auto sm:mt-7 sm:h-14 sm:p-1.5 sm:pl-5"
                role="search"
              >
                <Search className="h-[18px] w-[18px] shrink-0 text-slate-400 sm:h-5 sm:w-5" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Goa, Kedarnath, visa..."
                  aria-label="Search articles"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-heading outline-none placeholder:text-slate-400 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                )}
                {/* Icon-only button on phones so the search text has room */}
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-sm font-bold text-white hover:bg-primary-hover sm:h-11 sm:w-auto sm:px-5"
                >
                  <Search className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </form>
              {!loading && posts.length > 0 && (
                <p className="mt-3 text-xs font-semibold text-white/70 sm:mt-4">
                  {posts.length} articles · {categories.length} topics
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {error && <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}

          {/* Top stories (hidden while searching or filtering, so results come first) */}
          {!loading && !filtering && lead && (
            <section className="pt-12 md:pt-16">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className="!text-[24px] font-extrabold text-heading md:!text-3xl">Top stories</h2>
                <button type="button" onClick={jumpToList} className="hidden cursor-pointer items-center gap-1 text-sm font-bold text-primary hover:underline sm:flex">
                  View all {posts.length} articles <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <Link href={`/blog/${slugOf(lead)}`} className="group relative block min-h-[320px] overflow-hidden rounded-3xl bg-slate-900 md:min-h-[440px]">
                  <Image
                    src={img(lead, true)}
                    alt={lead.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    onError={() => onImgError(lead._id)}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                    <CategoryChip label={lead.category} light />
                    <h3 className="mt-3 line-clamp-3 !text-xl font-extrabold !leading-snug !text-white md:!text-3xl">{lead.title}</h3>
                    {lead.excerpt && <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/85">{plain(lead.excerpt)}</p>}
                    <div className="mt-3"><Meta post={lead} light /></div>
                  </div>
                </Link>
                <div className="flex flex-col gap-4">
                  {side.map((post) => (
                    <Link key={post._id} href={`/blog/${slugOf(post)}`} className="group flex gap-4 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-lg">
                      <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:w-40">
                        <Image src={img(post)} alt={post.title} fill sizes="160px" onError={() => onImgError(post._id)} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                      <div className="flex min-w-0 flex-col justify-center py-1">
                        <CategoryChip label={post.category} />
                        <h3 className="mt-2 line-clamp-2 !text-[15px] font-bold !leading-snug text-heading transition-colors group-hover:text-primary">{post.title}</h3>
                        <div className="mt-2"><Meta post={post} /></div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All articles */}
          <section id="all-articles" className="scroll-mt-24 pt-12 md:pt-16">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 !text-[24px] font-extrabold text-heading md:!text-3xl">
                  <Newspaper className="h-6 w-6 text-primary" /> {filtering ? "Results" : "All articles"}
                </h2>
                {!loading && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {filtered.length} {filtered.length === 1 ? "article" : "articles"}
                    {category !== "all" && <> in <span className="font-semibold text-heading">{category}</span></>}
                    {deferredQuery.trim() && <> for &ldquo;<span className="font-semibold text-heading">{deferredQuery.trim()}</span>&rdquo;</>}
                  </p>
                )}
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-10 w-[170px] rounded-full border-slate-200 bg-white text-xs font-semibold" aria-label="Sort articles">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                  {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Topic tabs: scroll sideways on phones */}
            <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="Topics">
              {[{ name: "all", count: posts.length }, ...categories].map((c) => {
                const active = category === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(c.name)}
                    className={`flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors ${
                      active ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {c.name === "all" ? "All topics" : c.name}
                    <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{c.count}</span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-3xl border border-slate-100 bg-white" />
                ))}
              </div>
            ) : shown.length > 0 ? (
              <>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((post) => (
                    <article key={post._id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <Link href={`/blog/${slugOf(post)}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
                        <Image
                          src={img(post)}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                          onError={() => onImgError(post._id)}
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3"><CategoryChip label={post.category} light /></span>
                      </Link>
                      <div className="flex flex-1 flex-col p-5">
                        <Meta post={post} />
                        <h3 className="mt-2 line-clamp-2 !text-[17px] font-bold !leading-snug text-heading">
                          <Link href={`/blog/${slugOf(post)}`} className="transition-colors hover:text-primary">{post.title}</Link>
                        </h3>
                        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{plain(post.excerpt)}</p>}
                        <Link href={`/blog/${slugOf(post)}`} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-primary" aria-label={`Read: ${post.title}`}>
                          Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-10 flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-bold text-heading">{shown.length}</span> of {filtered.length} articles
                  </p>
                  <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(shown.length / filtered.length) * 100}%` }} />
                  </div>
                  {visible < filtered.length && (
                    <Link
                      href={nextPageHref}
                      scroll={false}
                      onClick={(e) => {
                        e.preventDefault();
                        setVisible((v) => v + PAGE_SIZE);
                      }}
                      className="mt-2 flex h-11 cursor-pointer items-center gap-2 rounded-full border border-primary px-6 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      Load more articles <ChevronDown className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
                  <SearchX className="h-7 w-7" />
                </span>
                <p className="mt-4 text-lg font-bold text-heading">No articles found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try another word, or browse every topic.</p>
                <button type="button" onClick={clearFilters} className="mt-5 h-10 cursor-pointer rounded-full bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover">
                  Show all articles
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
