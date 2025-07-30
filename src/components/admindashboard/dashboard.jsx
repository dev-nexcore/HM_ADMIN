"use client";
import React from 'react';
import {
  FaRupeeSign,
  FaUniversity,
  FaBed,
} from 'react-icons/fa';

const Dashboard = () => {
  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen">
      {/* Header */}
      <h2 className="text-2xl font-bold border-l-4 border-red-600 pl-2 mb-6">
        Dashboard
      </h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card Template */}
        {[
          {
            title: "Total Revenue",
            value: "1,25,000",
            icon: <FaUniversity className="text-black text-lg" />,
            color: "text-green-600",
            isCurrency: true,
          },
          {
            title: "Pending Payments",
            value: "15,000",
            icon: <FaUniversity className="text-black text-lg" />,
            color: "text-orange-500",
            isCurrency: true,
          },
          {
            title: "Occupied Beds",
            value: "60 / 70",
            icon: <FaBed className="text-black text-lg" />,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Available Beds",
            value: "15 / 75",
            icon: <FaBed className="text-black text-lg" />,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Today's Check-In",
            value: "3",
            icon: <FaUniversity className="text-black text-lg" />,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Today's Check-Outs",
            value: "2",
            icon: <FaUniversity className="text-black text-lg" />,
            color: "text-black",
            isCurrency: false,
          },
        ].map((card, i) => (
          <button
            key={i}
            className="bg-white shadow-lg rounded-2xl overflow-hidden border border-white hover:shadow-2xl transition text-center relative"
          >
            <div className="flex justify-between items-center bg-[#c2c9b0] text-black px-4 py-2 w-full rounded-t-2xl">
              <span className="font-semibold text-sm">{card.title}</span>
            </div>

            <div className="absolute top-0 right-0 w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md aspect-square border border-gray-300">
              {card.icon}
            </div>

            <div className={`py-4 font-bold text-xl flex justify-center items-center gap-1 ${card.color}`}>
              {card.isCurrency ? (
                <>
                  <FaRupeeSign className="text-lg" /> {card.value}
                </>
              ) : (
                card.value
              )}
            </div>
          </button>
        ))}
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
