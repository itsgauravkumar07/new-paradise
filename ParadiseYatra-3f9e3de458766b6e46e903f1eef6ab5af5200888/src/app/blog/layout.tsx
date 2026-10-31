import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/blog");

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
