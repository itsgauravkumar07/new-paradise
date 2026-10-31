"use client";

// The small enquiry card opened by EnquiryPopup: where to, when, name and phone number.
// Sends to /api/lead-capture (saved as a lead with source "popup" and emailed to the team).

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, CalendarDays, CheckCircle2, Loader2, MapPin, PhoneCall, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";

// Suggestions while typing: where most of our packages are (keep to places we sell)
const DESTINATIONS = ["Andaman", "Kashmir", "Kerala", "Himachal Pradesh", "Sikkim", "Ladakh", "Uttarakhand", "Goa", "Thailand", "Bali", "Dubai"];
const FLEXIBLE = "Flexible / not decided";

/** "Nov 2026", "Dec 2026", ... for the next 12 months */
const nextMonths = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) =>
    new Date(now.getFullYear(), now.getMonth() + i, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
  );
};

const COUNTRY_CODES = [
  { code: "+91", label: "IN +91" },
  { code: "+971", label: "AE +971" },
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
];

interface Props {
  onClose: () => void;
  onSent: () => void;
}

export default function EnquiryPopupForm({ onClose, onSent }: Props) {
  const [destination, setDestination] = useState("");
  const [when, setWhen] = useState("");
  const [months] = useState(nextMonths);
  const [name, setName] = useState("");
  const [dial, setDial] = useState("+91");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ where?: string; name?: string; phone?: string }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const validate = () => {
    const next: typeof errors = {};
    if (!destination.trim()) next.where = "Tell us where you'd like to go (or type \"not sure\").";
    const trimmed = name.trim();
    if (!trimmed) next.name = "Please enter your name.";
    else if (trimmed.length < 2 || !/^[a-zA-Z.\s]+$/.test(trimmed)) next.name = "Use letters only, please.";
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
    if (!digits) next.phone = "Please enter your phone number.";
    else if (dial === "+91" ? digits.length !== 10 : digits.length < 7 || digits.length > 12) {
      next.phone = dial === "+91" ? "Enter a 10-digit mobile number." : "Enter a valid phone number.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    setServerError("");
    const where = destination.trim();
    const travelWhen = when && when !== FLEXIBLE ? when : "";
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name.trim(),
          email: "",
          phone: `${dial.replace(/\D/g, "")}${phone.replace(/\D/g, "").replace(/^0+/, "")}`,
          destination: where,
          // Shown as "Departure Date" in the team email
          departureDate: travelWhen || (when === FLEXIBLE ? "Flexible" : undefined),
          message: `Wants to go to: ${where}\nWhen: ${travelWhen || (when === FLEXIBLE ? "Flexible / not decided" : "Not specified")}`,
          source: "popup",
          website: honeypotRef.current?.value || "",
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || data?.message || "");
      }
      setStatus("sent");
      onSent();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "");
      setStatus("error");
    }
  };

  const fieldBox = (hasError: boolean) =>
    `flex h-11 items-center gap-2 rounded-xl border bg-slate-50 px-3 transition focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 ${
      hasError ? "border-red-400 bg-red-50/40" : "border-slate-200"
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[140] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-popup-title"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-[400px] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Photo header */}
        <div className="relative h-36 overflow-hidden">
          <Image src="/Home/Pop Up Form/Image.jpg" alt="" fill sizes="400px" className="object-cover object-[50%_35%]" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-strong/40 via-primary-strong/55 to-primary-strong/90" />
          <div className="absolute inset-x-0 bottom-0 p-5 pb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/30 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" /> Free trip planning
            </span>
            <h2 id="enquiry-popup-title" className="mt-2 text-[22px] font-extrabold leading-tight text-white">
              Plan your next trip with us
            </h2>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {status === "sent" ? (
            <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-6 pb-7 pt-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <h3 className="mt-3 text-lg font-extrabold text-heading">Thank you, {name.trim().split(" ")[0]}!</h3>
              <p className="mt-1 text-sm text-slate-500">Our travel expert will call you shortly about your {destination.trim()} trip.</p>
              <button type="button" onClick={onClose} className="mt-5 h-11 w-full cursor-pointer rounded-full bg-slate-900 text-sm font-bold text-white hover:bg-slate-800">
                Continue browsing
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate className="space-y-3.5 px-5 pb-5 pt-4">
              <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

              {/* Where to */}
              <div>
                <label htmlFor="popup-where" className="mb-1 block pl-1 text-xs font-semibold text-slate-500">Where do you want to go?</label>
                <div className={fieldBox(!!errors.where)}>
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    id="popup-where"
                    list="popup-where-list"
                    autoComplete="off"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      if (errors.where) setErrors((p) => ({ ...p, where: undefined }));
                    }}
                    placeholder="e.g. Kashmir, Kerala, Bali"
                    className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-slate-800 outline-none placeholder:text-slate-400 sm:text-sm"
                  />
                  <datalist id="popup-where-list">
                    {DESTINATIONS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
                {errors.where && (
                  <p className="mt-1 flex items-center gap-1 pl-1 text-[11px] font-medium text-red-500">
                    <AlertCircle className="h-3 w-3" /> {errors.where}
                  </p>
                )}
              </div>

              {/* When */}
              <div>
                <label htmlFor="popup-when" className="mb-1 block pl-1 text-xs font-semibold text-slate-500">When are you planning to travel?</label>
                <div className={fieldBox(false)}>
                  <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                  <select
                    id="popup-when"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className={`h-full min-w-0 flex-1 cursor-pointer bg-transparent text-[16px] outline-none sm:text-sm ${when ? "text-slate-800" : "text-slate-400"}`}
                  >
                    <option value="">Select month</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value={FLEXIBLE}>{FLEXIBLE}</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-1" aria-hidden="true" />

              {/* Name */}
              <div>
                <label htmlFor="popup-name" className="sr-only">Your name</label>
                <div className={fieldBox(!!errors.name)}>
                  <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    id="popup-name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder="Your name"
                    className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-slate-800 outline-none placeholder:text-slate-400 sm:text-sm"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 flex items-center gap-1 pl-1 text-[11px] font-medium text-red-500">
                    <AlertCircle className="h-3 w-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="popup-phone" className="sr-only">Phone number</label>
                <div className={fieldBox(!!errors.phone)}>
                  <PhoneCall className="h-4 w-4 shrink-0 text-slate-400" />
                  <select
                    aria-label="Country code"
                    value={dial}
                    onChange={(e) => setDial(e.target.value)}
                    className="h-full cursor-pointer bg-transparent pr-1 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <span className="h-5 w-px bg-slate-200" />
                  <input
                    id="popup-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/[^\d\s-]/g, ""));
                      if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    placeholder="Mobile number"
                    className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-slate-800 outline-none placeholder:text-slate-400 sm:text-sm"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 flex items-center gap-1 pl-1 text-[11px] font-medium text-red-500">
                    <AlertCircle className="h-3 w-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {status === "error" && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {serverError || "Something went wrong. Please try again."}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-strong text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:shadow-xl hover:shadow-primary/35 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Get a call back <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                No spam. See our{" "}
                <Link href="/privacy-policy" className="font-semibold text-slate-500 underline underline-offset-2 hover:text-primary">
                  Privacy Policy
                </Link>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
