"use client";
import React from 'react';

const AdminLogin = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-7xl h-full bg-white shadow-xl rounded-none lg:rounded-lg overflow-hidden">
        {/* Left Panel - Welcome Section */}
        <div className="lg:w-2/3 bg-[#9AAA87] rounded-b-[50px] lg:rounded-r-[50px] lg:rounded-bl-none flex flex-col items-center justify-center text-center px-6 py-12 lg:px-16 lg:py-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
            Welcome Back!
          </h2>
          <img
            src="logo.png"
            alt="Kokan Global Foundation Logo"
            className="w-[200px] h-[180px] bg-white p-4 rounded-md mb-6 object-contain"
          />
          <p className="text-black text-lg font-semibold max-w-md">
            “Manage Your Hostel Smarter – Everything You Need in One Platform.”
          </p>
        </div>

        {/* Right Panel - Login Form */}
        <div className="lg:w-1/3 flex flex-col justify-center items-center px-6 py-12 lg:px-16 lg:py-20 bg-white">
          <h2 className="text-3xl font-bold text-black mb-8">Admin Login</h2>

          <form className="space-y-6 w-full max-w-sm">
            <div>
              <label className="block text-sm font-bold mb-1">User ID</label>
              <input
                type="text"
                placeholder="Enter Your User ID"
                className="w-full px-4 py-2 bg-white placeholder-gray-400 text-gray-800 rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter Your Password"
                className="w-full px-4 py-2 bg-white placeholder-gray-400 text-gray-800 rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <div className="text-right mt-1">
                <a href="#" className="text-blue-600 text-sm hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-[200px] bg-[#c2c9b0] text-black font-semibold py-2 rounded-full shadow-md hover:bg-[#b2b9a0] transition duration-200"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
