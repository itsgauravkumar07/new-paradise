"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, MapPin, Star } from "lucide-react";
import { HOTEL_GUEST_LIMITS, StaySearch, nightsBetween, todayISO } from "./types";

interface Props {
  hotel: { slug: string; name: string; city: string; pricePerNight: number; starRating: number };
  initial?: Partial<StaySearch>;
  onDone?: () => void;
}

type EnquiryField = "name" | "phone" | "email" | "checkIn" | "checkOut";
type EnquiryErrors = Partial<Record<EnquiryField, string>>;

const field =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm !text-slate-900 outline-none focus:border-[#155dfc] focus:ring-2 focus:ring-blue-100 placeholder:!text-slate-400";
const label = "block !text-xs !font-bold uppercase tracking-wide !text-slate-500 mb-1.5";
const fieldError = "!text-xs !font-medium !text-red-600 mt-1.5";

const HotelEnquiryForm = ({ hotel, initial, onDone }: Props) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState(initial?.checkIn || "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut || "");
  const [adults, setAdults] = useState(Math.min(HOTEL_GUEST_LIMITS.adults, Math.max(1, initial?.adults || 2)));
  const [children, setChildren] = useState(Math.min(HOTEL_GUEST_LIMITS.children, Math.max(0, initial?.children || 0)));
  const [rooms, setRooms] = useState(Math.min(HOTEL_GUEST_LIMITS.rooms, Math.max(1, initial?.rooms || 1)));
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot - humans never see or fill this
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<EnquiryErrors>({});

  const nights = nightsBetween(checkIn, checkOut);

  const validate = (): EnquiryErrors => {
    const errors: EnquiryErrors = {};
    const fullName = name.trim();
    if (fullName.length < 2 || !/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u.test(fullName)) {
      errors.name = "Enter a valid name using letters, spaces, hyphens or apostrophes.";
    } else if (fullName.length > 100) {
      errors.name = "Name must be 100 characters or fewer.";
    }

    if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Enter a 10-digit phone number.";
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 120)) {
      errors.email = "Enter a valid email address (maximum 120 characters).";
    }

    const today = todayISO();
    if (!checkIn) errors.checkIn = "Choose a check-in date.";
    else if (checkIn < today) errors.checkIn = "Check-in cannot be in the past.";

    if (!checkOut) errors.checkOut = "Choose a check-out date.";
    else if (checkIn && checkOut <= checkIn) errors.checkOut = "Check-out must be after check-in.";

    return errors;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please correct the highlighted fields and try again.");
      document.getElementById(`he-${Object.keys(validationErrors)[0]}`)?.focus();
      return;
    }
    setFieldErrors({});
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/hotels/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelSlug: hotel.slug,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          checkIn,
          checkOut,
          adults,
          children,
          rooms,
          message: message.trim(),
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not send your enquiry. Please try again.");
      setDone(true);
    } catch (err) {
      setError((err as Error).message || "Could not send your enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-8 px-2">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
        <h3 className="!text-xl !font-extrabold !text-slate-900">Thank you, {name.split(" ")[0]}!</h3>
        <p className="!text-sm !text-slate-500 mt-2">
          We have received your enquiry for <b>{hotel.name}</b>. Our travel expert will contact you on <b>{phone}</b> to confirm availability and the final price.
        </p>
        {onDone && (
          <button onClick={onDone} className="mt-6 px-6 py-3 rounded-xl bg-[#155dfc] text-white font-bold text-sm hover:bg-[#0f4ad1]">
            Done
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-primary-light border border-blue-100">
        <div className="min-w-0">
          <p className="!text-sm !font-bold !text-slate-900 truncate">{hotel.name}</p>
          <p className="flex items-center gap-1 !text-xs !text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3" /> {hotel.city} · {hotel.starRating}
            <Star className="w-3 h-3 fill-tertiary text-tertiary" />
          </p>
        </div>
        <p className="!text-sm !font-extrabold !text-slate-900 whitespace-nowrap">
          ₹{hotel.pricePerNight.toLocaleString("en-IN")}
          <span className="!text-xs !font-medium !text-slate-400"> / night</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="he-name">Full name *</label>
          <input
            id="he-name"
            className={field}
            value={name}
            onChange={(e) => { setName(e.target.value); setFieldErrors((current) => ({ ...current, name: undefined })); }}
            autoComplete="name"
            maxLength={100}
            placeholder="e.g., Priya Sharma"
            required
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "he-name-error" : undefined}
          />
          {fieldErrors.name && <p id="he-name-error" className={fieldError}>{fieldErrors.name}</p>}
        </div>
        <div>
          <label className={label} htmlFor="he-phone">Phone number *</label>
          <input
            id="he-phone"
            type="tel"
            inputMode="tel"
            className={field}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
              setFieldErrors((current) => ({ ...current, phone: undefined }));
            }}
            autoComplete="tel"
            maxLength={10}
            pattern="[0-9]{10}"
            placeholder="9876543210"
            required
            aria-invalid={!!fieldErrors.phone}
            aria-describedby={fieldErrors.phone ? "he-phone-error" : undefined}
          />
          {fieldErrors.phone && <p id="he-phone-error" className={fieldError}>{fieldErrors.phone}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="he-email">Email (optional)</label>
          <input
            id="he-email"
            type="email"
            className={field}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); }}
            autoComplete="email"
            maxLength={120}
            placeholder="you@example.com"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "he-email-error" : undefined}
          />
          {fieldErrors.email && <p id="he-email-error" className={fieldError}>{fieldErrors.email}</p>}
        </div>
        <div>
          <label className={label} htmlFor="he-checkIn">Check-in *</label>
          <input id="he-checkIn" type="date" className={field} value={checkIn} min={todayISO()}
            required
            aria-invalid={!!fieldErrors.checkIn}
            aria-describedby={fieldErrors.checkIn ? "he-checkIn-error" : undefined}
            onChange={(e) => {
              setCheckIn(e.target.value);
              setFieldErrors((current) => ({ ...current, checkIn: undefined, checkOut: undefined }));
              if (checkOut && e.target.value && checkOut <= e.target.value) setCheckOut("");
            }} />
          {fieldErrors.checkIn && <p id="he-checkIn-error" className={fieldError}>{fieldErrors.checkIn}</p>}
        </div>
        <div>
          <label className={label} htmlFor="he-checkOut">Check-out * {nights > 0 && <span className="normal-case !text-[#155dfc]">({nights} night{nights > 1 ? "s" : ""})</span>}</label>
          <input
            id="he-checkOut"
            type="date"
            className={field}
            value={checkOut}
            min={checkIn || todayISO()}
            required
            aria-invalid={!!fieldErrors.checkOut}
            aria-describedby={fieldErrors.checkOut ? "he-checkOut-error" : undefined}
            onChange={(e) => { setCheckOut(e.target.value); setFieldErrors((current) => ({ ...current, checkOut: undefined })); }}
          />
          {fieldErrors.checkOut && <p id="he-checkOut-error" className={fieldError}>{fieldErrors.checkOut}</p>}
        </div>
        <div>
          <label className={label} htmlFor="he-adults">Adults</label>
          <select id="he-adults" className={field} value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
            {Array.from({ length: HOTEL_GUEST_LIMITS.adults }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="he-children">Children (0-12 yrs)</label>
          <select id="he-children" className={field} value={children} onChange={(e) => setChildren(Number(e.target.value))}>
            {Array.from({ length: HOTEL_GUEST_LIMITS.children + 1 }, (_, i) => i).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="he-rooms">Rooms</label>
          <select id="he-rooms" className={field} value={rooms} onChange={(e) => setRooms(Number(e.target.value))}>
            {Array.from({ length: HOTEL_GUEST_LIMITS.rooms }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="he-msg">Special requests (optional)</label>
          <textarea id="he-msg" rows={3} className={field} value={message} maxLength={1000} onChange={(e) => setMessage(e.target.value)} placeholder="Early check-in, meal preferences, extra bed..." />
        </div>
      </div>

      {/* Honeypot: hidden from people, bots tend to fill every field */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      {error && <p role="alert" className="!text-sm !font-semibold !text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

      <button
        type="submit" disabled={submitting}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#155dfc] to-[#0b3fc4] text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-70 hover:brightness-110"
      >
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send booking enquiry"}
      </button>
      <p className="!text-xs !text-slate-400 text-center">No payment now. We will call you to confirm availability and the final price.</p>
    </form>
  );
};

export default HotelEnquiryForm;
