"use client";

import React, { useState, useEffect } from "react";
import { Plane, Mail, Lock, Eye, EyeOff, Globe, ArrowRight, Compass, Loader2, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { API_CONFIG } from "@/config/api";
import GoogleOAuthClientProvider from "@/components/GoogleOAuthClientProvider";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuth();
    const router = useRouter();
    const hasGoogleClientId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

    const bgImage = "/Login/Image.jpg";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Manual validation
        if (!email.trim() || !password.trim()) {
            setError("Please fill out the required fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token, data.user);
                router.push("/");
            } else {
                setError(data.message || "Invalid credentials. Please try again.");
            }
        } catch (err) {
            setError("Something went wrong. Please check your connection.");
        } finally {
            setLoading(false);
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
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />

                {/* Branding Content removed */}
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-[400px]">


                    <div className="mb-4 text-center lg:text-left">
                        <h2 className="text-2xl font-extrabold mb-1.5 font-sans whitespace-nowrap text-[#000945]" style={{ fontWeight: 800 }}>Welcome back</h2>
                        <p className="text-slate-400 text-xs font-medium">Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-xs font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-3.5" noValidate>

                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-semibold text-[#000945] mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                    placeholder="hello@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-semibold text-[#000945] mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 focus:outline-none cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Options Row */}
                        <div className="flex items-center justify-end text-xs px-1">
                            <Link href="/forgot-password" title="Forgot password" className="text-blue-600 font-semibold hover:underline transition-all cursor-pointer">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-[6px] shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all disabled:opacity-70 cursor-pointer"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Sign in to your account
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Logins */}
                        <div className="flex justify-center">
                            <div className="w-full">
                                <div className="cursor-pointer">
                                    {hasGoogleClientId ? (
                                        <GoogleLogin
                                            onSuccess={async (credentialResponse: CredentialResponse) => {
                                                if (!credentialResponse.credential) return;
                                                setLoading(true);
                                                try {
                                                    const response = await fetch(API_CONFIG.getApiUrl(API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN), {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ idToken: credentialResponse.credential }),
                                                    });
                                                    const data = await response.json();
                                                    if (response.ok) {
                                                        login(data.token, data.user);
                                                        router.push("/");
                                                    } else {
                                                        setError(data.message || "Google Login failed.");
                                                    }
                                                } catch (err) {
                                                    setError("Connection error. Please try again.");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            onError={() => setError("Google Login failed.")}
                                            useOneTap={false}
                                            theme="outline"
                                            shape="rectangular"
                                            text="continue_with"
                                            width="100%"
                                            logo_alignment="center"
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <p className="text-center text-sm text-slate-500 pt-4">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-bold hover:underline underline-offset-4 transition-colors ml-1 cursor-pointer">
                                Sign up for free
                            </Link>
                        </p>

                    </form>
                </div>
            </div>
            </div>
        </GoogleOAuthClientProvider>
    );
}
