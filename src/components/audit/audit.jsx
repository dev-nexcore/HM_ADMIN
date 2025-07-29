"use client";

import { useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

export default function AuditLogsSection() {
  const [searchTerm, setSearchTerm] = useState("");

  const logs = [
    {
      timestamp: "25-10-2025\n14:00:30",
      user: "Chinmay\nGawade",
      action: "Student Registered",
      description: "Registered New Student Chinmay Gawade(ID:101)",
      // ip removed
    },
    {
      timestamp: "25-10-2025\n14:00:30",
      user: "Chinmay\nGawade",
      action: "Notice Issued",
      description: "Issued Notice 'Hotel Maintenance Schedule'",
      // ip removed
    },
    {
      timestamp: "25-10-2025\n14:00:30",
      user: "Chinmay\nGawade",
      action: "Leave Approved",
      description: "Approved Leave Request For Warden C",
      // ip removed
    },
  ];

  // Update filter to exclude 'ip' since it's removed
  const filteredLogs = logs.filter((log) =>
    Object.values(log).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getColorForWord = (word) => {
    if (word === "Student" || word === "Registered") return "text-[#1109FF]";
    if (word === "Notice" || word === "Issued") return "text-[#FF7700]";
    if (word === "Leave" || word === "Approved") return "text-[#36FF09]";
    return "";
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-white pt-8 pl-6 sm:pl-8 md:pl-12 pr-4 sm:pr-6 md:pr-10">
      <h2 className="text-3xl sm:text-4xl font-bold text-black border-l-4 border-red-600 pl-2 mb-6">
        Audit Logs
      </h2>

      <div className="bg-[#A4B494] rounded-xl px-4 sm:px-8 py-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl sm:text-3xl font-semibold text-black whitespace-nowrap">
            Audit Log Entries
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Logs……"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-white bg-white pr-10 pl-8 py-2 text-sm text-black shadow"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>

            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md px-5 py-2 whitespace-nowrap shadow-md">
              <FaFilter />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <table className="w-full text-sm sm:text-base text-left text-black border-separate border-spacing-y-2">
            <thead>
  <tr className="bg-white font-semibold text-black">
    <th className="px-4 py-3 border-r border-white whitespace-nowrap text-sm sm:text-base">
      TimeStamp
    </th>
    <th className="px-4 py-3 border-r border-white whitespace-nowrap text-sm sm:text-base">
      User
    </th>
    <th className="px-4 py-3 border-r border-white whitespace-nowrap text-center text-sm sm:text-base">
      Action Type
    </th>
    <th className="px-4 py-3 border-r border-white text-center text-sm sm:text-base">
      Description
    </th>
  </tr>
</thead>
<tbody>
  {filteredLogs.length > 0 ? (
    filteredLogs.map((log, index) => (
      <tr
        key={index}
        className="bg-[#A4B494] even:bg-opacity-90 hover:bg-[#90A884] transition-all rounded-md"
      >
        <td className="px-4 py-2 whitespace-pre-line font-semibold text-sm sm:text-base">
          {log.timestamp}
        </td>
        <td className="px-4 py-2 whitespace-pre-line font-semibold text-sm sm:text-base">
          {log.user}
        </td>
        <td className="px-4 py-2 text-center font-semibold text-sm sm:text-base">
          <div className="flex flex-col items-center justify-center h-full space-y-0.5">
            {log.action.split(" ").map((word, i) => (
              <div key={i} className={getColorForWord(word)}>
                {word}
              </div>
            ))}
          </div>
        </td>
        <td className="px-4 py-2 font-semibold text-center text-sm sm:text-base">
          {log.description}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={4} className="text-center py-6 font-medium">
        No logs found.
      </td>
    </tr>
  )}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
