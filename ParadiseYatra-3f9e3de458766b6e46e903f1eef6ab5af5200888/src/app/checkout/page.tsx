"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CheckoutPackage {
  _id: string;
  slug: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  priceType?: "per_person" | "per_couple";
  image?: string;
  checkoutType?: "package" | "fixed-departure";
  departureDate?: string;
}

interface PaymentResultModalState {
  open: boolean;
  status: "success" | "failed";
  title: string;
  message: string;
  orderId?: string | null;
  paymentId?: string | null;
  internalOrderId?: string | null;
  receiptNumber?: string | null;
  amount?: string | null;
}

type CheckoutField = "fullName" | "email" | "phone" | "travelDate";

const formatPrice = (amount: number) => `₹${(amount || 0).toLocaleString("en-IN")}`;
const getTodayDateInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const checkoutType: "package" | "fixed-departure" =
    searchParams.get("type") === "fixed-departure" ? "fixed-departure" : "package";
  const selectedDepartureDateParam = searchParams.get("departureDate") || "";
  const { user } = useAuth();

  const [pkg, setPkg] = useState<CheckoutPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [paymentMeta, setPaymentMeta] = useState<{
    internalOrderId?: string | null;
    receiptNumber?: string | null;
    paymentId?: string | null;
    travelDate?: string | null;
    travellers?: number | null;
    unitLabel?: string | null;
  } | null>(null);
  const [paymentResultModal, setPaymentResultModal] = useState<PaymentResultModalState>({
    open: false,
    status: "success",
    title: "",
    message: "",
  });

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    travelDate: "",
    travellers: 1,
    note: "",
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CheckoutField, string>>>({});
  const todayDateInputValue = useMemo(() => getTodayDateInputValue(), []);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!slug) {
        setError("Missing package slug. Please go back and try again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        if (checkoutType === "fixed-departure") {
          const response = await fetch(`/api/fixed-departures/slug/${slug}`, { cache: "no-store" });
          if (!response.ok) {
            throw new Error("Fixed departure not found");
          }

          const data = await response.json();
          const targetDate = selectedDepartureDateParam;
          let selectedBatchPrice = Number(data?.price || 0);

          if (targetDate && Array.isArray(data?.departures)) {
            const matched = data.departures.find((d: { date?: string; status?: string; price?: number }) => {
              if (!d?.date) return false;
              const parsed = new Date(d.date);
              if (Number.isNaN(parsed.getTime())) return false;
              const dateOnly = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
              return dateOnly === targetDate && d.status !== "soldout";
            });
            if (matched && Number(matched.price) > 0) {
              selectedBatchPrice = Number(matched.price);
            }
          }

          const defaultTravelDate = targetDate || (() => {
            const parsed = new Date(data?.departureDate);
            if (Number.isNaN(parsed.getTime())) return "";
            return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
          })();

          setForm((prev) => ({
            ...prev,
            travelDate: prev.travelDate || defaultTravelDate,
          }));

          setPkg({
            _id: data?._id || slug,
            slug: data?.slug || slug,
            title: data?.title || "Fixed Departure",
            destination: data?.destination || data?.location || "Destination",
            duration: data?.duration || "N/A",
            price: selectedBatchPrice,
            priceType: "per_person",
            image: Array.isArray(data?.images) ? data?.images?.[0] : data?.image,
            checkoutType: "fixed-departure",
            departureDate: defaultTravelDate,
          });
        } else {
          let response = await fetch(`/api/all-packages/${slug}`, { cache: "no-store" });
          if (!response.ok) {
            response = await fetch(`/api/packages/slug/${slug}`, { cache: "no-store" });
          }

          if (!response.ok) {
            throw new Error("Package not found");
          }

          const raw = await response.json();
          const data = raw?.package || raw?.destination || raw?.data || raw;

          setPkg({
            _id: data?._id || slug,
            slug: data?.slug || slug,
            title: data?.title || data?.name || "Travel Package",
            destination: data?.destination || data?.location || "Destination",
            duration: data?.duration || "N/A",
            price: Number(data?.price || 0),
            priceType: data?.priceType || "per_person",
            image: Array.isArray(data?.images) ? data?.images?.[0] : data?.image,
            checkoutType: "package",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load package details");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [slug, checkoutType, selectedDepartureDateParam]);

  const unitLabel = pkg?.priceType === "per_couple" ? "Per Couple" : "Per Person";

  const payableAmount = useMemo(() => {
    if (!pkg) return 0;
    if (pkg.priceType === "per_couple") {
      const couples = Math.max(1, Math.ceil((form.travellers || 1) / 2));
      return couples * pkg.price;
    }
    return (form.travellers || 1) * pkg.price;
  }, [pkg, form.travellers]);
  const chargeUnits =
    pkg?.priceType === "per_couple"
      ? Math.max(1, Math.ceil((form.travellers || 1) / 2))
      : Math.max(1, form.travellers || 1);
  const chargeUnitLabel = pkg?.priceType === "per_couple" ? "Couples" : "Travellers";

  const persistFailedStatus = async (params: {
    purchaseId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    failureReason?: string;
    failureCode?: string;
    failureSource?: string;
    failureStep?: string;
  }) => {
    try {
      await fetch("/api/payments/razorpay/mark-failed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
    } catch (statusErr) {
      console.error("Failed status persist error:", statusErr);
    }
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<CheckoutField, string>> = {};
    const trimmedName = form.fullName.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();

    if (!trimmedName) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!trimmedPhone) {
      nextErrors.phone = "Please enter your phone number.";
    } else if (!/^[0-9+\-\s()]{8,15}$/.test(trimmedPhone)) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    if (!form.travelDate) {
      nextErrors.travelDate = "Please select your travel date.";
    } else if (form.travelDate < todayDateInputValue) {
      nextErrors.travelDate = "Travel date cannot be in the past.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      setFieldErrors({});

      if (!validateForm()) {
        setError("Please correct the highlighted fields and try again.");
        return;
      }

      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) {
        throw new Error("Unable to load Razorpay SDK. Please check your internet and try again.");
      }

      const orderResponse = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutType,
          selectedDepartureDate: form.travelDate || selectedDepartureDateParam || pkg.departureDate || "",
          amount: Math.round(payableAmount * 100),
          currency: "INR",
          receipt: `pkg_${pkg.slug}_${Date.now()}`.slice(0, 40),
          userId: user?.id || "",
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          packageId: pkg._id,
          packageSlug: pkg.slug,
          packageTitle: pkg.title,
          destination: pkg.destination,
          travelDate: form.travelDate || "",
          travellers: Number(form.travellers || 1),
          unitPrice: pkg.price,
          unitLabel,
          customerNote: form.note || "",
          notes: {
            packageId: pkg._id,
            packageSlug: pkg.slug,
            travellers: String(form.travellers),
            travelDate: form.travelDate || "Flexible",
          },
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData?.orderId) {
        throw new Error(orderData?.message || "Failed to create payment order");
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Paradise Yatra",
        description: `${pkg.title} (${unitLabel})`,
        order_id: orderData.orderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          package: pkg.title,
          packageSlug: pkg.slug,
          travellers: String(form.travellers),
          travelDate: form.travelDate || "Flexible",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (paymentResponse: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyResponse = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...paymentResponse,
                purchaseId: orderData?.purchaseId,
                customer: {
                  fullName: form.fullName,
                  email: form.email,
                  phone: form.phone,
                },
                packageInfo: {
                  title: pkg.title,
                  slug: pkg.slug,
                  destination: pkg.destination,
                  travelDate: form.travelDate || pkg.departureDate || "Flexible",
                  travellers: Number(form.travellers || 1),
                  unitLabel,
                  unitPrice: pkg.price,
                  amount: payableAmount,
                },
              }),
            });
            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData?.verified) {
              throw new Error(verifyData?.message || "Payment verification failed");
            }

            setPaymentMeta({
              internalOrderId: verifyData?.internalOrderId || orderData?.internalOrderId || null,
              receiptNumber: verifyData?.receiptNumber || orderData?.receiptNumber || null,
              paymentId: paymentResponse.razorpay_payment_id,
              travelDate: verifyData?.travelDate || form.travelDate || "Flexible",
              travellers: verifyData?.travellers || Number(form.travellers || 1),
              unitLabel: verifyData?.unitLabel || unitLabel || "Per Person",
            });
            setSuccess("Payment successful. Receipt has been sent to your email.");
            setError("");
            setPaymentResultModal({
              open: true,
              status: "success",
              title: "Payment Successful",
              message: "Your booking payment is confirmed. Receipt details are ready below.",
              orderId: paymentResponse.razorpay_order_id,
              paymentId: paymentResponse.razorpay_payment_id,
              internalOrderId: verifyData?.internalOrderId || orderData?.internalOrderId || null,
              receiptNumber: verifyData?.receiptNumber || orderData?.receiptNumber || null,
              amount: formatPrice(payableAmount),
            });
          } catch (verifyErr) {
            await persistFailedStatus({
              purchaseId: orderData?.purchaseId,
              razorpayOrderId: paymentResponse?.razorpay_order_id || orderData?.orderId,
              razorpayPaymentId: paymentResponse?.razorpay_payment_id,
              failureReason: verifyErr instanceof Error ? verifyErr.message : "Payment verification failed",
              failureCode: "verification_failed",
              failureSource: "server_verify",
            });
            const verifyErrorMessage =
              verifyErr instanceof Error ? verifyErr.message : "Payment verification failed";
            setError(verifyErrorMessage);
            setPaymentResultModal({
              open: true,
              status: "failed",
              title: "Payment Verification Failed",
              message: verifyErrorMessage,
              orderId: paymentResponse?.razorpay_order_id || orderData?.orderId,
              paymentId: paymentResponse?.razorpay_payment_id || "",
              internalOrderId: orderData?.internalOrderId || null,
              receiptNumber: orderData?.receiptNumber || null,
              amount: formatPrice(payableAmount),
            });
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", async (failure: any) => {
        await persistFailedStatus({
          purchaseId: orderData?.purchaseId,
          razorpayOrderId:
            failure?.error?.metadata?.order_id ||
            failure?.error?.metadata?.razorpay_order_id ||
            orderData?.orderId,
          razorpayPaymentId:
            failure?.error?.metadata?.payment_id ||
            failure?.error?.metadata?.razorpay_payment_id ||
            "",
          failureReason: failure?.error?.description || failure?.error?.reason || "Payment failed",
          failureCode: failure?.error?.code || "",
          failureSource: failure?.error?.source || "",
          failureStep: failure?.error?.step || "",
        });

        const reason =
          failure?.error?.description ||
          failure?.error?.reason ||
          "Payment failed. Please try again.";
        setError(reason);
        setPaymentResultModal({
          open: true,
          status: "failed",
          title: "Payment Failed",
          message: reason,
          orderId:
            failure?.error?.metadata?.order_id ||
            failure?.error?.metadata?.razorpay_order_id ||
            orderData?.orderId,
          paymentId:
            failure?.error?.metadata?.payment_id ||
            failure?.error?.metadata?.razorpay_payment_id ||
            "",
          internalOrderId: orderData?.internalOrderId || null,
          receiptNumber: orderData?.receiptNumber || null,
          amount: formatPrice(payableAmount),
        });
      });
      paymentObject.open();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      setPaymentResultModal({
        open: true,
        status: "failed",
        title: "Unable To Start Payment",
        message: errorMessage,
        amount: formatPrice(payableAmount),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <button
          onClick={() => router.back()}
          className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-[#000945] hover:text-[#000945] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-24 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          </div>
        ) : pkg ? (
          <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
              <section className="order-2 lg:order-1 lg:col-span-2 bg-white rounded-[6px] border border-[#dfe1df] p-5 md:p-8">
                <div className="flex items-center justify-between gap-3 mb-6 md:mb-8">
                  <div>
                    <h2 className="!text-2xl !font-bold !text-[#000945]">Traveller Details</h2>
                    <p className="!mt-1 !text-sm !text-[#000945]">Complete your details to continue payment.</p>
                  </div>

                </div>

                <form noValidate onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#000945]">Full Name</label>
                      <input
                        value={form.fullName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setForm((prev) => ({ ...prev, fullName: value }));
                          setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                        }}
                        className={`w-full border rounded-[6px] bg-slate-50 px-4 py-2.5 focus:outline-none focus:ring-2 focus:bg-white transition ${fieldErrors.fullName ? "border-red-400 focus:ring-red-500/20" : "border-slate-200 focus:ring-blue-500/30"}`}
                        placeholder="Enter your full name"
                      />
                      {fieldErrors.fullName && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.fullName}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#000945]">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          const value = e.target.value;
                          setForm((prev) => ({ ...prev, email: value }));
                          setFieldErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className={`w-full border rounded-[6px] bg-slate-50 px-4 py-2.5 focus:outline-none focus:ring-2 focus:bg-white transition ${fieldErrors.email ? "border-red-400 focus:ring-red-500/20" : "border-slate-200 focus:ring-blue-500/30"}`}
                        placeholder="name@email.com"
                      />
                      {fieldErrors.email && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#000945]">Phone</label>
                      <input
                        value={form.phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          setForm((prev) => ({ ...prev, phone: value }));
                          setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        className={`w-full border rounded-[6px] bg-slate-50 px-4 py-2.5 focus:outline-none focus:ring-2 focus:bg-white transition ${fieldErrors.phone ? "border-red-400 focus:ring-red-500/20" : "border-slate-200 focus:ring-blue-500/30"}`}
                        placeholder="+91 xxxxx xxxxx"
                      />
                      {fieldErrors.phone && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.phone}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#000945]">Travel Date</label>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={`flex h-[46px] w-full cursor-pointer items-center rounded-[6px] border bg-slate-50 px-4 py-2.5 text-left text-sm text-[#000945] outline-none transition hover:border-slate-200 focus:border-slate-200 focus:bg-white ${fieldErrors.travelDate ? "border-red-400 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:ring-2 focus:ring-blue-500/30"}`}
                          >
                            <span className="flex items-center gap-2 leading-none">
                              <Calendar className="h-4 w-4 shrink-0 text-[#000945]" />
                              <span className={form.travelDate ? "text-[#000945]" : "text-slate-400"}>
                                {form.travelDate
                                  ? format(new Date(`${form.travelDate}T00:00:00`), "MMM dd, yyyy")
                                  : "Pick a date"}
                              </span>
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="z-[9999] w-auto p-0 !rounded-[6px]" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={form.travelDate ? new Date(`${form.travelDate}T00:00:00`) : undefined}
                            classNames={{ day_button: "cursor-pointer" }}
                            onSelect={(date) => {
                              setForm((prev) => ({
                                ...prev,
                                travelDate: date
                                  ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                  : "",
                              }));
                              setFieldErrors((prev) => ({ ...prev, travelDate: undefined }));
                              setTimeout(() => setCalendarOpen(false), 150);
                            }}
                            disabled={{ before: new Date() }}
                          />
                        </PopoverContent>
                      </Popover>
                      {fieldErrors.travelDate && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.travelDate}</p>}
                    </div>
                  </div>

                  <div className="rounded-[6px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="block text-sm font-semibold text-[#000945]">Travellers</label>
                      <div className="inline-flex items-center rounded-[6px] border border-slate-200 bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              travellers: Math.max(1, Number(prev.travellers || 1) - 1),
                            }))
                          }
                          className="h-10 w-10 cursor-pointer inline-flex items-center justify-center text-[#000945] hover:text-[#000945] transition"
                          aria-label="Decrease travellers"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={form.travellers}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              travellers: Math.max(1, Number(e.target.value || 1)),
                            }))
                          }
                          className="h-10 w-14 border-x border-slate-200 text-center font-bold text-[#000945] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              travellers: Math.max(1, Number(prev.travellers || 1) + 1),
                            }))
                          }
                          className="h-10 w-10 cursor-pointer inline-flex items-center justify-center text-[#000945] hover:text-[#000945] transition"
                          aria-label="Increase travellers"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs font-medium text-[#000945]">
                      Billing units: {chargeUnits} {chargeUnitLabel}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#000945]">Special Notes (optional)</label>
                    <textarea
                      rows={4}
                      value={form.note}
                      onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                      className="w-full border border-slate-200 rounded-[6px] bg-slate-50 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition"
                      placeholder="Any preference, pickup request, meal choice..."
                    />
                  </div>

                  {success && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-[6px] p-4 text-emerald-700 text-sm font-semibold space-y-1">
                      <p className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {success}
                      </p>
                      {paymentMeta?.internalOrderId && <p>Order ID: {paymentMeta.internalOrderId}</p>}
                      {paymentMeta?.receiptNumber && <p>Receipt No: {paymentMeta.receiptNumber}</p>}
                      {paymentMeta?.paymentId && <p>Payment ID: {paymentMeta.paymentId}</p>}
                      {paymentMeta?.travelDate && <p>Travel Date: {paymentMeta.travelDate}</p>}
                      {paymentMeta?.travellers && <p>Travellers: {paymentMeta.travellers}</p>}
                      {paymentMeta?.unitLabel && <p>Pricing Basis: {paymentMeta.unitLabel}</p>}
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-[6px] p-4 text-red-700 text-sm font-semibold">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto cursor-pointer rounded-[6px] !font-bold px-8 h-11 text-white bg-[#155dfc] hover:bg-[#0f4fe0]"
                    >
                      Pay Now
                    </Button>
                  </div>
                </form>
              </section>

              <aside className="order-1 lg:order-2 bg-white rounded-[6px] border border-[#dfe1df] p-6 space-y-5 lg:sticky lg:top-24">
                <h2 className="!text-lg !font-bold !text-[#000945]">Booking Summary</h2>

                <div className="rounded-[6px] border border-slate-200 overflow-hidden">
                  {pkg.image ? (
                    <img src={pkg.image} alt={pkg.title} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-28 w-full bg-gradient-to-r from-blue-100 to-slate-100" />
                  )}
                  <div className="p-3">
                    <p className="!font-semibold !leading-snug !text-[#000945]">{pkg.title}</p>
                    <p className="!mt-1 !inline-flex !items-center !gap-1.5 !text-xs !text-[#000945]">
                      <MapPin className="h-3.5 w-3.5 text-[#000945]" /> {pkg.destination}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 !text-[#000945]">
                      <Calendar className="h-4 w-4 text-[#000945]" />
                      Duration
                    </span>
                    <span className="!font-semibold !text-[#000945]">{pkg.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 !text-[#000945]">
                      <Users className="h-4 w-4 text-[#000945]" />
                      Travellers
                    </span>
                    <span className="!font-semibold !text-[#000945]">{form.travellers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="!text-[#000945]">{unitLabel}</span>
                    <span className="!font-semibold !text-[#000945]">{formatPrice(pkg.price)}</span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="!font-bold !text-[#000945]">Estimated Total</span>
                    <span className="!text-xl !font-black !text-blue-600">{formatPrice(payableAmount)}</span>
                  </div>
                </div>

                <div className="flex justify-center py-1">
                  <a href="https://razorpay.com/" target="_blank" rel="noopener noreferrer">
                    <img
                      referrerPolicy="origin"
                      src="https://badges.razorpay.com/badge-light.png"
                      style={{ height: "45px", width: "113px" }}
                      alt="Razorpay | Payment Gateway | Neobank"
                    />
                  </a>
                </div>

                <ul className="space-y-2 text-xs font-medium text-[#000945]">
                  <li className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#000945]" /> 256-bit encrypted payment flow
                  </li>
                  <li className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#000945]" /> Instant booking confirmation after success
                  </li>
                  <li className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#000945]" /> Receipt copy sent to your email
                  </li>
                </ul>
              </aside>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700 text-sm font-semibold">
            {error || "Unable to load checkout package details."}
          </div>
        )}

        <Dialog
          open={paymentResultModal.open}
          onOpenChange={(open) =>
            setPaymentResultModal((prev) => ({
              ...prev,
              open,
            }))
          }
        >
          <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 overflow-hidden border border-slate-200">
            <div
              className={`p-6 ${paymentResultModal.status === "success"
                  ? "bg-gradient-to-r from-emerald-50 to-blue-50"
                  : "bg-gradient-to-r from-red-50 to-orange-50"
                }`}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 !text-xl !text-[#000945]">
                  {paymentResultModal.status === "success" ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  {paymentResultModal.title}
                </DialogTitle>
              </DialogHeader>
              <p className="mt-2 text-sm font-medium !text-[#000945]">{paymentResultModal.message}</p>
            </div>

            <div className="p-6 space-y-3 text-sm">
              {paymentResultModal.internalOrderId && (
                <p className="flex justify-between gap-3">
                  <span className="font-semibold text-[#000945]">Order ID</span>
                  <span className="text-right font-bold text-[#000945]">{paymentResultModal.internalOrderId}</span>
                </p>
              )}
              {paymentResultModal.receiptNumber && (
                <p className="flex justify-between gap-3">
                  <span className="font-semibold text-[#000945]">Receipt No</span>
                  <span className="text-right font-bold text-[#000945]">{paymentResultModal.receiptNumber}</span>
                </p>
              )}
              {paymentResultModal.orderId && (
                <p className="flex justify-between gap-3">
                  <span className="font-semibold text-[#000945]">Razorpay Order ID</span>
                  <span className="break-all text-right font-semibold text-[#000945]">{paymentResultModal.orderId}</span>
                </p>
              )}
              {paymentResultModal.paymentId && (
                <p className="flex justify-between gap-3">
                  <span className="font-semibold text-[#000945]">Razorpay Payment ID</span>
                  <span className="break-all text-right font-semibold text-[#000945]">{paymentResultModal.paymentId}</span>
                </p>
              )}
              {paymentResultModal.amount && (
                <p className="flex justify-between gap-3 pt-2 border-t border-slate-200">
                  <span className="font-bold text-[#000945]">Amount</span>
                  <span className="font-black text-[#000945]">{paymentResultModal.amount}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 px-6 pb-6 text-[#000945]">
              <Button
                type="button"
                onClick={() => setPaymentResultModal((prev) => ({ ...prev, open: false }))}
                className="rounded-xl bg-slate-900 hover:bg-slate-800"
              >
                {paymentResultModal.status === "success" ? "Continue" : "Try Again"}
              </Button>
              {paymentResultModal.status === "success" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/package")}
                  className="rounded-xl"
                >
                  Explore More Packages
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <Header />
          <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
            <div className="flex items-center justify-center py-24 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            </div>
          </main>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
