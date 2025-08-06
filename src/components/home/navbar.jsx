"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";

export default function Navbar({ subtitle = "- have a great day", onSidebarToggle }) {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const router = useRouter();

  const adminFullName = "Nouman";
  const profileImage = "/photos/profile.jpg";
  const loading = false;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#BEC5AD] h-16 sm:h-20 md:h-24 flex items-center justify-between px-3 sm:px-5 md:px-6 shadow-md">
      <button
        onClick={onSidebarToggle}
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

      <div className="flex-1 text-center md:text-left ml-0 md:ml-60">
        <div className="font-semibold leading-tight text-sm sm:text-lg md:text-xl lg:text-2xl text-black">
          Welcome Back, {adminFullName}
        </div>
        <p className="italic text-black text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">
          {subtitle}
        </p>
      </div>

      <div className="relative flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <button
          onClick={() => setShowPopup(!showPopup)}
          className="relative"
          aria-label="View Notifications"
        >
          <Image
            src="/photos/bell1.png"
            alt="Notifications"
            width={24}
            height={24}
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
        </button>

        {showPopup && (
          <div
            ref={popupRef}
            className="absolute right-0 top-16 w-72 sm:w-80 bg-white rounded-xl shadow-xl z-50 p-4"
          >
            <div className="bg-[#A4B494] text-black px-4 py-3 rounded-t-xl flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Notifications</p>
                <p className="text-xs">Stay updated</p>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="text-black"
                aria-label="Close Notifications"
              >
                ✕
              </button>
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
                className="mt-4 px-4 py-2 text-black bg-[#A4B494] rounded-md text-sm hover:bg-[#92A385]"
              >
                View History
              </Link>
            </div>
          </div>
        )}

        <button
          onClick={handleProfileClick}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 overflow-hidden group cursor-pointer"
          aria-label="View Profile"
        >
          {!loading && profileImage ? (
            <Image
              src={profileImage}
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200 rounded-full"
            />
          ) : (
            <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-[#A4B494] transition-colors duration-200" />
          )}
        </button>
      </div>
    </header>
  );
}
