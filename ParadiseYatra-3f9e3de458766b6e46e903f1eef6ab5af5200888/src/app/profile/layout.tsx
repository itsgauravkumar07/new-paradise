import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/profile");

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
