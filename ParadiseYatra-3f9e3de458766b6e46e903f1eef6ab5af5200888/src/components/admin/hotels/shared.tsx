"use client";

import type { ComponentType, ReactNode } from "react";

/** Calls the hotel admin API through the Next.js proxy with the logged-in admin's token. */
export async function adminFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";
  const url = `/api/hotels-admin?p=${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export const AdminPageHeader = ({
  icon: Icon,
  title,
  subtitle,
  right,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  right?: ReactNode;
}) => (
  <div
    className="relative rounded-2xl p-6 overflow-hidden"
    style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)" }}
  >
    <div
      className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10"
      style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
    />
    <div className="relative flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.3)" }}>
            <Icon className="w-4 h-4 text-indigo-300" />
          </div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
        <p className="text-slate-400 text-sm">{subtitle}</p>
      </div>
      {right}
    </div>
  </div>
);

export const AdminSpinner = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="relative mx-auto w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

export const cardStyle = { borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };

export const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
export const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5";
