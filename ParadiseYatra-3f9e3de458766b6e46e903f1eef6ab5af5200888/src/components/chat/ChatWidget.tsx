"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { ASSISTANT } from "@/lib/chat/persona";
import AssistantAvatar from "./AssistantAvatar";

// The panel (and the chat logic) only downloads the first time a visitor opens the chat
const loadChatPanel = () => import("./ChatPanel");
const ChatPanel = dynamic(loadChatPanel, { ssr: false });

const HIDDEN_PREFIXES = ["/admin"];

/** Floating chat launcher shown on every public page (replaces the old Talk to Agent button). */
export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock page scroll behind the full-screen panel on mobile
  useEffect(() => {
    if (!open || window.innerWidth >= 768) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  const toggle = () => {
    if (!open) trackEvent("chat_open", { page_path: pathname });
    setOpen((value) => !value);
  };

  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} />}

      {open ? (
        <button
          type="button"
          onClick={toggle}
          aria-label="Close chat"
          aria-expanded
          className="fixed bottom-8 right-6 z-40 hidden h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition-colors hover:bg-primary-hover md:inline-flex"
        >
          <X className="h-6 w-6" />
        </button>
      ) : (
        <button
          type="button"
          onClick={toggle}
          onPointerEnter={() => void loadChatPanel()}
          aria-label={`Chat with ${ASSISTANT.name}, our ${ASSISTANT.role.toLowerCase()}`}
          aria-expanded={false}
          className="chat-launcher group fixed bottom-5 right-5 z-40 flex cursor-pointer items-center gap-3 md:bottom-8 md:right-6"
        >
          {/* Name tag beside the photo (tablet and up) */}
          <span className="hidden flex-col items-end rounded-2xl rounded-br-md bg-white px-4 py-2 text-right shadow-[0_8px_24px_rgba(15,23,42,0.14)] ring-1 ring-slate-100 transition-transform duration-200 group-hover:-translate-y-0.5 md:flex">
            <span className="text-sm font-bold leading-tight text-heading">Chat with {ASSISTANT.name}</span>
            <span className="text-[11px] font-medium leading-tight text-slate-500">{ASSISTANT.role}</span>
          </span>

          {/* Round photo */}
          <span className="relative transition-transform duration-200 group-hover:-translate-y-0.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/30 [animation-duration:2.5s]" />
            <span className="relative block rounded-full bg-white p-0.5 shadow-[0_10px_25px_rgba(37,99,235,0.35)] ring-2 ring-primary">
              <AssistantAvatar className="h-14 w-14" />
            </span>
            <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" aria-hidden />
          </span>
        </button>
      )}
    </>
  );
}
