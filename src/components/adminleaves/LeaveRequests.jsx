// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { CheckCircle, XCircle, Mail } from "lucide-react";
// import api from "@/lib/api";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Eye } from "lucide-react";

// const statusStyles = {
//   pending: "bg-orange-500 text-white",
//   approved: "bg-green-600 text-white", 
//   rejected: "bg-red-600 text-white",
//   Pending: "bg-orange-500 text-white",
//   Approved: "bg-green-600 text-white",
//   Rejected: "bg-red-600 text-white",
// };

// const filters = ["All", "Approved", "Rejected", "Pending"];

// export default function LeaveRequestsPage() {
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [loading, setLoading] = useState(false);
//   const [showApproveModal, setShowApproveModal] = useState(false);
// const [showRejectModal, setShowRejectModal] = useState(false);
// const [selectedLeaveId, setSelectedLeaveId] = useState(null);
// const [rejectReason, setRejectReason] = useState("");
// const [showViewModal, setShowViewModal] = useState(false);
// const [selectedLeave, setSelectedLeave] = useState(null);

//   // Fetch leaves from backend
//   const fetchLeaves = useCallback(async (filter) => {
//     setLoading(true);
//     try {
//       let url = "";
//       let params = {};

//       if (filter.toLowerCase() === "pending") {
//         url = `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/leaves/pending`;
//       } else {
//         url = `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/leaves`;
//         if (filter.toLowerCase() !== "all") {
//           params = { status: filter.toLowerCase(), page: 1, limit: 20 };
//         }
//       }

//       const res = await api.get(url, {
//         params,
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//         },
//       });

//       const leavesData = res.data.leaves || res.data || [];

//       const formatted = leavesData.map((leave) => ({
//         id: leave._id,
//         name: leave.studentId 
//           ? (typeof leave.studentId === 'object' 
//               ? `${leave.studentId.firstName || ''} ${leave.studentId.lastName || ''}`.trim() + 
//                 (leave.studentId.studentId ? ` (${leave.studentId.studentId})` : '')
//               : leave.studentId)
//           : 'Unknown Student',
//         type: leave.leaveType,
//         from: new Date(leave.startDate).toLocaleDateString(),
//         to: new Date(leave.endDate).toLocaleDateString(),
//         reason: leave.reason,
//         status: leave.status,
//         adminComments: leave.adminComments || "", 
//       }));

//       setLeaveRequests(formatted);
//     } catch (err) {
//       console.error("Failed to fetch leaves", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Load data whenever filter changes
//   useEffect(() => {
//     fetchLeaves(activeFilter);
//   }, [activeFilter, fetchLeaves]);

//   // Approve / Reject / Message actions
//   const handleAction = async (id, action) => {
//     try {
//       if (action === "approve" || action === "reject") {
//         const status = action === "approve" ? "approved" : "rejected";

//         await api.put(
//           `/api/adminauth/leaves/${id}/status`,
//           {
//             status,
//             adminComments: "",
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//             },
//           }
//         );
        
//         toast.success(`Leave has been ${status === "approved" ? "approved ✅" : "rejected ❌"}`);
//         fetchLeaves(activeFilter);
//       } else if (action === "message") {
//         const message = prompt("Enter your message to the student:");
//         if (message) {
//           await axios.post(
//             `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/leaves/${id}/message`,
//             {
//               message: message,
//               subject: "Regarding Your Leave Request"
//             },
//             {
//               headers: {
//                 Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//               },
//             }
//           );
//           toast.success("Message sent successfully 📩");
//         }
//       }
//     } catch (err) {
//       console.error("Action failed", err);
//       toast.error("Failed to perform action. Please try again.");
//     }
//   };


//   const confirmApprove = async () => {
//   try {
//     await api.put(
//       `/api/adminauth/leaves/${selectedLeaveId}/status`,
//       {
//         status: "approved",
//         adminComments: "",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//         },
//       }
//     );

//     toast.success("Leave approved ✅");
//     setShowApproveModal(false);
//     setSelectedLeaveId(null);
//     fetchLeaves(activeFilter);

//   } catch {
//     toast.error("Failed to approve leave");
//   }
// };


// const confirmReject = async () => {
//   try {
//     if (!rejectReason.trim()) {
//       toast.error("Rejection reason is required ❗");
//       return;
//     }

