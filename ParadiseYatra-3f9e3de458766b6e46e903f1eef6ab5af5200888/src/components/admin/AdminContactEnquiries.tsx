"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Clock, CheckCircle, Eye, Search, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

interface ContactEnquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source?: string;
  status: "new" | "read" | "resolved";
  submittedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: "New", color: "#6366f1", bg: "rgba(99,102,241,0.1)", icon: Clock },
  read: { label: "Read", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Eye },
  resolved: { label: "Resolved", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle },
};

const AdminContactEnquiries = () => {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "read" | "resolved">("all");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/contact-form?limit=200", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (data.success) {
        setEnquiries(data.data);
      } else {
        toast.error(data.message || "Failed to fetch contact enquiries");
      }
    } catch (error) {
      console.error("Error fetching contact enquiries:", error);
      toast.error("Error fetching contact enquiries");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: ContactEnquiry["status"]) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/contact-form/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setEnquiries((prev) => prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e)));
        toast.success("Status updated");
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  const filtered = enquiries.filter((e) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (e.name || "").toLowerCase().includes(search) ||
      (e.email || "").toLowerCase().includes(search) ||
      (e.phone || "").includes(search);
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    read: enquiries.filter((e) => e.status === "read").length,
    resolved: enquiries.filter((e) => e.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative mx-auto w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-sm text-slate-500">Loading contact enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)" }}
      >
        <div
          className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.3)" }}>
                <MessageSquare className="w-4 h-4 text-indigo-300" />
              </div>
              <h1 className="text-xl font-bold text-white">Contact Enquiries</h1>
            </div>
            <p className="text-slate-400 text-sm">Submissions from the public Contact Us form</p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            {enquiries.length} Total
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "new", "read", "resolved"] as const).map((s) => {
          const cfg = s === "all" ? { label: "All", color: "#6366f1", bg: "rgba(99,102,241,0.1)" } : statusConfig[s];
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={
                isActive
                  ? { background: cfg.color, color: "#fff", boxShadow: `0 4px 14px ${cfg.color}55` }
                  : { background: cfg.bg, color: cfg.color }
              }
            >
              {cfg.label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={isActive ? { background: "rgba(255,255,255,0.2)" } : { background: "rgba(0,0,0,0.07)" }}
              >
                {statusCounts[s]}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="flex items-center gap-3 p-4 rounded-2xl border"
        style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <Search className="text-slate-400 w-5 h-5 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-sm"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">No enquiries found.</div>
        )}
        {filtered.map((enquiry) => {
          const cfg = statusConfig[enquiry.status] || statusConfig.new;
          const StatusIcon = cfg.icon;
          return (
            <div
              key={enquiry._id}
              className="p-5 rounded-2xl border bg-white"
              style={{ borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">{enquiry.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{enquiry.email || "Not provided"}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{enquiry.phone}</span>
                  </div>
                </div>
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {cfg.label}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{enquiry.subject}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{enquiry.message || "No message provided."}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  {new Date(enquiry.submittedAt).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  {(["new", "read", "resolved"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(enquiry._id, s)}
                      disabled={enquiry.status === s}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: statusConfig[s].bg, color: statusConfig[s].color }}
                    >
                      Mark {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminContactEnquiries;