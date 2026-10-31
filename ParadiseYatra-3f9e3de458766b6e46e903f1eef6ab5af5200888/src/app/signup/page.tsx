"use client";

import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Loader2, Compass, Sparkles, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { API_CONFIG } from "@/config/api";
import GoogleOAuthClientProvider from "@/components/GoogleOAuthClientProvider";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const hasGoogleClientId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const bgImage = "/Login/Image.jpg";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstName = formData.name.split(' ')[0];
    if (!firstName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Please fill out the required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_CONFIG.getFullUrl('/api/auth/send-otp'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtpStep(true);
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setError("");

    try {
      const response = await fetch(API_CONFIG.getFullUrl('/api/auth/register'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        router.push("/");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <GoogleOAuthClientProvider>
      <div className="h-screen flex bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      {/* Back to Website Button */}
      <Link
        href="/"
        className="absolute top-3 left-3 z-50 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 rounded-[6px] text-[11px] font-bold shadow-sm transition-all hover:shadow-md cursor-pointer border border-slate-100 group"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Website
      </Link>

      {/* Left Panel - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />

        {/* Branding Content removed */}
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[400px]">


          {!showOtpStep ? (
            <>
              <div className="mb-4 text-center lg:text-left">
                <h2 className="text-2xl font-extrabold mb-1.5 font-sans whitespace-nowrap text-[#000945]" style={{ fontWeight: 800 }}>Create an account</h2>
                <p className="text-xs text-slate-400">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-blue-600 hover:underline transition-all cursor-pointer">Log in</Link>
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-800 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-2.5" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#000945] mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.name.split(' ')[0]}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value + ' ' + (formData.name.split(' ')[1] || '') })}
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#000945] mb-1">Last Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        onChange={(e) => setFormData({ ...formData, name: (formData.name.split(' ')[0] || '') + ' ' + e.target.value })}
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#000945] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                      placeholder="hello@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#000945] mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#000945] mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-[6px] shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:shadow-md disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 text-center leading-relaxed px-4">
                  By proceeding, you agree to our{" "}
                  <Link href="/terms-and-conditions" className="underline underline-offset-2 hover:text-blue-600 transition-colors cursor-pointer">Terms of Use</Link>{" "}
                  and confirm you have read our{" "}
                  <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-blue-600 transition-colors cursor-pointer">Privacy and Cookie Statement</Link>.
                </p>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-white text-slate-400 font-medium">Or register with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-full cursor-pointer">
                    {hasGoogleClientId ? (
                      <GoogleLogin
                        onSuccess={async (credentialResponse: CredentialResponse) => {
                          if (!credentialResponse.credential) return;
                          setLoading(true);
                          try {
                            const response = await fetch(API_CONFIG.getApiUrl(API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN), {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                idToken: credentialResponse.credential,
                                phone: formData.phone
                              }),
                            });
                            const data = await response.json();
                            if (response.ok) {
                              login(data.token, data.user);
                              router.push("/");
                            } else {
                              setError(data.message || "Google registration failed.");
                            }
                          } catch (err) {
                            setError("Connection error. Please try again.");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        onError={() => setError("Google registration failed.")}
                        useOneTap={false}
                        theme="outline"
                        shape="rectangular"
                        text="signup_with"
                        width="100%"
                        logo_alignment="center"
                      />
                    ) : null}
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 text-blue-600 mb-6">
                <Mail className="h-10 w-10 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-3 !font-unbounded text-[#000945]">Check your email</h2>
              <p className="text-slate-400 mb-8">
                We've sent a 6-digit verification code to <br />
                <span className="text-slate-900 font-semibold">{formData.email}</span>
              </p>

              <form onSubmit={handleSignup} className="space-y-6" noValidate>
                <div className="flex justify-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full max-w-[240px] px-4 py-4 bg-white border border-slate-200 rounded-[6px] text-4xl text-center tracking-[0.5em] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    type="submit"
                    disabled={otpLoading || otp.length !== 6}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[6px] transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {otpLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Complete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtpStep(false)}
                    className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    Go back and edit
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      </div>
    </GoogleOAuthClientProvider>
  );
}
