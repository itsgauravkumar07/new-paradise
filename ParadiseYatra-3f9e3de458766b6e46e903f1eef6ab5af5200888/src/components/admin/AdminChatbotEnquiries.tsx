"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Bot, CalendarDays, ExternalLink, Mail, MapPin, MessageCircle, Phone, Search } from "lucide-react";
import { toast } from "react-toastify";
import { AdminPageHeader, AdminSpinner, cardStyle } from "./hotels/shared";
import { ChatTranscript, chatAdminFetch, fmtDateTime, type ChatConversationDetail } from "./chatShared";

type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

interface ChatbotEnquiry {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  destination?: string;
  destinationUrl?: string;
  packageTitle?: string;
  departureDate?: string;
  message?: string;
  status: LeadStatus;
  createdAt?: string;
  timestamp?: string;
  conversation: { _id: string; messageCount: number; lastMessageAt: string } | null;
}

const STATUSES: { value: LeadStatus; label: string; color: string; bg: string }[] = [
  { value: "new", label: "New", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  { value: "contacted", label: "Contacted", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  { value: "qualified", label: "Qualified", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  { value: "won", label: "Won", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  { value: "lost", label: "Lost", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
];
const statusStyle = (status: LeadStatus) => STATUSES.find((s) => s.value === status) ?? STATUSES[0];

const PAGE_SIZE = 20;

const SITE_PATH = /^\/(?!\/)[\w\-./%]*$/;

/**
 * Website page the visitor was interested in. Newer enquiries store it; older ones carry it in the
 * message ("Package: Kashmir Paradise (/package/kashmir-paradise)").
 */
const destinationLink = (e: ChatbotEnquiry): string | null => {
  if (e.destinationUrl && SITE_PATH.test(e.destinationUrl)) return e.destinationUrl;
  const fromMessage = e.message?.match(/\((\/(?:package|fixed-departures)\/[^)\s]+)\)/)?.[1];
  return fromMessage && SITE_PATH.test(fromMessage) ? fromMessage : null;
};

const whatsappHref = (phone: string, name: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi ${name}, this is Paradise Yatra. Thank you for your enquiry on our website chat!`
  )}`;

const StatusPill = ({ status }: { status: LeadStatus }) => {
  const s = statusStyle(status);
  return (
    <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

const AdminChatbotEnquiries = () => {
  const [items, setItems] = useState<ChatbotEnquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | LeadStatus>("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatConversationDetail | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set("q", search);
      if (status) params.set("status", status);
      const data = await chatAdminFetch<{ enquiries: ChatbotEnquiry[]; total: number }>(`/api/chat/enquiries?${params.toString()}`);
      setItems(data.enquiries || []);
      setTotal(data.total || 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load chatbot enquiries");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  // On wide screens open the newest enquiry straight away
  useEffect(() => {
    if (!selectedId && items.length && window.innerWidth >= 1024) setSelectedId(items[0]._id);
  }, [items, selectedId]);

  const selected = items.find((e) => e._id === selectedId) ?? null;

  // Load the chat that belongs to the selected enquiry
  useEffect(() => {
    const conversationId = selected?.conversation?._id;
    setChat(null);
    if (!conversationId) return;
    let active = true;
    setChatLoading(true);
    chatAdminFetch<{ conversation: ChatConversationDetail }>(`/api/chat/conversations/detail?id=${conversationId}`)
      .then((data) => active && setChat(data.conversation))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load the chat"))
      .finally(() => active && setChatLoading(false));
    return () => {
      active = false;
    };
  }, [selected?.conversation?._id]);

  const updateStatus = async (enquiry: ChatbotEnquiry, next: LeadStatus) => {
    try {
      await chatAdminFetch(`/api/leads/${enquiry._id}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      setItems((list) => list.map((e) => (e._id === enquiry._id ? { ...e, status: next } : e)));
      toast.success("Status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Bot}
        title="Chatbot Enquiries"
        subtitle="Enquiries submitted through the website chat assistant, with the full chat for each one."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4" style={cardStyle}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSelectedId(null);
            setSearch(query.trim());
          }}
          className="relative min-w-[220px] flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email or destination…"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </form>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setSelectedId(null);
            setStatus(e.target.value as "" | LeadStatus);
          }}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">{total} enquiries</span>
      </div>

      {loading ? (
        <AdminSpinner label="Loading chatbot enquiries..." />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500" style={cardStyle}>
          No chatbot enquiries yet. They appear here when a visitor sends an enquiry from the website chat.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* Enquiry list */}
          <div className={`rounded-2xl border bg-white ${selected ? "hidden lg:block" : ""}`} style={cardStyle}>
            <ul className="max-h-[75vh] divide-y divide-slate-100 overflow-y-auto">
              {items.map((e) => (
                <li key={e._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(e._id)}
                    className={`w-full p-4 text-left transition-colors cursor-pointer ${
                      e._id === selectedId ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-slate-900">{e.fullName}</span>
                      <StatusPill status={e.status} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{e.phone || e.email}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      {e.destination && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {e.destination}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {e.conversation ? `${e.conversation.messageCount} messages` : "No chat saved"}
                      </span>
                      <span>{fmtDateTime(e.createdAt || e.timestamp)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 p-3 text-xs">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setSelectedId(null);
                    setPage((p) => p - 1);
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setSelectedId(null);
                    setPage((p) => p + 1);
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Enquiry detail + chat */}
          {selected ? (
            <div className="space-y-4">
              <div className="rounded-2xl border bg-white p-5" style={cardStyle}>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline lg:hidden cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to enquiries
                </button>

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selected.fullName}</h2>
                    <p className="text-xs text-slate-500">Received {fmtDateTime(selected.createdAt || selected.timestamp)}</p>
                  </div>
                  <select
                    value={selected.status}
                    onChange={(e) => updateStatus(selected, e.target.value as LeadStatus)}
                    className="rounded-xl border px-3 py-2 text-sm font-semibold outline-none"
                    style={{ color: statusStyle(selected.status).color, borderColor: statusStyle(selected.status).color }}
                    aria-label="Enquiry status"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {/* Some visitors only share an email, so the phone buttons only show when there is a number */}
                  {selected.phone ? (
                    <>
                      <a
                        href={`tel:${selected.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-600"
                      >
                        <Phone className="h-3.5 w-3.5" /> {selected.phone}
                      </a>
                      <a
                        href={whatsappHref(selected.phone, selected.fullName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-600"
                      >
                        WhatsApp
                      </a>
                    </>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700">
                      No phone shared: reply by email
                    </span>
                  )}
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-600"
                    >
                      <Mail className="h-3.5 w-3.5" /> {selected.email}
                    </a>
                  )}
                </div>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      <MapPin className="h-3 w-3" /> Destination / interest
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">
                      {(() => {
                        const href = destinationLink(selected);
                        const label = selected.destination || selected.packageTitle;
                        if (!label) return "Not specified";
                        if (!href) return label;
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Open ${href} on the website`}
                            className="group inline-flex items-center gap-1.5 text-indigo-600 hover:underline"
                          >
                            {label}
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                          </a>
                        );
                      })()}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      <CalendarDays className="h-3 w-3" /> Travel month
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">{selected.departureDate || "Not specified"}</dd>
                  </div>
                </dl>

                {selected.message && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Enquiry details</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{selected.message}</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border bg-white p-5" style={cardStyle}>
                <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <MessageCircle className="h-4 w-4 text-indigo-500" /> Chat with the chatbot
                  </h3>
                  {chat && <span className="text-xs text-slate-400">{chat.messages.length} messages</span>}
                </div>
                {!selected.conversation ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    The chat for this enquiry wasn&apos;t saved (for example, the visitor closed the page before it synced).
                  </p>
                ) : chatLoading || !chat ? (
                  <AdminSpinner label="Loading chat..." />
                ) : (
                  <ChatTranscript messages={chat.messages} className="max-h-[60vh]" />
                )}
              </div>
            </div>
          ) : (
            <div
              className="hidden items-center justify-center rounded-2xl border bg-white p-10 text-sm text-slate-500 lg:flex"
              style={cardStyle}
            >
              Select an enquiry to see its details and chat.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminChatbotEnquiries;
