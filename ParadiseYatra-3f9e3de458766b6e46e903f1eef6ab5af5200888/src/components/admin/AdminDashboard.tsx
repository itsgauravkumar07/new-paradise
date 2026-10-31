"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  MapPin,
  FileText,
  Users,
  BarChart2,
  ArrowUpRight,
  Activity,
  Globe,
  Zap,
  Database,
  CheckCircle,
  Clock,
} from "lucide-react";

const AdminDashboard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    {
      title: "Total Packages",
      value: "46",
      change: "+12%",
      positive: true,
      icon: MapPin,
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      bg: "rgba(99,102,241,0.08)",
    },
    {
      title: "Active Blogs",
      value: "72",
      change: "+8%",
      positive: true,
      icon: FileText,
      gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      bg: "rgba(6,182,212,0.08)",
    },
    {
      title: "Total Queries",
      value: "541",
      change: "+23%",
      positive: true,
      icon: Users,
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      bg: "rgba(16,185,129,0.08)",
    },
    {
      title: "Testimonials",
      value: "13",
      change: "+3",
      positive: true,
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
      bg: "rgba(245,158,11,0.08)",
    },
  ];

  const recentActivities = [
    {
      action: "New query received",
      description: "Andaman & Nicobar Islands package inquiry",
      time: "2 hours ago",
      color: "#6366f1",
      icon: Users,
    },
    {
      action: "Blog published",
      description: "Top Monsoon Destinations 2026",
      time: "4 hours ago",
      color: "#06b6d4",
      icon: FileText,
    },
    {
      action: "Package updated",
      description: "Shimla Manali Adventure Package",
      time: "Yesterday",
      color: "#10b981",
      icon: MapPin,
    },
    {
      action: "SEO updated",
      description: "Homepage meta tags refreshed",
      time: "2 days ago",
      color: "#f59e0b",
      icon: Globe,
    },
    {
      action: "Testimonial added",
      description: "New customer review from Goa trip",
      time: "3 days ago",
      color: "#8b5cf6",
      icon: Activity,
    },
  ];

  const systemStatus = [
    { label: "Website", status: "Online", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Database", status: "Healthy", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "API Server", status: "Running", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
    { label: "Storage", status: "75% Used", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
        />
        <div
          className="absolute right-24 -bottom-6 w-28 h-28 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
        />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-300 text-sm font-medium mb-1">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h1 className="text-2xl font-bold text-white mb-1">Welcome back, Admin 👋</h1>
              <p className="text-slate-400 text-sm">
                Here's what's happening with your Paradise Yatra business today.
              </p>
            </div>
            <div
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-green-300"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}
            >
              <CheckCircle className="w-4 h-4" />
              All Systems Normal
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-2xl p-5 border transition-all duration-300 group"
              style={{
                background: "#ffffff",
                borderColor: "rgba(0,0,0,0.06)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transition: `all 0.4s ease ${i * 80}ms`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: stat.bg }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: stat.gradient.includes("6366f1") ? "#6366f1" : stat.gradient.includes("06b6d4") ? "#06b6d4" : stat.gradient.includes("10b981") ? "#10b981" : "#f59e0b" }}
                  />
                </div>
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                  style={
                    stat.positive
                      ? { color: "#10b981", background: "rgba(16,185,129,0.1)" }
                      : { color: "#ef4444", background: "rgba(239,68,68,0.1)" }
                  }
                >
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activities */}
        <div
          className="lg:col-span-2 rounded-2xl border overflow-hidden"
          style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h2 className="font-semibold text-slate-800">Recent Activities</h2>
            </div>
            <span className="text-xs text-slate-400">Last 7 days</span>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {recentActivities.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${activity.color}18` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: activity.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700">{activity.action}</p>
                      <p className="text-sm text-slate-400 truncate">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* System Status */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
          >
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-slate-800">System Status</h3>
            </div>
            <div className="p-5 space-y-3">
              {systemStatus.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{s.label}</span>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: s.color, background: s.bg }}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "#fff", borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
          >
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              <h3 className="font-semibold text-slate-800">Quick Stats</h3>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Packages Published", val: 46, max: 100, color: "#6366f1" },
                { label: "Blogs Live", val: 72, max: 100, color: "#06b6d4" },
                { label: "Queries Resolved", val: 68, max: 100, color: "#10b981" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold text-slate-700">{item.val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: mounted ? `${item.val}%` : "0%", background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;