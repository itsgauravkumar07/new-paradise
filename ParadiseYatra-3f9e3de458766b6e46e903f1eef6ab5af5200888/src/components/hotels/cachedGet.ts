// Small GET cache for rarely-changing hotel data (cities, offers, filter options).
// - one in-flight request per URL (React StrictMode / re-mounts share it)
// - result kept in memory and sessionStorage for 5 minutes, so reloads don't re-hit the API
const TTL_MS = 5 * 60 * 1000;
const inflight = new Map<string, Promise<unknown>>();
const memory = new Map<string, { at: number; data: unknown }>();

export function cachedGet<T = any>(url: string): Promise<T> {
  const now = Date.now();

  const mem = memory.get(url);
  if (mem && now - mem.at < TTL_MS) return Promise.resolve(mem.data as T);

  try {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem(`hc:${url}`) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as { at: number; data: unknown };
      if (now - parsed.at < TTL_MS) {
        memory.set(url, parsed);
        return Promise.resolve(parsed.data as T);
      }
    }
  } catch {
    /* storage unavailable - ignore */
  }

  const existing = inflight.get(url);
  if (existing) return existing as Promise<T>;

  const request = fetch(url)
    .then((r) => r.json())
    .then((data) => {
      if (data?.success) {
        const entry = { at: Date.now(), data };
        memory.set(url, entry);
        try {
          sessionStorage.setItem(`hc:${url}`, JSON.stringify(entry));
        } catch {
          /* ignore */
        }
      }
      return data as T;
    })
    .finally(() => inflight.delete(url));

  inflight.set(url, request);
  return request;
}
