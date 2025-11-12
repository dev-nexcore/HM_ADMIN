"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api"; 

const AdminLogin = () => {
  const [step, setStep] = useState(1); // 1 = Enter Admin ID, 2 = Enter OTP
  const [adminId, setAdminId] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedNumber, setMaskedNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  // Mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Step 1: Send OTP to WhatsApp
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data } = await api.post(
        `/api/adminauth/send-login-otp`,
        { adminId },
        { headers: { "Content-Type": "application/json" } }
      );

      setMaskedNumber(data.contactNumber || "your registered number");
      setStep(2);
      setResendTimer(60); // 60 seconds before resend is allowed
    } catch (error) {
      console.error("Send OTP error:", error);
      setErrorMsg(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data } = await api.post(
        `/api/adminauth/login`,
        { adminId, otp },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
      );

      const { token, refreshToken } = data || {};
      if (!token) throw new Error("No token returned");

      // Store tokens
      localStorage.setItem("accessToken", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      // Set cookie for middleware
      document.cookie = `adminToken=${token}; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax${
        window.location.protocol === "https:" ? "; Secure" : ""
      }`;

      // Redirect
      const urlParams = new URLSearchParams(window.location.search);
      // If the app is served under /admin (basePath), prefer /admin/dashboard as default.
      const defaultDashboard = window.location.pathname.startsWith("/admin")
        ? "/admin/dashboard"
        : "/dashboard";
      const callbackUrl = urlParams.get("callbackUrl") || defaultDashboard;
      window.location.href = callbackUrl;

    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setErrorMsg("");
    setOtp(""); // Clear previous OTP

    try {
      await api.post(
        `/api/adminauth/send-login-otp`,
        { adminId },
        { headers: { "Content-Type": "application/json" } }
      );
      
      setResendTimer(60);
      setErrorMsg(""); // Clear any previous errors
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Go back to step 1
  const handleBack = () => {
    setStep(1);
    setOtp("");
    setErrorMsg("");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#A4B494] overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-row w-full h-full bg-white shadow-2xl overflow-hidden">
        {/* Left Panel */}
        <div
          className={`w-1/2 bg-[#9AAA87] flex flex-col items-center justify-center text-center px-6 py-10 lg:px-16 lg:py-0 rounded-none lg:rounded-r-[100px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-1000 ease-out ${
            mounted
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0"
          }`}
        >
          <h2
            className={`text-3xl sm:text-4xl font-bold text-black mb-12 transition-all duration-700 delay-300 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            Welcome Back!
          </h2>

          <div
            className={`transition-all duration-700 delay-500 ease-out transform ${
              mounted
                ? "scale-100 opacity-100 rotate-0"
                : "scale-75 opacity-0 rotate-12"
            }`}
          >
            <img
              src="/photos/logo1.svg"
              alt="Logo"
              className="w-[210px] h-[190px] bg-white p-4 rounded-lg mb-14 object-contain hover:scale-110 transition-transform duration-300 ease-in-out shadow-lg"
            />
          </div>

          <p
            className={`text-black text-lg font-semibold max-w-lg transition-all duration-700 delay-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            "Manage Your Hostel Smarter – Everything You Need in One Platform."
          </p>
        </div>

        {/* Right Panel */}
        <div
          className={`w-1/2 flex flex-col justify-center items-center px-6 py-10 sm:px-10 lg:px-16 bg-white transition-all duration-1000 ease-out ${
            mounted ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <h2
            className={`text-4xl font-bold text-black mb-16 transition-all duration-700 delay-200 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
            }`}
          >
            Admin Login
          </h2>

          <div
            className={`w-full max-w-sm transition-all duration-700 delay-400 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            {step === 1 ? (
              // Step 1: Enter Admin ID
              <form onSubmit={handleSendOTP} className="space-y-6 w-full">
                <div>
                  <label className="block text-lg font-bold mb-2">Admin ID</label>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Enter Your Admin ID"
                    required
                    className="w-full px-5 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87] placeholder:font-medium transition-all duration-300 ease-in-out transform focus:scale-[1.02] hover:shadow-lg"
                    style={{
                      boxShadow: "0px 4px 10px 0px #00000040",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "500",
                    }}
                  />
                </div>

                {errorMsg && (
                  <div className="text-red-600 text-sm font-semibold text-center animate-fadeInUp">
                    {errorMsg}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-[200px] cursor-pointer bg-[#BEC5AD] text-black font-bold py-3 rounded-xl hover:bg-[#c1cca4] transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:opacity-70"
                    style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              // Step 2: Enter OTP
              <form onSubmit={handleVerifyOTP} className="space-y-6 w-full">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    OTP sent to WhatsApp: <span className="font-semibold">{maskedNumber}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-lg font-bold mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    required
                    maxLength={6}
                    className="w-full px-5 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87] placeholder:font-medium text-center text-xl tracking-widest transition-all duration-300 ease-in-out transform focus:scale-[1.02] hover:shadow-lg"
                    style={{
                      boxShadow: "0px 4px 10px 0px #00000040",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "500",
                    }}
                  />
                </div>

                {errorMsg && (
                  <div className="text-red-600 text-sm font-semibold text-center animate-fadeInUp">
                    {errorMsg}
                  </div>
                )}

                <div className="flex flex-col items-center space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-[200px] cursor-pointer bg-[#BEC5AD] text-black font-bold py-3 rounded-xl hover:bg-[#c1cca4] transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:opacity-70"
                    style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify & Login"
                    )}
                  </button>

                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-gray-600 text-sm font-medium hover:underline transition-colors duration-200"
                    >
                      ← Back
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || loading}
                      className="text-blue-600 text-sm font-medium hover:underline transition-colors duration-200 disabled:text-gray-400 disabled:no-underline"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col items-center w-full h-full relative overflow-hidden">
        {/* Top white section with logo */}
        <div
          className={`w-full flex flex-col items-center justify-center bg-white pt-2 pb-10 sm:pb-8 md:pb-10 rounded-b-[20px] relative z-0 transition-all duration-1000 ease-out ${
            mounted
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
        >
          <div
            className={`transition-all duration-700 delay-500 ease-out transform ${
              mounted
                ? "scale-100 opacity-100 rotate-0"
                : "scale-75 opacity-0 rotate-12"
            }`}
          >
            <img
              src="/photos/logo1.svg"
              alt="Logo"
              className="w-[200px] h-[180px] xs:w-[220px] xs:h-[200px] sm:w-[260px] sm:h-[240px] md:w-[300px] md:h-[280px] bg-white p-3 sm:p-4 rounded-lg object-contain hover:scale-105 transition-transform duration-300 ease-in-out shadow-md"
            />
          </div>
        </div>

        {/* Login Form Card */}
        <div
          className={`absolute top-[200px] xs:top-[220px] sm:top-[260px] md:top-[300px] w-[85%] xs:w-[80%] sm:w-[75%] md:w-9/12 max-w-[400px] bg-white rounded-t-[20px] rounded-b-xl z-20 p-0 min-h-[350px] xs:min-h-[380px] sm:min-h-[400px] overflow-hidden transition-all duration-1000 ease-out ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
          style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
        >
          {/* Header */}
          <div
            className={`w-full transition-all duration-700 delay-200 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
            }`}
          >
            <h2
              className="text-lg xs:text-xl sm:text-xl font-bold text-black bg-white text-center py-3 xs:py-4 m-0 rounded-t-[20px] rounded-b-[20px]"
              style={{
                border: "0.5px solid #000000",
                fontFamily: "Poppins",
                fontWeight: "600",
              }}
            >
              Admin Login
            </h2>
          </div>

          {/* Login Form */}
          <div
            className={`p-4 xs:p-5 sm:p-6 md:p-8 transition-all duration-700 delay-400 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            {step === 1 ? (
              // Step 1: Enter Admin ID (Mobile)
              <form onSubmit={handleSendOTP} className="space-y-4 xs:space-y-5 sm:space-y-6 w-full">
                <div>
                  <label className="block text-base xs:text-lg font-bold mb-2">
                    Admin ID
                  </label>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Enter Admin ID"
                    required
                    className="w-full px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 text-sm xs:text-base text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87] placeholder:font-medium transition-all duration-300 ease-in-out transform focus:scale-[1.02] hover:shadow-lg"
                    style={{
                      boxShadow: "0px 4px 10px 0px #00000040",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "500",
                    }}
                  />
                </div>

                {errorMsg && (
                  <div className="text-red-600 text-xs xs:text-sm font-semibold text-center animate-fadeInUp">
                    {errorMsg}
                  </div>
                )}

                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-[160px] xs:w-[180px] sm:w-[200px] cursor-pointer bg-[#A4B494] text-black font-bold py-2.5 xs:py-3 text-sm xs:text-base rounded-xl hover:bg-[#9AAA87] transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:opacity-70"
                    style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              // Step 2: Enter OTP (Mobile)
              <form onSubmit={handleVerifyOTP} className="space-y-4 xs:space-y-5 sm:space-y-6 w-full">
                <div className="text-center mb-2">
                  <p className="text-xs xs:text-sm text-gray-600">
                    OTP sent to: <span className="font-semibold">{maskedNumber}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-base xs:text-lg font-bold mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6-digit OTP"
                    required
                    maxLength={6}
                    className="w-full px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 text-base xs:text-lg text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87] placeholder:font-medium text-center tracking-widest transition-all duration-300 ease-in-out transform focus:scale-[1.02] hover:shadow-lg"
                    style={{
                      boxShadow: "0px 4px 10px 0px #00000040",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "500",
                    }}
                  />
                </div>

                {errorMsg && (
                  <div className="text-red-600 text-xs xs:text-sm font-semibold text-center animate-fadeInUp">
                    {errorMsg}
                  </div>
                )}

                <div className="flex flex-col items-center space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-[160px] xs:w-[180px] sm:w-[200px] cursor-pointer bg-[#A4B494] text-black font-bold py-2.5 xs:py-3 text-sm xs:text-base rounded-xl hover:bg-[#9AAA87] transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:opacity-70"
                    style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify & Login"
                    )}
                  </button>

                  <div className="flex items-center space-x-4 text-xs xs:text-sm">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-gray-600 font-medium hover:underline transition-colors duration-200"
                    >
                      ← Back
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || loading}
                      className="text-blue-600 font-medium hover:underline transition-colors duration-200 disabled:text-gray-400 disabled:no-underline"
                    >
                      {resendTimer > 0 ? `Resend ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom quote section */}
        <div
          className={`w-full flex flex-col items-center justify-center text-center px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 mt-[320px] xs:mt-[360px] sm:mt-[380px] md:mt-[400px] transition-all duration-700 delay-600 ease-out ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="text-black text-sm xs:text-base sm:text-lg font-semibold max-w-xs xs:max-w-sm sm:max-w-lg leading-relaxed">
            "Manage Your Hostel Smarter – Everything You Need in One Platform."
          </p>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;