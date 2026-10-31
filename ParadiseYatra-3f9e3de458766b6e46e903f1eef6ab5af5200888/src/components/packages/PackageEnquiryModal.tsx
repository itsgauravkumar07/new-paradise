"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Loader2, Mail, MessageSquare, Minus, Phone, Plus, Send, ShieldCheck, User, X } from "lucide-react";
import { COMPANY } from "@/lib/chat/company";

interface PackageEnquiryModalProps {
  open: boolean;
  onClose: () => void;
  packageTitle: string;
  /** e.g. "₹12,000 per person" */
  priceLabel?: string;
  destination?: string;
}

type Field = "name" | "phone" | "email" | "date";
type FieldErrors = Partial<Record<Field, string>>;

const today = () => new Date().toISOString().slice(0, 10);

/** Digits to send, with 91 added to a bare 10-digit Indian number; null when the number isn't usable. */
const normalisePhone = (value: string): { digits: string | null; error?: string } => {
  let d = value.replace(/\D/g, "");
  if (d.length === 0 || d === "91") return { digits: null, error: "Please enter your phone number." };
  if (d.length === 10) d = `91${d}`;
  if (d.startsWith("91") && d.length !== 12) return { digits: null, error: "Enter a 10-digit mobile number." };
  if (d.startsWith("91") && !/^[6-9]/.test(d.slice(2))) return { digits: null, error: "Indian mobile numbers start with 6, 7, 8 or 9." };
  if (d.length < 10 || d.length > 15) return { digits: null, error: "Please enter a valid phone number." };
  return { digits: d };
};