//     await api.put(
//       `/api/adminauth/leaves/${selectedLeaveId}/status`,
//       {
//         status: "rejected",
//         adminComments: rejectReason,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//         },
//       }
//     );

//     toast.success("Leave rejected ❌");

//     setShowRejectModal(false);
//     setRejectReason("");
//     setSelectedLeaveId(null);
//     fetchLeaves(activeFilter);

//   } catch {
//     toast.error("Failed to reject leave");
//   }
// };
//   const filteredRequests =
//     activeFilter === "All"
//       ? leaveRequests
//       : leaveRequests.filter((req) => req.status.toLowerCase() === activeFilter.toLowerCase());

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white text-black -mt-5 md:mt-1">
//       <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ml-1 sm:ml-2">
//         <span className="border-l-4 border-[#4F8CCF] pl-2">Leave Requests</span>
//       </h2>

//       {/* Filter buttons - More responsive */}
//       <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 px-1 sm:ml-5">
//         {filters.map((filter) => (
//           <button
//             key={filter}
//             onClick={() => setActiveFilter(filter)}
//             className={`px-3 sm:px-4 py-2 rounded-xl border-b-2 shadow-md font-bold text-sm sm:text-base ${
//               activeFilter === filter
//                 ? "bg-[#ADCE8C] text-black"
//                 : "bg-white text-black"
//             }`}
//           >
//             {filter}
//           </button>
//         ))}
//       </div>

//       {/* Mobile Card View (sm and below) */}
//       <div className="block lg:hidden">
//         <div className="bg-[#BEC5AD] rounded-2xl p-3 sm:p-4 shadow-inner">
//           {loading ? (
//             <p className="text-center py-4">Loading...</p>
//           ) : filteredRequests.length === 0 ? (
//             <p className="text-center py-6 text-gray-600">No leave requests found.</p>
//           ) : (
//             <div className="space-y-4">
//               {filteredRequests.map((req) => (
//                 <div key={req.id} className="bg-white rounded-lg p-4 shadow-sm">
//                   {/* Header */}
//                   <div className="flex justify-between items-start mb-3">
//                     <div>
//                       <h3 className="font-semibold text-sm sm:text-base">{req.name}</h3>
//                       <p className="text-xs sm:text-sm text-gray-600">{req.type}</p>
//                     </div>
//                     <span
//                       className={`px-2 py-1 rounded-lg font-medium text-xs ${
//                         statusStyles[req.status] || statusStyles[req.status?.toLowerCase()] || "bg-gray-300 text-black"
//                       }`}
//                     >
//                       {req.status?.charAt(0).toUpperCase() + req.status?.slice(1).toLowerCase()}
//                     </span>
//                   </div>

//                   {/* Dates */}
//                   <div className="mb-3">
//                     <p className="text-xs sm:text-sm text-gray-700">
//                       <span className="font-medium">Dates:</span> {req.from} - {req.to}
//                     </p>
//                   </div>

//                   {/* Reason */}
//                   {/* <div className="mb-4">
//                     <p className="text-xs sm:text-sm text-gray-700">
//                       <span className="font-medium">Reason:</span> {req.reason}
//                     </p>
//                     {req.status?.toLowerCase() === "rejected" && req.adminComments && (
//   <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
//     <p className="text-xs text-red-700">
//       <span className="font-semibold">Rejected:</span> {req.adminComments}
//     </p>
//   </div>
// )}
//                   </div> */}
                  

