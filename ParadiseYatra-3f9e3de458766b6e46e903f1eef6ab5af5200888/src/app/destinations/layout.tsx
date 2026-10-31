import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/destinations");

export default function DestinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
