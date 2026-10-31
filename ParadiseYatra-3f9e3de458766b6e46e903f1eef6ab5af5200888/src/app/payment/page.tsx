"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  CreditCard,
  Landmark,
  Lock,
  Mail,
  Phone,
  Plane,
  ShieldCheck,
  Square,
} from "lucide-react";

const PAYMENT_LINK = "https://razorpay.me/@paradiseyatra1352";

const bookingTypes = [
  {
    title: "Package Booking",
    description: "Select your travel package first, then continue with payment.",
    href: "/package",
    icon: Plane,
  },
  {
    title: "Fixed Departure",
    description: "Choose your departure date first, then proceed to pay.",
    href: "/fixed-departures",
    icon: Calendar,
  },
];

const bankDetails = [
  { label: "Account Holder", value: "PARADISE YATRA" },
  { label: "Bank Name", value: "HDFC" },
  { label: "Account No.", value: "50200053051934" },
  { label: "IFSC Code", value: "HDFC0000225" },
  { label: "Branch", value: "RAJPUR ROAD, DEHRADUN" },
];

const checklistItems = [
  "Razorpay ID or UTR number",
  "Full name used for the booking",
  "Package or departure name",
  "Travel date and total travellers",
];

const securityNotes = [
  {
    title: "Use verified details only",
    description: "Pay only through the Razorpay link and bank details shown on this page.",
    icon: ShieldCheck,
  },
  {
    title: "Never share card secrets",
    description: "Do not share OTP, card PIN, CVV, or banking passwords with anyone.",
    icon: CreditCard,
  },
  {
    title: "Confirmation follows verification",
    description: "Payment is reviewed by our team before the booking is fully confirmed.",
    icon: Lock,
  },
];

