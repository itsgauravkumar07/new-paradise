"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { boldParts, isSafeOfferLink, OFFER_BAR_THEMES, type OfferBarData } from "@/lib/offers";

const hide = () => document.documentElement.classList.add("offer-bar-dismissed");

const countdownParts = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const min = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return days > 0
    ? [
        [days, days === 1 ? "day" : "days", "d"],
        [hrs, "hrs", "h"],
        [min, "min", "m"],
      ]
    : [
        [hrs, "hrs", "h"],
        [min, "min", "m"],
        [sec, "sec", "s"],
      ];
};

export default function OfferBar({ bar, preview = false }: { bar: OfferBarData; preview?: boolean }) {
  const pathname = usePathname();
  // The countdown depends on the visitor's clock, so it is only shown after hydration
  const [now, setNow] = useState<number | null>(null);
  const endsAt = bar.endsAt ? new Date(bar.endsAt).getTime() : null;

  useEffect(() => {
    if (!endsAt) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  const remaining = endsAt && now !== null ? endsAt - now : null;
  const expired = remaining !== null && remaining <= 0;

  useEffect(() => {
    if (expired && !preview) hide();
  }, [expired, preview]);

  if (!preview && pathname?.startsWith("/admin")) return null;

  const theme = OFFER_BAR_THEMES[bar.theme] || OFFER_BAR_THEMES.sunset;
  const link = isSafeOfferLink(bar.linkUrl) ? bar.linkUrl! : null;

  // Hides the bar until the page is reloaded (nothing is stored, so a refresh shows it again)
  const dismiss = hide;

  const content = (
    <>
      <Sparkles aria-hidden="true" className="offer-bar-sparkle h-4 w-4 shrink-0 text-white" />
      {bar.label && (
        // On phones the message wins the space when there is both
        <span className={`shrink-0 text-[13px] font-extrabold uppercase tracking-wide sm:text-[15px] ${bar.message ? "hidden sm:inline" : ""}`}>{bar.label}</span>
      )}
      {bar.message && (
        <span className="min-w-0 truncate text-[13px] font-medium sm:text-[15px]">
          {boldParts(bar.message).map((part, i) => (
            <Fragment key={i}>{part.bold ? <strong className="offer-bar-highlight font-extrabold">{part.text}</strong> : part.text}</Fragment>
          ))}
        </span>
      )}
      {link && bar.ctaText && (
        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-sm md:inline-flex">
          {bar.ctaText} <ArrowRight className="offer-bar-arrow h-3.5 w-3.5" />
        </span>
      )}
    </>
  );

  const contentClass = "flex min-w-0 items-center justify-center gap-2 sm:gap-3";

  return (
    <div
      role="region"
      aria-label="Current offer"
      className={`offer-bar ${preview ? "relative" : "sticky top-0"} z-[61] h-10 w-full overflow-hidden text-white`}
      style={{ background: theme.background, textShadow: "0 1px 2px rgba(0,0,0,0.22)" }}
    >
      <span aria-hidden="true" className="offer-bar-shine" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-center gap-2 pl-3 pr-9 sm:gap-4 sm:px-12">
        {link ? (
          link.startsWith("/") ? (
            <Link href={link} className={`${contentClass} hover:opacity-95`}>{content}</Link>
          ) : (
            <a href={link} target="_blank" rel="noopener noreferrer" className={`${contentClass} hover:opacity-95`}>{content}</a>
          )
        ) : (
          <div className={contentClass}>{content}</div>
        )}

        {bar.showCountdown !== false && endsAt && (
          <span
            className="flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[13px] font-extrabold tabular-nums sm:px-3 sm:text-base lg:absolute lg:right-14"
            style={{ background: theme.chip, textShadow: "none" }}
            aria-label="Time left"
          >
            {remaining === null ? (
              <span className="inline-block w-24 opacity-0">0</span>
            ) : (
              countdownParts(remaining).map(([value, unit, short], i) => (
                <Fragment key={short}>
                  {i > 0 && <span className="offer-bar-colon px-0.5">:</span>}
                  <span>
                    {value}
                    <span className="ml-px text-[10px] font-semibold sm:hidden">{short}</span>
                    <span className="ml-px hidden text-xs font-semibold sm:inline">{unit}</span>
                  </span>
                </Fragment>
              ))
            )}
          </span>
        )}

        {!preview && (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close offer"
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white sm:right-3"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
