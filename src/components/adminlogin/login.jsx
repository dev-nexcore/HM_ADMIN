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
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/login`,
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
                className="w-full px-5 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87] placeholder:font-medium"
                style={{
                  boxShadow: "0px 4px 10px 0px #00000040",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "500",
                }}
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
                className="w-full px-5 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87] placeholder:font-medium"
                style={{
                  boxShadow: "0px 4px 10px 0px #00000040",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "500",
                }}
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
                className="w-[200px] cursor-pointer bg-[#BEC5AD] text-black font-bold py-3 rounded-xl hover:bg-[#c1cca4] transition-all duration-200"
                style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
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

        {/* Login Form Card - Fully responsive positioning and sizing */}
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
              Admin Login
            </h2>
          </div>

          {/* Login Form - Responsive padding and spacing */}
          <div className="p-4 xs:p-5 sm:p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-4 xs:space-y-5 sm:space-y-6 w-full">
              {/* User ID - Responsive text and input sizing */}
              <div>
                <label className="block text-base xs:text-lg font-bold mb-2">User ID</label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter User ID"
                  required
                  className="w-full px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 text-sm xs:text-base text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87] placeholder:font-medium"
                  style={{
                    boxShadow: "0px 4px 10px 0px #00000040",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "500",
                  }}
                />
              </div>

              {/* Password - Responsive text and input sizing */}
              <div>
                <label className="block text-base xs:text-lg font-bold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                  className="w-full px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 text-sm xs:text-base text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AAA87] placeholder:font-medium"
                  style={{
                    boxShadow: "0px 4px 10px 0px #00000040",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "500",
                  }}
                />
                <div className="text-right mt-2">
                  <a
                    href="/forgetpassword"
                    className="text-xs xs:text-sm font-semibold hover:underline"
                    style={{
                      color: "#1109FF",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "600",
                    }}
                  >
                    Forget Password?
                  </a>
                </div>
              </div>

              {/* Error Message - Responsive text */}
              {errorMsg && (
                <div className="text-red-600 text-xs xs:text-sm font-semibold text-center">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button - Responsive sizing */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-[160px] xs:w-[180px] sm:w-[200px] cursor-pointer bg-[#A4B494] text-black font-bold py-2.5 xs:py-3 text-sm xs:text-base rounded-xl hover:bg-[#9AAA87] transition-all duration-200"
                  style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom quote section - Responsive text and spacing */}
        <div className="w-full flex flex-col items-center justify-center text-center px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 mt-[320px] xs:mt-[360px] sm:mt-[380px] md:mt-[400px]">
          <p className="text-black text-sm xs:text-base sm:text-lg font-semibold max-w-xs xs:max-w-sm sm:max-w-lg leading-relaxed">
            “Manage Your Hostel Smarter – Everything You Need in One Platform.”
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
