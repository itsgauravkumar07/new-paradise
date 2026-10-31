"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";

export default function NewsletterSubscribe() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setStatus("error");
            setMessage("Please enter your email address to continue.");
            setTimeout(() => setStatus("idle"), 3000);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus("error");
            setMessage("Please enter a valid email address.");
            setTimeout(() => setStatus("idle"), 3000);
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const response = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: 'footer-newsletter-form' }),
            });

            if (response.status === 201) {
                // New subscription
                setStatus("success");
                setMessage("Thank you! Your journey begins soon.");
                setEmail("");
                setTimeout(() => {
                    setStatus("idle");
                    setMessage("");
                }, 4000);
            } else if (response.status === 200) {
                // Already subscribed
                setStatus("duplicate");
                setMessage("You're already part of our travel family! 🌍");
                setTimeout(() => {
                    setStatus("idle");
                    setMessage("");
                }, 4000);
            } else {
                setStatus("error");
                setMessage("Subscription failed. Please try again.");
                setTimeout(() => setStatus("idle"), 3000);
            }
        } catch (error) {
            setStatus("error");
            setMessage("An error occurred. Please try again.");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

       return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-strong via-primary to-blue-500 px-4 py-5 text-white shadow-2xl shadow-blue-900/20 sm:rounded-3xl sm:px-6 sm:py-7 md:px-10 md:py-8">
            <div className="relative grid items-center gap-4 sm:gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
                {/* Left: copy */}
                <div className="flex items-center gap-5">
                    <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 sm:flex">
                        <Mail className="h-7 w-7" />
                    </span>
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 sm:text-[11px]">
                            Exclusive traveler newsletter
                        </span>
                        <h2 className="mt-0.5 text-xl font-extrabold leading-tight !text-white sm:mt-1 sm:text-2xl md:text-3xl">Stay in the Loop!</h2>
                        <p className="mt-1 text-[13px] text-white/85 sm:mt-2 sm:text-sm md:text-base">
                            <span className="sm:hidden">Deals, new trips and travel tips in your inbox.</span>
                            <span className="hidden sm:inline">Be the first to hear about seasonal discounts, new trips and insider travel tips.</span>
                        </p>
                    </div>
                </div>

                {/* Right: form */}
                <div>
                    <form onSubmit={handleSubmit} noValidate>
                        <div
                            className={`flex items-center gap-2 rounded-full border bg-white/10 p-1.5 pl-3.5 backdrop-blur-md transition-colors sm:p-2 sm:pl-4 ${
                                status === "error" ? "border-red-300" : "border-white/25 focus-within:border-white/70"
                            }`}
                        >
                            <Mail className="h-4 w-4 shrink-0 text-white/70" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                aria-label="Email address"
                                disabled={status === "loading" || status === "success"}
                                className="min-w-0 flex-1 bg-transparent text-sm font-medium !text-white placeholder:text-white/60 focus:outline-none disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={status === "loading" || status === "success"}
                                className="flex shrink-0 items-center gap-1.5 rounded-full bg-tertiary px-4 py-2.5 text-[13px] font-bold text-white shadow-md transition-colors hover:bg-amber-600 disabled:cursor-default disabled:opacity-80 cursor-pointer sm:px-6 sm:py-3 sm:text-sm"
                                aria-label="Subscribe"
                            >
                                {status === "loading" ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : status === "success" ? (
                                    <>Subscribed <Check className="h-4 w-4" /></>
                                ) : (
                                    <>Subscribe <ArrowRight className="h-4 w-4" /></>
                                )}
                            </button>
                        </div>

                        {/* One line under the field: the result message when there is one, otherwise the reassurance */}
                        <div className="mt-2 min-h-[1.125rem] text-[11px] sm:mt-3 sm:text-xs" aria-live="polite">
                            {message ? (
                                <p
                                    className={`font-medium ${
                                        status === "success"
                                            ? "text-emerald-200"
                                            : status === "duplicate"
                                                ? "text-amber-200"
                                                : "text-red-200"
                                    }`}
                                >
                                    {message}
                                </p>
                            ) : (
                                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-white/80">
                                    <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> No spam, ever</li>
                                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Unsubscribe in 1 click</li>
                                </ul>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
