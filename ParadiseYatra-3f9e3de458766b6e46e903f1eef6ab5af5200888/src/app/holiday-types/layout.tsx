import { buildStaticMetadata } from "@/lib/seo";

export const metadata = buildStaticMetadata("/holiday-types");

export default function HolidayTypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
