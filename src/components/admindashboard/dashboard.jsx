"use client";
import React, { useState, useEffect } from "react";
import { FaRupeeSign, FaUniversity, FaBed } from "react-icons/fa";
import axios from "axios";
const Dashboard = () => {
  const [checkInOutData, setCheckInOutData] = useState({
    checkIns: 0,
    checkOuts: 0,
  });

  useEffect(() => {
    const fetchCheckInOutStatus = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/adminauth/todays-checkin-checkout`
        );
        setCheckInOutData(data);
      } catch (error) {
        console.error("Failed to fetch check-in/out status:", error);
      }
    };

    fetchCheckInOutStatus();
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
            icon: (
              <svg
                width="22"
                height="22"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.25 20.25V11.5H6.75V20.25H4.25ZM11.75 20.25V11.5H14.25V20.25H11.75ZM0.5 25.25V22.75H25.5V25.25H0.5ZM19.25 20.25V11.5H21.75V20.25H19.25ZM0.5 9V6.5L13 0.25L25.5 6.5V9H0.5ZM6.0625 6.5H19.9375L13 3.0625L6.0625 6.5Z"
                  fill="#060606"
                />
              </svg>
            ),
            color: "text-green-600",
            isCurrency: true,
          },
          {
            title: "Pending Payments",
            value: "15,000",
            icon: (
              <svg
                width="22"
                height="22"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.25 20.25V11.5H6.75V20.25H4.25ZM11.75 20.25V11.5H14.25V20.25H11.75ZM0.5 25.25V22.75H25.5V25.25H0.5ZM19.25 20.25V11.5H21.75V20.25H19.25ZM0.5 9V6.5L13 0.25L25.5 6.5V9H0.5ZM6.0625 6.5H19.9375L13 3.0625L6.0625 6.5Z"
                  fill="#060606"
                />
              </svg>
            ),
            color: "text-orange-500",
            isCurrency: true,
          },
          {
            title: "Occupied Beds",
            value: "60 / 70",
            icon: (
              <svg
                width="22"
                height="16"
                viewBox="0 0 26 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.499756 17.75V10.25C0.499756 9.6875 0.614339 9.17708 0.843506 8.71875C1.07267 8.26042 1.37476 7.85417 1.74976 7.5V4C1.74976 2.95833 2.11434 2.07292 2.84351 1.34375C3.57267 0.614583 4.45809 0.25 5.49976 0.25H10.4998C10.9789 0.25 11.4268 0.338542 11.8435 0.515625C12.2602 0.692708 12.6456 0.9375 12.9998 1.25C13.3539 0.9375 13.7393 0.692708 14.156 0.515625C14.5727 0.338542 15.0206 0.25 15.4998 0.25H20.4998C21.5414 0.25 22.4268 0.614583 23.156 1.34375C23.8852 2.07292 24.2498 2.95833 24.2498 4V7.5C24.6248 7.85417 24.9268 8.26042 25.156 8.71875C25.3852 9.17708 25.4998 9.6875 25.4998 10.25V17.75H22.9998V15.25H2.99976V17.75H0.499756ZM14.2498 6.5H21.7498V4C21.7498 3.64583 21.63 3.34896 21.3904 3.10938C21.1508 2.86979 20.8539 2.75 20.4998 2.75H15.4998C15.1456 2.75 14.8487 2.86979 14.6091 3.10938C14.3695 3.34896 14.2498 3.64583 14.2498 4V6.5ZM4.24976 6.5H11.7498V4C11.7498 3.64583 11.63 3.34896 11.3904 3.10938C11.1508 2.86979 10.8539 2.75 10.4998 2.75H5.49976C5.14559 2.75 4.84871 2.86979 4.60913 3.10938C4.36955 3.34896 4.24976 3.64583 4.24976 4V6.5ZM2.99976 12.75H22.9998V10.25C22.9998 9.89583 22.88 9.59896 22.6404 9.35938C22.4008 9.11979 22.1039 9 21.7498 9H4.24976C3.89559 9 3.59871 9.11979 3.35913 9.35938C3.11955 9.59896 2.99976 9.89583 2.99976 10.25V12.75Z"
                  fill="#1C1B1F"
                />
              </svg>
            ),
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Available Beds",
            value: "15 / 75",
            icon: (
              <svg
                width="22"
                height="16"
                viewBox="0 0 26 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.499756 17.75V10.25C0.499756 9.6875 0.614339 9.17708 0.843506 8.71875C1.07267 8.26042 1.37476 7.85417 1.74976 7.5V4C1.74976 2.95833 2.11434 2.07292 2.84351 1.34375C3.57267 0.614583 4.45809 0.25 5.49976 0.25H10.4998C10.9789 0.25 11.4268 0.338542 11.8435 0.515625C12.2602 0.692708 12.6456 0.9375 12.9998 1.25C13.3539 0.9375 13.7393 0.692708 14.156 0.515625C14.5727 0.338542 15.0206 0.25 15.4998 0.25H20.4998C21.5414 0.25 22.4268 0.614583 23.156 1.34375C23.8852 2.07292 24.2498 2.95833 24.2498 4V7.5C24.6248 7.85417 24.9268 8.26042 25.156 8.71875C25.3852 9.17708 25.4998 9.6875 25.4998 10.25V17.75H22.9998V15.25H2.99976V17.75H0.499756ZM14.2498 6.5H21.7498V4C21.7498 3.64583 21.63 3.34896 21.3904 3.10938C21.1508 2.86979 20.8539 2.75 20.4998 2.75H15.4998C15.1456 2.75 14.8487 2.86979 14.6091 3.10938C14.3695 3.34896 14.2498 3.64583 14.2498 4V6.5ZM4.24976 6.5H11.7498V4C11.7498 3.64583 11.63 3.34896 11.3904 3.10938C11.1508 2.86979 10.8539 2.75 10.4998 2.75H5.49976C5.14559 2.75 4.84871 2.86979 4.60913 3.10938C4.36955 3.34896 4.24976 3.64583 4.24976 4V6.5ZM2.99976 12.75H22.9998V10.25C22.9998 9.89583 22.88 9.59896 22.6404 9.35938C22.4008 9.11979 22.1039 9 21.7498 9H4.24976C3.89559 9 3.59871 9.11979 3.35913 9.35938C3.11955 9.59896 2.99976 9.89583 2.99976 10.25V12.75Z"
                  fill="#1C1B1F"
                />
              </svg>
            ),
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Today's Check-In",
            value: checkInOutData.checkIns,
            icon: (
              <svg
                width="22"
                height="22"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.25 20.25V11.5H6.75V20.25H4.25ZM11.75 20.25V11.5H14.25V20.25H11.75ZM0.5 25.25V22.75H25.5V25.25H0.5ZM19.25 20.25V11.5H21.75V20.25H19.25ZM0.5 9V6.5L13 0.25L25.5 6.5V9H0.5ZM6.0625 6.5H19.9375L13 3.0625L6.0625 6.5Z"
                  fill="#060606"
                />
              </svg>
            ),
            color: "text-black",
            isCurrency: false,
          },
          {
            title: "Today's Check-Outs",
            value: checkInOutData.checkOuts,
            icon: (
              <svg
                width="22"
                height="22"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.25 20.25V11.5H6.75V20.25H4.25ZM11.75 20.25V11.5H14.25V20.25H11.75ZM0.5 25.25V22.75H25.5V25.25H0.5ZM19.25 20.25V11.5H21.75V20.25H19.25ZM0.5 9V6.5L13 0.25L25.5 6.5V9H0.5ZM6.0625 6.5H19.9375L13 3.0625L6.0625 6.5Z"
                  fill="#060606"
                />
              </svg>
            ),
            color: "text-black",
            isCurrency: false,
          },
        ].map((card, i) => (
          <button
            key={i}
            className="bg-white shadow-lg rounded-2xl overflow-hidden border border-white hover:shadow-2xl transition text-center relative min-h-[140px] flex flex-col justify-between"
          >
            {/* Header with icon overlapping the corner */}
            <div className="relative w-full bg-[#c2c9b0] px-1 pl-4 py-2 rounded-3xl text-start">
              <span className="font-semibold text-lg">{card.title}</span>
              <div className="absolute -top-1 -right-1 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-300">
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
