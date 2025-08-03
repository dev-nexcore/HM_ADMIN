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
    <div className="min-h-screen bg-[#9AAA87]">
      {/* Desktop Layout: Hidden on mobile, shown on large screens */}
      <div className="hidden lg:flex items-center justify-center min-h-screen px-4">
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

      {/* Mobile Layout: This div contains the new mobile-specific code. */}
      {/* It is a flex container by default and becomes hidden on large screens (lg:). */}
      <div className="lg:hidden flex flex-col items-center w-full h-full">
        {/* Top white section with logo */}
        <div className="w-full flex flex-col items-center justify-center bg-white pt-2 pb-10 rounded-b-[20px] relative z-0">
          <img
            src="/photos/logo.png"
            alt="Logo"
            className="w-[300px] h-[280px] bg-white p-4 rounded-lg object-contain"
          />
        </div>
        {/* Forgot Password Form Card - white, positioned to overlap */}
        <div
          className="absolute top-[300px] w-9/12 max-w-sm bg-white rounded-t-[20px] rounded-b-xl z-20 p-0 min-h-[400px] overflow-hidden"
          style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
        >
          {/* Header with border touching edges */}
          <div className="w-full">
            <h2
              className="text-xl font-bold text-black bg-white text-center py-4 m-0 rounded-t-[20px] rounded-b-[20px]"
              style={{
                border: "0.5px solid #000000",
                fontFamily: "Poppins",
                fontWeight: "600",
              }}
            >
              Forget Password
            </h2>
          </div>
          {/* Forgot Password Form */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              {/* Email ID */}
              <div>
                <label className="block text-lg font-bold mb-2">Email ID</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email ID"
                  required
                  className="w-full px-5 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87] placeholder:font-medium"
                  style={{
                    boxShadow: "0px 4px 10px 0px #00000040",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "500",
                  }}
                />
              </div>
              {/* Error/Success Messages */}
              {errorMsg && <div className="text-red-600 text-sm font-semibold text-center">{errorMsg}</div>}
              {successMsg && <div className="text-green-600 text-sm font-semibold text-center">{successMsg}</div>}
              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-[200px] cursor-pointer bg-[#A4B494] text-black font-bold py-3 rounded-xl hover:bg-[#9AAA87] transition-all duration-200"
                  style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
                >
                  {loading ? "Sending..." : "Submit"}
                </button>
              </div>
              {/* Back to Login Link */}
              <div className="text-center mt-2">
                <Link
                  href="/"
                  className="text-sm font-semibold hover:underline"
                  style={{
                    color: "#1109FF",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "600",
                  }}
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
        {/* Bottom quote section - on green background */}
        <div className="w-full flex flex-col items-center justify-center text-center px-6 py-10 mt-[400px]">
          <p className="text-black text-lg font-semibold max-w-lg">
            "Manage Your Hostel Smarter – Everything You Need in One Platform."
          </p>
        </div>
      </div>
    </div>

  );
};

export default ForgotPassword;
