import BlogListClient from "./BlogListClient";
import { sortBlogPosts, type BlogPost } from "@/lib/blogPosts";
import { backendJsonSafe, listFrom } from "@/lib/server/backend";
import { getCanonicalBlogSlug, SITE_URL } from "@/lib/seo";

// Title, description and canonical (/blog) come from ./layout.tsx

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) || "";

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // Every published article (list fields only), so the cards and links are in the HTML search engines get.
  // null = backend unreachable: the list then loads in the browser as before.
  const data = await backendJsonSafe<unknown>("/api/blogs?published=true&minimal=true&limit=500", { revalidate: 60 });
  const posts = data === null ? undefined : sortBlogPosts(listFrom<BlogPost>(data, ["blogs"]));
  const page = Math.min(50, Math.max(1, parseInt(first(params.page), 10) || 1));

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      ],
    },
    ...(posts?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Paradise Yatra Travel Blog",
            url: `${SITE_URL}/blog`,
            publisher: { "@id": `${SITE_URL}/#organization` },
            blogPost: posts.slice(0, 100).map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              url: `${SITE_URL}/blog/${getCanonicalBlogSlug(post.slug || "")}`,
              ...(post.publishDate || post.createdAt ? { datePublished: post.publishDate || post.createdAt } : {}),
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <BlogListClient
        initialPosts={posts}
        initialQuery={first(params.q)}
        initialCategory={first(params.category) || "all"}
        initialSort={["oldest", "popular"].includes(first(params.sort)) ? first(params.sort) : "newest"}
        initialPage={page}
      />
    </>
  );
}
