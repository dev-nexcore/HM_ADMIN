"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import axios from "axios";

const statusStyles = {
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
        url = `${process.env.NEXT_PUBLIC_BACKEND_API}/adminauth/leaves/pending`;
      } else {
        url = `${process.env.NEXT_PUBLIC_BACKEND_API}/adminauth/leaves`;
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
        name: `${leave.studentId?.studentName} (${leave.studentId?.studentId})`,
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
      // match backend's expected values
      const status = action === "approve" ? "approved" : "rejected";

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/adminauth/leaves/${id}/status`,
        {
          status, // backend expects 'approved' or 'rejected'
          adminComments: "", // optional: could be a state value from an input
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      
        toast.success(
          `Leave has been ${status === "approved" ? "approved ✅" : "rejected ❌"}`
        );

      fetchLeaves(activeFilter); // refresh after update
    } else if (action === "message") {
      alert("Message sent 📩");
    }
  } catch (err) {
    console.error("Action failed", err);
  }
};


  const filteredRequests =
    activeFilter === "All"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="p-8 min-h-screen bg-white text-black mt-8">
      <h2 className="text-2xl font-bold mb-6 ml-2">
        <span className="border-l-4 border-[#4F8CCF] pl-2">Leave Requests</span>
      </h2>

      {/* Filter buttons */}
      <div className="flex flex-wrap justify-start gap-4 mb-6 ml-5">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`min-w-[80px] sm:min-w-[100px] px-2 sm:px-4 py-2 rounded-xl border-b-2 shadow-md font-bold ${
              activeFilter === filter
                ? "bg-[#ADCE8C] text-black"
                : "bg-white text-black"
            }`}
          >
            <span className="text-xs sm:text-base">{filter}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-inner">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <table className="min-w-full text-black text-sm md:text-base table-fixed">
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
                          statusStyles[req.status] || "bg-gray-300 text-black"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {req.status === "pending" ? (
                        <div className="flex flex-col gap-2 items-center">
                          <button
                            className="w-28 h-8 flex items-center justify-start gap-2 text-white bg-[#28C404] hover:bg-green-700 px-3 py-1 text-xs md:text-sm rounded-lg"
                            onClick={() => handleAction(req.id, "approve")}
                          >
                            <CheckCircle size={15} /> APPROVE
                          </button>
                          <button
                            className="w-28 h-8 flex items-center justify-start gap-2 text-white bg-[#FF0000] hover:bg-red-600 px-3 py-1 text-xs md:text-sm rounded-lg"
                            onClick={() => handleAction(req.id, "reject")}
                          >
                            <XCircle size={15} /> REJECT
                          </button>
                          <button
                            className="w-28 h-8 flex items-center justify-start gap-2 bg-white border text-black hover:bg-gray-100 px-3 py-1 text-xs md:text-sm rounded-lg"
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
  );
}
