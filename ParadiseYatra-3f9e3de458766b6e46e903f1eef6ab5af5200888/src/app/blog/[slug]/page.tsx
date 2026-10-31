import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailClient from "./BlogDetailClient";
import { BLOG_HERO_IMAGE_OPTIONS } from "@/lib/blogImageOptions";
import { getImageUrl } from "@/lib/utils";
import { fitTitle, getBlogDataSlug, SITE_URL, truncateText } from "@/lib/seo";

interface BlogPost {
  _id: string;
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
  faqs?: { question: string; answer: string; order?: number }[];
  seoKeywords?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoOgTitle?: string;
  seoOgDescription?: string;
  seoTwitterTitle?: string;
  seoTwitterDescription?: string;
  imageAlt?: string;
  createdAt: string;
  updatedAt: string;
}

// Function to strip HTML tags for meta description
const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Function to fetch blog post by slug with timeout
// IMPORTANT: This must call the *Next.js app* (not the backend) because `/api/blogs/[id]`
// is a Next route that proxies to the backend.
const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
  try {
    // For server-side rendering, we need to construct the full URL to THIS Next app.
    // Never use NEXT_PUBLIC_BACKEND_URL here.
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      (process.env.NODE_ENV === "production"
        ? "https://paradiseyatra.com"
        : "http://localhost:3001");

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    try {
      response = await fetch(`${baseUrl}/api/blogs/${encodeURIComponent(getBlogDataSlug(slug))}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error("Blog fetch timed out");
      }
      throw fetchError;
    }

    // Only a confirmed 404 means "no such article"; anything else is a temporary failure
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Blog request failed with status ${response.status}`);
    }

    const blog = await response.json();
    return blog;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    // Re-throw so Next.js shows a temporary error (5xx, retried by Google) instead of a 404 for a real article
    throw error;
  }
};

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | Paradise Yatra",
      description: "The requested blog post could not be found.",
    };
  }

  const cleanContent = stripHtml(post.content);
  const descriptionValue =
    post.seoDescription || post.excerpt || cleanContent.substring(0, 160);
  const description =
    descriptionValue.length > 160
      ? truncateText(descriptionValue, 157)
      : descriptionValue;
  const publishedDate = new Date(post.createdAt).toISOString();
  const modifiedDate = new Date(post.updatedAt || post.createdAt).toISOString();
  const seoTitleValue = post.seoTitle || post.title;
  // Never end a title in "...": shorten the brand suffix first, then cut at a whole word (see fitTitle)
  const metadataTitle = fitTitle(`${seoTitleValue} | Paradise Yatra Travel Blog`);
  const openGraphTitle = fitTitle(post.seoOgTitle || seoTitleValue, 90);
  const openGraphDescriptionValue = post.seoOgDescription || description;
  const openGraphDescription =
    openGraphDescriptionValue.length > 160
      ? truncateText(openGraphDescriptionValue, 157)
      : openGraphDescriptionValue;
  const twitterTitle = fitTitle(post.seoTwitterTitle || seoTitleValue, 90);
  const twitterDescriptionValue = post.seoTwitterDescription || description;
  const twitterDescription =
    twitterDescriptionValue.length > 160
      ? truncateText(twitterDescriptionValue, 157)
      : twitterDescriptionValue;
  const metadataImage =
    getImageUrl(post.image || null, BLOG_HERO_IMAGE_OPTIONS) || "/banner.jpeg";

  return {
    title: metadataTitle,
    description: description,
    keywords:
      post.seoKeywords && post.seoKeywords.length > 0
        ? post.seoKeywords
        : [
          "travel blog",
          "travel tips",
          post.category.toLowerCase(),
          "adventure travel",
          "destination guide",
          "travel experience",
          "Paradise Yatra",
        ],
    authors: [{ name: post.author }],
    creator: post.author,
    publisher: "Paradise Yatra",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/blog/${resolvedParams.slug}`,
    },
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      url: `/blog/${resolvedParams.slug}`,
      siteName: "Paradise Yatra",
      images: [
        {
          url: metadataImage,
          width: 1200,
          height: 630,
          alt: post.imageAlt || seoTitleValue,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
      authors: [post.author],
      section: post.category,
      tags:
        post.seoKeywords && post.seoKeywords.length > 0
          ? post.seoKeywords
          : [post.category, "Travel", "Adventure"],
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: [metadataImage],
      creator: "@paradiseyatra",
      site: "@paradiseyatra",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

const BlogDetailPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${encodeURIComponent(resolvedParams.slug)}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />
      <BlogDetailClient post={post} slug={resolvedParams.slug} />
    </>
  );
};

export default BlogDetailPage;
