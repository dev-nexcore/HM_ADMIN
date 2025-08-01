"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`flex items-center justify-between px-4 sm:px-6 py-6 bg-[#BEC5AD] h-24 min-h-[80px] transition-all duration-300 md:ml-60 relative`}
    >
      {/* Hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden p-2"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Welcome Text */}
      <div className={`flex-1 ${sidebarOpen ? "pl-48" : "pl-4"} md:pl-0`}>
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
          Welcome Back, Nouman
        </h2>
        <p className="text-xs sm:text-sm italic text-gray-800">- have a great day</p>
      </div>

      {/* Bell + Profile */}
      <div className="relative flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <button onClick={() => setShowPopup(!showPopup)} className="hover:opacity-80 relative">
          <Image
            src="/photos/bell1.png"
            alt="Notifications"
            width={24}
            height={24}
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
        </button>

        {/* Notification Popup */}
        {showPopup && (
          <div
            ref={popupRef}
            className="absolute right-0 top-16 w-72 sm:w-80 bg-white rounded-xl shadow-xl z-50"
          >
            <div className="bg-[#A4B494] text-black px-4 py-3 rounded-t-xl flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Notifications</p>
                <p className="text-xs">Stay updated</p>
              </div>
              <button onClick={() => setShowPopup(false)} className="text-black">✕</button>
            </div>
            <div className="flex flex-col items-center py-6">
              <Image
                src="/photos/bell1.png"
                width={35}
                height={35}
                alt="bell"
                className="mb-2"
              />
              <p className="font-semibold text-sm">All caught up!</p>
              <p className="text-xs text-gray-500">No new notifications to show</p>
              <Link
                href="/notifications"
                className="mt-4 px-4 py-2 text-black bg-[#A4B494] rounded-md text-sm hover:bg-[#A4B494]"
              >
                View History
              </Link>
            </div>
          </div>
        )}

        {/* Profile */}
        <Link href="/profile" aria-label="Go to profile">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-300 cursor-pointer" />
        </Link>
      </div>
    </nav>
  );
}
