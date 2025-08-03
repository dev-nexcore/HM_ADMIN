"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/forgot-password`, { email });
      setSuccessMsg("OTP has been sent to your email");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#9AAA87] px-4">
  <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.2)] px-20 py-28">
    <h1 className="text-3xl font-bold text-center text-black mb-10">
      Forget Password
    </h1>

    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
      <div className="w-full max-w-sm">
        <label htmlFor="email" className="text-lg font-semibold block mb-2 text-black">
          Email ID
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Email ID"
          required
          className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9AAA87] shadow-md"
        />
      </div>

      {errorMsg && (
        <div className="text-red-600 text-sm font-semibold text-center">{errorMsg}</div>
      )}

      {successMsg && (
        <div className="text-green-600 text-sm font-semibold text-center">{successMsg}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-50 bg-[#BEC5AD] text-black font-bold py-2 px-4 cursor-pointer shadow-md rounded-lg hover:bg-[#9aab86] transition duration-200"
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>

      <div className="text-center mt-2">
        <Link
          href="/"
          className="text-gray-800 font-medium hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </form>
  </div>
</div>

  );
};

export default ForgotPassword;
