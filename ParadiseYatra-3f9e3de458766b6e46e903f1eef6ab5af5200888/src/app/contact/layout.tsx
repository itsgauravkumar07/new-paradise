import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/contact");

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
