"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", icon: "/photos/dashboard.png", href: "/dashboard" },
    {
      label: "Inventory<br/>Management",
      icon: "/photos/inventory.png",
      href: "/inventory",
    },
    {
      label: "Student<br/>Management",
      icon: "/photos/student.png",
      href: "/management",
    },
    { label: "Notices", icon: "/photos/notice.png", href: "/notices" },
    { label: "Invoices", icon: "/photos/invoice.png", href: "/invoices" },
    { label: "Inspection", icon: "/photos/inspection.png", href: "/inspection" },
    {
      label: "Leave<br/>Requests",
      icon: "/photos/leave.png",
      href: "/leave-requests",
    },
    {
      label: "Staff<br/>Allotment",
      icon: "/photos/staff.png",
      href: "/staffallotment",
    },
    {
      label: "Staff Salary<br/>& Deductions",
      icon: "/photos/salary.png",
      href: "/staffsalary",
    },
    {
      label: "Tickets<br/>and Queries",
      icon: "/photos/tickets.png",
      href: "/ticket",
    },
    { label: "Audit Logs", icon: "/photos/audit.png", href: "/audit" },
    { label: "Refunds", icon: "/photos/refund.png", href: "/refunds" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/");
  };

  const getLinkClass = (href, label) =>
  `flex items-center gap-3 px-2 py-1.5 transition-all duration-200 text-[15px] font-semibold w-full cursor-pointer
   ${
     active === label || pathname === href
       ? "bg-white text-black shadow rounded-l-full pl-6 pr-0"
       : "hover:bg-white/30 text-black pl-6 pr-0"
   }`;


  return (
    <div className="min-h-screen flex">
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#A4B494] rounded-md shadow text-black"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-60 h-full bg-[#A4B494] py-6 shadow rounded-tr-3xl flex flex-col items-center transition-transform duration-300
        ${isHydrated && sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        {/* Close button mobile */}
        <button
          className="md:hidden absolute top-4 right-4 p-2 text-black"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>

        {/* Logo */}
<div className="flex justify-center items-center mb-6 -mt-3">
  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow">
    <img
      src="/photos/logo.png"
      alt="Logo"
      className="w-full h-full object-cover"
    />
  </div>
</div>


        {/* Nav items */}
        <ul className="flex flex-col gap-1 w-full px-2">
          {navItems.map(({ label, icon, href }) => (
            <li key={label} onClick={() => setActive(label)}>
              <Link href={href}>
                <div className={getLinkClass(href, label)}>
                  <Image
                    src={icon}
                    alt={`${label} icon`}
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <span
                    className="break-words leading-tight"
                    dangerouslySetInnerHTML={{ __html: label }}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="mt-auto mb-6 px-5 w-full">
          <hr className="border-t border-black mb-3" />
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center justify-start gap-3 text-black px-4 -pt-3 rounded-full hover:bg-[#3E522D] w-full font-semibold"
          >
            <Image src="/photos/logout.png" alt="Logout" width={20} height={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#A4B494]/60 backdrop-blur-sm z-50">
          <div className="bg-[#A4B494] p-6 rounded-xl shadow-lg w-80 max-w-full text-black flex flex-col items-center">
            <p className="mb-4 text-center text-lg font-extrabold">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="bg-white text-[#4A633E] font-semibold px-5 py-2 rounded-full hover:bg-[#D7E3C8] "
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-[#4A633E] text-white font-semibold px-5 py-2 rounded-full hover:bg-[#3E522D]"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
