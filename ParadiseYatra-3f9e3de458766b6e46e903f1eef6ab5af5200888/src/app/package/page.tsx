import { buildStaticMetadata } from "@/lib/seo";
import PackagePageClient from './PackagePageClient';

export const metadata = buildStaticMetadata("/package");

export default function PackagePage() {
    return <PackagePageClient />;
}
