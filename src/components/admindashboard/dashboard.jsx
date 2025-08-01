"use client";
import React,{useState,useEffect} from "react";
import { FaRupeeSign, FaUniversity, FaBed } from "react-icons/fa";
import axios from 'axios'
const Dashboard = () => {
   const [checkInOutData, setCheckInOutData] = useState({
    checkIns: 0,
    checkOuts: 0,
  });

  useEffect(() => {
    const fetchCheckInOutStatus = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/adminauth/todays-checkin-checkout`);
        setCheckInOutData(data);
      } catch (error) {
        console.error("Failed to fetch check-in/out status:", error);
      }
    };

    fetchCheckInOutStatus();
  }, []);

  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-6">
      {/* Header */}
      <h2 className="text-2xl font-bold border-l-4 border-blue-600 pl-2 mb-6">
        Dashboard
      </h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            title: "Total Revenue",
            value: "1,25,000",
            icon: <FaUniversity className="text-black text-3xl" />,
            color: "text-green-600",
            isCurrency: true,
          },
          {
            title: "Pending Payments",
            value: "15,000",
            icon: <FaUniversity className="text-black text-3xl" />,
            color: "text-orange-500",
            isCurrency: true,
          },
          {
            title: "Occupied Beds",
            value: "60 / 70",
            icon: <FaBed className="text-black text-3xl" />,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Available Beds",
            value: "15 / 75",
            icon: <FaBed className="text-black text-3xl" />,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Today's Check-In",
            value: checkInOutData.checkIns,
            icon: <FaUniversity className="text-black text-3xl" />,
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Today's Check-Outs",
            value: checkInOutData.checkOuts,
            icon: <FaUniversity className="text-black text-3xl" />,
            color: "text-black",
            isCurrency: false,
          },
        ].map((card, i) => (
          <button
            key={i}
            className="bg-white shadow-lg rounded-2xl overflow-hidden border border-white hover:shadow-2xl transition text-center relative min-h-[160px] flex flex-col justify-between"
          >
            {/* Header with icon overlapping the corner */}
            <div className="relative w-full bg-[#c2c9b0] px-1 py-3 rounded-3xl">
              <span className="font-semibold text-lg">{card.title}</span>
              <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-300">
                {card.icon}
              </div>
            </div>

            {/* Value */}
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
      <div className="rounded-t-2xl bg-[#c2c9b0] p-4  font-semibold text-black text-base">
        Recent Activities
      </div>
      <div className="bg-white shadow-md rounded-b-2xl p-4 space-y-4 text-base">
        <div className="flex flex-col sm:flex-row justify-between">
          <p>Student Ayesha Ali Khan checked in to Bed 101</p>
          <p className="text-gray-700 mt-1 sm:mt-0">10:30 AM</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-between">
          <p>Student Mohammed Shariq Shaikh checked out from Bed 205</p>
          <p className="text-gray-700 mt-1 sm:mt-0">09:30 AM</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-between">
          <p>Student Nida Fatima Konkan checked in to Bed 310</p>
          <p className="text-gray-700 mt-1 sm:mt-0">08:45 AM</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
