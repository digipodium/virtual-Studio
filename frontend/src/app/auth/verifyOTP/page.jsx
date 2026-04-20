"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import API from "@/utils/api";
import toast from "react-hot-toast";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email")?.toLowerCase().trim() || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      if (!email) {
        toast.error("Email is missing ❌");
        return;
      }

      const trimmedOtp = otp.trim();
      if (!trimmedOtp || trimmedOtp.length !== 6) {
        toast.error("Please enter a 6-digit OTP ❌");
        return;
      }

      setLoading(true);

      await API.post("/users/verify-otp", {
        email,
        otp: trimmedOtp,
      });

      toast.success("OTP Verified ✅");

      router.push(
        `/auth/reset-password?email=${encodeURIComponent(email)}&otp=${trimmedOtp}`
      );
    } catch (err) {
      console.error("OTP verification error:", err.response?.data);
      toast.error(err.response?.data?.error || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4 ">
      
      {/* Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8">
        
        {/* Heading */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Verify OTP
        </h1>

        <p className="text-center text-gray-400 text-sm mb-6">
          Enter the 6-digit code sent to
        </p>

        <p className="text-center text-purple-400 text-sm mb-6 break-all">
          {email}
        </p>

        {/* OTP Input */}
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          className="w-full bg-black/40 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-center tracking-widest text-lg focus:outline-none focus:border-purple-500"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {/* Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700 transition-all text-white font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Extra */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Didn’t receive OTP?{" "}
          <span className="text-purple-400 cursor-pointer hover:underline">
            Resend
          </span>
        </p>
      </div>
    </div>
  );
}