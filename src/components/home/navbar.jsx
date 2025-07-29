"use client";
import Link from "next/link";
import Image from "next/image";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  return (
    <nav
      className={`flex items-center justify-between px-4 sm:px-6 py-6 bg-[#BEC5AD] h-24 min-h-[80px]
        transition-all duration-300 md:ml-60 
      `}
    >
      {/* Hamburger button to toggle sidebar on mobile */}
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

      {/* Left Text (shifts only on mobile when sidebar is open) */}
      <div
        className={`flex-1 transition-all duration-300
          ${sidebarOpen ? "pl-48" : "pl-4"} md:pl-0
        `}
      >
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
          Welcome Back, Nouman
        </h2>
        <p className="text-xs sm:text-sm italic text-gray-800">
          - have a great day
        </p>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <button className="hover:opacity-80">
          <Image
            src="/photos/bell1.png"
            alt="Notifications"
            width={24}
            height={24}
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
        </button>

        <Link href="/profile" aria-label="Go to profile">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-300 cursor-pointer" />
        </Link>
      </div>
    </nav>
  );
}
