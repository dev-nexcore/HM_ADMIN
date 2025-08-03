"use client";

import { useState } from "react";
import { Eye, Download } from "lucide-react";
import Image from "next/image";

const statusStyles = {
  Scheduled: "bg-[#FF9D00] text-white",
  Completed: "bg-[#28C404] text-white",
  Cancelled: "bg-gray-300 text-black",
};

export default function InspectionPage() {
  const [formData, setFormData] = useState({
    title: "",
    target: "",
    date: "",
    time: "",
    instructions: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const upcomingInspections = [
    {
      id: "INS-001",
      title: "Monthly Room Check",
      target: "Ayaan Raje",
      date: "15/07/2025",
      time: "08:00 AM",
      status: "Scheduled",
    },
    {
      id: "INS-002",
      title: "Sanitation Check",
      target: "Block B",
      date: "20/07/2025",
      time: "10:00 AM",
      status: "Completed",
    },
    {
      id: "INS-003",
      title: "Monthly Room Check",
      target: "Block C",
      date: "25/07/2025",
      time: "09:30 AM",
      status: "Scheduled",
    },
  ];

  const tableHeaders = [
    { label: "Inspection ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Target", key: "target" },
    { label: "Date", key: "date" },
    { label: "Time", key: "time" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required.";
    if (!formData.target) newErrors.target = "Target is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.time) newErrors.time = "Time is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    alert("Inspection Scheduled Successfully");
    setFormData({
      title: "",
      target: "",
      date: "",
      time: "",
      instructions: "",
    });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleDownload = (inspection) => {
    alert(`Downloading report for ${inspection.title} (${inspection.id})`);
  };

  const handleViewDetails = (inspection) => {
    alert(
      `Inspection Details:\n\nTitle: ${inspection.title}\nTarget: ${inspection.target}\nDate: ${inspection.date}\nTime: ${inspection.time}\nStatus: ${inspection.status}`
    );
  };

  return (
    <div className="bg-white text-black w-full max-w-7xl mx-auto p-6 space-y-10 min-h-screen my-10">
      <h2 className="text-2xl font-bold mb-4 text-black">
        <span className="border-l-4 border-[#4F8CCF] pl-2 ml-2">
          Hostel Inspections
        </span>
      </h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 bg-[#BEC5AD] shadow-md space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block font-semibold mb-1">
              Inspection Title
            </label>
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 bg-white rounded-lg shadow-xl"
            >
              <option value="">Select</option>
              <option value="Monthly Room Check">Monthly Room Check</option>
              <option value="Sanitation Check">Sanitation Check</option>
            </select>
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="target" className="block font-semibold mb-1">
              Target Warden/Area
            </label>
            <input
              name="target"
              type="text"
              value={formData.target}
              onChange={handleChange}
              placeholder="Enter Target"
              className="w-full p-2 bg-white rounded-lg shadow-xl"
            />
            {errors.target && (
              <p className="text-red-600 text-xs mt-1">{errors.target}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block font-semibold mb-1">
              Date
            </label>
            <div className="flex items-center gap-2 md:max-w-[400px] w-full">
              <input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                id="dateInput"
                className="w-full p-2 text-gray-800 bg-white rounded-lg shadow-xl appearance-none"
              />
              <Image
                src="/photos/calendar.svg"
                alt="Calendar Icon"
                width={24}
                height={24}
                className="cursor-pointer hover:scale-110 transition-transform"
                onClick={() =>
                  document.getElementById("dateInput")?.showPicker?.() ||
                  document.getElementById("dateInput")?.focus()
                }
              />
            </div>
            {errors.date && (
              <p className="text-red-600 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label htmlFor="time" className="block font-semibold mb-1">
              Time
            </label>
            <div className="flex items-center gap-2 md:max-w-[400px] w-full">
              <input
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                id="timeInput"
                className="w-full p-2 text-gray-800 bg-white rounded-lg shadow-xl appearance-none"
              />
              <Image
                src="/photos/clock.svg"
                alt="Clock Icon"
                width={24}
                height={24}
                className="cursor-pointer hover:scale-110 transition-transform"
                onClick={() =>
                  document.getElementById("timeInput")?.showPicker?.() ||
                  document.getElementById("timeInput")?.focus()
                }
              />
            </div>
            {errors.time && (
              <p className="text-red-600 text-xs mt-1">{errors.time}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="instructions" className="block font-semibold mb-1">
            Instructions (optional)
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 bg-white rounded-lg shadow-xl"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: "",
                target: "",
                date: "",
                time: "",
                instructions: "",
              });
              setErrors({});
            }}
            className="bg-white text-black font-semibold px-6 py-2 rounded-lg shadow-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-white text-black font-semibold px-6 py-2 rounded-lg shadow-xl"
          >
            Schedule
          </button>
        </div>
      </form>

      {/* Inspection Table */}
      <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-xl">
        <h2 className="text-black text-lg font-semibold mb-3 ml-2">
          Upcoming Inspections
        </h2>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <div className="min-w-full inline-block overflow-hidden rounded-t-2xl border">
            <table className="min-w-full text-black text-xs sm:text-sm md:text-base table-fixed">
              <thead>
                <tr className="bg-white border-b">
                  {tableHeaders.map((header, i) => (
                    <th
                      key={i}
                      className="text-center font-semibold py-3 px-2 whitespace-nowrap w-[12.5%]"
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcomingInspections.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-black/5 transition">
                    {tableHeaders.map((column, cellIndex) => {
                      if (column.key === "actions") {
                        return (
                          <td
                            key={cellIndex}
                            className="text-center px-2 py-3 whitespace-nowrap w-[12.5%]"
                          >
                            <div className="flex justify-center items-center gap-2 sm:gap-3">
                              <Eye
                                className="w-4 h-4 text-black cursor-pointer"
                                onClick={() => handleViewDetails(row)}
                              />
                              <span className="text-gray-400">|</span>
                              <Download
                                className="w-4 h-4 text-black cursor-pointer"
                                onClick={() => handleDownload(row)}
                              />
                            </div>
                          </td>
                        );
                      }

                      if (column.key === "status") {
                        return (
                          <td
                            key={cellIndex}
                            className="text-center px-2 py-3 whitespace-nowrap w-[12.5%]"
                          >
                            <span
                              className={`inline-block w-24 px-3 py-1 text-[10px] sm:text-xs md:text-sm text-center font-medium rounded-lg ${
                                statusStyles[row.status] ??
                                "bg-gray-300 text-black"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={cellIndex}
                          className="text-center px-2 py-3 whitespace-nowrap w-[12.5%]"
                        >
                          {row[column.key]}
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
