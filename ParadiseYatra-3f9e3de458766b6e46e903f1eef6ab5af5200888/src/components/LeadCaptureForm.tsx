"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
  X,
  Send
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PhoneInput from "react-phone-input-international";
import "react-phone-input-international/lib/style.css";

interface LeadCaptureFormProps {
  isOpen: boolean;
  onClose: () => void;
  packageTitle?: string;
  packagePrice?: string;
  departureDate?: string;
  bannerImage?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  heading?: string;
  subheading?: string;
  submitLabel?: string;
  emailRequired?: boolean;
    /** Pre-fills the message box (e.g. details from the homepage planner) */
  initialMessage?: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const EMPTY_FORM: FormData = { fullName: "", email: "", phone: "", message: "" };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

const inputClass =
  "w-full h-10 rounded-xl border border-slate-200 bg-white/70 py-2 pl-9 pr-3 text-[16px] sm:text-sm text-slate-800 outline-none transition-all duration-200 focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] placeholder:text-slate-400";

const textAreaClass =
  "w-full min-h-[60px] rounded-xl border border-slate-200 bg-white/70 py-2.5 pl-9 pr-3 text-[16px] sm:text-sm text-slate-800 outline-none transition-all duration-200 focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] placeholder:text-slate-400 resize-none";

const labelClass = "mb-1 block text-[11px] font-semibold text-slate-700 tracking-wide";

const errorRing = "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="relative z-20 mt-0.5 overflow-hidden ml-1">
      <AnimatePresence initial={false} mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-[11px] font-medium leading-none !text-red-500 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function LeadCaptureForm({
  isOpen,
  onClose,
  packageTitle,
  packagePrice,
  departureDate,
  bannerImage,
  bannerTitle,
  bannerSubtitle,
  heading,
  subheading,
  submitLabel = "Submit",
  emailRequired = true,
  initialMessage,
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  // Hidden field only bots fill in; the API drops any enquiry where it has a value
  const honeypotRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [phoneDialCode, setPhoneDialCode] = useState("+91");

  useEffect(() => {
  if (isOpen && initialMessage) {
    setFormData((prev) => ({ ...prev, message: prev.message || initialMessage }));
  }
  }, [isOpen, initialMessage]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const fullName = formData.fullName.trim();
    if (!fullName) {
      newErrors.fullName = "Please enter your full name.";
    } else if (fullName.length < 3) {
      newErrors.fullName = "Full name should be at least 3 characters.";
    } else if (!/^[a-zA-Z.\s]+$/.test(fullName)) {
      newErrors.fullName = "Name can contain only letters, spaces, and dots.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRequired && !formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is mandatory.";
    } else if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      newErrors.phone = "Enter a valid mobile number (10-13 digits).";
    }

    if (formData.message.trim() && formData.message.trim().length < 10) {
      newErrors.message = "Please add at least 10 characters, or leave this blank.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleInputChange = (field: keyof FormData, value: string) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
  if (errors[field]) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  setSubmitStatus("idle");
  setServerError(null);

  const departureLine = departureDate ? `Departure Date: ${departureDate}` : "";
  const userMessage = formData.message.trim();
  const enhancedMessage = [departureLine, userMessage].filter(Boolean).join("\n\n");

  // Digits only, no leading zeros
  const nationalNumber = formData.phone.replace(/\D/g, "").replace(/^0+/, "");

  try {
    // /api/leads only serves the admin list (GET); /api/lead-capture saves the lead and emails the team
    const response = await fetch("/api/lead-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: `${phoneDialCode.replace(/\D/g, "")}${nationalNumber}`,
        message: enhancedMessage,
        departureDate,
        packageTitle,
        packagePrice,
        newsletterConsent: true,
        website: honeypotRef.current?.value || "",
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || data?.message || "Failed to submit form");
    }

    setSubmitStatus("success");
    setFormData(EMPTY_FORM);

    setTimeout(() => {
      setSubmitStatus("idle");
      onClose();
    }, 2200);
  } catch (error) {
    console.error("Error submitting form:", error);
    setServerError(error instanceof Error ? error.message : null);
    setSubmitStatus("error");
  } finally {
    setIsSubmitting(false);
  }
};

  const bannerContent = (
    <>
      <motion.div
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 h-full w-full"
      >
        {bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerImage}
            alt={bannerTitle || packageTitle || "Travel planning"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src="/Home/Pop Up Form/Image.jpg"
            alt="Travel planning"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-10 p-4 pr-14 md:p-6">
        <div className="space-y-1.5 md:space-y-2.5">
          {bannerSubtitle && (
            <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm md:text-[11px]">
              {bannerSubtitle}
            </span>
          )}
          <h2 className="line-clamp-3 text-base font-extrabold leading-snug text-white drop-shadow-md sm:text-lg md:line-clamp-none md:text-[22px] md:leading-tight">
            {bannerTitle ?? (
              <>
                Relax in Egypt with Nile sunsets, <br className="hidden sm:block" /> timeless beauty, and calm escapes.
              </>
            )}
          </h2>
        </div>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, type: "spring", bounce: 0.15 }}
            className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] ring-1 ring-slate-200/50 sm:max-h-[calc(100dvh-3rem)] md:min-h-[480px] md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition-all hover:bg-white hover:text-slate-900 active:scale-95"
              aria-label="Close lead capture form"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Banner */}
            <div className="relative h-[132px] w-full shrink-0 overflow-hidden sm:h-[150px] md:h-auto md:w-[40%]">
              {bannerImage ? (
                <div className="block h-full w-full">{bannerContent}</div>
              ) : (
                <Link
                  href="https://paradiseyatra.com/package/royal-egypt-nile-heritage-journey"
                  className="block h-full w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {bannerContent}
                </Link>
              )}
            </div>

            {/* Form pane */}
            <div className="relative min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4 sm:px-6 sm:py-5 md:px-7 md:py-5">
              {submitStatus === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[240px] flex-col items-center justify-center text-center md:h-full"
                >
                  <CheckCircle className="mb-4 h-14 w-14 text-emerald-500" />
                  <h4 className="mb-2 text-xl font-extrabold text-slate-800">You are all set.</h4>
                  <p className="max-w-xs text-sm leading-relaxed text-slate-600">
                    Thank you for sharing your details. Our travel expert will call you shortly.
                  </p>
                </motion.div>
              ) : submitStatus === "error" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[240px] flex-col items-center justify-center text-center md:h-full"
                >
                  <AlertCircle className="mb-4 h-14 w-14 text-rose-500" />
                  <h4 className="mb-2 text-xl font-extrabold text-slate-800">Submission Failed</h4>
                  <p className="max-w-xs text-sm leading-relaxed text-slate-600">
                    {serverError && serverError !== "Failed to submit form"
                      ? serverError
                      : "Something went wrong while sending your request. Please try again."}
                  </p>
                  <button
                    onClick={() => setSubmitStatus("idle")}
                    className="mt-5 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95"
                  >
                    Try again
                  </button>
                </motion.div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                  <motion.div variants={itemVariants} className="pr-8 md:pr-0">
                    <h2 className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 sm:text-xl md:text-[22px]">
                      {heading ?? "Plan My Trip"}
                    </h2>
                    <p className="mt-1 text-xs leading-snug text-slate-500 sm:text-[13px]">
                      {subheading ?? "Share your details and our travel expert will get back to you shortly."}
                    </p>
                  </motion.div>

                  {(packageTitle || packagePrice || departureDate) && (
                    <motion.div
                      variants={itemVariants}
                      className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2"
                    >
                      {!bannerTitle && packageTitle && (
                        <p className="flex items-center gap-1.5 truncate text-[13px] font-bold text-slate-800">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                          <span className="truncate">{packageTitle}</span>
                        </p>
                      )}
                      <div
                        className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${
                          !bannerTitle && packageTitle ? "mt-1" : ""
                        }`}
                      >
                        {departureDate && (
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <CalendarDays className="h-3.5 w-3.5 text-indigo-600" />
                            <span className="text-slate-500">Departure:</span> {departureDate}
                          </span>
                        )}
                        {packagePrice && (
                          <span className="font-bold text-indigo-600">
                            <span className="font-semibold text-slate-500">Price: </span>
                            {packagePrice}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-3 space-y-2.5 sm:space-y-3" noValidate>
                    <input
                      ref={honeypotRef}
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    />
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                      <motion.div variants={itemVariants} className="relative">
                        <label htmlFor="fullName" className={labelClass}>
                          Full name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            id="fullName"
                            autoComplete="name"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            className={`${inputClass} ${errors.fullName ? errorRing : ""}`}
                            placeholder="Your name"
                            disabled={isSubmitting}
                          />
                        </div>
                        <FieldError message={errors.fullName} />
                      </motion.div>

                      <motion.div variants={itemVariants} className="relative">
                        <label htmlFor="email" className={labelClass}>
                          Email address {emailRequired && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            id="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={`${inputClass} ${errors.email ? errorRing : ""}`}
                            placeholder="you@example.com"
                            disabled={isSubmitting}
                          />
                        </div>
                        <FieldError message={errors.email} />
                      </motion.div>
                    </div>

                    <motion.div variants={itemVariants} className="relative">
                      <label htmlFor="phone" className={labelClass}>
                        Phone number <span className="text-red-500">*</span>
                      </label>
                      <div
                        className={`package-phone-input lead-phone-input flex h-10 gap-1 rounded-xl border bg-white/70 transition-all duration-200 focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] ${
                          errors.phone ? "border-red-500" : "border-slate-200"
                        }`}
                        data-dial-code={phoneDialCode}
                      >
                        <PhoneInput
                          country="in"
                          containerStyle={{ width: 76, height: "100%", flexShrink: 0 }}
                          onChange={(value, data) => {
                            if (data && typeof data === "object" && "dialCode" in data) {
                              const dialCode = (data as { dialCode?: string }).dialCode;
                              if (dialCode) setPhoneDialCode(`+${dialCode}`);
                            }
                          }}
                          preferredCountries={["in", "ae", "us", "gb"]}
                          enableSearch={false}
                          disableSearchIcon
                          inputStyle={{ display: "none" }}
                          buttonStyle={{
                            position: "relative",
                            border: "none",
                            background: "transparent",
                            width: "100%",
                            height: "100%",
                            padding: "0 0 0 10px",
                            borderRadius: "8px 0 0 8px",
                          }}
                        />
                        <div className="relative h-full flex-1 border-l border-slate-200/70 space-x-2">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            id="phone"
                            autoComplete="tel-national"
                            inputMode="numeric"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value.replace(/[^\d\s-]/g, ""))}
                            className="h-full w-full bg-transparent pl-9 pr-3 text-[16px] text-slate-800 outline-none placeholder:text-slate-400 sm:text-sm"
                            placeholder="Phone number"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      <FieldError message={errors.phone} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative">
                      <label htmlFor="message" className={labelClass}>
                        Travel requirements <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <div className="relative">
                        <MessageSquare className="pointer-events-none absolute left-3 top-3 z-10 h-3.5 w-3.5 text-slate-400" />
                        <textarea
                          id="message"
                          rows={2}
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          className={`${textAreaClass} ${errors.message ? errorRing : ""}`}
                          placeholder="Travelers, room preferences, special requests..."
                          disabled={isSubmitting}
                        />
                      </div>
                      <FieldError message={errors.message} />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover transition-all hover:shadow-[0_8px_20px_rgba(59,130,246,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span>{submitLabel}</span>
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </motion.button>

                      <p className="mt-2 text-center text-[10px] leading-snug text-slate-500">
                        By submitting, you agree to our{" "}
                        <Link href="/terms-and-conditions" className="font-semibold text-slate-700 underline underline-offset-2 hover:text-primary">
                          Terms of Use
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy-policy" className="font-semibold text-slate-700 underline underline-offset-2 hover:text-primary">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </motion.div>
                  </form>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}