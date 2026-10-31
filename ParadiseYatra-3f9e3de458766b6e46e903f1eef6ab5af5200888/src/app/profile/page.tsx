"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarDays,
  CreditCard,
  Loader2,
  MapPin,
  Receipt,
  Ticket,
  Users,
} from "lucide-react";

type PurchaseStatus = "created" | "paid" | "failed" | "refunded";

interface PurchaseItem {
  _id: string;
  internalOrderId: string;
  receiptNumber: string;
  packageSlug: string;
  packageTitle: string;
  destination?: string;
  travelDate?: string;
  travellers: number;
  unitLabel: string;
  amount: number;
  currency: string;
  status: PurchaseStatus;
  createdAt: string;
  paidAt?: string;
}

const formatMoney = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusBadgeClasses: Record<PurchaseStatus, string> = {
  created: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function ProfilePage() {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const fetchPurchases = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/purchases/my", {
          headers: {
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
          },
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) {
            const message = String(data?.message || "").toLowerCase();
            if (
              message.includes("user not found") ||
              message.includes("invalid token") ||
              message.includes("access denied")
            ) {
              setError("Your session expired. Please login again.");
              logout();
              return;
            }
          }
          throw new Error(data?.message || "Failed to fetch bookings");
        }
        setPurchases(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [authLoading, user, token]);

  const summary = useMemo(() => {
    const total = purchases.length;
    const paid = purchases.filter((p) => p.status === "paid").length;
    const upcoming = purchases.filter(
      (p) =>
        p.status === "paid" &&
        p.travelDate &&
        !Number.isNaN(new Date(p.travelDate).getTime()) &&
        new Date(p.travelDate) >= new Date()
    ).length;
    return { total, paid, upcoming };
  }, [purchases]);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 md:p-8 shadow-sm mb-5 sm:mb-6">
          <p className="!text-xs !font-black uppercase tracking-widest !text-blue-600">Profile</p>
          <h1 className="mt-1 !text-2xl sm:!text-3xl md:!text-4xl !font-black !text-slate-900 leading-tight">
            My Bookings
          </h1>
          <p className="mt-2 !text-slate-600 !text-sm sm:!text-base">
            Track your purchased packages, payment status, and travel plans in one place.
          </p>
        </section>

        {authLoading || loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900">Login Required</h2>
            <p className="mt-2 text-slate-600">Please login to view your bookings.</p>
            <Link
              href="/login"
              className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 font-semibold">
            {error}
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-widest font-black !text-slate-500">Total Bookings</p>
                <p className="mt-2 text-3xl !font-black !text-slate-900">{summary.total}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-widest font-black !text-slate-500">Confirmed</p>
                <p className="mt-2 text-3xl !font-black !text-emerald-700">{summary.paid}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-widest font-black !text-slate-500">Upcoming Trips</p>
                <p className="mt-2 text-3xl !font-black !text-blue-700">{summary.upcoming}</p>
              </div>
            </section>

            {purchases.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <Ticket className="w-10 h-10 text-slate-400 mx-auto" />
                <h2 className="mt-3 text-xl font-bold text-slate-900">No bookings yet</h2>
                <p className="mt-2 text-slate-600">Once you purchase a package, it will appear here.</p>
                <Link
                  href="/package"
                  className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-white font-bold hover:bg-blue-700 transition-colors"
                >
                  Explore Packages
                </Link>
              </div>
            ) : (
              <section className="space-y-3 sm:space-y-4">
                {purchases.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <h3 className="!text-lg sm:!text-xl !font-black !text-slate-900 leading-tight break-words">
                          {item.packageTitle}
                        </h3>
                        <p className="!text-sm !text-slate-500 mt-1 inline-flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 !text-blue-500" />
                          {item.destination || "Destination"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide w-fit ${statusBadgeClasses[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 !text-sm">
                      <p className="!text-slate-600 inline-flex items-center gap-2 min-w-0 flex-wrap">
                        <Receipt className="w-4 h-4 text-slate-400" />
                        Receipt: <span className="!font-semibold !text-slate-800 break-all">{item.receiptNumber}</span>
                      </p>
                      <p className="!text-slate-600 inline-flex items-center gap-2 min-w-0 flex-wrap">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        Amount: <span className="font-semibold text-slate-800 break-words">{formatMoney(item.amount, item.currency)}</span>
                      </p>
                      <p className="text-slate-600 inline-flex items-center gap-2 min-w-0 flex-wrap">
                        <Users className="w-4 h-4 text-slate-400" />
                        Travellers: <span className="font-semibold text-slate-800">{item.travellers}</span>
                      </p>
                      <p className="text-slate-600 inline-flex items-center gap-2 min-w-0 flex-wrap">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        Travel Date: <span className="font-semibold text-slate-800 break-words">{formatDate(item.travelDate)}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
                      <p className="text-xs text-slate-500 break-all">
                        Booked on {formatDate(item.createdAt)} • Order ID: {item.internalOrderId}
                      </p>
                      <Link
                        href={`/package/${encodeURIComponent(item.packageSlug)}`}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors w-fit"
                      >
                        View Package
                      </Link>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