const validate = (name: string, phone: string, email: string, date: string): FieldErrors => {
  const errors: FieldErrors = {};
  const n = name.trim();
  if (!n) errors.name = "Please enter your name.";
  else if (n.replace(/[^\p{L}]/gu, "").length < 2) errors.name = "Name should have at least 2 letters.";
  else if (/[^\p{L}\p{M}\s.'-]/u.test(n)) errors.name = "Use letters only.";
  const p = normalisePhone(phone);
  if (p.error) errors.phone = p.error;
  if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errors.email = "Enter a valid email address.";
  if (date && date < today()) errors.date = "Pick today or a future date.";
  return errors;
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
      <AlertCircle className="h-3 w-3 shrink-0" /> {message}
    </p>
  );
}

const fieldBox = (invalid: boolean) =>
  `flex h-10 items-center gap-2 rounded-xl border bg-white px-3 transition-colors ${
    invalid ? "border-rose-400 bg-rose-50/40 focus-within:border-rose-500" : "border-slate-200 focus-within:border-primary"
  }`;

function Counter({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold text-heading">{label}</p>
      <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`} className="flex h-full w-8 cursor-pointer items-center justify-center text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="flex-1 text-center text-sm font-bold text-heading">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(30, value + 1))} aria-label={`More ${label.toLowerCase()}`} className="flex h-full w-8 cursor-pointer items-center justify-center text-slate-600 hover:bg-slate-50">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Package enquiry popup. Sends to /api/lead-capture (saved as a lead and emailed to the team). */
export default function PackageEnquiryModal({ open, onClose, packageTitle, priceLabel, destination }: PackageEnquiryModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const refs = {
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    date: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Start fresh the next time it opens after a successful enquiry
  useEffect(() => {
    if (!open && sent) {
      setSent(false);
      setMessage("");
    }
  }, [open, sent]);

  if (!open) return null;

  // Typing in a field clears its message; it's checked again on submit (or when leaving the field)
  const edit = (field: Field, setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const recheck = (field: Field) => {
    const next = validate(name, phone, email, date)[field];
    // Only flag a field on blur once something has been typed in it
    const touched = { name: name.trim(), phone: phone.replace(/\D/g, "").length > 2, email: email.trim(), date }[field];
    if (touched) setErrors((prev) => ({ ...prev, [field]: next }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const found = validate(name, phone, email, date);
    setErrors(found);
    const first = (["name", "phone", "email", "date"] as Field[]).find((f) => found[f]);
    if (first) {
      refs[first].current?.focus();
      return;
    }

    const digits = normalisePhone(phone).digits!;
    const travelDate = date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
    const summary = [
      travelDate ? `Travel date: ${travelDate}` : "Travel date: not decided",
      `Travellers: ${adults} adult${adults === 1 ? "" : "s"}${children ? `, ${children} child${children === 1 ? "" : "ren"}` : ""}`,
      message.trim() ? `\nMessage:\n${message.trim()}` : "",
    ].filter(Boolean).join("\n");

    setSending(true);
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name.trim(),
          phone: `+${digits}`,
          email: email.trim(),
          destination: destination || "",
          departureDate: travelDate,
          message: summary,
          packageTitle,
          packagePrice: priceLabel || "",
          source: "package-page",
          destinationUrl: typeof window !== "undefined" ? window.location.pathname : "",
          website,
          newsletterConsent: false,
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Could not send your enquiry.");
      setSent(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? `${err.message} You can also call us on ${COMPANY.phone}.`
          : `We couldn't send that. Check your connection or call us on ${COMPANY.phone}.`
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Send an enquiry"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[96vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="relative shrink-0 bg-gradient-to-br from-primary-strong to-primary px-5 py-4 text-white">
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/15 hover:bg-white/25">
            <X className="h-4 w-4" />
          </button>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Enquire about</p>
          <p className="mt-0.5 line-clamp-1 pr-10 text-base font-bold leading-snug">{packageTitle}</p>
          {priceLabel && <p className="text-xs text-white/85">Starting from {priceLabel}</p>}
        </div>

        {sent ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="mt-3 text-lg font-extrabold text-heading">Thank you, {name.trim().split(" ")[0]}!</p>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              Your enquiry is with our travel team. A trip expert will call you on {phone.trim()} to plan the details.
            </p>
            <button type="button" onClick={onClose} className="mt-5 h-10 cursor-pointer rounded-full bg-primary px-8 text-sm font-bold text-white hover:bg-primary-hover">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
              <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-heading">Full name <span className="text-rose-500">*</span></span>
                <span className={fieldBox(!!errors.name)}>
                  <User className="h-4 w-4 shrink-0 text-slate-400" />
                  <input ref={refs.name} value={name} onChange={edit("name", setName)} onBlur={() => recheck("name")} placeholder="Your name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby="enq-name-error" className="w-full bg-transparent text-sm outline-none" />
                </span>
                <FieldError id="enq-name-error" message={errors.name} />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block min-w-0">
                  <span className="mb-1 block text-[11px] font-bold text-heading">Phone <span className="text-rose-500">*</span></span>
                  <span className={fieldBox(!!errors.phone)}>
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <input ref={refs.phone} type="tel" inputMode="tel" value={phone} onChange={edit("phone", setPhone)} onBlur={() => recheck("phone")} placeholder="+91 98765 43210" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby="enq-phone-error" className="w-full min-w-0 bg-transparent text-sm outline-none" />
                  </span>
                  <FieldError id="enq-phone-error" message={errors.phone} />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-[11px] font-bold text-heading">Email <span className="font-normal text-slate-400">(optional)</span></span>
                  <span className={fieldBox(!!errors.email)}>
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <input ref={refs.email} type="email" inputMode="email" value={email} onChange={edit("email", setEmail)} onBlur={() => recheck("email")} placeholder="you@email.com" autoComplete="email" aria-invalid={!!errors.email} aria-describedby="enq-email-error" className="w-full min-w-0 bg-transparent text-sm outline-none" />
                  </span>
                  <FieldError id="enq-email-error" message={errors.email} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
                <label className="col-span-2 block min-w-0 sm:col-span-1">
                  <span className="mb-1 block text-[11px] font-bold text-heading">Travel date <span className="font-normal text-slate-400">(optional)</span></span>
                  <span className={fieldBox(!!errors.date)}>
                    <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                    <input ref={refs.date} type="date" min={today()} value={date} onChange={edit("date", setDate)} onBlur={() => recheck("date")} aria-invalid={!!errors.date} aria-describedby="enq-date-error" className="w-full min-w-0 bg-transparent text-sm outline-none" />
                  </span>
                  <FieldError id="enq-date-error" message={errors.date} />
                </label>
                <Counter label="Adults" value={adults} min={1} onChange={setAdults} />
                <Counter label="Children" value={children} min={0} onChange={setChildren} />
              </div>

              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-heading">Anything else? <span className="font-normal text-slate-400">(optional)</span></span>
                <span className="flex gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-primary">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={1000} placeholder="Hotel preference, special requests, questions..." className="w-full resize-none bg-transparent text-sm outline-none" />
                </span>
              </label>
            </div>

            {/* Always-visible footer: the button can't be squeezed or scrolled away */}
            <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              {submitError && (
                <p role="alert" className="mb-2.5 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {submitError}
                </p>
              )}
              {/* Phones: button on top, note under it. Wider screens: note left, button right, one row */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <p className="flex items-center justify-center gap-2 text-[11px] leading-tight text-slate-500 sm:justify-start">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>
                    <span className="font-bold text-heading">No payment needed.</span>{" "}
                    <span className="sm:block">Our expert will call you back.</span>
                  </span>
                </p>
                <button
                  type="submit"
                  disabled={sending}
                  className="group flex h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-strong px-7 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(21,93,252,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(21,93,252,0.7)] active:translate-y-0 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 sm:w-auto"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  )}
                  {sending ? "Sending..." : "Send enquiry"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
