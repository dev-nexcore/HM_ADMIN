"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import api from "@/lib/api";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye } from "lucide-react";

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
  const [showApproveModal, setShowApproveModal] = useState(false);
const [showRejectModal, setShowRejectModal] = useState(false);
const [selectedLeaveId, setSelectedLeaveId] = useState(null);
const [rejectReason, setRejectReason] = useState("");
const [showViewModal, setShowViewModal] = useState(false);
const [selectedLeave, setSelectedLeave] = useState(null);

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

      const res = await api.get(url, {
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
        adminComments: leave.adminComments || "", 
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

        await api.put(
          `/api/adminauth/leaves/${id}/status`,
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
        
        toast.success(`Leave has been ${status === "approved" ? "approved ✅" : "rejected ❌"}`);
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
          toast.success("Message sent successfully 📩");
        }
      }
    } catch (err) {
      console.error("Action failed", err);
      toast.error("Failed to perform action. Please try again.");
    }
  };


  const confirmApprove = async () => {
  try {
    await api.put(
      `/api/adminauth/leaves/${selectedLeaveId}/status`,
      {
        status: "approved",
        adminComments: "",
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    toast.success("Leave approved ✅");
    setShowApproveModal(false);
    setSelectedLeaveId(null);
    fetchLeaves(activeFilter);

  } catch {
    toast.error("Failed to approve leave");
  }
};


const confirmReject = async () => {
  try {
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required ❗");
      return;
    }

    await api.put(
      `/api/adminauth/leaves/${selectedLeaveId}/status`,
      {
        status: "rejected",
        adminComments: rejectReason,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    toast.success("Leave rejected ❌");

    setShowRejectModal(false);
    setRejectReason("");
    setSelectedLeaveId(null);
    fetchLeaves(activeFilter);

  } catch {
    toast.error("Failed to reject leave");
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
                  {/* <div className="mb-4">
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="font-medium">Reason:</span> {req.reason}
                    </p>
                    {req.status?.toLowerCase() === "rejected" && req.adminComments && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
    <p className="text-xs text-red-700">
      <span className="font-semibold">Rejected:</span> {req.adminComments}
    </p>
  </div>
)}
                  </div> */}
                  

                  {/* Actions */}
                  {req.status?.toLowerCase() === "pending" ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 text-xs sm:text-sm rounded-lg"
  onClick={() => {
    setSelectedLeave(req);
    setShowViewModal(true);
  }}
>
  <Eye size={14} /> VIEW
</button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 text-white bg-[#28C404] hover:bg-green-700 px-3 py-2 text-xs sm:text-sm rounded-lg"
                        // onClick={() => handleAction(req.id, "approve")}
                        onClick={() => {
  setSelectedLeaveId(req.id);
  setShowApproveModal(true);
}}
                      >
                        <CheckCircle size={14} /> APPROVE
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 text-white bg-[#FF0000] hover:bg-red-600 px-3 py-2 text-xs sm:text-sm rounded-lg"
                        // onClick={() => handleAction(req.id, "reject")}
                        onClick={() => {
  setSelectedLeaveId(req.id);
  setShowRejectModal(true);
}}
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
                    <button
  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 text-xs sm:text-sm rounded-lg"
  onClick={() => {
    setSelectedLeave(req);
    setShowViewModal(true);
  }}
>
  <Eye size={14} /> VIEW
</button>
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
                    {/* <th className="px-4 py-3 text-center">Reason</th> */}
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                    {/* <th className="px-4 py-3 text-center">Rejection Reason</th> */}
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
                      {/* <td className="px-4 py-3 text-center">{req.reason}</td> */}
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
  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 text-xs sm:text-sm rounded-lg"
  onClick={() => {
    setSelectedLeave(req);
    setShowViewModal(true);
  }}
>
  <Eye size={14} /> VIEW
</button>
                            <button
                              className="w-28 h-8 flex items-center justify-start gap-2 text-white bg-[#28C404] hover:bg-green-700 px-3 py-1 text-xs lg:text-sm rounded-lg"
                              // onClick={() => handleAction(req.id, "approve")}
                              onClick={() => {
  setSelectedLeaveId(req.id);
  setShowApproveModal(true);
}}
                            >
                              <CheckCircle size={15} /> APPROVE
                            </button>
                            <button
                              className="w-28 h-8 flex items-center justify-start gap-2 text-white bg-[#FF0000] hover:bg-red-600 px-3 py-1 text-xs lg:text-sm rounded-lg"
                              // onClick={() => handleAction(req.id, "reject")}
                              onClick={() => {
  setSelectedLeaveId(req.id);
  setShowRejectModal(true);
}}
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
                          <button
  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 text-xs sm:text-sm rounded-lg"
  onClick={() => {
    setSelectedLeave(req);
    setShowViewModal(true);
  }}
>
  <Eye size={14} /> VIEW
</button>
                        )}
                      </td>
                      {/* <td className="px-4 py-3 text-center text-red-600 text-sm">
  {req.status?.toLowerCase() === "rejected" ? req.adminComments : "-"}
</td> */}
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
 {showApproveModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    
    <div className="bg-white w-[90%] sm:w-[380px] rounded-2xl p-6 shadow-2xl animate-fadeIn">
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Confirm Approval
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to approve this leave request?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowApproveModal(false)}
          className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
        >
          Cancel
        </button>

        <button
          onClick={confirmApprove}
          className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
        >
          Approve
        </button>
      </div>

    </div>
  </div>
)}
{showRejectModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    
    <div className="bg-white w-[90%] sm:w-[420px] rounded-2xl p-6 shadow-2xl animate-fadeIn">

      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Reject Leave
      </h3>

      <textarea
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        placeholder="Enter rejection reason..."
        className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-red-400"
        rows={4}
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setShowRejectModal(false);
            setRejectReason("");
          }}
          className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
        >
          Cancel
        </button>

        <button
          onClick={confirmReject}
          className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
        >
          Reject
        </button>
      </div>

    </div>
  </div>
)}


{showViewModal && selectedLeave && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    
    <div className="bg-white w-[90%] sm:w-[450px] rounded-2xl p-6 shadow-2xl">

      <h3 className="text-lg font-semibold mb-4">Leave Details</h3>

      <div className="space-y-2 text-sm text-gray-700">
        <p><b>Name:</b> {selectedLeave.name}</p>
        <p><b>Type:</b> {selectedLeave.type}</p>
        <p><b>From:</b> {selectedLeave.from}</p>
        <p><b>To:</b> {selectedLeave.to}</p>
        <p><b>Status:</b> {selectedLeave.status}</p>

        <p><b>Reason:</b> {selectedLeave.reason}</p>

        {selectedLeave.status?.toLowerCase() === "rejected" && (
          <p className="text-red-600">
            <b>Rejection Reason:</b> {selectedLeave.adminComments || "-"}
          </p>
        )}
      </div>

      <div className="flex justify-end mt-5">
        <button
          onClick={() => setShowViewModal(false)}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  theme="colored"
/>
    </div>
  );
}