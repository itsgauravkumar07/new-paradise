// The top offer bar, read once per page render in the root layout (cached; refreshed on save in Admin → Offers).
import { backendJsonSafe } from "@/lib/server/backend";
import type { OfferBarData } from "@/lib/offers";

export const OFFER_BAR_TAG = "offer-bar";

export async function getOfferBar(): Promise<OfferBarData | null> {
  // Never blocks a page for long, and never fails it: no bar is the fallback
  const res = await backendJsonSafe<{ data?: OfferBarData | null }>("/api/offers/bar", { revalidate: 60, timeoutMs: 3000, tags: [OFFER_BAR_TAG] });
  const bar = res?.data;
  if (!bar || (!bar.label && !bar.message)) return null;
  if (bar.endsAt && new Date(bar.endsAt).getTime() <= Date.now()) return null;
  return bar;
}
