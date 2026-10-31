"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  X,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { roleLabels, type StaffRole } from "@/lib/adminPermissions";

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

const ASSIGNABLE_ROLES: { value: StaffRole; label: string; description: string }[] = [
  {
    value: "developer",
    label: "Developer",
    description: "Packages, Fixed Departures, Itinerary, Blogs, SEO, FAQ, Footer",
  },
  {
    value: "marketer",
    label: "Digital Marketer",
    description: "Blogs and SEO settings",
  },
  {
    value: "packageManager",
    label: "Package Manager",
    description: "Packages, Fixed Departures, and Itinerary",
  },
  {
    value: "legal",
    label: "Legal Team",
    description: "Legal pages: Privacy, Terms, Cookie and Refund policies",
  },
];

const roleBadgeStyle: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#eef2ff", text: "#4338ca" },
  developer: { bg: "#ecfdf5", text: "#047857" },
  marketer: { bg: "#fff7ed", text: "#c2410c" },
  packageManager: { bg: "#eff6ff", text: "#1d4ed8" },
  legal: { bg: "#f5f3ff", text: "#6d28d9" },
};

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

const AdminStaffAccounts = () => {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "developer" as StaffRole });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("adminToken");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/staff", { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load staff accounts");
      setStaff(data.staff || []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load staff accounts");
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const openModal = () => {
    setForm({ name: "", email: "", password: generatePassword(), role: "developer" });
    setFormError(null);
    setShowPassword(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFormError("Name, email and password are all required.");
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create account");

      setIsModalOpen(false);
      setSuccessMessage(`${roleLabels[form.role]} account created for ${form.email}.`);
      fetchStaff();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Staff Accounts</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Create and review Developer, Marketer and Package Manager logins.
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Create Account
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}

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
              onClick={fetchStaff}
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        ) : staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <ShieldCheck className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No staff accounts yet</p>
            <p className="text-xs text-slate-400 mt-1">Create one to give someone scoped dashboard access.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Email</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Role</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => {
                const badge = roleBadgeStyle[member.role] || roleBadgeStyle.developer;
                return (
                  <tr key={member._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{member.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{member.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {roleLabels[member.role] || member.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          member.isActive ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            member.isActive ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />
                        {member.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(member.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Account Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create Staff Account</h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  placeholder="e.g. Priya Sharma"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  placeholder="name@paradiseyatra.com"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
                <div className="space-y-2">
                  {ASSIGNABLE_ROLES.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                        form.role === r.value
                          ? "border-indigo-300 bg-indigo-50/60"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        checked={form.role === r.value}
                        onChange={() => setForm((f) => ({ ...f, role: r.value }))}
                        className="mt-0.5"
                        disabled={isSubmitting}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{r.label}</p>
                        <p className="text-xs text-slate-500">{r.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600">Temporary password</label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    disabled={isSubmitting}
                  >
                    Regenerate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-800 font-mono outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Share this with them directly — there's no invite email yet, so copy it before saving.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffAccounts;