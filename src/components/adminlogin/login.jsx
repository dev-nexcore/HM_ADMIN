"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const AdminLogin = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/adminauth/login`,
        { adminId, password }
      );
      const { token, refreshToken, admin } = response.data;
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminRefreshToken", refreshToken);
      localStorage.setItem("adminInfo", JSON.stringify(admin));
      router.push("/dashboard");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#A4B494]">
      {/* Desktop Layout - Visible on large screens and above (NO CHANGES HERE) */}
      <div className="hidden lg:flex flex-row w-full h-full bg-white shadow-2xl overflow-hidden">
        {/* Left Panel - Original green background */}
        <div className="w-1/2 bg-[#9AAA87] flex flex-col items-center justify-center text-center px-6 py-10 lg:px-16 lg:py-0 rounded-none lg:rounded-r-[100px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-12">
            Welcome Back!
          </h2>
          <img
            src="/photos/logo.png"
            alt="Logo"
            className="w-[210px] h-[190px] bg-white p-4 rounded-lg mb-14 object-contain"
          />
          <p className="text-black text-lg font-semibold max-w-lg">
            “Manage Your Hostel Smarter – Everything You Need in One Platform.”
          </p>
        </div>
        {/* Right Panel - Original white background */}
        <div className="w-1/2 flex flex-col justify-center items-center px-6 py-10 sm:px-10 lg:px-16 bg-white">
          <h2 className="text-4xl font-bold text-black mb-16">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-6 w-full max-w-sm">
            {/* User ID */}
            <div>
              <label className="block text-lg font-bold mb-2">User ID</label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter Your User ID"
                required
                className="w-full px-5 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87]"
                style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
              />
            </div>
            {/* Password */}
            <div>
              <label className="block text-lg font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Your Password"
                required
                className="w-full px-5 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-[#9AAA87]"
              />
              <div className="text-right mt-2">
                <a
                  href="/forgetpassword"
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Forget Password?
                </a>
              </div>
            </div>
            {/* Error Message */}
            {errorMsg && (
              <div className="text-red-600 text-sm font-semibold text-center">
                {errorMsg}
              </div>
            )}
            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-[200px] cursor-pointer bg-[#BEC5AD] text-black font-bold py-3 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-[#c1cca4] transition-all duration-200"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Layout - Visible on screens smaller than large (ALL CHANGES HERE) */}
      <div className="lg:hidden flex flex-col items-center w-full h-full">
        {/* Top white section with logo */}
        <div className="w-full flex flex-col items-center justify-center bg-white pt-10 pb-20 rounded-b-[20px] relative z-0">
          <img
            src="/photos/logo.png"
            alt="Logo"
            className="w-[250px] h-[230px] bg-white p-4 rounded-lg object-contain"
          />
        </div>

        {/* Login Form Card - white, positioned to overlap */}
        <div
          className="absolute top-[320px] w-9/12 max-w-sm bg-white rounded-t-[20px] rounded-b-xl z-20 p-0 min-h-[400px] overflow-hidden"
          style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
        >
          {/* Header with border touching edges */}
          <div className="w-full">
            <h2
              className="text-2xl font-bold text-black bg-white text-center py-4 m-0 rounded-t-[20px] rounded-b-[20px]"
              style={{ border: "0.5px solid #000000" }}
            >
              Admin Login
            </h2>
          </div>

          {/* Login Form */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-6 w-full">
              {/* User ID */}
              <div>
                <label className="block text-lg font-bold mb-2">User ID</label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter Your User ID"
                  required
                  className="w-full px-5 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87]"
                  style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-lg font-bold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Your Password"
                  required
                  className="w-full px-5 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87]"
                  style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
                />
                <div className="text-right mt-2">
                  <a
                    href="/forgetpassword"
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Forget Password?
                  </a>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="text-red-600 text-sm font-semibold text-center">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-[200px] cursor-pointer bg-[#A4B494] text-black font-bold py-3 rounded-xl hover:bg-[#9AAA87] transition-all duration-200"
                  style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
                >
                  {loading ? "Logging in..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom quote section - on green background */}
        <div className="w-full flex flex-col items-center justify-center text-center px-6 py-10 mt-auto">
          <p className="text-black text-lg font-semibold max-w-lg">
            “Manage Your Hostel Smarter – Everything You Need in One Platform.”
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
