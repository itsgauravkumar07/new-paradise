"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  History,
  PlusCircle,
  PencilLine,
} from "lucide-react";
import { roleLabels } from "@/lib/adminPermissions";

interface AuditLogEntry {
  _id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: "create" | "update";
  section: string;
  documentId?: string;
  method: string;
  path: string;
  createdAt: string;
}

const sectionLabels: Record<string, string> = {
  packages: "Packages",
  fixedDepartures: "Fixed Departures",
  blogs: "Blogs",
  seo: "SEO",
  faq: "FAQ",
  footer: "Footer",
  "legal-pages": "Legal Pages",
  offers: "Offers",
  offerBar: "Offer Bar",
  customerMoments: "Customer Gallery",
};

const roleBadgeStyle: Record<string, { bg: string; text: string }> = {
  developer: { bg: "#ecfdf5", text: "#047857" },
  marketer: { bg: "#fff7ed", text: "#c2410c" },
  packageManager: { bg: "#eff6ff", text: "#1d4ed8" },
  legal: { bg: "#f5f3ff", text: "#6d28d9" },
};

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminAuditLog = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/audit-logs?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load activity log");
      setLogs(data.logs || []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load activity log");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Activity Log</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Every create or edit made by a staff account (Developer, Marketer, Package Manager).
            Your own actions as Admin aren&apos;t logged here.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-sm text-slate-600 mb-3">{loadError}</p>
            <button
              onClick={fetchLogs}
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <History className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No activity yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Staff edits and creations will show up here as they happen.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Who</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Role</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Action</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Section</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const badge = roleBadgeStyle[log.userRole] || roleBadgeStyle.developer;
                return (
                  <tr key={log._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{log.userName}</p>
                      <p className="text-xs text-slate-400">{log.userEmail}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {roleLabels[log.userRole] || log.userRole}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          log.action === "create" ? "text-emerald-600" : "text-indigo-600"
                        }`}
                      >
                        {log.action === "create" ? (
                          <PlusCircle className="w-3.5 h-3.5" />
                        ) : (
                          <PencilLine className="w-3.5 h-3.5" />
                        )}
                        {log.action === "create" ? "Created" : "Updated"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {sectionLabels[log.section] || log.section}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{formatTimestamp(log.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLog;