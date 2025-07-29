"use client";
import React from 'react';

const AdminLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white shadow-lg overflow-hidden">

        {/* Left Panel - Green with right-side rounded only */}
        <div className="lg:flex-[2] bg-[#9AAA87] rounded-r-[50px] flex flex-col items-center justify-center text-center p-8 lg:p-16">
          <h2 className="text-3xl font-bold text-black mb-6">
            Welcome Back!
          </h2>

          <img 
            src="logo.png" 
            alt="Kokan Global Foundation Logo" 
            className="w-[200px] h-[180px] bg-white p-4 rounded-md mb-6"
          />

          <p className="text-black text-lg font-semibold max-w-md">
            “Manage Your Hostel Smarter – Everything You Need in One Platform.”
          </p>
        </div>

        {/* Right Panel - Login form */}
        <div className="lg:flex-[1] flex flex-col justify-center items-center p-8 lg:p-16">
          <h2 className="text-3xl font-bold text-black mb-8">
            Admin Login
          </h2>

          <form className="space-y-6 w-full max-w-md">
            <div>
              <label className="block text-sm font-bold mb-1">User ID</label>
              <input
                type="text"
                placeholder="Enter Your User ID"
                className="w-full px-4 py-2 bg-white placeholder-gray-400 text-gray-800 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Password</label>
              <input 
                type="password" 
                placeholder="Enter Your Password"
                className="w-full px-4 py-2 bg-white placeholder-gray-400 text-gray-800 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <div className="text-right mt-1">
                <a href="#" className="text-blue-600 text-sm hover:underline">
                  Forget Password?
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
