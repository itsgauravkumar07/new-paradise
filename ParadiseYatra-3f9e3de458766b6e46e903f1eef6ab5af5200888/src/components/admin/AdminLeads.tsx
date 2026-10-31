"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  MessageSquare,
  Search,
  Filter,
  Users,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Lead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  destination: string;
  budget: string;
  message: string;
  status: "new" | "contacted" | "qualified" | "lost" | "won";
  timestamp: string;
  followUpDate?: string | null;
  packageTitle?: string;
  packagePrice?: string;
  newsletterConsent?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: "New", color: "#6366f1", bg: "rgba(99,102,241,0.1)", icon: Clock },
  contacted: { label: "Contacted", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Mail },
  qualified: { label: "Qualified", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle },
  won: { label: "Won", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: TrendingUp },
  lost: { label: "Lost", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: XCircle },
};

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [followUpFilter, setFollowUpFilter] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (data.success) {
        setLeads(data.data);
      } else {
        toast.error("Failed to fetch leads");
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Error fetching leads");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/leads/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setLeads(leads.map((lead) =>
          lead._id === id ? { ...lead, status: newStatus as Lead["status"] } : lead
        ));
        toast.success("Status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  const updateFollowUpDate = async (id: string, date: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/leads/${id}/followup`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ followUpDate: date || null }),
      });
      const data = await response.json();
      if (data.success) {
        setLeads(leads.map((lead) =>
          lead._id === id ? { ...lead, followUpDate: date || null } : lead
        ));
        toast.success(date ? "Follow-up date saved" : "Follow-up date cleared");
      } else {
        toast.error("Failed to save date");
      }
    } catch (error) {
      console.error("Error updating follow-up date:", error);
      toast.error("Error saving date");
    }
  };


  // const filteredLeads = leads.filter((lead) => {
  //   const matchesSearch =
  //     lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     lead.phone.includes(searchTerm);
  //   const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
  //   const matchesFollowUp = !followUpFilter || (
  //     lead.followUpDate && 
  //     new Date(lead.followUpDate).toISOString().split('T')[0] === followUpFilter
  //   );

  //   return matchesSearch && matchesStatus && matchesFollowUp;
  // });



