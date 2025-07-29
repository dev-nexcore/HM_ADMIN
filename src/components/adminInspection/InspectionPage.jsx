"use client";

import { useState } from "react";
import { CalendarIcon, ClockIcon, Eye, Download } from "lucide-react";

const statusStyles = {
  Scheduled: "bg-yellow-200 text-yellow-800",
  Completed: "bg-green-200 text-green-800",
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
      title: "Monthly Room Check",
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
            <label className="block font-medium mb-1">Inspection Title</label>
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
            <label className="block font-medium mb-1">Target Warden/Area</label>
            <input
              type="text"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              placeholder="Enter Target"
              className="w-full p-2 bg-white rounded-lg shadow-xl"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Date</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-2 bg-white rounded-lg shadow-xl"
                placeholder="dd-mm-yyyy"
              />
              <CalendarIcon size={18} className="text-black" />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Time</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full p-2 bg-white rounded-lg shadow-xl"
                placeholder="-- : --"
              />
              <ClockIcon size={18} className="text-black" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Instructions</label>
          <textarea
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            rows={3}
            className="w-full p-2 bg-white rounded-lg shadow-xl"
          />
        </div>

        <div className="flex justify-center gap-4">
          <button className="bg-white text-black px-6 py-2 rounded shadow">
            Cancel
          </button>
          <button className="bg-white text-black px-6 py-2 rounded shadow">
            Schedule
          </button>
        </div>
      </div>

      {/* ✅ Responsive Table Section */}
      <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-xl">
        <h2 className="font-semibold text-black mb-3 text-lg">
          Upcoming Inspections
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-black rounded-lg text-sm md:text-base">
            <thead>
              <tr className="bg-white">
                {tableHeaders.map((header, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-center font-semibold whitespace-nowrap ${
                      i === 0
                        ? "rounded-tl-2xl"
                        : i === tableHeaders.length - 1
                        ? "rounded-tr-2xl"
                        : ""
                    }`}
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
                    const value =
                      row[
                        column
                          .toLowerCase()
                          .replace("inspection id", "id")
                          .replace(/\s+/g, "")
                      ];

                    if (column === "Status") {
                      return (
                        <td
                          key={cellIndex}
                          className="px-4 py-4 text-center whitespace-nowrap"
                        >
                          <span
                            className={`inline-block w-24 text-center px-3 py-1 text-xs md:text-sm rounded-lg font-medium ${
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
                          className="px-4 py-2 text-center whitespace-nowrap"
                        >
                          <div className="flex justify-center items-center gap-3">
                            <Eye className="h-4 w-4 cursor-pointer text-black" />
                            <span className="text-gray-400">|</span>
                            <Download className="h-4 w-4 cursor-pointer text-black" />
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={cellIndex}
                        className="px-4 py-2 text-center whitespace-nowrap"
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
      </section>
    </div>
  );
}