//                   {/* Actions */}
//                   {req.status?.toLowerCase() === "pending" ? (
//                     <div className="flex flex-col sm:flex-row gap-2">
//                       <button
//   className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 text-xs sm:text-sm rounded-lg"
//   onClick={() => {
//     setSelectedLeave(req);
//     setShowViewModal(true);
//   }}
// >
//   <Eye size={14} /> VIEW
// </button>
//                       <button
//                         className="flex-1 flex items-center justify-center gap-2 text-white bg-[#28C404] hover:bg-green-700 px-3 py-2 text-xs sm:text-sm rounded-lg"
//                         // onClick={() => handleAction(req.id, "approve")}
//                         onClick={() => {
//   setSelectedLeaveId(req.id);
//   setShowApproveModal(true);
// }}
//                       >
//                         <CheckCircle size={14} /> APPROVE
//                       </button>
//                       <button
//                         className="flex-1 flex items-center justify-center gap-2 text-white bg-[#FF0000] hover:bg-red-600 px-3 py-2 text-xs sm:text-sm rounded-lg"
//                         // onClick={() => handleAction(req.id, "reject")}
//                         onClick={() => {
//   setSelectedLeaveId(req.id);
//   setShowRejectModal(true);
// }}
//                       >
//                         <XCircle size={14} /> REJECT
//                       </button>
//                       <button
//                         className="flex-1 flex items-center justify-center gap-2 bg-white border text-black hover:bg-gray-100 px-3 py-2 text-xs sm:text-sm rounded-lg"
//                         onClick={() => handleAction(req.id, "message")}
//                       >
//                         <Mail size={14} /> MESSAGE
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//   className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 text-xs sm:text-sm rounded-lg"
//   onClick={() => {
//     setSelectedLeave(req);
//     setShowViewModal(true);
//   }}
// >
//   <Eye size={14} /> VIEW
// </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Desktop Table View (lg and above) */}
//       <div className="hidden lg:block">
//         <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-inner">
//           <div className="overflow-x-auto">
//             {loading ? (
//               <p className="text-center py-4">Loading...</p>
//             ) : (
//               <table className="min-w-full text-black text-sm lg:text-base">
//                 <thead>
//                   <tr className="bg-[#BEC5AD]">
//                     <th className="px-4 py-3 text-center">Requester Name</th>
//                     <th className="px-4 py-3 text-center">Type</th>
//                     <th className="px-4 py-3 text-center">Dates</th>
//                     {/* <th className="px-4 py-3 text-center">Reason</th> */}
//                     <th className="px-4 py-3 text-center">Status</th>
//                     <th className="px-4 py-3 text-center">Actions</th>
//                     {/* <th className="px-4 py-3 text-center">Rejection Reason</th> */}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredRequests.map((req) => (
//                     <tr key={req.id} className="hover:bg-black/5 border-t">
//                       <td className="px-4 py-3 text-center">{req.name}</td>
//                       <td className="px-4 py-3 text-center">{req.type}</td>
//                       <td className="px-4 py-3 text-center whitespace-nowrap">
//                         {req.from} <br /> To <br /> {req.to}
//                       </td>
//                       {/* <td className="px-4 py-3 text-center">{req.reason}</td> */}
//                       <td className="px-4 py-3 text-center">
//                         <span
//                           className={`inline-block w-24 text-center px-3 py-1 rounded-lg font-medium ${
//                             statusStyles[req.status] || statusStyles[req.status?.toLowerCase()] || "bg-gray-300 text-black"
//                           }`}
//                         >
//                           {req.status?.charAt(0).toUpperCase() + req.status?.slice(1).toLowerCase()}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         {req.status?.toLowerCase() === "pending" ? (
//                           <div className="flex flex-col gap-2 items-center">
//                             <button
//   className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 text-xs sm:text-sm rounded-lg"
//   onClick={() => {
//     setSelectedLeave(req);
//     setShowViewModal(true);
//   }}
// >
//   <Eye size={14} /> VIEW
// </button>
//                             <button
//                               className="w-28 h-8 flex items-center justify-start gap-2 text-white bg-[#28C404] hover:bg-green-700 px-3 py-1 text-xs lg:text-sm rounded-lg"
//                               // onClick={() => handleAction(req.id, "approve")}
//                               onClick={() => {
//   setSelectedLeaveId(req.id);
//   setShowApproveModal(true);
// }}
//                             >
//                               <CheckCircle size={15} /> APPROVE
//                             </button>
//                             <button
//                               className="w-28 h-8 flex items-center justify-start gap-2 text-white bg-[#FF0000] hover:bg-red-600 px-3 py-1 text-xs lg:text-sm rounded-lg"
//                               // onClick={() => handleAction(req.id, "reject")}
//                               onClick={() => {
//   setSelectedLeaveId(req.id);
//   setShowRejectModal(true);
// }}
//                             >
//                               <XCircle size={15} /> REJECT
//                             </button>
//                             <button
//                               className="w-28 h-8 flex items-center justify-start gap-2 bg-white border text-black hover:bg-gray-100 px-3 py-1 text-xs lg:text-sm rounded-lg"
//                               onClick={() => handleAction(req.id, "message")}
//                             >
//                               <Mail size={15} /> MESSAGE
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//   className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 text-xs sm:text-sm rounded-lg"
//   onClick={() => {
//     setSelectedLeave(req);
//     setShowViewModal(true);
//   }}
// >
//   <Eye size={14} /> VIEW
// </button>
//                         )}
//                       </td>
//                       {/* <td className="px-4 py-3 text-center text-red-600 text-sm">
//   {req.status?.toLowerCase() === "rejected" ? req.adminComments : "-"}
// </td> */}
//                     </tr>
                    
