"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Loader2 } from "lucide-react";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<
  "login" | "forgot" | "otp" | "reset"
>("login");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // if (data.user.role !== "admin") {
      //   setError("Access denied. Admin privileges required.");
      //   return;
      // }

      const STAFF_ROLES = ["admin", "developer", "marketer", "packageManager", "legal"];
      if (!STAFF_ROLES.includes(data.user.role)) {
        setError("Access denied. You don't have dashboard access.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      router.push("/admin");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  setLoading(true);
  setError("");
  setMessage("");

  try {
    const response = await fetch(
      "/api/auth/admin/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to send OTP"
      );
    }

    setMessage("OTP sent to your email.");
    setMode("otp");

  } catch (err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to send OTP"
    );
  } finally {
    setLoading(false);
  }
};

const handleVerifyOTP = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  setLoading(true);
  setError("");
  setMessage("");

  try {
    const response = await fetch(
      "/api/auth/admin/verify-reset-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Invalid OTP"
      );
    }

    setMessage("OTP verified successfully.");
    setMode("reset");

  } catch (err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : "Invalid OTP"
    );
  } finally {
    setLoading(false);
  }
};

const handleResetPassword = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  setError("");
  setMessage("");

  if (newPassword !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (newPassword.length < 6) {
    setError(
      "Password must be at least 6 characters."
    );
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      "/api/auth/admin/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to reset password"
      );
    }

    setMessage(
      "Password reset successfully. You can now login."
    );

    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");

    setMode("login");

  } catch (err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to reset password"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
          <div className="space-y-1 pb-2 pt-8 px-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Image
                  src="/footerLogo.png"
                  alt="logo"
                  className="w-20 h-20 object-contain"
                  width={80}
                  height={80}
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Admin Portal
            </h2>
            <p className="text-center text-gray-800 text-sm font-medium">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <CardContent className="pt-2 px-6 pb-8">

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm font-medium mb-5">
                {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
              <div className="bg-green-100 border-2 border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm font-medium mb-5">
                {message}
              </div>
            )}

            {/* ================= LOGIN ================= */}
            {mode === "login" && (
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* EMAIL */}
                <div className="space-y-3">
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-gray-900"
                  >
                    Email Address
                  </label>

                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                    className="h-12 bg-white text-gray-900 border-2 border-gray-300"
                  />
                </div>

                {/* PASSWORD */}
                <div className="space-y-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-gray-900"
                  >
                    Password
                  </label>

                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="h-12 text-gray-900 bg-white border-2 border-gray-300"
                  />

                  {/* FORGOT PASSWORD */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setMessage("");
                        setMode("forgot");
                      }}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* LOGIN BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

              </form>
            )}


            {/* ================= FORGOT PASSWORD ================= */}
            {mode === "forgot" && (
              <form
                onSubmit={handleForgotPassword}
                className="space-y-6"
              >

                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Forgot Password?
                  </h3>

                  <p className="mt-2 text-sm text-gray-600">
                    Enter your admin email address and we'll
                    send you a verification OTP.
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="forgot-email"
                    className="block text-sm font-bold text-gray-900"
                  >
                    Admin Email
                  </label>

                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="admin@paradiseyatra.com"
                    required
                    className="h-12"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setMode("login");
                  }}
                  className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  ← Back to Login
                </button>

              </form>
            )}


            {/* ================= OTP ================= */}
            {mode === "otp" && (
              <form
                onSubmit={handleVerifyOTP}
                className="space-y-6"
              >

                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Verify OTP
                  </h3>

                  <p className="mt-2 text-sm text-gray-600">
                    Enter the 6-digit OTP sent to:
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {email}
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="otp"
                    className="block text-sm font-bold text-gray-900"
                  >
                    Verification Code
                  </label>

                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="123456"
                    required
                    className="h-12 text-center text-xl tracking-[0.4em]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setMode("forgot");
                  }}
                  className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  ← Change Email
                </button>

              </form>
            )}


            {/* ================= RESET PASSWORD ================= */}
            {mode === "reset" && (
              <form
                onSubmit={handleResetPassword}
                className="space-y-6"
              >

                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Reset Password
                  </h3>

                  <p className="mt-2 text-sm text-gray-600">
                    Create a new password for your admin account.
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-bold text-gray-900"
                  >
                    New Password
                  </label>

                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    minLength={6}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-bold text-gray-900"
                  >
                    Confirm Password
                  </label>

                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                    className="h-12"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

              </form>
            )}

            </CardContent>
          </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-700 text-sm font-medium">
            Not an admin?{" "}
            <a
              href="#"
              className="font-bold text-indigo-700 hover:text-indigo-800 underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
