import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/payment");

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
