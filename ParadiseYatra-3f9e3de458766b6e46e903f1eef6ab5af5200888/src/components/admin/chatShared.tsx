"use client";

// Shared by the admin "Chat Conversations" and "Chatbot Enquiries" sections.

export interface TranscriptMessage {
  role: "user" | "bot";
  kind: string;
  text: string;
  createdAt: string;
}

export interface ChatConversationDetail {
  _id: string;
  sessionId: string;
  contact?: { name?: string; phone?: string; email?: string };
  leadId?: string | null;
  status: "open" | "lead" | "closed";
  pageUrl?: string;
  lastMessageAt: string;
  createdAt: string;
  messages: TranscriptMessage[];
}

export const fmtDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "";

/** Calls an admin API route through the Next.js proxy with the logged-in admin's token. */
export async function chatAdminFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) throw new Error(data?.message || `Request failed (${res.status})`);
  return data as T;
}

/** Chat bubbles: the visitor on the right, the bot on the left. */
export const ChatTranscript = ({ messages, className = "" }: { messages: TranscriptMessage[]; className?: string }) =>
  messages.length === 0 ? (
    <p className="py-8 text-center text-sm text-slate-500">No messages saved for this chat.</p>
  ) : (
    <div className={`space-y-3 overflow-y-auto pr-1 ${className}`}>
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm ${
              m.role === "user" ? "rounded-tr-md bg-indigo-600 text-white" : "rounded-tl-md bg-slate-100 text-slate-700"
            }`}
          >
            {m.text || <em className="opacity-60">({m.kind})</em>}
            <span className={`mt-1 block text-[10px] ${m.role === "user" ? "text-white/60" : "text-slate-400"}`}>
              {m.role === "user" ? "Visitor" : "Chatbot"} · {fmtDateTime(m.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
