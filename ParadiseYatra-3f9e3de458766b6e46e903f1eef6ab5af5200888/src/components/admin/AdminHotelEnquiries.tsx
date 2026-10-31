"use client";

import { useCallback, useEffect, useState } from "react";
import { BedDouble, Phone, Mail, CalendarDays, Users, Search, Trash2, Clock, PhoneCall, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { adminFetch, AdminPageHeader, AdminSpinner, cardStyle } from "./hotels/shared";

type Status = "new" | "contacted" | "booked" | "closed";

interface Enquiry {
  _id: string;
  hotelName: string;
  hotelSlug?: string;
  city?: string;
  name: string;
  phone: string;
  email?: string;
  checkIn?: string;
  checkOut?: string;
  adults: number;
  children: number;
  rooms: number;
  message?: string;
  status: Status;
  adminNotes?: string;
  submittedAt: string;
}

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: "New", color: "#6366f1", bg: "rgba(99,102,241,0.1)", icon: Clock },
  contacted: { label: "Contacted", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: PhoneCall },
  booked: { label: "Booked", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle2 },
  closed: { label: "Closed", color: "#64748b", bg: "rgba(100,116,139,0.12)", icon: XCircle },
};
const STATUSES: Status[] = ["new", "contacted", "booked", "closed"];

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

const AdminHotelEnquiries = () => {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [counts, setCounts] = useState<Record<Status, number>>({ new: 0, contacted: 0, booked: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Enquiry | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      const q = new URLSearchParams({ limit: "200" });
      if (statusFilter !== "all") q.set("status", statusFilter);
      if (debounced.trim()) q.set("q", debounced.trim());
      const data = await adminFetch<{ data: Enquiry[]; statusCounts: Record<Status, number> }>(`enquiries?${q.toString()}`);
      setItems(data.data || []);
      setCounts(data.statusCounts);
      setNotes((prev) => {
        const next = { ...prev };
        (data.data || []).forEach((e) => { if (next[e._id] === undefined) next[e._id] = e.adminNotes || ""; });
        return next;
      });
    } catch (e) {
      toast.error((e as Error).message || "Failed to load hotel enquiries");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debounced]);

  useEffect(() => { load(); }, [load]);

  const patch = async (id: string, body: { status?: Status; adminNotes?: string }, okMsg: string) => {
    try {
      await adminFetch(`enquiries/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      toast.success(okMsg);
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Failed to update");
    }
  };

  const remove = async (e: Enquiry) => {
    try {
      await adminFetch(`enquiries/${e._id}`, { method: "DELETE" });
      toast.success("Enquiry deleted");
      await load();
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete");
    }
  };

  const total = counts.new + counts.contacted + counts.booked + counts.closed;

  if (loading) return <AdminSpinner label="Loading hotel enquiries..." />;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon={BedDouble}
        title="Hotel Enquiries"
        subtitle="People who clicked “Book this hotel” and sent their stay details"
        right={
          <div className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
            {total} Total
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => {
          const cfg = s === "all" ? { label: "All", color: "#6366f1", bg: "rgba(99,102,241,0.1)" } : statusConfig[s];
          const active = statusFilter === s;
          return (
            <button
              key={s} onClick={() => setStatusFilter(s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={active ? { background: cfg.color, color: "#fff", boxShadow: `0 4px 14px ${cfg.color}55` } : { background: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={active ? { background: "rgba(255,255,255,0.2)" } : { background: "rgba(0,0,0,0.07)" }}>
                {s === "all" ? total : counts[s]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl border bg-white" style={cardStyle}>
        <Search className="text-slate-400 w-5 h-5 flex-shrink-0" />
        <input
          type="text" placeholder="Search by name, phone, email, hotel or city..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none text-sm"
        />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No hotel enquiries found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((e) => {
            const cfg = statusConfig[e.status] || statusConfig.new;
            const Icon = cfg.icon;
            const guests = e.adults + e.children;
            return (
              <div key={e._id} className="p-5 rounded-2xl border bg-white" style={cardStyle}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{e.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                      <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-indigo-600"><Phone className="w-3.5 h-3.5" />{e.phone}</a>
                      {e.email && <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-indigo-600"><Mail className="w-3.5 h-3.5" />{e.email}</a>}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon className="w-3.5 h-3.5" />{cfg.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 text-sm text-slate-700 mb-3">
                  <div className="flex items-start gap-2"><BedDouble className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" /><div><p className="font-semibold">{e.hotelName}</p>{e.city && <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{e.city}</p>}</div></div>
                  <div className="flex items-start gap-2"><CalendarDays className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" /><p>{e.checkIn && e.checkOut ? `${fmtDate(e.checkIn)} → ${fmtDate(e.checkOut)}` : "Dates not given"}</p></div>
                  <div className="flex items-start gap-2"><Users className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" /><p>{guests} guest{guests > 1 ? "s" : ""} ({e.adults} adult{e.adults > 1 ? "s" : ""}{e.children ? `, ${e.children} child${e.children > 1 ? "ren" : ""}` : ""}), {e.rooms} room{e.rooms > 1 ? "s" : ""}</p></div>
                </div>

                {e.message && <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3">{e.message}</p>}

                <div className="mb-3">
                  <textarea
                    rows={2} placeholder="Internal notes (only staff can see this)..." value={notes[e._id] ?? ""}
                    onChange={(ev) => setNotes((p) => ({ ...p, [e._id]: ev.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  {(notes[e._id] ?? "") !== (e.adminNotes || "") && (
                    <button onClick={() => patch(e._id, { adminNotes: notes[e._id] ?? "" }, "Notes saved")} className="mt-1.5 text-xs font-bold text-indigo-600 hover:underline">Save notes</button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Received {new Date(e.submittedAt).toLocaleString("en-IN")}</span>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s} onClick={() => patch(e._id, { status: s }, `Marked ${statusConfig[s].label}`)} disabled={e.status === s}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: statusConfig[s].bg, color: statusConfig[s].color }}
                      >
                        {statusConfig[s].label}
                      </button>
                    ))}
                    <button onClick={() => setToDelete(e)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete" aria-label="Delete enquiry"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove(toDelete)}
        title="Delete enquiry?"
        message={`The enquiry from ${toDelete?.name} will be deleted permanently.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default AdminHotelEnquiries;