//New function new dev
  const filteredLeads = leads.filter((lead) => {
  console.log("🔍 Checking lead:", lead);
  console.log("fullName:", lead.fullName);
  console.log("email:", lead.email);
  console.log("phone:", lead.phone);

  const search = searchTerm.toLowerCase();

  const matchesSearch =
    (lead.fullName || "").toLowerCase().includes(search) ||
    (lead.email || "").toLowerCase().includes(search) ||
    (lead.phone || "").includes(search);

  const matchesStatus =
    statusFilter === "all" || lead.status === statusFilter;

  const matchesFollowUp =
    !followUpFilter ||
    (
      lead.followUpDate &&
      new Date(lead.followUpDate).toISOString().split("T")[0] === followUpFilter
    );

  return matchesSearch && matchesStatus && matchesFollowUp;
});

  const statusCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    won: leads.filter((l) => l.status === "won").length,
    lost: leads.filter((l) => l.status === "lost").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative mx-auto w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-sm text-slate-500">Loading queries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)" }}
      >
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.3)" }}>
                <Users className="w-4 h-4 text-indigo-300" />
              </div>
              <h1 className="text-xl font-bold text-white">Queries Management</h1>
            </div>
            <p className="text-slate-400 text-sm">Track and manage all customer inquiries in one place</p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            <TrendingUp className="w-4 h-4" />
            {leads.length} Total
          </div>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "new", "contacted", "qualified", "won", "lost"] as const).map((s) => {
          const cfg = s === "all"
            ? { label: "All", color: "#6366f1", bg: "rgba(99,102,241,0.1)" }
            : statusConfig[s];
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

      {/* Search and Follow-up Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Search */}
        <div
          className="flex-1 flex items-center gap-3 p-4 rounded-2xl border w-full"
          style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <Search className="text-slate-400 w-5 h-5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-700 text-xs font-semibold">
              Clear
            </button>
          )}
        </div>

        {/* Follow-Up Date Filter */}
        <div
          className="flex items-center gap-3 p-4 rounded-2xl border w-full sm:w-auto"
          style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <Calendar className="text-indigo-400 w-5 h-5 flex-shrink-0" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Filter by Follow-Up:</span>
            <input
              type="date"
              value={followUpFilter}
              onChange={(e) => setFollowUpFilter(e.target.value)}
              className="text-sm outline-none bg-transparent text-slate-800 cursor-pointer font-medium"
            />
          </div>
          {followUpFilter && (
            <button onClick={() => setFollowUpFilter("")} className="text-slate-400 hover:text-red-500 text-xs font-semibold ml-2">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filteredLeads.length}</span> of{" "}
          <span className="font-semibold text-slate-700">{leads.length}</span> queries
        </p>
      </div>

      {/* Leads table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                {["Contact Info", "Requirements", "Package Interest", "Lead Picked Date", "Follow-Up Date", "Status"].map((h, idx) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest ${idx === 0 ? "sticky left-0 z-20 shadow-[1px_0_0_rgba(0,0,0,0.06)]" : ""}`}
                    style={{ color: "#475569", background: idx === 0 ? "#f8fafc" : "transparent" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Filter className="w-10 h-10 text-slate-200" />
                      <p className="text-slate-600 font-medium">No queries match your filters</p>
                      <button
                        onClick={() => { setSearchTerm(""); setStatusFilter("all"); setFollowUpFilter(""); }}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-bold"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, i) => {
                  const cfg = statusConfig[lead.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr
                      key={lead._id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = "#f0f4ff")}
                      onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? "#fff" : "#fafafa")}
                    >
                      {/* Contact */}
                      <td className="px-5 py-4 sticky left-0 z-10 shadow-[1px_0_0_rgba(0,0,0,0.04)]" style={{ background: "inherit", minWidth: "250px" }}>
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                          >
                            {/* {lead.fullName.charAt(0).toUpperCase()} */}

                            {/* new change dev */}

                            {(lead.fullName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-[15px]">{lead.fullName || "Unknown"}</p>
                            <div className="flex items-center gap-1.5 text-[13px] text-slate-600 mt-1 font-medium">
                              <Mail className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="truncate max-w-[180px]">{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[13px] text-slate-600 mt-0.5 font-medium">
                              <Phone className="w-3.5 h-3.5 text-green-500" />
                              {lead.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Requirements */}
                      <td className="px-5 py-4">
                        <div className="space-y-2 text-[13px]">
                          {lead.destination && (
                            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                              <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                              {lead.destination}
                            </div>
                          )}
                          {lead.budget && (
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                              <IndianRupee className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              {lead.budget}
                            </div>
                          )}
                          {lead.message && (
                            <div className="flex items-start gap-1.5 mt-1">
                              <MessageSquare className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                              <span
                                className="text-[13px] text-slate-600 font-medium line-clamp-2 max-w-[200px]"
                                title={lead.message}
                              >
                                {lead.message}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Package */}
                      <td className="px-5 py-4">
                        {lead.packageTitle ? (
                          <div>
                            <p
                              className="text-[13px] font-bold leading-tight"
                              style={{ color: "#4f46e5" }}
                            >
                              {lead.packageTitle}
                            </p>
                            {lead.packagePrice && (
                              <p className="text-xs text-slate-500 mt-1 font-semibold">{lead.packagePrice}</p>
                            )}
                          </div>
                        ) : (
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: "#e2e8f0", color: "#475569" }}
                          >
                            General Inquiry
                          </span>
                        )}
                      </td>

                      {/* Lead Picked Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <div>
                            <div>{new Date(lead.timestamp).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            <div className="text-[11px] text-slate-500">{new Date(lead.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                        </div>
                      </td>

                      {/* Follow-Up Date */}
                      <td className="px-5 py-4">
                        <div className="w-full min-w-[140px]">
                          <input
                            type="date"
                            value={
                              lead.followUpDate
                                ? new Date(lead.followUpDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) => updateFollowUpDate(lead._id, e.target.value)}
                            className="text-[13px] rounded-lg px-2.5 py-2 outline-none border transition-all w-full cursor-pointer shadow-sm"
                            style={{
                              borderColor: lead.followUpDate ? "#6366f1" : "rgba(0,0,0,0.15)",
                              background: lead.followUpDate ? "rgba(99,102,241,0.08)" : "#fff",
                              color: lead.followUpDate ? "#4338ca" : "#475569",
                              fontWeight: lead.followUpDate ? 700 : 500,
                            }}
                          />
                          {lead.followUpDate && (
                            <button
                              onClick={() => updateFollowUpDate(lead._id, "")}
                              className="text-[11px] mt-1.5 transition-colors block w-full text-right font-bold"
                              style={{ color: "#ef4444" }}
                              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#b91c1c")}
                              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#ef4444")}
                            >
                              ✕ Clear
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="w-full xl:w-auto flex-1">
                          <div
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold mb-2"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {cfg.label}
                          </div>
                          <select
                            value={lead.status}
                            onChange={(e) => updateStatus(lead._id, e.target.value)}
                            className="text-[13px] rounded-lg px-2.5 py-2 outline-none cursor-pointer border transition-colors w-full font-semibold shadow-sm"
                            style={{
                              borderColor: "rgba(0,0,0,0.15)",
                              background: "#fff",
                              color: "#1e293b",
                            }}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;
