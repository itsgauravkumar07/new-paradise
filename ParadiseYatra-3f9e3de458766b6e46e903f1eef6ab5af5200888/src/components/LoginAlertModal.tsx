"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Mail, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "react-toastify";
import { API_CONFIG } from "@/config/api";
import GoogleOAuthClientProvider from "@/components/GoogleOAuthClientProvider";

interface LoginAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme?: "pink" | "blue";
}

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 533.5 544.3"
        className={className}
        aria-hidden="true"
        focusable="false"
    >
        <path
            fill="#4285F4"
            d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.3h146.9c-6.3 34-25 62.8-53.4 82l86.4 67.2c50.5-46.6 81.6-115.4 81.6-194.1z"
        />
        <path
            fill="#34A853"
            d="M272 544.3c72.6 0 133.6-24 178.1-65.2l-86.4-67.2c-24 16.1-54.7 25.6-91.7 25.6-70.4 0-130.1-47.6-151.5-111.5H32.8v69.9c44.6 88.2 136.4 148.4 239.2 148.4z"
        />
        <path
            fill="#FBBC04"
            d="M120.5 326.1c-10.3-30.9-10.3-64.2 0-95.1v-69.9H32.8c-43.6 87.3-43.6 190.4 0 277.7l87.7-69.9z"
        />
        <path
            fill="#EA4335"
            d="M272 107.7c39.5-.6 77.5 14.1 106.6 41.1l79.7-79.7C409.2 24.7 342.2-0.4 272 0 169.2 0 77.4 60.2 32.8 148.4l87.7 69.9C141.9 155.3 201.6 107.7 272 107.7z"
        />
    </svg>
);

const LoginAlertModal = ({ isOpen, onClose, theme = "blue" }: LoginAlertModalProps) => {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const hasGoogleClientId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    const showGoogleLogin = isOpen && hasGoogleClientId;

    const handleLoginRedirect = () => {
        router.push("/login");
        onClose();
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            toast.error("Google login failed. No credential received.");
            return;
        }

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
                toast.success("Logged in successfully!");
                onClose();
            } else {
                toast.error(data.message || "Google Login failed.");
            }
        } catch (err) {
            toast.error("Connection error. Please try again.");
            console.error("Google login error:", err);
        } finally {
            setLoading(false);
        }
    };

    const headingText = "Making a list? Log in to add your saves to a trip you can edit or share.";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px] p-0 border border-[#dfe1df] shadow-2xl bg-white overflow-visible !rounded-[6px]">
                <div className="flex flex-col items-center px-6 sm:px-10 pt-10 pb-10">
                    {/* Logo Section */}
                    <div className="mb-6 relative h-14 w-14 flex items-center justify-center bg-blue-50 rounded-[6px] border border-blue-100">
                        <Image
                            src="/favicon.png"
                            alt="Paradise Yatra Logo"
                            fill
                            sizes="48px"
                            className="object-contain"
                        />
                    </div>

                    {/* Text Section */}
                    <h2 className="!text-lg sm:!text-xl !font-black !text-[#000945] text-center leading-[1.4] mb-8 tracking-tight px-2">
                        {headingText}
                    </h2>

                    {/* Buttons Section */}
                    <div className="flex flex-col gap-3 w-full">
                        <div className="relative w-full h-11 group">
                            {/* The "Look-alike" container that matches email button style */}
                            <div className="absolute inset-0 w-full h-full rounded-[6px] border border-slate-300 bg-white group-hover:bg-slate-50 flex items-center justify-center gap-3 px-6 transition-all group-active:scale-[0.98] pointer-events-none shadow-none text-slate-700">
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                ) : (
                                    <GoogleIcon className="h-5 w-5" />
                                )}
                                <span className="text-sm font-bold">
                                    {loading ? "Processing..." : "Continue with Google"}
                                </span>
                            </div>

                            {/* The hidden real Google button - scaled to cover the entire container */}
                            <div className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer flex justify-center items-center">
                                <div className="scale-[5] origin-center">
                                    {showGoogleLogin ? (
                                        <GoogleOAuthClientProvider>
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={() => toast.error("Google Login failed")}
                                                useOneTap={false}
                                                theme="outline"
                                                shape="rectangular"
                                                width="320px"
                                            />
                                        </GoogleOAuthClientProvider>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleLoginRedirect}
                            variant="outline"
                            className="w-full h-11 rounded-[6px] border border-slate-300 !text-slate-700 bg-white hover:bg-slate-50 !font-bold flex items-center justify-center gap-3 px-6 transition-all !text-sm active:scale-[0.98] !shadow-none"
                        >
                            <Mail className="h-5 w-5 text-slate-500" />
                            Continue with email
                        </Button>
                    </div>

                    {/* Footer Text */}
                    <div className="mt-8 text-center max-w-[320px]">
                        <p className="!text-[10px] !text-slate-500 !leading-relaxed !font-medium">
                            By proceeding, you agree to our <span className="!text-blue-600 underline cursor-pointer hover:!text-blue-700 font-bold">Terms of Use</span> and confirm you have read our <span className="!text-blue-600 underline cursor-pointer hover:!text-blue-700 font-bold">Privacy and Cookie Statement</span>.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LoginAlertModal;