const portalSteps = [
  {
    step: "Step 01",
    title: "Select Booking",
    accent: "text-blue-600",
  },
  {
    step: "Step 02",
    title: "Payment Method",
    accent: "text-amber-500",
  },
  {
    step: "Step 03",
    title: "Confirmation",
    accent: "text-green-600",
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function PaymentPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopy = async (text: string, type: "link" | "account") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 1800);
      } else {
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 1800);
      }
    } catch {
      if (type === "link") setCopiedLink(false);
      else setCopiedAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white">
      <Header />

      <main className="mx-auto max-w-[1120px] px-4 py-12 md:px-6 md:py-16">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center"
        >
          <motion.h1 
            variants={fadeInUp}
            className="font-unbounded text-4xl font-black tracking-tight !text-slate-950 md:text-5xl lg:text-6xl"
          >
            Secure Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Journey</span>
          </motion.h1>
          <motion.p 
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-2xl text-base font-medium !text-slate-700 md:text-lg"
          >
            Experience a seamless, encrypted payment process. Choose your preferred premium gateway to finalize your luxury getaway.
          </motion.p>
        </motion.section>

        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mt-12 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100"
        >
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {portalSteps.map((item, index) => (
              <div
                key={item.title}
                className="relative px-6 py-5 text-center transition-colors hover:bg-slate-50"
              >
                <p className={`text-sm font-bold tracking-widest uppercase ${item.accent}`}>{item.step}</p>
                <p className="mt-1 text-lg font-bold !text-slate-950">{item.title}</p>
                {index < portalSteps.length - 1 && (
                  <div className="absolute right-[-14px] top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 md:flex">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-8 grid gap-4 md:grid-cols-2"
        >
          {bookingTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Link
                key={type.title}
                href={type.href}
                className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-blue-600/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-950 text-white shadow-inner transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-lg font-bold !text-slate-950">{type.title}</p>
                    <p className="mt-1 text-sm font-medium !text-slate-600">{type.description}</p>
                  </div>
                </div>
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </Link>
            );
          })}
        </motion.section>

        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-10 grid gap-6 lg:grid-cols-2"
        >
          {/* Razorpay Gateway Card */}
          <motion.div variants={fadeInUp} className="group relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl shadow-blue-900/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/30 blur-[80px] transition-all duration-500 group-hover:bg-blue-500/40"></div>
            
            <div className="relative z-10 border-b border-white/10 bg-white/5 px-6 py-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Instant Gateway</h2>
              </div>
            </div>

            <div className="relative z-10 p-6 md:p-8">
              <a
                href={PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/25 active:scale-95"
              >
                Pay Securely with Razorpay
                <ArrowUpRight className="h-5 w-5" />
              </a>

              <div className="mt-8 text-center md:text-left">
                <p className="text-lg font-bold text-white">
                  Accepted: UPI, Cards, Net Banking, Wallets
                </p>
                <p className="mt-2 text-sm leading-relaxed text-blue-100/80">
                  Enjoy a seamless and encrypted transaction using India's most trusted payment gateway. 100% secure processing.
                </p>
              </div>

              <div className="mt-8 flex justify-center md:justify-start">
                <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                  <Image
                    referrerPolicy="origin"
                    src="https://badges.razorpay.com/badge-dark.png"
                    alt="Razorpay Security Badge"
                    width={113}
                    height={45}
                    className="h-[45px] w-auto opacity-90 transition-opacity hover:opacity-100"
                  />
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Unique Payment Link</p>
                <div className="mt-3 flex items-center rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
                  <span className="min-w-0 flex-1 truncate px-4 text-sm font-medium text-white">
                    {PAYMENT_LINK}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(PAYMENT_LINK, "link")}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-all hover:bg-white hover:text-[#000945]"
                    aria-label="Copy payment link"
                  >
                    {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                {copiedLink && <p className="mt-2 text-right text-xs font-semibold text-emerald-400">Payment link copied to clipboard!</p>}
              </div>
            </div>
          </motion.div>

          {/* Bank Transfer Card */}
          <motion.div variants={fadeInUp} className="group overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 transition-all hover:shadow-2xl hover:shadow-slate-200/60 hover:ring-slate-300">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                  <Landmark className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-black tracking-tight !text-slate-950">Direct Transfer</h2>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-lg font-extrabold !text-slate-950">Verified Bank Details</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                  <BadgeCheck className="h-4 w-4" />
                  Verified Account
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200/60">
                <div className="divide-y divide-slate-200/60">
                  {bankDetails.map((item) => (
                    <div key={item.label} className="flex flex-col gap-1 p-4 transition-colors hover:bg-white sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-semibold !text-slate-600">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold !text-slate-950">{item.value}</span>
                        {item.label === "Account No." && (
                          <button
                            onClick={() => handleCopy(item.value, "account")}
                            className="text-slate-400 transition-colors hover:text-blue-600"
                            title="Copy Account Number"
                          >
                            {copiedAccount ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-100/50 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.1em] !text-slate-950">NEFT / IMPS / RTGS</p>
                  <p className="mt-2 text-sm leading-relaxed !text-slate-700">
                    Use these verified details for direct transfer. Please share your transaction reference immediately after payment so we can instantly secure your booking.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-12 grid gap-6 lg:grid-cols-12"
        >
          <motion.div variants={fadeInUp} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-7 lg:p-8">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <h2 className="text-2xl font-black tracking-tight !text-slate-950">
                Post-Payment Checklist
              </h2>
              <p className="mt-2 text-sm leading-relaxed !text-slate-600">
                Ensure a smooth confirmation process by preparing these details after your payment is successful.
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
              {checklistItems.map((item) => (
                <div key={item} className="group flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Square className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm font-semibold !text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200 lg:col-span-5 lg:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl"></div>
            
            <div className="relative z-10 mb-6 border-b border-amber-200/60 pb-5">
              <h2 className="text-2xl font-black tracking-tight text-[#6b4300]">
                Security Notes
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#8c5e0a]">
                Your safety is our priority. Follow these strict guidelines to protect your transaction.
              </p>
            </div>

            <div className="relative z-10 space-y-5">
              {securityNotes.map((note) => {
                const Icon = note.icon;
                return (
                  <div key={note.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-amber-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#6b4300]">{note.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#8c5e0a]">{note.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.section>

        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-8 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl shadow-blue-900/10"
        >
          <div className="flex flex-col gap-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-overlay p-6 md:flex-row md:items-center md:justify-between lg:p-8">
            <div>
              <p className="text-xl font-black tracking-tight text-white">Need help with your payment?</p>
              <p className="mt-2 text-sm text-blue-200">
                Our premium support team is ready to assist you with verification and booking.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+918031274154"
                className="group flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:!text-slate-950"
              >
                <Phone className="h-4 w-4 transition-transform group-hover:scale-110" />
                +91 8031274154
              </a>
              <a
                href="mailto:info@paradiseyatra.com"
                className="group flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:!text-slate-950"
              >
                <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
                Email Support
              </a>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

