"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoPackagesEnquiryFormProps {
    context?: string; // Short summary of what the visitor searched/filtered for
}

const NoPackagesEnquiryForm = ({ context }: NoPackagesEnquiryFormProps) => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim() || !phone.trim()) {
            setError("Please share your name and phone number so we can reach you.");
            return;
        }

        setIsSubmitting(true);
        try {
            const fullMessage = [
                message.trim() ? message.trim() : "No additional details provided.",
                context ? `\n\nWhat they were looking for: ${context}` : "",
            ].join("");

            const response = await fetch("/api/contact-form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                    subject: "Custom Package Request",
                    message: fullMessage,
                    source: "package-search-no-results",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit");
            }

            setIsSubmitted(true);
        } catch (err) {
            console.error("Custom package enquiry error:", err);
            setError("Something went wrong. Please try again in a moment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center gap-3 py-6 px-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 flex-shrink-0" />
                <p className="!text-[#000945] font-bold text-sm max-w-xs">
                    Thanks! We've got your request — our team will reach out with a personalised package soon.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-3 text-left px-4 sm:px-0">
            <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-[6px] border border-[#dfe1df] text-base sm:text-sm !text-[#000945] outline-none focus:border-[#155dfc] transition-colors"
            />
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full sm:w-1/2 px-4 py-3 rounded-[6px] border border-[#dfe1df] text-base sm:text-sm !text-[#000945] outline-none focus:border-[#155dfc] transition-colors"
                />
                <input
                    type="email"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full sm:w-1/2 px-4 py-3 rounded-[6px] border border-[#dfe1df] text-base sm:text-sm !text-[#000945] outline-none focus:border-[#155dfc] transition-colors"
                />
            </div>
            <textarea
                placeholder="Tell us what you're looking for (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-[6px] border border-[#dfe1df] text-base sm:text-sm !text-[#000945] outline-none focus:border-[#155dfc] transition-colors resize-none"
            />
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full !bg-[#155dfc] !text-white font-bold py-3 rounded-[6px] h-auto text-base sm:text-sm transition-all disabled:opacity-60"
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </span>
                ) : (
                    "Request My Package"
                )}
            </Button>
        </form>
    );
};

export default NoPackagesEnquiryForm;