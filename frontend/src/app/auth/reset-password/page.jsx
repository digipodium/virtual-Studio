"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import API from "@/utils/api";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email")?.toLowerCase().trim() || "";
  const otp = searchParams.get("otp") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Email is missing ❌");
      return;
    }

    if (!otp) {
      toast.error("OTP is missing ❌");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match ❌");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters ❌");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/users/reset-password", {
        email,
        otp,
        newPassword,
      });

      toast.success("Password Reset Successfully ✅");
      router.push("/auth/login");
    } catch (err) {
      console.error("Reset password error:", err.response?.data);
      toast.error(err.response?.data?.error || "Failed to reset password ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] flex items-center justify-center p-4">
      <form
        onSubmit={handleResetPassword}
        className="bg-[#111827] p-8 rounded-xl border border-slate-800 w-96 shadow-2xl text-center"
      >
        <h2 className="text-2xl text-purple-500 font-bold mb-4">Reset Password</h2>
        <p className="text-white text-sm mb-6">Enter your new password</p>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 bg-gray-800 text-white rounded-lg outline-none border border-slate-700 focus:border-cyan-600 transition-all"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 bg-gray-800 text-white rounded-lg outline-none border border-slate-700 focus:border-cyan-600 transition-all"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-md hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/auth/login"
            className="text-sm font-semibold text-gray-500 hover:underline"
          >
            Back to login
          </a>
        </div>
      </form>
    </div>
  );
}
