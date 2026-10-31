import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/login");

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
