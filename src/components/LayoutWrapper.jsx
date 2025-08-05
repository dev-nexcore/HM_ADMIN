"use client";
import Sidebar from "./home/sidebar";
import Navbar from "./home/navbar";
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Pages without layout
  const noLayoutPages = ["/", "/forgetpassword"];
  
  const hideLayout = noLayoutPages.includes(pathname);
  
  return (
    <>
      {hideLayout ? (
        children
      ) : (
        <div className="flex min-h-screen bg-white">
          {/* Sidebar - Let it handle its own positioning */}
          <Sidebar />
          
          {/* Main Area */}
          <div className="flex-1 min-h-screen ml-0 md:ml-60">
            {/* Navbar */}
            <div className="fixed top-0 right-0 h-20 z-40 bg-[#C0C8A4] left-0 md:left-60">
              <Navbar />
            </div>
            
            {/* Content Area */}
            <div className="pt-20 px-4 md:px-6">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}