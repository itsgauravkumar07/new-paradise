import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/coming-soon");

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
