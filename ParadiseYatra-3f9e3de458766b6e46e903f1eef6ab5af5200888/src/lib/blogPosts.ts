// Shared by the blog list's server page and its client component (keep free of "use client" code)

export interface BlogPost {
  _id: string;
  slug?: string;
  title: string;
  excerpt?: string;
  author?: string;
  image?: string;
  category?: string;
  readTime?: number;
  views?: number;
  isFeatured?: boolean;
  createdAt?: string;
  publishDate?: string;
  updatedAt?: string;
}

export const blogPostDate = (post: BlogPost) => new Date(post.publishDate || post.createdAt || post.updatedAt || 0);

/** Newest first */
export const sortBlogPosts = (list: BlogPost[]) =>
  [...list].sort((a, b) => blogPostDate(b).getTime() - blogPostDate(a).getTime());
