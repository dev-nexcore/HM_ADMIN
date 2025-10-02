"use client";
import Sidebar from "./home/sidebar";
import Navbar from "./home/navbar";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Exclude layout for /admin/login or /forgetpassword pages
  const hideLayout = pathname.startsWith("/admin") && !pathname.includes("login");

  return (
    <>
      {hideLayout ? (
        children
      ) : (
        <div className="min-h-screen bg-white">
          {/* Sidebar */}
          <Sidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
          
          {/* Main Content Area - with proper margin for desktop sidebar */}
          <div className={`md:ml-60 min-h-screen flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-60' : ''}`}>
            {/* Navbar - Fixed at top */}
            <Navbar 
              onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            
            {/* Page Content - with top margin for fixed navbar */}
            <main className="flex-1 px-4 md:px-6 py-4 mt-16 sm:mt-20 md:mt-24">
              {children}
            </main>
          </div>
        </div>
      )}
    </>
  );
}
