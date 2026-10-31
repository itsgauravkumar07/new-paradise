"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SocialJourneySection from "@/components/SocialJourneySection";

function FieldError({ message }: { message?: string }) {
  return (
    <div className="relative z-20 mt-1 h-[14px] overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        {message ? (
          <motion.p
            key={message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-[11px] font-medium leading-none !text-red-500"
            style={{ color: "#ef4444" }}
          >
            {message}
          </motion.p>
        ) : (
          <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 0 }} className="text-[11px]">
            &nbsp;
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactPage() {
  const [footerData, setFooterData] = useState<{
    companyInfo?: { phone?: string; email?: string; whatsapp?: string };
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitFeedback, setSubmitFeedback] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  }>({});

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch("/api/footer");
        if (response.ok) {
          const data = await response.json();
          setFooterData(data);
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      }
    };
    fetchFooterData();
  }, []);

  const companyInfo = {
    phone: footerData?.companyInfo?.phone || "+91 8031274154",
    email: footerData?.companyInfo?.email || "planners@paradiseyatra.com",
    whatsapp: footerData?.companyInfo?.whatsapp || "+91 6383822508",
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const validateForm = () => {
    const nextErrors: {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    } = {};

    const fullName = formData.name.trim();
    if (!fullName) {
      nextErrors.name = "Please enter your full name.";
    } else if (fullName.length < 3) {
      nextErrors.name = "Full name should be at least 3 characters.";
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone number is mandatory so we can reach you.";
    } else if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      nextErrors.phone = "Please enter a valid mobile number (10 to 13 digits).";
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        nextErrors.email = "Please enter a valid email address (example: name@email.com).";
      }
    } else {
      nextErrors.email = "Please enter your email address.";
    }

    if (!formData.subject) {
      nextErrors.subject = "Please select a query type.";
    }

    if (!formData.message.trim()) {
      nextErrors.message = "Please enter your message.";
    } else if (formData.message.trim().length < 10) {
      nextErrors.message = "Please add at least 10 characters in your message.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitFeedback("");

    try {
      const response = await fetch("/api/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          source: "contact-page",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit form. Please try again.");
      }

      setSubmitStatus("success");
      setSubmitFeedback("Thank you for reaching out. Our team will contact you shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });

      setTimeout(() => {
        setSubmitStatus("idle");
        setSubmitFeedback("");
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitFeedback(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Header />
      
      <main>
      <section className="relative flex min-h-[300px] items-center overflow-hidden bg-slate-900 md:min-h-[360px]">
        <img
          src="/Contact/Hero/contact_hero.webp"
          alt="Contact the Paradise Yatra team"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/65 to-slate-900/30" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-14">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
              We are here to help
            </span>
            <h1 className="!text-[30px] font-extrabold leading-tight !text-white drop-shadow-lg sm:!text-4xl md:!text-5xl">
              Contact Us
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/90 md:text-base">
              Have a question about your next trip? Our travel experts are ready to help you plan with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 md:rounded-3xl">
              <div className="mb-5">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Send us a message</span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#000945] md:text-3xl">Get in touch</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Share a few details and our team will get back to you shortly.
                </p>
              </div>

              {submitStatus === "success" ? (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                  <CheckCircle className="mb-4 h-14 w-14 text-green-500" />
                  <h4 className="mb-2 text-2xl font-bold text-[#000945]">You are all set.</h4>
                  <p className="max-w-sm text-sm text-slate-600">
                    {submitFeedback || "Thank you for reaching out. Our team will contact you shortly."}
                  </p>
                </div>
              ) : submitStatus === "error" ? (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                  <AlertCircle className="mb-4 h-14 w-14 text-red-500" />
                  <h4 className="mb-2 text-2xl font-bold text-[#000945]">Submission Failed</h4>
                  <p className="max-w-sm text-sm text-slate-600">
                    {submitFeedback || "Something went wrong. Please try again."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitStatus("idle");
                      setSubmitFeedback("");
                    }}
                    className="mt-4 rounded-xl bg-[#155dfc] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4bce]"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1 block text-[12px] font-bold text-[#121417]">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#121417] outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                        placeholder="Enter your name*"
                      />
                      <FieldError message={errors.name} />
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1 block text-[12px] font-bold text-[#121417]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#121417] outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                        placeholder="Enter your phone number*"
                      />
                      <FieldError message={errors.phone} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1 block text-[12px] font-bold text-[#121417]">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#121417] outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      placeholder="Enter your email*"
                    />
                    <FieldError message={errors.email} />
                  </div>

                  <div>
                    <label htmlFor="subject" className="mb-1 block text-[12px] font-bold text-[#121417]">
                      Query Type
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, subject: value }));
                        setErrors((prev) => ({ ...prev, subject: undefined }));
                      }}
                    >
                      <SelectTrigger
                        id="subject"
                        className="h-11 w-full !rounded-xl !border !border-slate-200 !bg-white px-3 text-sm !text-[#121417] transition focus:!border-primary focus:!ring-4 focus:!ring-primary/10"
                      >
                        <SelectValue placeholder="Select query type" />
                      </SelectTrigger>
                      <SelectContent className="!rounded-xl border-slate-200">
                        <SelectItem value="package-booking">Package Booking</SelectItem>
                        <SelectItem value="career-related">Career Related</SelectItem>
                        <SelectItem value="payment-support">Payment Support</SelectItem>
                        <SelectItem value="refund-cancellation">Refund / Cancellation</SelectItem>
                        <SelectItem value="business-related">Business Related</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.subject} />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-1 block text-[12px] font-bold text-[#121417]">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#121417] outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <FieldError message={errors.message} />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 min-w-[220px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#155dfc] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f4bce] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    {!isSubmitting && <Send className="h-4 w-4" />}
                  </button>
                </form>
              )}
            </div>

            <div className="flex h-full flex-col gap-6">
              <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 text-[#000945] shadow-sm sm:p-7 md:rounded-3xl [&_p]:!text-[#000945] [&_span]:!text-[#000945] [&_svg]:!text-primary">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Reach our team</span>
                <h2 className="mb-5 mt-2 text-2xl font-bold tracking-tight text-[#000945] md:text-3xl">Contact Information</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#000945]">
                      <Phone className="h-4 w-4" />
                      <span className="text-[12px] font-bold text-[#000945]">Phone</span>
                    </div>
                    <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`} className="block text-[15px] text-[#000945] hover:underline">
                      {companyInfo.phone}
                    </a>
                    <a href={`tel:${companyInfo.whatsapp.replace(/\s+/g, "")}`} className="block text-[13px] text-[#000945] hover:underline">
                      {companyInfo.whatsapp}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#000945]">
                      <MapPin className="h-4 w-4" />
                      <span className="text-[12px] font-bold text-[#000945]">Address</span>
                    </div>
                    <p className="text-[15px] text-[#000945]">108, Tagore Villa, Chakrata Road, Dehradun, Uttarakhand - 248001</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-[#000945]">
                      <Mail className="h-4 w-4" />
                      <span className="text-[12px] font-bold text-[#000945]">Email</span>
                    </div>
                    <a href={`mailto:${companyInfo.email}`} className="block text-[15px] text-[#000945] hover:underline">
                      {companyInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 text-[#000945] shadow-sm sm:p-7 md:rounded-3xl [&_p]:!text-[#000945] [&_span]:!text-[#000945]">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Customer support</span>
                <h2 className="mb-5 mt-2 text-2xl font-bold tracking-tight text-[#000945] md:text-3xl">Grievance Officer</h2>
                <div className="space-y-3">
                  <div>
                    <p style={{ color: "#000945" }} className="text-[12px] font-bold">Name</p>
                    <p style={{ color: "#000945" }} className="text-[15px]">Dikshant Sharma</p>
                  </div>
                  <div>
                    <p style={{ color: "#000945" }} className="text-[12px] font-bold">Phone</p>
                    <a href="tel:+919873391733" style={{ color: "#000945" }} className="block text-[15px] hover:underline">
                      +91 9873391733
                    </a>
                  </div>
                  <div>
                    <p style={{ color: "#000945" }} className="text-[12px] font-bold">Email</p>
                    <a href="mailto:dikshant@paradiseyatra.com" style={{ color: "#000945" }} className="block text-[15px] hover:underline">
                      dikshant@paradiseyatra.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:rounded-3xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1388.6582464962262!2d78.03477118988253!3d30.327473883386677!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092a19318db8c3%3A0xd8c55020cab7d0c4!2sParadise%20Yatra!5e0!3m2!1sen!2sin!4v1772634410746!5m2!1sen!2sin"
              style={{ border: 0, width: "100%", height: 360 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            ></iframe>
          </div>
        </div>
      </section>
      <SocialJourneySection />
      </main>
    </div>
  );
}
