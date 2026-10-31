"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  title: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Sticky contents for the legal pages (desktop): highlights the section being read and shows progress. */
export default function LegalToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const els = items.map((it) => document.getElementById(it.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const onScroll = () => {
      const first = els[0].getBoundingClientRect();
      const last = els[els.length - 1].getBoundingClientRect();
      const total = last.bottom - first.top - window.innerHeight * 0.6;
      setProgress(Math.min(100, Math.max(0, (-first.top / Math.max(total, 1)) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) setActive(visible[0].target.id);
        },
        { rootMargin: "-120px 0px -60% 0px" }
      );
      els.forEach((el) => observer!.observe(el));
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer?.disconnect();
    };
  }, [items]);

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 104, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  return (
    <nav aria-label="On this page" className="sticky top-28 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-2.5 flex items-center justify-between px-1.5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">On this page</p>
        <span className="text-xs font-bold tabular-nums text-primary">{Math.round(progress)}%</span>
      </div>
      <div className="mx-1.5 mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400 transition-[width] duration-200" style={{ width: `${progress}%` }} />
      </div>
      <ol className="max-h-[calc(100vh-15rem)] space-y-0.5 overflow-y-auto scrollbar-hide">
        {items.map((it, i) => {
          const isActive = active === it.id;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(it.id);
                }}
                className={`flex items-start gap-3 rounded-xl px-2.5 py-2 text-[13px] leading-snug transition-colors ${
                  isActive ? "bg-primary-light font-semibold text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-heading"
                }`}
              >
                <span className={`mt-px text-[11px] font-bold tabular-nums ${isActive ? "text-primary" : "text-slate-400"}`}>{pad(i + 1)}</span>
                <span>{it.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