//                   ))}
//                   {filteredRequests.length === 0 && !loading && (
//                     <tr>
//                       <td colSpan={6} className="text-center py-6 text-gray-600">
//                         No leave requests found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </section>
//       </div>
//  {showApproveModal && (
//   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    
//     <div className="bg-white w-[90%] sm:w-[380px] rounded-2xl p-6 shadow-2xl animate-fadeIn">
      
//       <h3 className="text-lg font-semibold text-gray-800 mb-2">
//         Confirm Approval
//       </h3>

//       <p className="text-sm text-gray-600 mb-6">
//         Are you sure you want to approve this leave request?
//       </p>

//       <div className="flex justify-end gap-3">
//         <button
//           onClick={() => setShowApproveModal(false)}
//           className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
//         >
//           Cancel
//         </button>

//         <button
//           onClick={confirmApprove}
//           className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
//         >
//           Approve
//         </button>
//       </div>

//     </div>
//   </div>
// )}
// {showRejectModal && (
//   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    
//     <div className="bg-white w-[90%] sm:w-[420px] rounded-2xl p-6 shadow-2xl animate-fadeIn">

//       <h3 className="text-lg font-semibold text-gray-800 mb-3">
//         Reject Leave
//       </h3>

//       <textarea
//         value={rejectReason}
//         onChange={(e) => setRejectReason(e.target.value)}
//         placeholder="Enter rejection reason..."
//         className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-red-400"
//         rows={4}
//       />

//       <div className="flex justify-end gap-3">
//         <button
//           onClick={() => {
//             setShowRejectModal(false);
//             setRejectReason("");
//           }}
//           className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
//         >
//           Cancel
//         </button>

//         <button
//           onClick={confirmReject}
//           className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
//         >
//           Reject
//         </button>
//       </div>

//     </div>
//   </div>
// )}


// {showViewModal && selectedLeave && (
//   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    
//     <div className="bg-white w-[90%] sm:w-[450px] rounded-2xl p-6 shadow-2xl">

//       <h3 className="text-lg font-semibold mb-4">Leave Details</h3>

//       <div className="space-y-2 text-sm text-gray-700">
//         <p><b>Name:</b> {selectedLeave.name}</p>
//         <p><b>Type:</b> {selectedLeave.type}</p>
//         <p><b>From:</b> {selectedLeave.from}</p>
//         <p><b>To:</b> {selectedLeave.to}</p>
//         <p><b>Status:</b> {selectedLeave.status}</p>

//         <p><b>Reason:</b> {selectedLeave.reason}</p>

//         {selectedLeave.status?.toLowerCase() === "rejected" && (
//           <p className="text-red-600">
//             <b>Rejection Reason:</b> {selectedLeave.adminComments || "-"}
//           </p>
//         )}
//       </div>

//       <div className="flex justify-end mt-5">
//         <button
//           onClick={() => setShowViewModal(false)}
//           className="px-4 py-2 bg-gray-200 rounded-lg"
//         >
//           Close
//         </button>
//       </div>

