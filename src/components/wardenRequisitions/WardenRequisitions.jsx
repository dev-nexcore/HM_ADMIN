"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineBriefcase,
} from "react-icons/hi";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

// ── Theme tokens (Luxury Sage & Gold Palette) ─────────────────────
const T = {
  bg: "#7A8B5E",
  bgLight: "#F8FAF5",
  accent: "#5A6E3A",
  accentDark: "#3E4B28",
  accentLight: "#E8EDDF",
  gold: "#C5A059",
  goldLight: "#F4EDE1",
  text: "#1A1F16",
  textMuted: "#6B7280",
  border: "rgba(90,110,58,0.08)",
  glass: "rgba(255, 255, 255, 0.7)",
  shadow: "rgba(40, 50, 30, 0.08)",
  green: "#10B981",
  red: "#EF4444",
  orange: "#F59E0B",
  blue: "#3B82F6",
};

const css = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F1F3EE",
    padding: "24px",
    fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
  },
  glassCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    boxShadow: `0 10px 40px ${T.shadow}`,
    padding: "24px",
  },
  btnPrimary: {
    background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
    color: "#fff",
    borderRadius: "14px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  btnSecondary: {
    background: "#fff",
    color: T.accent,
    borderRadius: "14px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: 700,
    border: `1.5px solid ${T.accent}20`,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  input: {
    background: "#FFFFFF",
    border: `1.5px solid #E5E7EB`,
    borderRadius: "14px",
    padding: "10px 16px",
    fontSize: "14px",
    color: T.text,
    outline: "none",
    width: "100%",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  }
};

const StatusBadge = ({ status }) => {
  const map = {
    pending:   { bg: "#FFFBEB", color: "#D97706", label: "Pending", icon: <HiOutlineClock /> },
    approved:  { bg: "#ECFDF5", color: "#059669", label: "Approved", icon: <HiOutlineCheckCircle /> },
    rejected:  { bg: "#FEF2F2", color: "#DC2626", label: "Rejected", icon: <HiOutlineXCircle /> },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ ...css.badge, background: s.bg, color: s.color }}>
      {s.icon} {s.label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const map = {
    student: { bg: "#EFF6FF", color: "#2563EB", label: "Student", icon: <HiOutlineUserGroup /> },
    parent:  { bg: "#F3E8FF", color: "#7C3AED", label: "Parent", icon: <HiOutlineUsers /> },
    worker:  { bg: "#FEF3C7", color: "#D97706", label: "Worker", icon: <HiOutlineBriefcase /> },
    staff:   { bg: "#DBEAFE", color: "#0284C7", label: "Staff", icon: <HiOutlineBriefcase /> },
    notice:  { bg: "#FDF2F8", color: "#DB2777", label: "Notice", icon: <HiOutlineDocumentText /> },
    inventory_replacement: { bg: "#FFF7ED", color: "#EA580C", label: "Replacement", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg> },
    complaint_resolution: { bg: "#EEF2FF", color: "#4338CA", label: "Complaint", icon: <HiOutlineDocumentText /> },
  };
  const t = map[type] || map.student;
  return (
    <span style={{ ...css.badge, background: t.bg, color: t.color, fontSize: '11px' }}>
      {t.icon} {t.label}
    </span>
  );
};

