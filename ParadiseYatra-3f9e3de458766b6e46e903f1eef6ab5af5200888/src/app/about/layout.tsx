import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/about");

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
