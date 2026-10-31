"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Phone, RotateCcw, Send, X } from "lucide-react";
import { useChatSession } from "@/hooks/useChatSession";
import { trackEvent } from "@/lib/analytics";
import type { ChatCard, ChatMessage, LeadStep } from "@/lib/chat/types";
import { ASSISTANT } from "@/lib/chat/persona";
import { LANGS, t, type Lang, type StringKey } from "@/lib/chat/i18n";
import AssistantAvatar from "./AssistantAvatar";

// Same WhatsApp number the old "Talk to Agent" button used
export const CHAT_WHATSAPP_NUMBER = "919873391733";
const CALL_NUMBER = "+919873391733";

const INPUT_PLACEHOLDERS: Partial<Record<LeadStep, StringKey>> = {
  name: "placeholderName",
  phone: "placeholderPhone",
  email: "placeholderEmail",
  month: "placeholderMonth",
  adults: "placeholderAdults",
  children: "placeholderChildren",
  budget: "placeholderBudget",
  notes: "placeholderNotes",
};

const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const whatsappLink = (interest?: string) =>
  `https://wa.me/${CHAT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Paradise Yatra! I'm interested in ${interest ? `${interest} ` : ""}tour packages. Can you help me?`
  )}`;

const BotAvatar = () => <AssistantAvatar className="h-7 w-7" />;

/**
 * On phones the on-screen keyboard shrinks the visible area but not the layout viewport (iPhone),
 * which hides the message box. Track the visible area so the full-screen chat always fits above the keyboard.
 */
function useMobileViewport() {
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => setBox(window.innerWidth < 768 ? { top: vv.offsetTop, height: vv.height } : null);
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);
  return box;
}

interface MessageBodyProps {
  message: ChatMessage;
  interest?: string;
  lang: Lang;
  onEnquire?: (card: ChatCard) => void;
}

const MessageBody = ({ message, interest, lang, onEnquire }: MessageBodyProps) => (
  <div className="min-w-0 space-y-2">
    {message.text && (
      <div className="w-fit max-w-full whitespace-pre-line rounded-2xl rounded-tl-md border border-slate-100 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-700 shadow-sm">
        {message.kind === "faq" && (
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-primary">{t(lang, "fromFaqs")}</span>
        )}
        {message.text}
      </div>
    )}

    {message.cards && message.cards.length > 0 && (
      <div className="-mr-4 flex snap-x gap-2.5 overflow-x-auto pb-1 pr-4 scrollbar-hide">
        {message.cards.map((card) => (
          <div
            key={card.id}
            className="flex w-48 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={card.href} className="group block">
              <div className="relative h-24 bg-primary-light">
                {card.image ? (
                  <Image src={card.image} alt={card.title} fill sizes="192px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary/30">
                    <MapPin className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="px-3 pt-3">
                <p className="line-clamp-2 text-xs font-bold leading-snug text-slate-900 group-hover:text-primary">{card.title}</p>
                {card.subtitle && <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{card.subtitle}</p>}
                {card.price > 0 && (
                  <p className="mt-1.5 text-sm font-extrabold text-primary">
                    {formatPrice(card.price)}
                    <span className="ml-1 text-[10px] font-medium text-slate-400">{card.priceLabel}</span>
                  </p>
                )}
              </div>
            </Link>
            {onEnquire && (
              // Enquire takes the width (labels differ in length per language); View is a compact icon button
              <div className="mt-auto flex items-center gap-1.5 p-3">
                <button
                  type="button"
                  onClick={() => onEnquire(card)}
                  className="flex h-8 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-primary px-3 text-[11px] font-bold text-white transition-colors hover:bg-primary-hover cursor-pointer"
                >
                  <Send className="h-3 w-3 shrink-0" />
                  <span className="truncate">{t(lang, "enquireNow")}</span>
                </button>
                <Link
                  href={card.href}
                  aria-label={`${t(lang, "view")}: ${card.title}`}
                  title={t(lang, "view")}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-primary hover:text-primary"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {message.seeAll && (
      <Link href={message.seeAll.href} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
        {message.seeAll.label} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    )}

    {message.kind === "handoff" && (
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappLink(interest)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("chat_handoff", { channel: "whatsapp" })}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-600"
        >
          {t(lang, "whatsappUs")}
        </a>
        <a
          href={`tel:${CALL_NUMBER}`}
          onClick={() => trackEvent("chat_handoff", { channel: "call" })}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-primary hover:text-primary"
        >
          <Phone className="h-3.5 w-3.5" /> +91 98733 91733
        </a>
      </div>
    )}
  </div>
);

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const { messages, leadStep, interest, lang, ready, busy, choose, send, enquire, setLanguage, reset } = useChatSession();
  const viewport = useMobileViewport();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const trackedLeadRef = useRef<string | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Count each submitted enquiry once
  const last = messages[messages.length - 1];
  useEffect(() => {
    if (last?.kind === "lead" && trackedLeadRef.current !== last.id) {
      trackedLeadRef.current = last.id;
      trackEvent("chat_lead_submitted");
    }
  }, [last]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || busy) return;
    send(draft);
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <div
      role="dialog"
      aria-label={`${ASSISTANT.name} · ${t(lang, "role")}`}
      lang="en"
      className="fixed inset-0 z-[130] flex flex-col overflow-hidden bg-slate-50 md:inset-auto md:bottom-24 md:right-6 md:h-[600px] md:max-h-[calc(100vh-8rem)] md:w-[380px] md:rounded-3xl md:border md:border-slate-200 md:shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      style={{ paddingTop: "env(safe-area-inset-top)", ...(viewport ? { top: viewport.top, height: viewport.height, bottom: "auto" } : {}) }}
    >
      {/* Header */}
      <div className="relative flex shrink-0 items-center gap-3 overflow-hidden bg-gradient-to-br from-primary to-primary-strong px-4 py-3.5 text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
        <span className="relative shrink-0 rounded-full bg-white p-0.5">
          <AssistantAvatar className="h-10 w-10" />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-primary bg-emerald-400" aria-hidden />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="text-sm font-bold !text-white">{ASSISTANT.name}</p>
          <p className="truncate text-[11px] text-white/80">{t(lang, "role")} · Paradise Yatra</p>
        </div>
        <div role="group" aria-label={t(lang, "language")} className="relative flex shrink-0 rounded-full bg-white/15 p-0.5">
          {LANGS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLanguage(option.value)}
              disabled={busy}
              aria-pressed={lang === option.value}
              title={option.label}
              className={`rounded-full px-2 py-1 text-[10px] font-bold transition-colors cursor-pointer disabled:cursor-wait ${
                lang === option.value ? "bg-white text-primary" : "text-white/85 hover:text-white"
              }`}
            >
              {option.short}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={reset}
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
          aria-label={t(lang, "newChat")}
          title={t(lang, "newChat")}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
          aria-label={t(lang, "closeChat")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
        {!ready ? (
          <div className="mx-auto mt-10 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          messages.map((message, index) => {
            const isLast = index === messages.length - 1;
            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end">
                  <p className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-sm text-white shadow-sm">
                    {message.text}
                  </p>
                </div>
              );
            }
            return (
              <div key={message.id} className="flex gap-2">
                <BotAvatar />
                <div className="min-w-0 flex-1 space-y-2">
                  <MessageBody message={message} interest={interest} lang={lang} onEnquire={busy ? undefined : enquire} />
                  {isLast && !busy && message.options && message.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {message.options.map((option) => (
                        <button
                          key={option.action}
                          type="button"
                          onClick={() => choose(option.action, option.label)}
                          className="rounded-full border border-primary/25 bg-white px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white cursor-pointer"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {busy && (
          <div className="flex gap-2">
            <BotAvatar />
            <span className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-slate-100 bg-white px-3.5 py-3 shadow-sm">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={submit}
        className="shrink-0 border-t border-slate-100 bg-white px-3 pt-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            type={leadStep === "phone" ? "tel" : leadStep === "email" ? "email" : "text"}
            inputMode={
              leadStep === "phone" ? "tel" : leadStep === "adults" || leadStep === "children" ? "numeric" : undefined
            }
            maxLength={leadStep === "notes" ? 500 : 300}
            placeholder={t(lang, (leadStep && INPUT_PLACEHOLDERS[leadStep]) || "placeholderDefault")}
            className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:bg-white"
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={!draft.trim() || busy}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            aria-label={t(lang, "sendMessage")}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          {t(lang, "footer")} ·{" "}
          <Link href="/privacy-policy" className="underline hover:text-slate-600">
            {t(lang, "privacy")}
          </Link>
        </p>
      </form>
    </div>
  );
}
