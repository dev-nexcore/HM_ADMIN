"use client";
import Link from 'next/link';
import { Home, ArrowLeft, Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#F4F7F2] flex items-center justify-center p-4 sm:p-6 font-['Inter'] overflow-x-hidden overflow-y-auto">
      {/* Decorative Background Elements - Clipped to prevent X-scroll */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#BEC5AD]/10 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#4F8CCF]/5 rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      <div className="max-w-2xl w-full relative my-auto">
        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[30px] md:rounded-[40px] p-6 sm:p-10 md:p-16 shadow-[0_32px_64px_-16px_rgba(190,197,173,0.2)] border border-white flex flex-col items-center text-center">
          
          {/* Creative Illustration Section */}
          <div className="relative mb-8 md:mb-12 w-full flex justify-center">
            <div className="flex items-center justify-center">
              <span className="text-[80px] sm:text-[120px] md:text-[180px] font-black tracking-tighter text-[#BEC5AD]/20 leading-none select-none">
                404
              </span>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center pt-2 md:pt-4">
              <div className="relative group">
                <div className="absolute -inset-3 bg-gradient-to-tr from-[#BEC5AD] to-[#4F8CCF] rounded-full opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative bg-white p-5 sm:p-6 md:p-8 rounded-full shadow-2xl border border-gray-50 transform hover:scale-110 hover:-rotate-6 transition-all duration-500 cursor-default">
                  <Ghost className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-[#BEC5AD] animate-bounce" />
                </div>
              </div>
            </div>
          </div>

          {/* Text Information */}
          <div className="space-y-3 md:space-y-4 mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2D3128] tracking-tight">
              Oops! You're Lost.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-sm md:max-w-md mx-auto leading-relaxed font-medium">
              We searched everywhere but couldn't find this page. It might have drifted into another dimension.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center px-4 sm:px-0">
            <Link 
              href="/dashboard"
              className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 bg-[#BEC5AD] text-white font-bold rounded-xl sm:rounded-2xl hover:bg-[#A8AF97] transition-all hover:translate-y-[-4px] active:translate-y-0 shadow-[0_12px_24px_-8px_rgba(190,197,173,0.6)] group text-sm sm:text-base"
            >
              <Home size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="whitespace-nowrap">Return to Home</span>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 bg-white text-[#2D3128] font-bold rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-[#BEC5AD] hover:bg-gray-50 transition-all hover:translate-y-[-4px] active:translate-y-0 text-sm sm:text-base"
            >
              <ArrowLeft size={18} />
              Take Me Back
            </button>
          </div>

          {/* Branded Status */}
          <div className="mt-12 md:mt-16 flex items-center gap-3 sm:gap-4 text-[#BEC5AD]/60 font-bold text-[10px] sm:text-xs tracking-[0.2em] uppercase">
            <span className="hidden sm:block w-8 h-[2px] bg-[#BEC5AD]/20" />
            System Status: 404 Found
            <span className="hidden sm:block w-8 h-[2px] bg-[#BEC5AD]/20" />
          </div>
        </div>

        {/* Floating Tag */}
        <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-[#4F8CCF] text-white text-[10px] sm:text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg rotate-12 animate-pulse">
          LOST IN SPACE
        </div>
      </div>
    </div>
  );
}
