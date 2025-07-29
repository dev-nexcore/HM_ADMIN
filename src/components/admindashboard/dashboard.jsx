"use client";
import React from 'react';
import {
  FaRupeeSign,
  FaUniversity,
  FaBed,
  FaSignInAlt,
  FaSignOutAlt
} from 'react-icons/fa';

const Dashboard = () => {
  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      {/* Header */}
      <h2 className="text-2xl font-bold border-l-4 border-red-600 pl-2 mb-6">
        Dashboard
      </h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* Total Revenue */}
        <button className="bg-white shadow-lg rounded-2xl overflow-hidden border border-white hover:shadow-2xl transition text-center relative">
          <div className="flex justify-between items-center bg-[#c2c9b0] text-black px-4 py-2 w-full rounded-t-2xl rounded-b-2xl">
            <span className="font-semibold text-sm">Total Revenue</span>
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg aspect-square border-2 border-gray-300">
            <FaUniversity className="text-black text-2xl font-bold" />
          </div>
          <div className="py-4 text-green-600 font-bold text-xl flex justify-center items-center gap-1">
            <FaRupeeSign /> 1,25,000
          </div>
        </button>

        {/* Pending Payments */}
        <button className="bg-white shadow-lg rounded-2xl overflow-hidden border border-white hover:shadow-2xl transition text-center relative">
          <div className="flex justify-between items-center bg-[#c2c9b0] text-black px-4 py-2 w-full rounded-t-2xl rounded-b-2xl">
            <span className="font-semibold text-sm">Pending Payments</span>
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg aspect-square border-2 border-gray-300">
            <FaUniversity className="text-black text-2xl font-bold" />
          </div>
          <div className="py-4 text-orange-500 font-bold text-xl flex justify-center items-center gap-1">
            <FaRupeeSign /> 15,000
          </div>
        </button>

        {/* Occupied Beds */}
        <button className="bg-white shadow-lg rounded-2xl overflow-hidden border border-white hover:shadow-2xl transition text-center relative">
          <div className="flex justify-between items-center bg-[#c2c9b0] text-black px-4 py-2 w-full rounded-t-2xl rounded-b-2xl">
            <span className="font-semibold text-sm">Occupied Beds</span>
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg aspect-square border-2 border-gray-300">
            <FaBed className="text-black text-2xl font-bold" />
          </div>
          <div className="py-4 text-black font-bold text-xl">60 / 70</div>
        </button>

        {/* Available Beds */}
        <button className="bg-white shadow-lg rounded-2xl overflow-hidden border border-white hover:shadow-2xl transition text-center relative">
          <div className="flex justify-between items-center bg-[#c2c9b0] text-black px-4 py-2 w-full rounded-t-2xl rounded-b-2xl">
            <span className="font-semibold text-sm">Available Beds</span>
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg aspect-square border-2 border-gray-300">
            <FaBed className="text-black text-2xl font-bold" />
          </div>
          <div className="py-4 text-black font-bold text-xl">15 / 75</div>
        </button>

        {/* Today's Check-In */}
        <button className="bg-white shadow-lg rounded-2xl overflow-hidden border border-white hover:shadow-2xl transition text-center relative">
          <div className="flex justify-between items-center bg-[#c2c9b0] text-black px-4 py-2 w-full rounded-t-2xl rounded-b-2xl">
            <span className="font-semibold text-sm">Today's Check-In</span>
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg aspect-square border-2 border-gray-300">
            <FaUniversity className="text-black text-2xl font-bold" />
          </div>
          <div className="py-4 text-black font-bold text-xl">3</div>
        </button>

        {/* Today's Check-Outs */}
        <button className="bg-white shadow-lg rounded-2xl overflow-hidden border border-white hover:shadow-2xl transition text-center relative">
          <div className="flex justify-between items-center bg-[#c2c9b0] text-black px-4 py-2 w-full rounded-t-2xl rounded-b-2xl">
            <span className="font-semibold text-sm">Today's Check-Outs</span>
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg aspect-square border-2 border-gray-300">
            <FaUniversity className="text-black text-2xl font-bold" />
          </div>
          <div className="py-4 text-black font-bold text-xl">2</div>
        </button>
      </div>

      {/* Recent Activities */}
      <div className="rounded-t-2xl bg-[#c2c9b0] p-4 font-semibold text-black">
        Recent Activities
      </div>
      <div className="bg-white shadow-md rounded-b-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between text-sm border-b pb-2">
          <p>Student Ayesha Ali Khan checked in to Bed 101</p>
          <p className="text-gray-600 mt-1 sm:mt-0">10:30 AM</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-between text-sm border-b pb-2">
          <p>Student Mohammed Shariq Shaikh checked out from Bed 205</p>
          <p className="text-gray-600 mt-1 sm:mt-0">09:30 AM</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-between text-sm">
          <p>Student Nida Fatima Konkan checked in to Bed 310</p>
          <p className="text-gray-600 mt-1 sm:mt-0">08:45 AM</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
