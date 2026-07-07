"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Users, ChevronDown, ChevronUp } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // Scroll Lock on Sidebar Open
  useEffect(() => {
    if (sidebarOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
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
        { label: "Student Inquiries", icon: "/photos/audit.png", href: "/inquiries" },
        { label: "Student Fees", icon: "/photos/invoice.png", href: "/student-fees" },
        { label: "Warden Requisitions", icon: "/photos/audit.png", href: "/warden-requisitions" },
        { label: "Attendance Monitoring", icon: "/photos/inspection.png", href: "/attendance" },
        { label: "Leave Requests", icon: "/photos/leave.png", href: "/leave-requests" },
        { label: "Staff Allotment", icon: "/photos/staff.png", href: "/staffallotment" },
        { label: "Staff Salary & Deductions", icon: "/photos/salary.png", href: "/staffsalary" },
        { label: "Calendar", icon: "/photos/calendar.svg", href: "/calendar" },
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
      pathname === href || (href !== "/" && pathname.startsWith(href))
        ? "bg-white text-black rounded-lg mx-2 shadow-sm mb-1"
        : "hover:bg-white/30 text-black pl-6"
    }`;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-60 bg-[#A4B494] py-6 shadow-lg rounded-tr-3xl flex flex-col items-center transition-transform duration-300 overflow-y-auto scrollbar-hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Close Button - Mobile Only */}
        <button
          className="md:hidden absolute top-4 right-4 p-2 text-black"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="flex justify-center items-center mb-6 -mt-3">
          <img src="/photos/logo1.svg" alt="Logo" className="w-31 h-auto" />
        </div>

        {/* Nav Items */}
        <div className="w-full md:flex-1 md:overflow-y-auto px-2 scrollbar-hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isParent = !!item.children;

              return (
                <li key={item.label} className="w-full">
                  {isParent ? (
                    <>
                      <div
                        className={`flex items-center justify-between gap-3 px-4 py-2 cursor-pointer font-semibold text-black hover:bg-white/30 rounded-lg transition-all duration-200 ${
                          openMenus[item.label] ? "bg-white/40" : ""
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

                      {openMenus[item.label] && (
                        <div className="mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link href={child.href} key={child.label}>
                              <div
                                className={`${getLinkClass(child.href, child.label)} ml-4`}
                                onClick={() => {
                                  setActive(child.label);
                                  setSidebarOpen(false); // Close sidebar on mobile after selection
                                }}
                              >
                                <Image src={child.icon} alt={`${child.label} icon`} width={20} height={20} />
                                <span className="text-sm">{child.label}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href={item.href}>
                      <div
                        className={getLinkClass(item.href, item.label)}
                        onClick={() => {
                          setActive(item.label);
                          setSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
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
        </div>

        {/* Logout */}
        <div className="md:mt-auto mt-6 mb-12 md:mb-6 px-5 w-full">
          <hr className="border-t border-black mb-3" />
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 text-black px-4 py-2 rounded-full hover:bg-[#3E522D] w-full font-semibold"
          >
            <Image src="/photos/logout.png" alt="Logout" width={20} height={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4" style={{ backdropFilter: 'blur(8px)' }}>
          <div
            className="max-w-md w-full p-6 rounded-2xl border shadow-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%)',
                pointerEvents: 'none'
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                  style={{
                    background: 'rgba(239, 68, 68, 0.9)',
                    border: '1px solid rgba(239, 68, 68, 1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 drop-shadow-sm">Confirm Logout</h3>
              </div>

              <p className="text-gray-800 mb-6 text-sm leading-relaxed font-medium">
                Are you sure you want to logout? You will need to sign in again to access your account.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-5 py-2.5 text-gray-800 font-semibold rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 15px 0 rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 text-white font-semibold rounded-lg transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 1) 100%)',
                    border: '1px solid rgba(185, 28, 28, 0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 15px 0 rgba(239, 68, 68, 0.5)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 1) 0%, rgba(185, 28, 28, 1) 100%)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 1) 100%)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}