const WardenRequisitions = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedReq, setSelectedReq] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequisitions();
    fetchStats();
  }, []);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const [reqRes, compRes] = await Promise.all([
        api.get("/api/adminauth/requisitions"),
        api.get("/api/adminauth/complaints?limit=200") // Fetch more to get resolved ones too
      ]);
      
      let allItems = [];
      if (reqRes.data.success) {
        allItems = [...reqRes.data.requisitions];
      }

      if (compRes.data.complaints) {
        const relevantComplaints = compRes.data.complaints.filter(c => 
          c.status === 'pending_approval' || c.status === 'resolved'
        );
        
        const complaints = relevantComplaints.map(c => ({
          _id: c._id,
          isComplaint: true,
          requestedByName: "Hostel Warden",
          requestedBy: { wardenId: "Warden Team" },
          requisitionType: "complaint_resolution",
          status: c.status === 'pending_approval' ? 'pending' : 'approved', 
          createdAt: c.filedDate,
          approvedAt: c.updatedAt,
          approvedByName: "Admin",
          data: {
            subject: c.subject,
            description: c.description,
            complaintType: c.displayType,
            ticketId: c.ticketId,
            studentName: c.raisedBy?.name,
            studentEmail: c.raisedBy?.email,
            adminNotes: c.adminNotes,
            targetStatus: c.targetStatus
          }
        }));
        allItems = [...allItems, ...complaints];
      }

      allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequisitions(allItems);
    } catch (error) {
      toast.error("Failed to fetch requisitions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [reqRes, compRes] = await Promise.all([
        api.get("/api/adminauth/requisitions/stats"),
        api.get("/api/adminauth/complaints?limit=200")
      ]);
      
      let s = { total: 0, pending: 0, approved: 0, rejected: 0 };
      if (reqRes.data.success) {
        s = { ...reqRes.data.stats };
      }
      
      if (compRes.data.complaints) {
        const cPending = compRes.data.complaints.filter(c => c.status === 'pending_approval').length;
        const cApproved = compRes.data.complaints.filter(c => c.status === 'resolved').length;
        s.total += (cPending + cApproved);
        s.pending += cPending;
        s.approved += cApproved;
      }
      setStats(s);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      setSubmitting(true);
      
      if (selectedReq.isComplaint) {
        const targetStatus = selectedReq.data?.targetStatus || 'resolved';
        await api.put(`/api/adminauth/complaints/${id}/status`, {
          status: targetStatus,
          adminNotes: notes || `Request approved by Admin.`
        });
        toast.success(`Complaint request approved! Status changed to ${targetStatus}.`);
        setShowModal(false);
        setNotes("");
        fetchRequisitions();
        fetchStats();
        return;
      }

      const res = await api.put(`/api/adminauth/requisitions/${id}/status`, {
        status: 'approved',
        notes
      });
      if (res.data.success) {
        let successMsg = `Registration approved successfully! ID: ${res.data.entityId}`;
        
        if (selectedReq.requisitionType === 'notice') {
          successMsg = "Notice approved and issued successfully!";
        } else if (selectedReq.requisitionType === 'inventory_replacement') {
          successMsg = "Inventory replacement request approved!";
        }
          
        toast.success(successMsg);
        setShowModal(false);
        setNotes("");
        fetchRequisitions();
        fetchStats();
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to approve requisition";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (selectedReq.isComplaint) {
        const targetStatus = selectedReq.data?.targetStatus;
        let returnStatus = 'in progress'; // Default for resolution rejection
        
        if (targetStatus === 'in progress' || targetStatus === 'rejected') {
          returnStatus = 'pending';
        }

        await api.put(`/api/adminauth/complaints/${id}/status`, {
          status: returnStatus,
          adminNotes: rejectionReason
        });
        toast.success(`Resolution rejected. Complaint set to ${returnStatus}.`);
        setShowModal(false);
        setShowRejectModal(false);
        setRejectionReason("");
        setNotes("");
        fetchRequisitions();
        fetchStats();
        return;
      }

      const res = await api.put(`/api/adminauth/requisitions/${id}/status`, {
        status: 'rejected',
        rejectionReason,
        notes
      });
      if (res.data.success) {
        toast.success("Requisition rejected successfully");
        setShowModal(false);
        setShowRejectModal(false);
        setRejectionReason("");
        setNotes("");
        fetchRequisitions();
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to reject requisition");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(req => {
      const matchesSearch = 
        req.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.data?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.data?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.data?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.data?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      const matchesType = typeFilter === "all" || req.requisitionType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requisitions, searchTerm, statusFilter, typeFilter]);

  return (
    <div style={css.page}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        
        {/* Header */}
        <header className="page-header mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#1A1F16] m-0">Warden Requisitions</h1>
              <p className="text-[#6B7280] text-sm mt-1">Review and approve registration requests from wardens</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total Requests", value: stats.total, color: T.accent, bg: T.accentLight },
              { label: "Pending", value: stats.pending, color: T.orange, bg: "#FFFBEB" },
              { label: "Approved", value: stats.approved, color: T.green, bg: "#ECFDF5" },
              { label: "Rejected", value: stats.rejected, color: T.red, bg: "#FEF2F2" },
            ].map((stat, i) => (
              <div key={i} style={{ ...css.glassCard, padding: "20px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="header-actions flex flex-col md:flex-row gap-3 flex-wrap">
            <div className="search-container relative flex-1 w-full md:w-auto">
              <HiOutlineSearch size={18} color={T.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                placeholder="Search by warden or registrant name..." 
                className="search-input w-full"
                style={{ ...css.input, paddingLeft: 40 }} 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select 
                className="status-select flex-1 w-full sm:min-w-[140px]"
                style={css.input}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select 
                className="type-select flex-1 w-full sm:min-w-[140px]"
                style={css.input}
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="worker">Worker</option>
                <option value="staff">Staff</option>
                <option value="notice">Notice</option>
                <option value="inventory_replacement">Replacement</option>
                <option value="complaint_resolution">Complaint</option>
              </select>
            </div>
          </div>
        </header>

        {/* Table */}
        <div style={css.glassCard} className="table-container">
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: T.textMuted }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Loading requisitions...</div>
            </div>
          ) : filteredRequisitions.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: T.textMuted }}>
              <HiOutlineDocumentText size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <div style={{ fontSize: 16, fontWeight: 600 }}>No requisitions found</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your filters</div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto pb-4">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                    {["Warden", "Type", "Registrant", "Email", "Contact", "Status", "Submitted", "Action"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "16px", fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.map((req) => (
                    <tr key={req._id} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.2s" }} className="hover-row">
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accentLight, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                            {req.requestedByName?.charAt(0) || "W"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{req.requestedByName}</div>
                            <div style={{ fontSize: 11, color: T.textMuted }}>ID: {req.requestedBy?.wardenId || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <TypeBadge type={req.requisitionType} />
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {req.requisitionType === 'notice' ? req.data?.title : 
                           req.requisitionType === 'inventory_replacement' ? req.data?.itemName :
                           req.requisitionType === 'complaint_resolution' ? req.data?.subject :
                           `${req.data?.firstName} ${req.data?.lastName}`}
                        </div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: T.textMuted }}>
                        {req.requisitionType === 'notice' ? `To: ${req.data?.recipientType}` : 
                         req.requisitionType === 'inventory_replacement' ? `ID: ${req.data?.barcodeId}` :
                         req.requisitionType === 'complaint_resolution' ? `Student: ${req.data?.studentName}` :
                         req.data?.email}
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: T.textMuted }}>
                        {req.requisitionType === 'notice' ? (req.data?.individualRecipient || "All") : 
                         req.requisitionType === 'inventory_replacement' ? "N/A" :
                         req.requisitionType === 'complaint_resolution' ? req.data?.ticketId :
                         req.data?.contactNumber}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <StatusBadge status={req.status} />
                      </td>
                      <td style={{ padding: "16px", fontSize: 12, color: T.textMuted }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button 
                          style={{ background: "none", border: "none", cursor: "pointer", color: T.accent, padding: 8, borderRadius: 8, transition: "background 0.2s" }}
                          className="action-btn"
                          onClick={() => { 
                            setSelectedReq(req); 
                            setNotes(req.notes || ""); 
                            setRejectionReason("");
                            setShowModal(true); 
                          }}
                        >
                          <HiOutlineEye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedReq && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div className="modal-content" style={{ ...css.glassCard, width: "100%", maxWidth: 700, padding: 0, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            
            {/* Modal Header */}
            <div style={{ padding: "24px", background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Registration Request Details</h2>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                  <TypeBadge type={selectedReq.requisitionType} /> 
                  <span style={{ marginLeft: 8 }}>Submitted {new Date(selectedReq.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HiOutlineX size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              
              {/* Warden Info */}
              <div style={{ background: T.bgLight, padding: "16px", borderRadius: "12px", marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Requested By</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedReq.requestedByName}</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>Warden ID: {selectedReq.requestedBy?.wardenId || "N/A"}</div>
              </div>

              {/* Registrant Details */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", marginBottom: 12 }}>
                  {selectedReq.requisitionType === 'complaint_resolution' 
                    ? 'Complaint Details' 
                    : `${selectedReq.requisitionType.charAt(0).toUpperCase() + selectedReq.requisitionType.slice(1)} Information`}
                </div>
                <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {selectedReq.requisitionType !== 'notice' && selectedReq.requisitionType !== 'inventory_replacement' && selectedReq.requisitionType !== 'complaint_resolution' && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>First Name</label>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data?.firstName || "N/A"}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Last Name</label>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data?.lastName || "N/A"}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Email</label>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data?.email || "N/A"}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Contact Number</label>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data?.contactNumber || "N/A"}</div>
                      </div>
                    </>
                  )}

                  {/* Student/Worker specific fields */}
                  {(selectedReq.requisitionType === 'student' || selectedReq.requisitionType === 'worker') && (
                    <>
                      {selectedReq.data?.roomNumber && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Room Number</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data.roomNumber}</div>
                        </div>
                      )}
                      {selectedReq.data?.bedNumber && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Bed Number</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data.bedNumber}</div>
                        </div>
                      )}
                      {selectedReq.data?.emergencyContact && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Emergency Contact</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data.emergencyContact}</div>
                        </div>
                      )}
                      {selectedReq.data?.emergencyContactName && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Emergency Contact Name</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data.emergencyContactName}</div>
                        </div>
                      )}
                      {selectedReq.data?.admissionDate && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Admission Date</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{new Date(selectedReq.data.admissionDate).toLocaleDateString()}</div>
                        </div>
                      )}
                      {selectedReq.data?.feeStatus && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Fee Status</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data.feeStatus}</div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Notice specific fields */}
                  {selectedReq.requisitionType === 'notice' && (
                    <>
                      {selectedReq.data?.template && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Template</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data.template}</div>
                        </div>
                      )}
                      {selectedReq.data?.recipientType && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Recipient Type</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data.recipientType}</div>
                        </div>
                      )}
                      {selectedReq.data?.individualRecipient && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Recipient ID</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data.individualRecipient}</div>
                        </div>
                      )}
                      {selectedReq.data?.issueDate && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Issue Date</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{new Date(selectedReq.data.issueDate).toLocaleDateString()}</div>
                        </div>
                      )}
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Message</label>
                        <div style={{ fontWeight: 600, fontSize: 14, background: T.bgLight, padding: 12, borderRadius: 8 }}>{selectedReq.data.message}</div>
                      </div>
                    </>
                  )}

                  {/* Parent specific fields */}
                  {selectedReq.requisitionType === 'parent' && (
                    <>
                      {selectedReq.data?.relation && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Relation</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data.relation}</div>
                        </div>
                      )}
                      {selectedReq.data?.studentId && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Student ID</label>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data.studentId}</div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Inventory Replacement specific fields */}
                  {selectedReq.requisitionType === 'inventory_replacement' && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Item Name</label>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data?.itemName}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Barcode ID</label>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data?.barcodeId}</div>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Replacement Reason</label>
                        <div style={{ fontWeight: 600, fontSize: 14, background: T.bgLight, padding: 12, borderRadius: 8 }}>{selectedReq.data?.reason}</div>
                      </div>
                    </>
                  )}

                  {/* Complaint Resolution specific fields */}
                  {selectedReq.requisitionType === 'complaint_resolution' && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Ticket ID</label>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data?.ticketId}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Requested Action</label>
                        <div style={{ 
                          fontWeight: 800, 
                          fontSize: 12, 
                          color: selectedReq.data?.targetStatus === 'in progress' ? T.blue : 
                                 selectedReq.data?.targetStatus === 'resolved' ? T.green : 
                                 selectedReq.data?.targetStatus === 'rejected' ? T.red : T.text,
                          textTransform: 'uppercase'
                        }}>
                          {selectedReq.data?.targetStatus === 'in progress' ? 'Start Processing' : 
                           selectedReq.data?.targetStatus === 'resolved' ? 'Mark as Resolved' : 
                           selectedReq.data?.targetStatus === 'rejected' ? 'Reject Complaint' : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Student</label>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data?.studentName} ({selectedReq.data?.studentEmail})</div>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Subject</label>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedReq.data?.subject}</div>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>Description</label>
                        <div style={{ fontWeight: 600, fontSize: 14, background: T.bgLight, padding: 12, borderRadius: 8 }}>{selectedReq.data?.description}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Documents */}
              {(selectedReq.documents?.aadharCard || selectedReq.documents?.panCard || selectedReq.documents?.photo) && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", marginBottom: 12 }}>Documents / Evidence</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {selectedReq.documents.aadharCard && (
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5224"}/${selectedReq.documents.aadharCard.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...css.btnSecondary, textDecoration: "none", fontSize: 12 }}
                      >
                        <HiOutlineDocumentText /> View Aadhar Card
                      </a>
                    )}
                    {selectedReq.documents.panCard && (
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5224"}/${selectedReq.documents.panCard.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...css.btnSecondary, textDecoration: "none", fontSize: 12 }}
                      >
                        <HiOutlineDocumentText /> View PAN Card
                      </a>
                    )}
                    {selectedReq.documents.photo && (
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5224"}/uploads/wardens/${selectedReq.documents.photo.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...css.btnSecondary, textDecoration: "none", fontSize: 12, borderColor: T.orange, color: T.orange }}
                      >
                        <HiOutlineEye /> View Item Photo
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Status Info */}
              {selectedReq.status !== 'pending' && (
                <div style={{ background: selectedReq.status === 'approved' ? "#ECFDF5" : "#FEF2F2", padding: "16px", borderRadius: "12px", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
                    {selectedReq.status === 'approved' ? 'Approval Details' : 'Rejection Details'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {selectedReq.status === 'approved' ? `Approved by ${selectedReq.approvedByName}` : `Rejected by ${selectedReq.rejectedByName}`}
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>
                    {selectedReq.status === 'approved' 
                      ? new Date(selectedReq.approvedAt).toLocaleString()
                      : new Date(selectedReq.rejectedAt).toLocaleString()
                    }
                  </div>
                  {selectedReq.rejectionReason && (
                    <div style={{ fontSize: 13, marginTop: 8, padding: "12px", background: "rgba(255,255,255,0.7)", borderRadius: "8px" }}>
                      <strong>Reason:</strong> {selectedReq.rejectionReason}
                    </div>
                  )}
                  {selectedReq.notes && (
                    <div style={{ fontSize: 13, marginTop: 8, padding: "12px", background: "rgba(255,255,255,0.7)", borderRadius: "8px" }}>
                      <strong>Notes:</strong> {selectedReq.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Actions for Pending */}
              {selectedReq.status === 'pending' && (
                <div style={{ background: T.bgLight, padding: "20px", borderRadius: "16px" }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Admin Notes (Optional)</label>
                  <textarea 
                    style={{ ...css.input, minHeight: 80, resize: "vertical", marginBottom: 16 }}
                    placeholder="Add internal notes about this requisition..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 12 }}>
                    <button 
                      disabled={submitting}
                      style={{ ...css.btnSecondary, flex: 1, justifyContent: "center", opacity: submitting ? 0.6 : 1 }}
                      onClick={() => setShowRejectModal(true)}
                    >
                      <HiOutlineXCircle /> Reject
                    </button>
                    <button 
                      disabled={submitting}
                      style={{ ...css.btnPrimary, background: T.green, flex: 1, justifyContent: "center", opacity: submitting ? 0.6 : 1 }}
                      onClick={() => handleApprove(selectedReq._id)}
                    >
                      <HiOutlineCheckCircle /> {submitting ? "Processing..." : "Approve & Register"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReq && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001, padding: 20 }}>
          <div style={{ ...css.glassCard, width: "100%", maxWidth: 500, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px", background: T.red, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Reject Requisition</h3>
              <button onClick={() => setShowRejectModal(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HiOutlineX size={18} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: 14, color: T.textMuted, marginBottom: 16 }}>
                Please provide a reason for rejecting this registration request. This will be visible to the warden.
              </p>
              <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Rejection Reason *</label>
              <textarea 
                style={{ ...css.input, minHeight: 100, resize: "vertical", marginBottom: 20 }}
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                autoFocus
              />
              <div style={{ display: "flex", gap: 12 }}>
                <button 
                  style={{ ...css.btnSecondary, flex: 1, justifyContent: "center" }}
                  onClick={() => setShowRejectModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  disabled={submitting || !rejectionReason.trim()}
                  style={{ ...css.btnPrimary, background: T.red, flex: 1, justifyContent: "center", opacity: (submitting || !rejectionReason.trim()) ? 0.6 : 1 }}
                  onClick={() => handleReject(selectedReq._id)}
                >
                  {submitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-row:hover {
          background-color: ${T.bgLight};
        }
        .action-btn:hover {
          background-color: ${T.accentLight} !important;
        }
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 16px;
          }
          .header-actions {
            width: 100%;
            flex-direction: column;
          }
          .search-container {
            width: 100% !important;
          }
          .search-input {
            width: 100% !important;
          }
          .status-select, .type-select {
            width: 100% !important;
          }
          .table-container {
            overflow-x: auto;
            margin: 0 -24px;
            padding: 0 24px;
          }
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
          .modal-content {
            width: 95% !important;
            margin: 10px !important;
          }
        }
      `}</style>

    </div>
  );
};

export default WardenRequisitions;
