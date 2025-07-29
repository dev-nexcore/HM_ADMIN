"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");

  useEffect(() => {
    setSidebarOpen(false); // Close on route change
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", icon: "/photos/dashboard.png", href: "/dashboard" },
    {
      label: "Inventory Management",
      icon: "/photos/inventory.png",
      href: "/inventory",
    },
    {
      label: "Student Management",
      icon: "/photos/student.png",
      href: "/students",
    },
    { label: "Notices", icon: "/photos/notice.png", href: "/notices" },
    { label: "Invoices", icon: "/photos/invoice.png", href: "/invoices" },
    {
      label: "Inspection",
      icon: "/photos/inspection.png",
      href: "/inspection",
    },
    {
      label: "Leave Requests",
      icon: "/photos/leave.png",
      href: "/leave-requests",
    },
    {
      label: "Staff Allotment",
      icon: "/photos/staff.png",
      href: "/staffallotment",
    },
    {
      label: "Staff Salary & Deductions",
      icon: "/photos/salary.png",
      href: "/staffsalary",
    },
    {
      label: "Tickets and Queries",
      icon: "/photos/tickets.png",
      href: "/tickets",
    },
    { label: "Audit Logs", icon: "/photos/audit.png", href: "/audit" },
    { label: "Refunds", icon: "/photos/refund.png", href: "/refunds" },
  ];

  const getLinkClass = (href, label) =>
    `flex items-center gap-3 px-6 py-3 transition-all duration-200 rounded-l-full text-sm cursor-pointer
     ${
       active === label || pathname === href
         ? "bg-white text-black font-bold shadow ml-2"
         : "hover:underline text-black"
     }`;

  return (
    <div className="bg-[#BEC5AD]">
      {/* Hamburger menu (Mobile) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#A4B494] rounded-md shadow text-black"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 z-40 w-60 h-full bg-[#A4B494] py-8 pl-5 flex flex-col justify-between
        rounded-tr-4xl shadow transform transition-transform duration-300
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
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
          <div className="flex justify-start mb-6 px-4 ml-8.5">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow">
              <img
                src="/photos/logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Nav Links */}
          <ul className="space-y-1 text-[15px] font-semibold">
            {navItems.map(({ label, icon, href }) => (
              <li key={label} onClick={() => setActive(label)}>
                <Link href={href}>
                  <div className={getLinkClass(href, label)}>
                    <Image
                      src={icon}
                      alt={`${label} icon`}
                      width={18}
                      height={18}
                    />
                    {label}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout */}
        <div className="mt-auto mb-6">
          <hr className="border-t border-black mx-6 my-4" />
          <div className="flex justify-start px-6">
            <button className="flex items-center gap-2 text-black text-sm hover:underline">
              <Image
                src="/photos/logout.png"
                alt="Logout"
                width={18}
                height={18}
              />
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
    </div>
  );
}
