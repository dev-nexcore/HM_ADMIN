"use client";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#BEC5AD] h-20 min-h-[80px]">
      {/* Left Text - Changed to match your requirements */}
      <div className="pl-[240px] flex-1">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
          Welcome Back, Nouman
        </h2>
        <p className="text-xs sm:text-sm italic text-gray-700">
          - have a great day
        </p>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {/* Bell Icon */}
        <button className="hover:opacity-80">
          <Image
            src="/photos/bell1.png"
            alt="Notifications"
            width={24}
            height={24}
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
        </button>

        {/* Profile Icon */}
        <Link href="/profile" aria-label="Go to profile">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-300 cursor-pointer" />
        </Link>
      </div>
    </nav>
  );
}
