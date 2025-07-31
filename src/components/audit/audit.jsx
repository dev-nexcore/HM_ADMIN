"use client";

import { useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

export default function AuditLogsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const logs = [
    { timestamp: "25-10-2025\n14:00:30", user: "Chinmay Gawade", action: "Student Registered", description: "Registered New Student Chinmay Gawade(ID:101)" },
    { timestamp: "25-10-2025\n14:00:30", user: "Chinmay Gawade", action: "Notice Issued", description: "Issued Notice 'Hotel Maintenance Schedule'" },
    { timestamp: "25-10-2025\n14:00:30", user: "Chinmay Gawade", action: "Leave Approved", description: "Approved Leave Request For Warden C" },
  ];

  const filteredLogs = logs.filter(log =>
    Object.values(log).some(val =>
      val.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getColorForAction = action => {
    if (action === "Student Registered") return "text-blue-600";
    if (action === "Notice Issued") return "text-orange-600";
    if (action === "Leave Approved") return "text-green-600";
    return "";
  };

  const toggleFilterModal = () => setIsFilterModalOpen(!isFilterModalOpen);

  return (
    <div className="min-h-screen w-full bg-white pt-8 px-6 sm:px-8 md:px-12">
      <div className="flex items-center gap-2 mb-6">
        <span className="h-7 w-1 bg-[#4F8CCF]" />
        <h2 className="text-3xl font-semibold text-black">Audit Logs</h2>
      </div>

      <div className="bg-[#A4B494] rounded-xl px-4 sm:px-8 py-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-semibold text-black">Audit Log Entries</h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80 md:w-64 lg:w-96">
              <input
                type="text"
                placeholder="Search Logs…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full
                  h-10 sm:h-12 md:h-12
                  rounded-md bg-white border border-white
                  pl-12 pr-10
                  text-sm sm:text-base
                  text-black shadow
                "
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>

            {/* Filter button (commented) */}
            {/* <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md px-5 py-2 shadow-md" onClick={toggleFilterModal}>
              <FaFilter /><span className="hidden sm:inline">Filter</span>
            </button> */}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base text-left text-black border-separate border-spacing-y-2">
            <style jsx>{`
              th {
                position: relative;
              }
              th:not(:last-child)::after {
                content: "";
                position: absolute;
                top: 12px;
                bottom: 12px;
                right: 0;
                width: 0.5px;
                background-color: #444;
              }
            `}</style>
            <thead>
              <tr className="bg-white font-semibold text-black">
                <th className="px-4 py-3">TimeStamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-center">Action Type</th>
                <th className="px-4 py-3 text-center">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="bg-[#A4B494] even:bg-opacity-90 hover:bg-[#90A884] transition-all rounded-md">
                    <td className="px-4 py-4 whitespace-pre-line font-semibold">{log.timestamp}</td>
                    <td className="px-4 py-4 whitespace-pre-line font-semibold">{log.user}</td>
                    <td className={`px-4 py-4 text-center font-semibold ${getColorForAction(log.action)}`}>{log.action}</td>
                    <td className="px-4 py-4 text-center font-semibold">{log.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-6 font-medium">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Modal (commented) */}
      {/* {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] sm:w-[400px]">
            …filter content…
          </div>
        </div>
      )} */}
    </div>
  );
}
