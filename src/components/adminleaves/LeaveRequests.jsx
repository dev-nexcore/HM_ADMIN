"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  RefreshCw,
  Calendar,
  Filter,
  MessageSquare,
  Trash2
} from "lucide-react";
import api from "@/lib/api";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── Status styles ──────────────────────────────────────────────────────────────
const getStatusColor = (status) => {
  const s = status?.toLowerCase() || '';
  if (['pending'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (['approved', 'warden_approved', 'parent_approved'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (['rejected', 'warden_rejected', 'parent_rejected'].includes(s)) return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

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
  const [isProcessing, setIsProcessing]         = useState(false);
  
  // ── Search & Filter ────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  const clearFilters = () => {
    setActiveFilter("All");
    setSearchTerm("");
    setDateFilter("");
  };
  
  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/leaves`,
        {
          params: { page: 1, limit: 1000 },
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
        type:          leave.leaveType === 'Others' && leave.otherLeaveType ? `Others (${leave.otherLeaveType})` : leave.leaveType,
        startDate:     leave.startDate,
        endDate:       leave.endDate,
        from:          new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        to:            new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        reason:        leave.reason,
        status:        leave.status,
        adminComments: leave.adminComments || "",
        wardenComments: leave.wardenComments || ""
      }));

      // Sort by latest first
      formatted.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setLeaveRequests(formatted);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    leaveRequests.length,
    approved: leaveRequests.filter(r => ['approved', 'warden_approved', 'parent_approved'].includes(r.status?.toLowerCase())).length,
    rejected: leaveRequests.filter(r => ['rejected', 'warden_rejected', 'parent_rejected'].includes(r.status?.toLowerCase())).length,
    pending:  leaveRequests.filter(r => r.status?.toLowerCase() === "pending").length,
  }), [leaveRequests]);

  // ── Filtered list (client-side) ────────────────────────────────────────────
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(r => {
      let matchesFilter = false;
      if (activeFilter === "All") {
        matchesFilter = true;
      } else if (activeFilter === "Pending") {
        matchesFilter = ["pending", "parent_approved", "warden_approved", "warden_rejected"].includes(r.status?.toLowerCase());
      } else {
        matchesFilter = r.status?.toLowerCase() === activeFilter.toLowerCase();
      }
      
      const matchesSearch = 
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        
      let matchesDate = true;
      if (dateFilter) {
        const filterD = new Date(dateFilter);
        const filterEnd = new Date(dateFilter);
        filterEnd.setHours(23, 59, 59, 999);
        
        const reqStart = r.startDate ? new Date(r.startDate) : new Date(0);
        const reqEnd = r.endDate ? new Date(r.endDate) : reqStart;
        
        matchesDate = (filterD <= reqEnd) && (filterEnd >= reqStart);
      }
      
      return matchesFilter && matchesSearch && matchesDate;
    });
  }, [leaveRequests, activeFilter, searchTerm, dateFilter]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const confirmApprove = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await api.put(
        `/api/adminauth/leaves/${selectedLeaveId}/status`,
        { status: "approved", adminComments: "" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );
      toast.success("Leave approved successfully!");
      setShowApproveModal(false); 
      setSelectedLeaveId(null);
      fetchLeaves();
    } catch { 
      toast.error("Failed to approve leave"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) { toast.error("Rejection reason is required"); return; }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await api.put(
        `/api/adminauth/leaves/${selectedLeaveId}/status`,
        { status: "rejected", adminComments: rejectReason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );
      toast.success("Leave rejected successfully");
      setShowRejectModal(false); 
      setRejectReason(""); 
      setSelectedLeaveId(null);
      fetchLeaves();
    } catch { 
      toast.error("Failed to reject leave"); 
    } finally { 
      setIsProcessing(false); 
    }
  };



  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-4 font-sans">
      <div className="w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
              <h1 className="text-[25px] leading-[25px] font-extrabold text-black flex items-center" style={{ fontFamily: 'Inter' }}>
                Leave Requests
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 text-sm ml-3" style={{ fontFamily: 'Poppins' }}>
              Review and manage student leave applications
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Total Requests</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-200">
            <p className="text-emerald-600 text-sm font-medium">Approved</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-xl shadow-sm border border-rose-200">
            <p className="text-rose-600 text-sm font-medium">Rejected</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{stats.rejected}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-200">
            <p className="text-amber-600 text-sm font-medium">Pending</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{stats.pending}</p>
          </div>
        </div>

        {/* Filtering */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or reason..."
              className="pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 outline-none text-sm font-semibold text-black shadow-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select
              className="flex-1 sm:flex-none px-4 py-2 bg-white rounded-xl outline-none text-sm font-semibold text-black shadow-sm border border-gray-200"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="parent_approved">Parent Approved</option>
              <option value="parent_rejected">Parent Rejected</option>
              <option value="warden_approved">Warden Approved</option>
              <option value="warden_rejected">Warden Rejected</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <div className="relative flex-1 sm:flex-none">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 outline-none text-sm font-semibold text-black shadow-sm w-full cursor-pointer"
              />
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-white shadow-sm border border-gray-200 rounded-xl text-black hover:bg-gray-50 transition-all font-semibold text-sm flex items-center justify-center gap-2 flex-shrink-0"
            >
              Clear
            </button>
            <button
              onClick={fetchLeaves}
              className="p-2 bg-white shadow-sm border border-gray-200 rounded-xl text-black hover:bg-gray-50 transition-all flex-shrink-0"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-6 border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter' }}>
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Leave Applications
              </h2>
              <p className="text-sm text-gray-700 mt-1">Total: {filteredRequests.length} records</p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 bg-white/40">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">No leave requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Requester</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Leave Type</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Duration</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-800 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden">
                            {req.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm">{req.name.split(' (')[0]}</div>
                            <div className="text-xs text-gray-500 font-medium">ID: {req.name.includes('(') ? req.name.split('(')[1].replace(')', '') : 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-700 font-medium">
                        {req.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="font-bold text-gray-800">{req.from}</span>
                        <span className="text-gray-500 mx-2 text-xs">to</span>
                        <span className="font-bold text-gray-800">{req.to}</span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(req.status)}`}>
                          {formatStatus(req.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setSelectedLeave(req); setShowViewModal(true); }}
                            className="text-gray-500 hover:text-blue-600 transition-colors" 
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {(["pending", "parent_approved", "warden_approved", "warden_rejected"].includes(req.status?.toLowerCase())) && (
                            <>
                              <button 
                                onClick={() => { setSelectedLeaveId(req.id); setShowApproveModal(true); }}
                                className="text-gray-500 hover:text-emerald-600 transition-colors" 
                                title="Approve Leave"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => { setSelectedLeaveId(req.id); setShowRejectModal(true); }}
                                className="text-gray-500 hover:text-rose-600 transition-colors" 
                                title="Reject Leave"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Details Modal */}
        {showViewModal && selectedLeave && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#f4f6f0] rounded-2xl shadow-xl overflow-hidden w-full max-w-xl relative flex flex-col border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter', maxHeight: '90vh' }}>
              
              <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-semibold text-black">Leave Details</h2>
                  <p className="text-sm text-gray-800 mt-1 font-medium">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-white/50 border-black/10 inline-block mr-2`}>
                      {formatStatus(selectedLeave.status)}
                    </span>
                    {selectedLeave.type}
                  </p>
                </div>
                <button onClick={() => setShowViewModal(false)} className="text-black/70 hover:text-black transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Requester</p>
                  <p className="text-sm font-bold text-gray-800">{selectedLeave.name.split(' (')[0]}</p>
                  <p className="text-sm font-medium text-gray-500">Student ID: {selectedLeave.name.includes('(') ? selectedLeave.name.split('(')[1].replace(')', '') : 'N/A'}</p>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Start Date</p>
                    <p className="text-sm font-bold text-gray-800">{selectedLeave.from}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">End Date</p>
                    <p className="text-sm font-bold text-gray-800">{selectedLeave.to}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detailed Reason</p>
                    <div className="text-sm font-medium text-gray-600 bg-white px-4 py-3.5 rounded-xl border border-gray-200 shadow-sm whitespace-pre-wrap">
                      {selectedLeave.reason}
                    </div>
                  </div>
                </div>

                {selectedLeave.wardenComments && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Warden Feedback</p>
                    <div className="text-sm font-medium text-blue-800 bg-blue-50 px-4 py-3.5 rounded-xl border border-blue-200 shadow-sm whitespace-pre-wrap italic">
                      "{selectedLeave.wardenComments}"
                    </div>
                  </div>
                )}

                {selectedLeave.status?.toLowerCase() === "rejected" && selectedLeave.adminComments && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Admin Rejection Feedback</p>
                    <div className="text-sm font-medium text-red-800 bg-red-50 px-4 py-3.5 rounded-xl border border-red-200 shadow-sm whitespace-pre-wrap italic">
                      "{selectedLeave.adminComments}"
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* Reject Confirmation Modal */}
        {showRejectModal && selectedLeaveId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-2xl" style={{ fontFamily: 'Poppins' }}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Reject Leave</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Please provide a reason for rejecting this leave request. This will be visible to the student.
                </p>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-y min-h-[100px] mb-6 text-left"
                  placeholder="Enter rejection reason..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReject}
                    disabled={isProcessing || !rejectReason.trim()}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50"
                  >
                    {isProcessing ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approve Confirmation Modal */}
        {showApproveModal && selectedLeaveId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-2xl" style={{ fontFamily: 'Poppins' }}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Approve Leave</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to approve this leave request? This action will notify the student.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApprove}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                  >
                    {isProcessing ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable theme="colored"/>
    </div>
  );
}