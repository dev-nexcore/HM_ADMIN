"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Users, ChevronDown, ChevronUp } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // Scroll & Touch Lock on Sidebar Open
  useEffect(() => {
    const preventScroll = (e) => {
      e.preventDefault();
    };

    if (sidebarOpen) {
      document.documentElement.style.overflow = "hidden"; // HTML scroll lock
      document.body.style.overflow = "hidden";            // Body scroll lock
      document.addEventListener("touchmove", preventScroll, { passive: false }); // Touch scroll lock
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [sidebarOpen]);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const navItems = [
    { label: "Dashboard", icon: "/photos/dashboard.png", href: "/dashboard" },
    {
      label: "Management",
      icon: "react-icon",
      children: [
        { label: "Student Management", icon: "/photos/student.png", href: "/management" },
        { label: "Leave Requests", icon: "/photos/leave.png", href: "/leave-requests" },
        { label: "Staff Allotment", icon: "/photos/staff.png", href: "/staffallotment" },
        { label: "Staff Salary & Deductions", icon: "/photos/salary.png", href: "/staffsalary" },
      ],
    },
    { label: "Inventory Management", icon: "/photos/inventory.png", href: "/inventory" },
    { label: "Notices", icon: "/photos/notice.png", href: "/notices" },
    { label: "Invoices", icon: "/photos/invoice.png", href: "/invoices" },
    { label: "Inspection", icon: "/photos/inspection.png", href: "/inspection" },
    { label: "Tickets and Queries", icon: "/photos/tickets.png", href: "/ticket" },
    { label: "Audit Logs", icon: "/photos/audit.png", href: "/audit" },
    { label: "Refunds", icon: "/photos/refund.png", href: "/refunds" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/");
  };

  const getLinkClass = (href, label) =>
    `flex items-center gap-3 px-4 py-2 transition-all duration-200 text-sm font-semibold cursor-pointer
    ${
      active === label || pathname === href
        ? "bg-white text-black rounded-lg ml-2 shadow-inner"
        : "hover:bg-white/30 text-black pl-6"
    }`;

  return (
    <div className="relative min-h-screen">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40  md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#A4B494] rounded-md shadow text-black"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-60 bg-[#A4B494] py-6 shadow-md rounded-tr-3xl flex flex-col items-center transition-transform duration-300 overflow-y-auto md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close Button */}
        <button
          className="md:hidden absolute top-4 right-4 p-2 text-black"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="flex justify-center items-center mb-6 -mt-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow">
            <img src="/photos/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Nav Items */}
        <ul className="flex flex-col gap-1 w-full px-2">
          {navItems.map((item) => {
            const isParent = !!item.children;

            return (
              <li key={item.label} className="w-full">
                {isParent ? (
                  <>
                    <div
                      className={`flex items-center justify-between gap-3 px-4 py-2 cursor-pointer font-semibold text-black hover:bg-white/30 ${
                        openMenus[item.label] ? "bg-white/40 rounded-lg" : ""
                      }`}
                      onClick={() => toggleMenu(item.label)}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon === "react-icon" ? (
                          <Users size={20} />
                        ) : (
                          <Image src={item.icon} alt={`${item.label} icon`} width={20} height={20} />
                        )}
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span>{openMenus[item.label] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                    </div>

                    {openMenus[item.label] &&
                      item.children.map((child) => (
                        <Link href={child.href} key={child.label}>
                          <div
                            className={`${getLinkClass(child.href, child.label)} ml-6`}
                            onClick={() => setActive(child.label)}
                          >
                            <Image src={child.icon} alt={`${child.label} icon`} width={20} height={20} />
                            <span className="text-sm">{child.label}</span>
                          </div>
                        </Link>
                      ))}
                  </>
                ) : (
                  <Link href={item.href}>
                    <div
                      className={getLinkClass(item.href, item.label)}
                      onClick={() => setActive(item.label)}
                    >
                      <Image src={item.icon} alt={`${item.label} icon`} width={20} height={20} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Logout */}
        <div className="mt-auto mb-6 px-5 w-full">
          <hr className="border-t border-black mb-3" />
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 text-black px-4 rounded-full hover:bg-[#3E522D] w-full font-semibold"
          >
            <Image src="/photos/logout.png" alt="Logout" width={20} height={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#A4B494]/60 backdrop-blur-sm z-50">
          <div className="bg-[#A4B494] p-6 rounded-xl shadow-lg w-80 text-black text-center">
            <p className="mb-4 text-lg font-extrabold">Are you sure you want to logout?</p>
            <div className="flex justify-center gap-4">
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
