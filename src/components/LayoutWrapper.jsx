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
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Navbar - Fixed at top */}
            <div className="h-20 bg-[#C0C8A4] flex-shrink-0">
              <Navbar />
            </div>
            
            {/* Page Content */}
            <div className="flex-1 px-4 md:px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}