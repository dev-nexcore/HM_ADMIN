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

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", icon: "/photos/dashboard.png", href: "/dashboard" },
    {
      label: "Inventory<br/>Management",
      icon: "/photos/inventory.png",
      href: "/inventary",
    },
    {
      label: "Student<br/>Management",
      icon: "/photos/student.png",
      href: "/management",
    },
    { label: "Notices", icon: "/photos/notice.png", href: "/notices" },
    { label: "Invoices", icon: "/photos/invoice.png", href: "/invoices" },
    {
      label: "Inspection",
      icon: "/photos/inspection.png",
      href: "/inspection",
    },
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
    router.push("/login");
  };

  const getLinkClass = (href, label) =>
    `flex items-start gap-3 px-2 py-1.5 transition-all duration-200 rounded-l-full text-[0.86rem] cursor-pointer leading-tight
     ${active === label || pathname === href
        ? "bg-white text-black font-semibold shadow ml-1"
        : "hover:underline text-black"}`;

  return (
    <div>
      {/* Hamburger menu (Mobile) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#A4B494] rounded-md shadow text-black"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      <aside
        className={`fixed top-0 left-0 z-40 w-60 h-screen bg-[#A4B494] py-3 pl-2 flex flex-col justify-between
        rounded-tr-4xl shadow transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        {/* Close Button (Mobile Only) */}
        <button
          className="md:hidden absolute top-4 right-4 p-2 text-black"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>

        <div>
          {/* Logo */}
          <div className="flex items-center justify-center mb-2 px-1">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow">
              <img
                src="/photos/logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Nav Links */}
          <ul className="space-y-2 font-semibold pr-2">
            {navItems.map(({ label, icon, href }) => (
              <li key={label} onClick={() => setActive(label)}>
                <Link href={href}>
                  <div className={getLinkClass(href, label)}>
                    <div className="min-w-[18px] mt-[2px]">
                      <Image src={icon} alt={`${label} icon`} width={18} height={18} />
                    </div>
                    <span
                      className="break-words"
                      dangerouslySetInnerHTML={{ __html: label }}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="mt-3 mb-2">
          <hr className="border-t border-black mx-4 mb-1" />
          <div className="px-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 text-black px-3 py-1.5 rounded-full hover:bg-[#3E522D] w-full"
            >
              <Image src="/photos/logout.png" alt="Logout" width={18} height={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Dark Overlay (Mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-[#A4B494]/60 z-50">
          <div className="bg-[#A4B494] p-6 rounded-xl shadow-lg w-80 max-w-full text-black flex flex-col items-center">
            <p className="mb-4 text-center text-lg font-semibold">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="bg-white text-[#4A633E] font-semibold px-5 py-2 rounded-full hover:bg-[#D7E3C8]"
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
