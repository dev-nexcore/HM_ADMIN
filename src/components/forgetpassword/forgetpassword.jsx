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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/forgot-password`, { email });
      setSuccessMsg("OTP has been sent to your email");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#9AAA87]">
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

      {/* Mobile Layout - Fully Responsive for All Devices */}
      <div className="lg:hidden flex flex-col items-center w-full h-full relative overflow-hidden">
        {/* Top white section with logo - Responsive sizing */}
        <div className="w-full flex flex-col items-center justify-center bg-white pt-2 pb-10 sm:pb-8 md:pb-10 rounded-b-[20px] relative z-0">
          <img
            src="/photos/logo.png"
            alt="Logo"
            className="w-[200px] h-[180px] xs:w-[220px] xs:h-[200px] sm:w-[260px] sm:h-[240px] md:w-[300px] md:h-[280px] bg-white p-3 sm:p-4 rounded-lg object-contain"
          />
        </div>

        {/* Forgot Password Form Card - Fully responsive positioning and sizing */}
        <div
          className="absolute top-[200px] xs:top-[220px] sm:top-[260px] md:top-[300px] w-[85%] xs:w-[80%] sm:w-[75%] md:w-9/12 max-w-[400px] bg-white rounded-t-[20px] rounded-b-xl z-20 p-0 min-h-[350px] xs:min-h-[380px] sm:min-h-[400px] overflow-hidden"
          style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
        >
          {/* Header with border touching edges - Responsive text */}
          <div className="w-full">
            <h2
              className="text-lg xs:text-xl sm:text-xl font-bold text-black bg-white text-center py-3 xs:py-4 m-0 rounded-t-[20px] rounded-b-[20px]"
              style={{
                border: "0.5px solid #000000",
                fontFamily: "Poppins",
                fontWeight: "600",
              }}
            >
              Forget Password
            </h2>
          </div>

          {/* Forgot Password Form - Responsive padding and spacing */}
          <div className="p-4 xs:p-5 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-5 sm:space-y-6 w-full">
              {/* Email ID - Responsive text and input sizing */}
              <div className="mt-6 xs:mt-8 sm:mt-10">
                <label className="block text-base xs:text-lg font-bold mb-2">Email ID</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email ID"
                  required
                  className="w-full px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 text-sm xs:text-base text-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AAA87]"
                  style={{
                    boxShadow: "0px 4px 10px 0px #00000040",
                    fontFamily: "Poppins",
                    fontWeight: "500",
                  }}
                />
              </div>
              {/* Error/Success Messages - Responsive text */}
              {errorMsg && <div className="text-red-600 text-xs xs:text-sm font-semibold text-center">{errorMsg}</div>}
              {successMsg && <div className="text-green-600 text-xs xs:text-sm font-semibold text-center">{successMsg}</div>}
              {/* Submit Button - Responsive sizing */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-[140px] xs:w-[160px] sm:w-[160px] cursor-pointer bg-[#A4B494] text-black font-bold py-2 xs:py-2 text-sm xs:text-base rounded-xl hover:bg-[#9AAA87] transition-all duration-200 mt-4 xs:mt-5 sm:mt-6"
                  style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
                >
                  {loading ? "Sending..." : "Submit"}
                </button>
              </div>
              {/* Back to Login Link - Responsive text */}
              <div className="text-center mt-2">
                <Link
                  href="/"
                  className="text-xs xs:text-sm font-semibold hover:underline"
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

        {/* Quote section - Positioned below form card (same as login) */}
        <div className="w-full flex flex-col items-center justify-center text-center px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 mt-[320px] xs:mt-[360px] sm:mt-[380px] md:mt-[400px]">
          <p className="text-black text-sm xs:text-base sm:text-lg font-semibold max-w-xs xs:max-w-sm sm:max-w-lg leading-relaxed">
            "Manage Your Hostel Smarter – Everything You Need in One Platform."
          </p>
        </div>
      </div>
    </div>

  );
};

export default ForgotPassword;
