"use client";

import { useState } from "react";
import { CalendarIcon, ClockIcon, Eye, Download } from "lucide-react";

const statusStyles = {
  Scheduled: "bg-[#FF9D00] text-white",
  Completed: "bg-[#28C404] text-white",
  Cancelled: "bg-gray-300 text-black",
};

export default function InspectionPage() {
  const [form, setForm] = useState({
    title: "",
    target: "",
    date: "",
    time: "",
    instructions: "",
  });

  const upcomingInspections = [
    {
      id: "INS-001",
      title: "Monthly Room Check ",
      target: "Ayaan Raje",
      date: "15-07-2025",
      time: "08:00 am",
      status: "Scheduled",
    },
    {
      id: "INS-002",
      title: "Sanitation Check",
      target: "Block B",
      date: "20-07-2025",
      time: "10:00 am",
      status: "Completed",
    },
    {
      id: "INS-003",
      title: "Monthly Room Check",
      target: "Block C",
      date: "25-07-2025",
      time: "09:30 am",
      status: "Scheduled",
    },
  ];

  const tableHeaders = [
    "Inspection ID",
    "Title",
    "Target",
    "Date",
    "Time",
    "Status",
    "Actions",
  ];

  return (
    <div className="bg-white text-black min-w-full mx-auto p-6 space-y-8 min-h-screen my-10">
      <h2 className="text-2xl font-bold mb-4 text-black">
        <span className="border-l-4 border-red-600 pl-2 ml-2">
          Hostel Inspections
        </span>
      </h2>

      {/* Schedule Form */}
      <div className="rounded-2xl p-6 bg-[#BEC5AD] shadow-md">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1">Inspection Title</label>
            <select
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 bg-white rounded-lg shadow-xl"
            >
              <option value="">Select</option>
              <option value="Monthly Room Check">Monthly Room Check</option>
              <option value="Sanitation Check">Sanitation Check</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Target Warden/Area
            </label>
            <input
              type="text"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              placeholder="Enter Target"
              className="w-full p-2 bg-white rounded-lg shadow-xl"
            />
          </div>
        </div>

        {/* Date and Time Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="w-full md:w-1/2">
            <label className="block font-semibold mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full p-2 pl-5 text-gray-800 bg-white rounded-lg shadow-xl"
              placeholder="dd-mm-yyyy"
            />
          </div>
          <div className="w-full md:w-1/2">
            <label className="block font-semibold mb-1">Time</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full p-2 pl-5 text-gray-800 bg-white rounded-lg shadow-xl"
              placeholder="--:--"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Instructions</label>
          <textarea
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            rows={3}
            className="w-full p-2 bg-white rounded-lg shadow-xl"
          />
        </div>

        <div className="flex justify-center gap-4">
          <button className="bg-white text-black font-semibold px-6 py-2 rounded-lg shadow-xl">
            Cancel
          </button>
          <button className="bg-white font-semibold text-black px-6 py-2 rounded-lg shadow-xl">
            Schedule
          </button>
        </div>
      </div>

      {/* ✅ Responsive Table Section */}
      <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-xl">
        <h2 className="text-black text-lg font-semibold mb-3 ml-2">
          Upcoming Inspections
        </h2>

        <div className="overflow-x-auto">
          {/* Wrapper to enable proper border rounding */}
          <div className="min-w-full inline-block overflow-hidden  rounded-t-2xl border">
            <table className="min-w-full table-fixed text-black text-xs sm:text-sm md:text-base">
              <thead>
                <tr className="bg-white border-b">
                  {tableHeaders.map((header, i) => (
                    <th
                      key={i}
                      className="text-center font-semibold py-3 px-2 whitespace-nowrap w-[12.5%]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {upcomingInspections.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-black/5 transition">
                    {tableHeaders.map((column, cellIndex) => {
                      const key = column
                        .toLowerCase()
                        .replace("inspection id", "id")
                        .replace(/\s+/g, "");
                      const value = row[key];

                      if (column === "Status") {
                        return (
                          <td
                            key={cellIndex}
                            className="text-center px-2 py-3 whitespace-nowrap w-[12.5%]"
                          >
                            <span
                              className={`inline-block w-24 px-3 py-1 text-[10px] sm:text-xs md:text-sm text-center font-medium rounded-lg ${
                                statusStyles[value] || "bg-gray-300 text-black"
                              }`}
                            >
                              {value}
                            </span>
                          </td>
                        );
                      }

                      if (column === "Actions") {
                        return (
                          <td
                            key={cellIndex}
                            className="text-center px-2 py-3 whitespace-nowrap w-[12.5%]"
                          >
                            <div className="flex justify-center items-center gap-2 sm:gap-3">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-black cursor-pointer" />
                              <span className="text-gray-400">|</span>
                              <Download className="w-3 h-3 sm:w-4 sm:h-4 text-black cursor-pointer" />
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={cellIndex}
                          className="text-center px-2 py-3 whitespace-nowrap w-[12.5%]"
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
