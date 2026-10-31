"use client";

const CLIENT_ID_KEY = "py_ga_client_id";

const getClientId = (): string | null => {
  if (typeof window === "undefined") return null;

  const existing = window.localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(CLIENT_ID_KEY, generated);
  return generated;
};

export const trackPageView = (path: string) => {
  if (typeof window === "undefined") return;

  const clientId = getClientId();
  if (!clientId) return;

  const payload = {
    client_id: clientId,
    events: [
      {
        name: "page_view",
        params: {
          page_path: path,
          page_location: window.location.href,
          page_title: document.title,
        },
      },
    ],
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/collect", blob);
    return;
  }

  fetch("/api/analytics/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
};

// Same flag CookieConsentManager sets once the visitor accepts the cookie notice
const CONSENT_STORAGE_KEY = "paradise_cookie_notice";

/** Custom GA4 event (e.g. chat_open). Only sent after the visitor has accepted the cookie notice. */
export const trackEvent = (name: string, params: Record<string, string | number | boolean> = {}) => {
  if (typeof window === "undefined") return;

  try {
    if (window.localStorage.getItem(CONSENT_STORAGE_KEY) !== "acknowledged") return;
  } catch {
    return;
  }

  const clientId = getClientId();
  if (!clientId) return;

  const body = JSON.stringify({
    client_id: clientId,
    events: [{ name, params: { ...params, page_location: window.location.href } }],
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/collect", new Blob([body], { type: "application/json" }));
    return;
  }

  fetch("/api/analytics/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
};
