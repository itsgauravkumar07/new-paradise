import { getImageUrl, getPackagePriceLabel } from "@/lib/utils";
import type { TourMenuKey } from "@/lib/tourMenus";
import type { ChatCard } from "./types";

export interface Faq {
  _id: string;
  question: string;
  answer: string;
}

export interface ChatPackage {
  _id: string;
  name?: string;
  slug?: string;
  image?: string;
  price?: number;
  priceType?: string;
  duration?: string;
  state?: string;
  country?: string;
  location?: string;
}

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

/** The server couldn't be reached (offline, timed out or failing): different from "nothing found". */
export class ChatNetworkError extends Error {
  constructor(public reason: "timeout" | "network" | "server") {
    super(`Chat request failed: ${reason}`);
    this.name = "ChatNetworkError";
  }
}

export const REQUEST_TIMEOUT_MS = 8000;

/** fetch() that gives up after `ms` and turns network failures into ChatNetworkError. */
export async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (res.status >= 500) throw new ChatNetworkError("server");
    return res;
  } catch (error) {
    if (error instanceof ChatNetworkError) throw error;
    throw new ChatNetworkError(controller.signal.aborted ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }
}

/** Resolves like `promise`, or rejects with ChatNetworkError("timeout") after `ms`. */
export const withTimeout = <T>(promise: Promise<T>, ms = REQUEST_TIMEOUT_MS): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new ChatNetworkError("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error instanceof ChatNetworkError ? error : new ChatNetworkError("network"));
      }
    );
  });

let faqsPromise: Promise<Faq[]> | null = null;

/** Every active FAQ (all locations), fetched once per page load. FAQs are optional: failures give []. */
export const fetchFaqs = (): Promise<Faq[]> => {
  if (!faqsPromise) {
    faqsPromise = fetchWithTimeout("/api/faq?isActive=true&limit=200", { cache: "no-store" }, 6000)
      .then((res) => (res.ok ? res.json() : { faqs: [] }))
      .then((data) =>
        (Array.isArray(data?.faqs) ? data.faqs : []).map((f: Faq) => ({
          _id: f._id,
          question: f.question,
          answer: stripHtml(f.answer),
        }))
      )
      .catch(() => {
        faqsPromise = null; // allow a retry on the next question
        return [];
      });
  }
  return faqsPromise;
};

/**
 * Active packages for a tour type, optionally narrowed to a state/country or a keyword.
 * Throws ChatNetworkError when the server can't be reached, so "no packages" is never shown by mistake.
 */
export async function searchPackages(params: {
  tourType?: TourMenuKey;
  destination?: string;
  q?: string;
}): Promise<ChatPackage[]> {
  const query = new URLSearchParams({ isActive: "true", limit: "100" });
  if (params.tourType) query.set("tourType", params.tourType);
  if (params.destination) query.set(params.tourType === "international" ? "country" : "state", params.destination);
  if (params.q) query.set("q", params.q);

  const res = await fetchWithTimeout(`/api/all-packages?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new ChatNetworkError("server");
  const data = await res.json().catch(() => {
    throw new ChatNetworkError("server");
  });
  return Array.isArray(data?.packages) ? data.packages : [];
}

export const toCard = (pkg: ChatPackage): ChatCard => ({
  id: pkg._id,
  title: pkg.name || "Tour package",
  href: `/package/${pkg.slug || pkg._id}`,
  image: getImageUrl(pkg.image || null),
  price: pkg.price || 0,
  priceLabel: getPackagePriceLabel(pkg.priceType),
  subtitle: [pkg.duration, pkg.state || pkg.country || pkg.location].filter(Boolean).join(" · "),
});
