"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Mail } from "lucide-react";

const leaveRequests = [
  {
    id: 1,
    name: "Chinmay Gawade (Student)",
    type: "Vacation",
    from: "10-05-2025",
    to: "20-05-2025",
    reason: "Family Visit",
    status: "Pending",
  },
  {
    id: 2,
    name: "Chinmay Gawade (Student)",
    type: "Vacation",
    from: "10-05-2025",
    to: "20-05-2025",
    reason: "Family Visit",
    status: "Approved",
  },
  {
    id: 3,
    name: "Chinmay Gawade (Student)",
    type: "Vacation",
    from: "10-05-2025",
    to: "20-05-2025",
    reason: "Family Visit",
    status: "Rejected",
  },
];

const filters = ["All", "Approved", "Rejected", "Pending"];

const statusStyles = {
  Pending: "bg-orange-500 text-white",
  Approved: "bg-green-600 text-white",
  Rejected: "bg-red-600 text-white",
};

export default function LeaveRequestsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredRequests =
    activeFilter === "All"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === activeFilter);

  return (
    <div className="p-8 min-h-screen bg-white text-black mt-10">
      <h2 className="text-2xl font-bold mb-6 ml-2">
        <span className="border-l-4 border-red-600 pl-2">Leave Requests</span>
      </h2>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4 mb-6 ml-5">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl shadow-xl font-semibold ${
              activeFilter === filter
                ? "bg-[#ADCE8C] text-white"
                : "bg-white text-black"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-black text-sm md:text-base table-fixed">
            <thead>
              <tr className="bg-[#BEC5AD]">
                <th className="px-4 py-3 text-center align-middle font-semibold rounded-tl-2xl w-[20%]">
                  Requester Name
                </th>
                <th className="px-4 py-3 text-center align-middle font-semibold w-[10%]">
                  Type
                </th>
                <th className="px-4 py-3 text-center align-middle font-semibold w-[15%]">
                  Dates
                </th>
                <th className="px-4 py-3 text-center align-middle font-semibold w-[20%]">
                  Reason
                </th>
                <th className="px-4 py-3 text-center align-middle font-semibold w-[10%]">
                  Status
                </th>
                <th className="px-4 py-3 text-center align-middle font-semibold rounded-tr-2xl w-[25%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-black/5 transition border-t"
                >
                  <td className="px-4 py-3 text-center align-top break-words">
                    {req.name}
                  </td>
                  <td className="px-4 py-3 text-center align-top">
                    {req.type}
                  </td>
                  <td className="px-4 py-3 text-center align-top whitespace-nowrap">
                    {req.from} <br /> To <br /> {req.to}
                  </td>
                  <td className="px-4 py-3 text-center align-top">
                    {req.reason}
                  </td>
                  <td className="px-4 py-3 text-center align-top">
                    <span
                      className={`inline-block w-24 text-center px-3 py-1 text-xs md:text-sm rounded-lg font-medium ${
                        statusStyles[req.status] || "bg-gray-300 text-black"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center align-top">
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <button className="w-28 h-8 flex items-center justify-start gap-2 text-white bg-[#28C404] hover:bg-green-700 shadow-lg px-3 py-1 text-xs md:text-sm rounded-lg font-medium">
                        <CheckCircle size={18} />
                        APPROVE
                      </button>
                      <button className="w-28 h-8 flex items-center justify-start gap-2 text-white bg-[#FF0000] hover:bg-red-600 shadow-lg px-3 py-1 text-xs md:text-sm rounded-lg font-medium">
                        <XCircle size={16} />
                        Reject
                      </button>
                      <button className="w-28 h-8 flex items-center justify-start gap-2 bg-white border text-black hover:bg-gray-100 shadow-lg px-3 py-1 text-xs md:text-sm rounded-lg font-medium">
                        <Mail size={16} />
                        Message
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-600">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