//     </div>
//   </div>
// )}
//       <ToastContainer
//   position="top-right"
//   autoClose={3000}
//   hideProgressBar={false}
//   newestOnTop
//   closeOnClick
//   pauseOnHover
//   draggable
//   theme="colored"
// />
//     </div>
//   );
// }
"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Mail, Eye } from "lucide-react";
import api from "@/lib/api";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── Status styles ──────────────────────────────────────────────────────────────
const statusStyles = {
  pending:  "bg-orange-500 text-white",
  approved: "bg-green-600 text-white",
  rejected: "bg-red-600 text-white",
  parent_approved: "bg-purple-600 text-white",
  Pending:  "bg-orange-500 text-white",
  Approved: "bg-green-600 text-white",
  Rejected: "bg-red-600 text-white",
  Parent_approved: "bg-purple-600 text-white",
};

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icons = {
  total: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  approved: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  rejected: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  pending: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

// ── StatCard Component ─────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, isActive, onClick, total }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col gap-3 rounded-2xl p-5 text-left
        border-2 transition-all duration-200 cursor-pointer
        ${isActive
          ? "border-[#4F8CCF] bg-white shadow-lg scale-[1.02]"
          : "border-transparent bg-[#D6DAC8] hover:bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]"}
      `}
      style={{ fontFamily: "Poppins" }}
    >
      {/* Top row: icon + count */}
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <span className="text-3xl font-extrabold leading-none" style={{ color: accent }}>
          {value}
        </span>
      </div>

      {/* Label */}
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider leading-snug">
        {label}
      </p>

      {/* Mini progress bar (skip for Total) */}
      {label !== "Total Requests" && (
        <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: accent }} />
        </div>
      )}

      {/* Active dot */}
      {isActive && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: accent }} />
      )}
    </button>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal]   = useState(false);
  const [selectedLeaveId, setSelectedLeaveId]   = useState(null);
  const [rejectReason, setRejectReason]         = useState("");
  const [showViewModal, setShowViewModal]       = useState(false);
  const [selectedLeave, setSelectedLeave]       = useState(null);
  
  // ── Search & Filter ────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  
  // ── Pagination ─────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total:    leaveRequests.length,
    approved: leaveRequests.filter(r => r.status?.toLowerCase() === "approved").length,
    rejected: leaveRequests.filter(r => r.status?.toLowerCase() === "rejected").length,
    pending:  leaveRequests.filter(r => r.status?.toLowerCase() === "pending").length,
  };

  const STAT_CARDS = [
    { key: "All",      label: "Total Requests", value: stats.total,    accent: "#4F8CCF", icon: Icons.total },
    { key: "Approved", label: "Approved",        value: stats.approved, accent: "#22C55E", icon: Icons.approved },
    { key: "Rejected", label: "Rejected",         value: stats.rejected, accent: "#EF4444", icon: Icons.rejected },
    { key: "Pending",  label: "Pending",          value: stats.pending,  accent: "#FF9D00", icon: Icons.pending },
  ];

  // ── Fetch ──────────────────────────────────────────────────────────────────
  // We always fetch ALL leaves so stats stay accurate regardless of filter
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/leaves`,
        {
          params: { page: 1, limit: 200 },
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        }
      );

      const leavesData = res.data.leaves || res.data || [];

      const formatted = leavesData.map((leave) => ({
        id:            leave._id,
        name:          leave.studentId
          ? (typeof leave.studentId === "object"
              ? `${leave.studentId.firstName || ""} ${leave.studentId.lastName || ""}`.trim() +
                (leave.studentId.studentId ? ` (${leave.studentId.studentId})` : "")
              : leave.studentId)
          : "Unknown Student",
        type:          leave.leaveType,
        from:          new Date(leave.startDate).toLocaleDateString(),
        to:            new Date(leave.endDate).toLocaleDateString(),
        reason:        leave.reason,
        status:        leave.status,
        adminComments: leave.adminComments || "",
      }));

      setLeaveRequests(formatted);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const confirmApprove = async () => {
    try {
      await api.put(
        `/api/adminauth/leaves/${selectedLeaveId}/status`,
        { status: "approved", adminComments: "" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );
      toast.success("Leave approved ✅");
      setShowApproveModal(false); setSelectedLeaveId(null);
      fetchLeaves();
    } catch { toast.error("Failed to approve leave"); }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) { toast.error("Rejection reason is required ❗"); return; }
    try {
      await api.put(
        `/api/adminauth/leaves/${selectedLeaveId}/status`,
        { status: "rejected", adminComments: rejectReason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );
      toast.success("Leave rejected ❌");
      setShowRejectModal(false); setRejectReason(""); setSelectedLeaveId(null);
      fetchLeaves();
    } catch { toast.error("Failed to reject leave"); }
  };

  const handleMessage = async (id) => {
    const message = prompt("Enter your message to the student:");
    if (!message) return;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/leaves/${id}/message`,
        { message, subject: "Regarding Your Leave Request" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );
      toast.success("Message sent successfully 📩");
    } catch { toast.error("Failed to send message."); }
  };

  // ── Filtered list (client-side) ────────────────────────────────────────────
  const filteredRequests = leaveRequests.filter(r => {
    const matchesFilter = activeFilter === "All" || r.status?.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = 
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const displayedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // ── Pagination Component ───────────────────────────────────────────────────
  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-6 px-2">
        <p className="text-sm text-gray-500 font-medium">
          Showing <span className="text-black font-bold">{Math.min(filteredRequests.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
          <span className="text-black font-bold">{Math.min(filteredRequests.length, currentPage * itemsPerPage)}</span> of{" "}
          <span className="text-black font-bold">{filteredRequests.length}</span> entries
        </p>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
          >
            Previous
          </button>
          <div className="flex gap-1 hidden sm:flex">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                  currentPage === i + 1
                    ? "bg-[#4F8CCF] text-white shadow-lg shadow-[#4F8CCF]/20"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 shadow-sm"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // ── Shared action buttons ──────────────────────────────────────────────────
  const ActionButtons = ({ req, compact = false }) => {
    const btnBase = "relative flex items-center justify-center transition-all duration-200 transform active:scale-90 group";
    
    // Modern circular buttons with subtle colors
    const IconButton = ({ icon, color, label, onClick }) => (
      <button 
        onClick={onClick}
        title={label}
        className={`${btnBase} ${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full`}
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <div className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-10 transition-opacity" />
        {icon}
        {!compact && (
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none font-bold uppercase tracking-wider">
            {label}
          </span>
        )}
      </button>
    );

    return (
      <div className={`flex items-center justify-center ${compact ? 'gap-2' : 'gap-4'}`}>
        <IconButton 
          icon={<Eye size={compact ? 16 : 18} />} 
          color="#3B82F6" 
          label="View Details" 
          onClick={() => { setSelectedLeave(req); setShowViewModal(true); }} 
        />
        
        {(req.status?.toLowerCase() === "pending" || req.status?.toLowerCase() === "parent_approved") && (
          <>
            <IconButton 
              icon={<CheckCircle size={compact ? 16 : 18} />} 
              color="#10B981" 
              label="Approve" 
              onClick={() => { setSelectedLeaveId(req.id); setShowApproveModal(true); }} 
            />
            <IconButton 
              icon={<XCircle size={compact ? 16 : 18} />} 
              color="#EF4444" 
              label="Reject" 
              onClick={() => { setSelectedLeaveId(req.id); setShowRejectModal(true); }} 
            />
          </>
        )}
      </div>
    );
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white text-black">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 ml-1 sm:ml-2">
        <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "Inter" }}>
          <span className="border-l-4 border-[#4F8CCF] pl-2">Leave Requests</span>
        </h2>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="relative group">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8CCF]/20 focus:border-[#4F8CCF] transition-all cursor-pointer w-full sm:w-40"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#4F8CCF] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input 
              type="text"
              placeholder="Search student or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F8CCF]/20 focus:border-[#4F8CCF] transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── STAT CARDS (TOP) ── */}
      <div className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STAT_CARDS.map(card => (
            <StatCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={card.value}
              accent={card.accent}
              isActive={activeFilter === card.key}
              onClick={() => setActiveFilter(prev => prev === card.key ? "All" : card.key)}
              total={stats.total}
            />
          ))}
        </div>

        {/* Active filter badge */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {activeFilter !== "All" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4F8CCF]/10 text-[#4F8CCF] text-sm font-semibold rounded-full border border-[#4F8CCF]/30">
                {activeFilter}
                <button onClick={() => setActiveFilter("All")} className="ml-1 hover:text-red-500 transition-colors font-bold">×</button>
              </span>
            </div>
          )}
          
          {searchTerm && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Search:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full border border-gray-300">
                "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-red-500 transition-colors font-bold">×</button>
              </span>
            </div>
          )}

          {(activeFilter !== "All" || searchTerm) && (
            <span className="text-sm text-gray-500">({filteredRequests.length} result{filteredRequests.length !== 1 ? "s" : ""})</span>
          )}
        </div>
      </div>

      {/* ── Mobile Card View ── */}
      <div className="block lg:hidden">
        <div className="bg-[#BEC5AD] rounded-2xl p-3 sm:p-4 shadow-inner">
          {loading ? (
            <p className="text-center py-6 text-gray-600">Loading...</p>
          ) : displayedRequests.length === 0 ? (
            <p className="text-center py-8 text-gray-600">No leave requests found.</p>
          ) : (
            <div className="space-y-3">
              {displayedRequests.map((req, index) => (
                <div key={req.id} className="bg-white rounded-xl p-4 shadow-sm border border-black/10">
                  {/* Header with Sr No */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4F8CCF]/10 text-[#4F8CCF] font-bold text-sm">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{req.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{req.type}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap ${statusStyles[req.status] || "bg-gray-200 text-black"}`}>
                      {req.status?.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Duration</span>
                    <p className="text-xs font-semibold text-black mt-0.5">{req.from} → {req.to}</p>
                  </div>

                  {/* Actions */}
                  <ActionButtons req={req} />
                </div>
              ))}
            </div>
          )}
        </div>
        <Pagination />
      </div>

      {/* ── Desktop Table View ── */}
      <div className="hidden lg:block">
        <div className="bg-[#BEC5AD] rounded-2xl p-4 shadow-inner">
          {loading ? (
            <p className="text-center py-6 text-gray-600">Loading...</p>
          ) : (
            <div className="border border-black rounded-[19.6px] overflow-hidden">
              <table className="min-w-full text-black text-sm">
                <thead>
                  <tr className="bg-white">
                    {["Sr No", "Requester Name", "Type", "Dates", "Status", "Actions"].map((h, i, arr) => (
                      <th key={h} className="px-4 py-3 text-center font-semibold relative" style={{ fontFamily: "Poppins" }}>
                        {h}
                        {i < arr.length - 1 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-5 bg-black/30" />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedRequests.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-600">No leave requests found.</td>
                    </tr>
                  )}
                  {displayedRequests.map((req, index) => (
                    <tr key={req.id} className="hover:bg-black/5 border-t border-black/10">
                      <td className="px-4 py-3 text-center font-bold text-gray-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{req.name}</td>
                      <td className="px-4 py-3 text-center">{req.type}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                        <span className="font-medium">{req.from}</span>
                        <span className="block text-gray-500 text-xs my-0.5">to</span>
                        <span className="font-medium">{req.to}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block min-w-[100px] text-center px-3 py-1 rounded-lg font-semibold text-xs whitespace-nowrap ${statusStyles[req.status] || "bg-gray-200 text-black"}`}>
                          {req.status?.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {(req.status?.toLowerCase() === "pending" || req.status?.toLowerCase() === "parent_approved") ? (
                          <ActionButtons req={req} compact />
                        ) : (
                          <ActionButtons req={req} compact />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination />
      </div>

      {/* ── Approve Modal ── */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white w-full sm:w-[380px] rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Approval</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to approve this leave request?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowApproveModal(false)} className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition font-medium">Cancel</button>
              <button onClick={confirmApprove} className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium">Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white w-full sm:w-[420px] rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Reject Leave</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(""); }} className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition font-medium">Cancel</button>
              <button onClick={confirmReject} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium">Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {showViewModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white w-full sm:w-[550px] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F9FAFB] rounded-t-2xl">
              <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-tight" style={{ fontFamily: "Poppins" }}>
                Leave Application Details
              </h3>
              <button 
                onClick={() => { setShowViewModal(false); setSelectedLeave(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Grid info */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                {[
                  ["Requester",  selectedLeave.name],
                  ["Leave Type", selectedLeave.type],
                  ["From Date",       selectedLeave.from],
                  ["To Date",         selectedLeave.to],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-[0.1em] font-bold">{k}</span>
                    <span className="text-sm text-black font-semibold">{v}</span>
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-[0.1em] font-bold">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit whitespace-nowrap ${statusStyles[selectedLeave.status] || "bg-gray-200 text-black"}`}>
                    {selectedLeave.status?.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                  </span>
                </div>
              </div>

              {/* Reason box */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.1em] font-bold">Detailed Reason</span>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedLeave.reason}
                </div>
              </div>

              {/* Admin Comments (if rejected) */}
              {selectedLeave.status?.toLowerCase() === "rejected" && selectedLeave.adminComments && (
                <div className="space-y-2">
                  <span className="text-[10px] text-red-400 uppercase tracking-[0.1em] font-bold">Admin Rejection Feedback</span>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800 italic leading-relaxed break-words whitespace-pre-wrap">
                    "{selectedLeave.adminComments}"
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => { setShowViewModal(false); setSelectedLeave(null); }} 
                className="px-6 py-2.5 bg-black text-white hover:bg-gray-800 rounded-xl text-sm font-bold uppercase tracking-wider transition-all transform active:scale-95"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable theme="colored"/>
    </div>
  );
}