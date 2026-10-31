import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "./ui/SectionHeader";
import { Button } from "./ui/button";
import { getImageUrl } from "@/lib/utils";

interface BlogPost {
    _id: string;
    slug?: string;
    title: string;
    content: string;
    excerpt: string;
    author: string;
    image: string;
    category: string;
    readTime: number;
    views: number;
    likes: number;
    isPublished: boolean;
    isFeatured: boolean;
    createdAt: string;
}

// Function to generate slug from title
const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
};

const getPostSlug = (post: BlogPost): string => {
    return post.slug || generateSlug(post.title);
};

const BlogSectionNew = () => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [filters, setFilters] = useState([{ id: "all", label: "All Posts" }]);
    const [loading, setLoading] = useState(true);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollState = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener("scroll", updateScrollState);
            window.addEventListener("resize", updateScrollState);
            setTimeout(updateScrollState, 100);

            return () => {
                carousel.removeEventListener("scroll", updateScrollState);
                window.removeEventListener("resize", updateScrollState);
            };
        }
    }, [blogPosts]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const fetchBlogs = async () => {
            try {
                if (!isMounted) return;
                setLoading(true);

                const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5001";
                let response;
                try {
                    response = await fetch(`${BACKEND_URL}/api/blogs/featured?minimal=true`, {
                        signal: controller.signal,
                        cache: "no-store",
                    });
                    clearTimeout(timeoutId);
                } catch (fetchError) {
                    clearTimeout(timeoutId);
                    if (fetchError instanceof Error && fetchError.name === "AbortError") {
                        if (isMounted) {
                            console.warn("Blog fetch timed out");
                            setLoading(false);
                        }
                        return;
                    }
                    throw fetchError;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch blogs");
                }

                const data = await response.json();
                let posts: BlogPost[] = [];

                if (Array.isArray(data)) {
                    posts = data;
                } else if (data.blogs && Array.isArray(data.blogs)) {
                    posts = data.blogs;
                }

                if (isMounted) {
                    setAllPosts(posts);
                    setBlogPosts(posts.slice(0, 6));

                    // Extract unique categories
                    const categories = Array.from(
                        new Set(posts.map((post) => post.category).filter(Boolean))
                    );
                    const newFilters = [
                        { id: "all", label: "All Posts" },
                        ...categories.map((cat) => ({ id: cat, label: cat })),
                    ];
                    setFilters(newFilters);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error fetching blogs:", err);
                    setLoading(false);
                }
            }
        };

        fetchBlogs();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, []);

    // Handle filtering
    useEffect(() => {
        if (activeFilter === "all") {
            setBlogPosts(allPosts.slice(0, 6));
        } else {
            const filtered = allPosts.filter((post) => post.category === activeFilter);
            setBlogPosts(filtered.slice(0, 6));
        }
    }, [activeFilter, allPosts]);

    const scrollByStep = (direction: number) => {
        if (carouselRef.current) {
            const card = carouselRef.current.firstElementChild;
            const gap = 8; // gap-2 = 8px
            const cardWidth = card ? card.getBoundingClientRect().width : 340;
            const step = cardWidth + gap;

            carouselRef.current.scrollBy({
                left: direction * step,
                behavior: "smooth",
            });
        }
    };

    if (loading) {
        return (
            <section className="bg-background py-16">
                <div className="mx-auto max-w-7xl px-4 md:px-8">
                    <div className="mx-auto mb-8 h-10 w-72 animate-pulse rounded-xl bg-slate-200" />
                    <div className="grid gap-6 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[420px] animate-pulse rounded-3xl bg-slate-200" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (allPosts.length === 0 && !loading) return null;

    return (
        <section className="bg-background py-16">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <SectionHeader
                    titleClassName="!text-[20px] sm:!text-3xl md:!text-3xl"
                    align="center"
                    title="Travel Inspirations"
                    description={
                        <>
                            <span className="md:hidden">Travel ideas and stories to inspire your next trip.</span>
                            <span className="hidden md:inline">
                                A curated list of inspiration and the most exciting tours & travel stories based on diverse destinations worldwide.
                            </span>
                        </>
                    }
                />

                <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
                    {allPosts.slice(0, 3).map((post) => {
                        const date = new Date(post.createdAt);
                        return (
                            <Link
                                key={post._id}
                                href={`/blog/${getPostSlug(post)}`}
                                className="group flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white card-lift md:w-auto"
                            >
                                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                                    {post.image ? (
                                        <Image
                                            src={getImageUrl(post.image) || ""}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 85vw, 33vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-200 text-4xl">📝</div>
                                    )}
                                    {!Number.isNaN(date.getTime()) && (
                                        <span className="absolute bottom-3 right-3 flex flex-col items-center rounded-xl bg-white px-2.5 py-1 text-center shadow-md">
                                            <span className="text-base font-extrabold leading-none text-heading">{date.getDate()}</span>
                                            <span className="text-[9px] font-bold uppercase text-muted-foreground">
                                                {date.toLocaleDateString("en-US", { month: "short" })}
                                            </span>
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-3 flex items-center justify-between text-xs">
                                        <span className="rounded-full bg-primary-light px-2.5 py-1 font-bold text-primary">
                                            {post.category || "Travel"}
                                        </span>
                                        {post.readTime ? (
                                            <span className="text-muted-foreground">{post.readTime} min read</span>
                                        ) : null}
                                    </div>
                                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-heading transition-colors group-hover:text-primary">
                                        {post.title}
                                    </h3>
                                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                        {post.excerpt ||
                                            (post.content ? `${post.content.replace(/<[^>]*>?/gm, "").substring(0, 100)}...` : "")}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="truncate text-xs font-semibold text-slate-700">
                                            {post.author || "Paradise Yatra"}
                                        </span>
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-6 text-center">
                    <Button asChild size="lg">
                        <Link href="/blog">
                            View All Inspirations <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default BlogSectionNew;
