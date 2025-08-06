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
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-black border-l-4 border-[#4F8CCF] pl-3">
        Audit Logs
      </h2>

      <div className="bg-[#A4B494] rounded-2xl p-4 md:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold text-black">Audit Log Entries</h3>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Logs…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 rounded-md bg-white border border-white pl-10 pr-4 text-sm text-black shadow"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>

            <button 
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md px-4 py-2 shadow-md whitespace-nowrap" 
              onClick={toggleFilterModal}
            >
              <FaFilter />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-gray-600">Timestamp:</span>
                    <span className="font-bold text-right whitespace-pre-line">{log.timestamp}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-600">User:</span>
                    <p className="mt-1 font-semibold">{log.user}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-600">Action Type:</span>
                    <p className={`mt-1 font-semibold ${getColorForAction(log.action)}`}>{log.action}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-600">Description:</span>
                    <p className="mt-1 font-semibold">{log.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-700">
              No logs found.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-base text-left text-black border-separate border-spacing-y-2">
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
                <th className="px-4 py-3 whitespace-nowrap">TimeStamp</th>
                <th className="px-4 py-3 whitespace-nowrap">User</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">Action Type</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">Description</th>
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

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Filter Audit Logs</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">Action Type</label>
                <select className="w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700">
                  <option>All Actions</option>
                  <option>Student Registered</option>
                  <option>Notice Issued</option>
                  <option>Leave Approved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date From</label>
                <input
                  type="date"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date To</label>
                <input
                  type="date"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <input
                  type="text"
                  placeholder="Enter user name"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:justify-between">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md order-2 sm:order-1"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="bg-green-500 text-white px-4 py-2 rounded-md order-1 sm:order-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}