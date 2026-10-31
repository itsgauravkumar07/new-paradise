"use client";

// Small enquiry card (EnquiryPopupForm) that opens by itself 3-5 seconds after a visitor arrives.
// Shown once per visit (browser session); not again for 30 days after the visitor sends an enquiry.
// Leads are saved with source "popup" (the team email says "Website popup").

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const loadForm = () => import("@/components/EnquiryPopupForm");
const EnquiryPopupForm = dynamic(loadForm, { ssr: false });

const SHOWN_KEY = "py_enquiry_popup_shown"; // sessionStorage: already shown this visit
const SENT_KEY = "py_enquiry_popup_sent"; // localStorage: when the visitor last sent an enquiry from it
const SENT_QUIET_MS = 30 * 24 * 60 * 60 * 1000;

// Pages where an unexpected popup would get in the way
const SKIP_PATHS = ["/admin", "/login", "/signup", "/checkout", "/payment", "/profile"];
const skipPath = (path: string | null) => !!path && SKIP_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

const read = (store: () => Storage, key: string) => {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
};
const write = (store: () => Storage, key: string, value: string) => {
  try {
    store().setItem(key, value);
  } catch {
    // Storage blocked (private mode): the popup may show again next visit, which is fine
  }
};

// The visitor is busy with something else: typing in a field, or another dialog is open
const isBusy = () => {
  const active = document.activeElement;
  if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT")) return true;
  return !!document.querySelector('[aria-modal="true"], [role="dialog"]');
};

export default function EnquiryPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (skipPath(pathname)) return;
    // ?popup=1 on any page shows it regardless (for checking the popup)
    const forced = new URLSearchParams(window.location.search).get("popup") === "1";
    if (!forced) {
      if (read(() => sessionStorage, SHOWN_KEY)) return;
      const sentAt = Number(read(() => localStorage, SENT_KEY));
      if (sentAt && Date.now() - sentAt < SENT_QUIET_MS) return;
    }

    // Download the form while the visitor looks around, so it opens instantly
    loadForm().catch(() => {});

    let timer = window.setTimeout(function tryOpen() {
      if (skipPath(window.location.pathname)) return;
      if (isBusy()) {
        timer = window.setTimeout(tryOpen, 3000);
        return;
      }
      write(() => sessionStorage, SHOWN_KEY, "1");
      setOpen(true);
    }, 3000 + Math.round(Math.random() * 2000));

    return () => window.clearTimeout(timer);
    // Only the first page of the visit starts the timer; later navigation keeps it running
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!open) return null;

  return <EnquiryPopupForm onClose={() => setOpen(false)} onSent={() => write(() => localStorage, SENT_KEY, String(Date.now()))} />;
}
