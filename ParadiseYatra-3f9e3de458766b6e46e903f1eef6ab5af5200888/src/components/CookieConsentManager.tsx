"use client";

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trackPageView } from "@/lib/analytics";

type CookieNoticeState = "acknowledged" | null;

const NOTICE_STORAGE_KEY = "paradise_cookie_notice";
export default function CookieConsentManager() {
  const [noticeState, setNoticeState] = useState<CookieNoticeState>(null);
  const [isReady, setIsReady] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.toString() || "";

  useEffect(() => {
    const storedNotice = localStorage.getItem(NOTICE_STORAGE_KEY) as CookieNoticeState;
    if (storedNotice === "acknowledged") {
      setNoticeState("acknowledged");
      setAnalyticsEnabled(true);
    } else {
      setNoticeState(null);
    }

    setIsReady(true);
  }, []);

  const dismissNotice = () => {
    localStorage.setItem(NOTICE_STORAGE_KEY, "acknowledged");
    setNoticeState("acknowledged");
    setAnalyticsEnabled(true);
  };

  useEffect(() => {
    if (!analyticsEnabled) return;
    if (typeof window === "undefined") return;

    const path = searchQuery ? `${pathname}?${searchQuery}` : pathname;

    const send = () => trackPageView(path);

    if ("requestIdleCallback" in window) {
      const idleId = (window as Window & { requestIdleCallback: Function }).requestIdleCallback(
        send,
        { timeout: 2000 }
      );
      return () =>
        (window as Window & { cancelIdleCallback: Function }).cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(send, 600);
    return () => clearTimeout(timeoutId);
  }, [analyticsEnabled, pathname, searchQuery]);

  if (!isReady || noticeState === "acknowledged") return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[120] md:inset-x-6 md:bottom-6">
      <div className="mx-auto max-w-5xl rounded-[10px] border border-[#dfe1df] bg-white p-4 shadow-[0_10px_35px_rgba(2,8,23,0.12)] md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-[16px] font-bold text-[#000945]">We use cookies</p>
            <p className="text-[13px] leading-relaxed text-[#000945] md:text-[14px]">
              By using this site, you accept our cookie terms and the use of cookies to support core functionality,
              analytics, and site improvements.{" "}
              <Link href="/cookie-policy" className="font-semibold underline hover:text-[#155dfc]">
                Read Cookie Policy
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              type="button"
              onClick={dismissNotice}
              className="min-w-[130px] cursor-pointer rounded-[6px] border border-[#155dfc] bg-[#155dfc] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#0f4de0]"
            >
              Okay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
