import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/signup");

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
