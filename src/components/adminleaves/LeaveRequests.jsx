"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import axios from "axios";

const statusStyles = {
  pending: "bg-orange-500 text-white",
  approved: "bg-green-600 text-white", 
  rejected: "bg-red-600 text-white",
  Pending: "bg-orange-500 text-white",
  Approved: "bg-green-600 text-white",
  Rejected: "bg-red-600 text-white",
};

const filters = ["All", "Approved", "Rejected", "Pending"];

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // Fetch leaves from backend
  const fetchLeaves = useCallback(async (filter) => {
    setLoading(true);
    try {
      let url = "";
      let params = {};

      if (filter.toLowerCase() === "pending") {
        url = `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/leaves/pending`;
      } else {
        url = `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/leaves`;
        if (filter.toLowerCase() !== "all") {
          params = { status: filter.toLowerCase(), page: 1, limit: 20 };
        }
      }

      const res = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const leavesData = res.data.leaves || res.data || [];

      const formatted = leavesData.map((leave) => ({
        id: leave._id,
        name: leave.studentId 
          ? (typeof leave.studentId === 'object' 
              ? `${leave.studentId.firstName || ''} ${leave.studentId.lastName || ''}`.trim() + 
                (leave.studentId.studentId ? ` (${leave.studentId.studentId})` : '')
              : leave.studentId)
          : 'Unknown Student',
        type: leave.leaveType,
        from: new Date(leave.startDate).toLocaleDateString(),
        to: new Date(leave.endDate).toLocaleDateString(),
        reason: leave.reason,
        status: leave.status,
      }));

      setLeaveRequests(formatted);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data whenever filter changes
  useEffect(() => {
    fetchLeaves(activeFilter);
  }, [activeFilter, fetchLeaves]);

  // Approve / Reject / Message actions
  const handleAction = async (id, action) => {
    try {
      if (action === "approve" || action === "reject") {
        const status = action === "approve" ? "approved" : "rejected";

        await axios.put(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/leaves/${id}/status`,
          {
            status,
            adminComments: "",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        
        alert(`Leave has been ${status === "approved" ? "approved ✅" : "rejected ❌"}`);
        fetchLeaves(activeFilter);
      } else if (action === "message") {
        const message = prompt("Enter your message to the student:");
        if (message) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/leaves/${id}/message`,
            {
              message: message,
              subject: "Regarding Your Leave Request"
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
              },
            }
          );
          alert("Message sent successfully 📩");
        }
      }
    } catch (err) {
      console.error("Action failed", err);
      alert("Failed to perform action. Please try again.");
    }
  };

  const filteredRequests =
    activeFilter === "All"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white text-black -mt-5 md:mt-1">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ml-1 sm:ml-2">
        <span className="border-l-4 border-[#4F8CCF] pl-2">Leave Requests</span>
      </h2>

      {/* Filter buttons - More responsive */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 px-1 sm:ml-5">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 sm:px-4 py-2 rounded-xl border-b-2 shadow-md font-bold text-sm sm:text-base ${
              activeFilter === filter
                ? "bg-[#ADCE8C] text-black"
                : "bg-white text-black"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Mobile Card View (sm and below) */}
      <div className="block lg:hidden">
        <div className="bg-[#BEC5AD] rounded-2xl p-3 sm:p-4 shadow-inner">
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="text-center py-6 text-gray-600">No leave requests found.</p>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-lg p-4 shadow-sm">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{req.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{req.type}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-lg font-medium text-xs ${
                        statusStyles[req.status] || statusStyles[req.status?.toLowerCase()] || "bg-gray-300 text-black"
                      }`}
                    >
                      {req.status?.charAt(0).toUpperCase() + req.status?.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="mb-3">
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="font-medium">Dates:</span> {req.from} - {req.to}
                    </p>
                  </div>

                  {/* Reason */}
                  <div className="mb-4">
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="font-medium">Reason:</span> {req.reason}
                    </p>
                  </div>

                  {/* Actions */}
                  {req.status?.toLowerCase() === "pending" ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 text-white bg-[#28C404] hover:bg-green-700 px-3 py-2 text-xs sm:text-sm rounded-lg"
                        onClick={() => handleAction(req.id, "approve")}
                      >
                        <CheckCircle size={14} /> APPROVE
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 text-white bg-[#FF0000] hover:bg-red-600 px-3 py-2 text-xs sm:text-sm rounded-lg"
                        onClick={() => handleAction(req.id, "reject")}
                      >
                        <XCircle size={14} /> REJECT
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 bg-white border text-black hover:bg-gray-100 px-3 py-2 text-xs sm:text-sm rounded-lg"
                        onClick={() => handleAction(req.id, "message")}
                      >
                        <Mail size={14} /> MESSAGE
                      </button>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-2">
                      No actions available
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View (lg and above) */}
      <div className="hidden lg:block">
        <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-inner">
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : (
              <table className="min-w-full text-black text-sm lg:text-base">
                <thead>
                  <tr className="bg-[#BEC5AD]">
                    <th className="px-4 py-3 text-center">Requester Name</th>
                    <th className="px-4 py-3 text-center">Type</th>
                    <th className="px-4 py-3 text-center">Dates</th>
                    <th className="px-4 py-3 text-center">Reason</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-black/5 border-t">
                      <td className="px-4 py-3 text-center">{req.name}</td>
                      <td className="px-4 py-3 text-center">{req.type}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {req.from} <br /> To <br /> {req.to}
                      </td>
                      <td className="px-4 py-3 text-center">{req.reason}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block w-24 text-center px-3 py-1 rounded-lg font-medium ${
                            statusStyles[req.status] || statusStyles[req.status?.toLowerCase()] || "bg-gray-300 text-black"
                          }`}
                        >
                          {req.status?.charAt(0).toUpperCase() + req.status?.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {req.status?.toLowerCase() === "pending" ? (
                          <div className="flex flex-col gap-2 items-center">
                            <button
                              className="w-28 h-8 flex items-center justify-start gap-2 text-white bg-[#28C404] hover:bg-green-700 px-3 py-1 text-xs lg:text-sm rounded-lg"
                              onClick={() => handleAction(req.id, "approve")}
                            >
                              <CheckCircle size={15} /> APPROVE
                            </button>
                            <button
                              className="w-28 h-8 flex items-center justify-start gap-2 text-white bg-[#FF0000] hover:bg-red-600 px-3 py-1 text-xs lg:text-sm rounded-lg"
                              onClick={() => handleAction(req.id, "reject")}
                            >
                              <XCircle size={15} /> REJECT
                            </button>
                            <button
                              className="w-28 h-8 flex items-center justify-start gap-2 bg-white border text-black hover:bg-gray-100 px-3 py-1 text-xs lg:text-sm rounded-lg"
                              onClick={() => handleAction(req.id, "message")}
                            >
                              <Mail size={15} /> MESSAGE
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No actions available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-gray-600">
                        No leave requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}