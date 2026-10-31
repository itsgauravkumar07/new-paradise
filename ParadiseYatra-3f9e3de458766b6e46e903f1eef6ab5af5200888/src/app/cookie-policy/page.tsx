import { LazyHeader } from "@/components/lazy-components";
import LegalPage from "@/components/legal/LegalPage";
import { buildStaticMetadata } from "@/lib/seo";
import { getLegalPage } from "@/lib/server/legal";

export const metadata = buildStaticMetadata("/cookie-policy");
export const revalidate = 300;

// Content is edited in Admin → Legal Pages (built-in wording: src/lib/legal/defaults.ts)
export default async function CookiePolicyPage() {
  return (
    <>
      <LazyHeader />
      <LegalPage data={await getLegalPage("cookie")} />
    </>
  );
}
