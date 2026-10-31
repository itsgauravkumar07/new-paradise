// Server-side reads from the Express backend (used by page.tsx files to render content into the HTML).
// Never import this from a "use client" file.
import { API_CONFIG } from "@/config/api";

/** The backend answered with something other than 200/404, or didn't answer in time. */
export class BackendError extends Error {
  constructor(
    public status: number,
    public path: string
  ) {
    super(`Backend request failed (${status || "network"}): ${path}`);
    this.name = "BackendError";
  }
}

const backendBase = () => API_CONFIG.BACKEND_URL.replace(/\/+$/, "").replace(/\/api$/, "");

interface BackendOptions {
  /** Seconds the response may be reused before it's fetched again (default 60) */
  revalidate?: number;
  timeoutMs?: number;
  /** Cache tags, so a save elsewhere can refresh this response right away (revalidateTag) */
  tags?: string[];
}

/**
 * GET a backend path and parse the JSON.
 * Returns null ONLY when the backend says 404 (the item really doesn't exist), so pages can show a real 404.
 * Throws BackendError on any other failure, so an outage becomes a temporary error, not a "not found".
 */
export async function backendJson<T>(path: string, { revalidate = 60, timeoutMs = 10000, tags }: BackendOptions = {}): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${backendBase()}${path}`, {
      next: { revalidate, ...(tags ? { tags } : {}) },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new BackendError(0, path);
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new BackendError(res.status, path);
  return (await res.json()) as T;
}

/** Like backendJson, but never throws: returns null on any failure. For optional extras (lists, FAQs). */
export async function backendJsonSafe<T>(path: string, options?: BackendOptions): Promise<T | null> {
  try {
    return await backendJson<T>(path, options);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return null;
  }
}

/** Pull the array out of the different list shapes the backend uses ({ packages }, { blogs }, { data }, [..]). */
export function listFrom<T>(payload: unknown, keys: string[] = []): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of [...keys, "data", "items", "results"]) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }
  return [];
}
