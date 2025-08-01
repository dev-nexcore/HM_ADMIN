"use client";
import React, { useState } from "react";
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/adminauth/login`, { adminId, password });
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
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col lg:flex-row w-full h-full bg-white shadow-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="w-full lg:w-2.5/3 bg-[#9AAA87] flex flex-col items-center justify-center text-center px-6 py-10 lg:px-16 lg:py-0 rounded-none lg:rounded-r-[50px]">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6">Welcome Back!</h2>
          <img src="/photos/logo.png" alt="Logo" className="w-[180px] h-[160px] bg-white p-4 rounded-md mb-6 object-contain" />
          <p className="text-black text-lg font-semibold max-w-md">
            “Manage Your Hostel Smarter – Everything You Need in One Platform.”
          </p>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-2/3 flex flex-col justify-center items-center px-6 py-10 sm:px-10 lg:px-16 bg-white">
          <h2 className="text-3xl font-bold text-black mb-8">Admin Login</h2>

          <form onSubmit={handleLogin} className="space-y-6 w-full max-w-sm">
            <div>
              <label className="block text-sm font-bold mb-1">User ID</label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter Your User ID"
                required
                className="w-full px-4 py-2 bg-blue-50 text-gray-800 rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Your Password"
                required
                className="w-full px-4 py-2 bg-blue-50 text-gray-800 rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <div className="text-right mt-1">
                <a href="#" className="text-blue-600 text-sm hover:underline">Forgot Password?</a>
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-600 text-sm font-semibold text-center">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-[200px] bg-[#9AAA87] text-black font-semibold py-2 rounded-full shadow-md hover:bg-[#8d9b7d] transition duration-200"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
