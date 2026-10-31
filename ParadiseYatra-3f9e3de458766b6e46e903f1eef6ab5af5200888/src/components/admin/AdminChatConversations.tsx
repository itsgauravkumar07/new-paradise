"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Phone, Mail, Search, Trash2, UserCheck, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { AdminPageHeader, AdminSpinner, cardStyle } from "./hotels/shared";
import { ChatTranscript, chatAdminFetch, fmtDateTime, type ChatConversationDetail } from "./chatShared";

type Status = "open" | "lead" | "closed";

interface ConversationSummary {
  _id: string;
  sessionId: string;
  contact?: { name?: string; phone?: string; email?: string };
  leadId?: string | null;
  status: Status;
  pageUrl?: string;
  lastMessageAt: string;
  createdAt: string;
  messageCount: number;
  firstQuestion?: string;
}

type Conversation = ChatConversationDetail;

const PAGE_SIZE = 20;

const StatusBadge = ({ status }: { status: Status }) =>
  status === "lead" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
      <UserCheck className="h-3 w-3" /> Lead captured
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">Chat only</span>
  );

const AdminChatConversations = () => {
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | Status>("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toDelete, setToDelete] = useState<ConversationSummary | Conversation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set("q", search);
      if (status) params.set("status", status);
      const data = await chatAdminFetch<{ conversations: ConversationSummary[]; total: number }>(
        `/api/chat/conversations?${params.toString()}`
      );
      setItems(data.conversations || []);
      setTotal(data.total || 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (id: string) => {
    setLoadingDetail(true);
    try {
      const data = await chatAdminFetch<{ conversation: Conversation }>(`/api/chat/conversations/detail?id=${id}`);
      setSelected(data.conversation);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load conversation");
    } finally {
      setLoadingDetail(false);
    }
  };

  const remove = async (item: ConversationSummary | Conversation) => {
    try {
      await chatAdminFetch(`/api/chat/conversations/detail?id=${item._id}`, { method: "DELETE" });
      toast.success("Conversation deleted");
      setToDelete(null);
      setSelected(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete conversation");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={MessageCircle}
        title="Chat Conversations"
        subtitle="Transcripts from the website chat assistant. Enquiries submitted in chat also appear under Queries."
      />

      {selected ? (
        <div className="rounded-2xl border bg-white p-5" style={cardStyle}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to all conversations
              </button>
              <h2 className="text-lg font-bold text-slate-900">{selected.contact?.name || "Anonymous visitor"}</h2>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {selected.contact?.phone && (
                  <a href={`tel:${selected.contact.phone}`} className="inline-flex items-center gap-1 hover:text-indigo-600">
                    <Phone className="h-3.5 w-3.5" /> {selected.contact.phone}
                  </a>
                )}
                {selected.contact?.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {selected.contact.email}
                  </span>
                )}
                <span>Started {fmtDateTime(selected.createdAt)}</span>
                {selected.pageUrl && (
                  <a href={selected.pageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-indigo-600">
                    <ExternalLink className="h-3.5 w-3.5" /> Page
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={selected.status} />
              <button
                type="button"
                onClick={() => setToDelete(selected)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                aria-label="Delete conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ChatTranscript messages={selected.messages} className="max-h-[60vh]" />
        </div>
      ) : (
        <div className="rounded-2xl border bg-white" style={cardStyle}>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setSearch(query.trim());
              }}
              className="relative min-w-[220px] flex-1"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, phone or message text…"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </form>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value as "" | Status);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">All conversations</option>
              <option value="lead">Lead captured</option>
              <option value="open">Chat only</option>
            </select>
            <span className="text-xs text-slate-500">{total} total</span>
          </div>

          {loading || loadingDetail ? (
            <AdminSpinner label={loadingDetail ? "Loading conversation..." : "Loading conversations..."} />
          ) : items.length === 0 ? (
            <p className="p-10 text-center text-sm text-slate-500">No conversations yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item._id} className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50">
                  <button type="button" onClick={() => open(item._id)} className="min-w-0 flex-1 text-left cursor-pointer">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{item.contact?.name || "Anonymous visitor"}</span>
                      {item.contact?.phone && <span className="text-xs text-slate-500">{item.contact.phone}</span>}
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-600">{item.firstQuestion || "—"}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.messageCount} messages · Last activity {fmtDateTime(item.lastMessageAt)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(item)}
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 p-4 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
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
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove(toDelete)}
        title="Delete conversation?"
        message="This chat transcript will be deleted permanently. Any enquiry it created stays in Queries."
        confirmText="Delete"
      />
    </div>
  );
};

export default AdminChatConversations;
