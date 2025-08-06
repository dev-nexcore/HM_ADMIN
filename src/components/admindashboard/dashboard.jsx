"use client";
import React, { useState, useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import axios from "axios";

const Dashboard = () => {
  const [checkInOutData, setCheckInOutData] = useState({
    checkIns: 0,
    checkOuts: 0,
  });

  const [bedData, setBedData] = useState({
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
  });

  useEffect(() => {
    const fetchCheckInOutStatus = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/todays-checkin-checkout`,
        );
        setCheckInOutData(data);
      } catch (error) {
        console.error("Failed to fetch check-in/out status:", error);
      }
    };

    const fetchBedOccupancyStatus = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/bed-occupancy-status`,
        );
        setBedData(data);
      } catch (error) {
        console.error("Failed to fetch bed occupancy status:", error);
      }
    };

    fetchCheckInOutStatus();
    fetchBedOccupancyStatus();
  }, []);

  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-10">
      {/* Header */}
      <div className="flex items-center mb-7">
        <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
        <h2 className="text-2xl font-bold text-black">Dashboard</h2>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            title: "Total Revenue",
            value: "1,25,000",
            color: "text-green-600",
            isCurrency: true,
          },
          {
            title: "Pending Payments",
            value: "15,000",
            color: "text-orange-500",
            isCurrency: true,
          },
          {
            title: "Occupied Beds",
            value: `${bedData.occupiedBeds} / ${bedData.totalBeds}`,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Available Beds",
            value: `${bedData.availableBeds} / ${bedData.totalBeds}`,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Today's Check-In",
            value: checkInOutData.checkIns,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Today's Check-Outs",
            value: checkInOutData.checkOuts,
            color: "text-black",
            isCurrency: false,
          },
        ].map((card, i) => (
          <button
            key={i}
            className="bg-white shadow-lg rounded-2xl overflow-hidden border border-white hover:shadow-2xl transition text-center relative min-h-[140px] flex flex-col justify-between"
          >
            <div className="relative w-full bg-[#c2c9b0] px-1 pl-4 py-2 rounded-3xl text-start">
              <span className="font-semibold text-lg">{card.title}</span>
            </div>
            <div
              className={`py-6 font-bold text-3xl flex justify-center items-center gap-2 ${card.color}`}
            >
              {card.isCurrency ? (
                <>
                  <FaRupeeSign className="text-2xl" />
                  {card.value}
                </>
              ) : (
                card.value
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="rounded-t-2xl bg-[#c2c9b0] p-5 font-semibold text-black text-xl pl-8">
        Recent Activities
      </div>
      <div className="bg-white shadow-md rounded-b-2xl p-8 space-y-4 text-base">
        <div className="flex flex-col sm:flex-row justify-between">
          <p>Student Ayesha Ali Khan checked in to Bed 101</p>
          <p className="text-black mt-1 sm:mt-0">10:30 AM</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-between">
          <p>Student Mohammed Shariq Shaikh checked out from Bed 205</p>
          <p className="text-black mt-1 sm:mt-0">09:30 AM</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-between">
          <p>Student Nida Fatima Konkan checked in to Bed 310</p>
          <p className="text-black mt-1 sm:mt-0">08:45 AM</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
