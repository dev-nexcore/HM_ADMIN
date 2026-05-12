"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineInformationCircle,
  HiOutlineClipboardList,
  HiOutlineCurrencyRupee,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineX,
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
    completed: { bg: "#EFF6FF", color: "#2563EB", label: "Completed", icon: <HiOutlineCheckCircle /> },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ ...css.badge, background: s.bg, color: s.color }}>
      {s.icon} {s.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const map = {
    low:    { bg: "#F3F4F6", color: "#6B7280", label: "Low" },
    medium: { bg: "#DBEAFE", color: "#1D4ED8", label: "Medium" },
    high:   { bg: "#FFEDD5", color: "#D97706", label: "High" },
    urgent: { bg: "#FEE2E2", color: "#DC2626", label: "Urgent" },
  };
  const p = map[priority] || map.medium;
  return (
    <span style={{ ...css.badge, background: p.bg, color: p.color, fontSize: '10px' }}>
      {p.label}
    </span>
  );
};

const WardenRequisitions = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReq, setSelectedReq] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/adminauth/requisitions");
      if (res.data.success) {
        setRequisitions(res.data.requisitions);
      }
    } catch (error) {
      toast.error("Failed to fetch requisitions");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setSubmitting(true);
      const res = await api.put(`/api/adminauth/requisitions/${id}/status`, {
        status,
        adminRemarks
      });
      if (res.data.success) {
        toast.success(`Requisition ${status} successfully`);
        setShowModal(false);
        fetchRequisitions();
      }
    } catch (error) {
      toast.error("Failed to update requisition");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(req => {
      const matchesSearch = req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.wardenId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.wardenId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requisitions, searchTerm, statusFilter]);

  return (
    <div style={css.page}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: 0 }}>Warden Requisitions</h1>
            <p style={{ color: T.textMuted, fontSize: 14 }}>Approve or manage resource requests from hostel wardens</p>
          </div>
          
          <div className="header-actions" style={{ display: "flex", gap: 12 }}>
            <div className="search-container" style={{ position: "relative" }}>
              <HiOutlineSearch size={18} color={T.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                placeholder="Search requests..." 
                className="search-input"
                style={{ ...css.input, paddingLeft: 40, width: 260 }} 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="status-select"
              style={{ ...css.input, width: 160 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </header>

        <div style={css.glassCard} className="table-container">

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: T.textMuted }}>Loading requisitions...</div>
          ) : filteredRequisitions.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: T.textMuted }}>No requisitions found</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["Warden", "Title", "Amount", "Priority", "Status", "Date", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "16px", fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.map((req) => (
                  <tr key={req._id} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.2s" }} className="hover-row">
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accentLight, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>
                          {req.wardenId?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{req.wardenId?.firstName} {req.wardenId?.lastName}</div>
                          <div style={{ fontSize: 11, color: T.textMuted }}>ID: {req.wardenId?.wardenId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{req.title}</div>
                    </td>
                    <td style={{ padding: "16px", fontWeight: 800, color: T.text }}>
                      ₹{req.totalAmount?.toLocaleString()}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td style={{ padding: "16px" }}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ padding: "16px", fontSize: 12, color: T.textMuted }}>
                      {new Date(req.requestedDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <button 
                        style={{ background: "none", border: "none", cursor: "pointer", color: T.accent }}
                        onClick={() => { setSelectedReq(req); setAdminRemarks(req.adminRemarks || ""); setShowModal(true); }}
                      >
                        <HiOutlineEye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedReq && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="modal-content" style={{ ...css.glassCard, width: "100%", maxWidth: 600, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "24px", background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Requisition Details</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <HiOutlineX size={24} />
              </button>
            </div>
            
            <div style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
              <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Warden</label>
                  <div style={{ fontWeight: 700 }}>{selectedReq.wardenId?.firstName} {selectedReq.wardenId?.lastName}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Date Requested</label>
                  <div style={{ fontWeight: 700 }}>{new Date(selectedReq.requestedDate).toLocaleString()}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Priority</label>
                  <PriorityBadge priority={selectedReq.priority} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Status</label>
                  <StatusBadge status={selectedReq.status} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Description</label>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>{selectedReq.description || "No description provided"}</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Requested Items</label>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: "12px", overflow: "hidden" }}>
                  <table style={{ width: "100%", fontSize: 13 }}>
                    <thead style={{ background: T.bgLight }}>
                      <tr>
                        <th style={{ padding: "10px", textAlign: "left" }}>Item</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>Qty</th>
                        <th style={{ padding: "10px", textAlign: "right" }}>Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReq.items?.map((item, i) => (
                        <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                          <td style={{ padding: "10px" }}>{item.itemName}</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>{item.quantity} {item.unit}</td>
                          <td style={{ padding: "10px", textAlign: "right", fontWeight: 700 }}>₹{item.estimatedCost?.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr style={{ background: T.bgLight, fontWeight: 800 }}>
                        <td colSpan="2" style={{ padding: "12px" }}>Total Estimated Amount</td>
                        <td style={{ padding: "12px", textAlign: "right", color: T.accent }}>₹{selectedReq.totalAmount?.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedReq.status === 'pending' ? (
                <div style={{ background: T.bgLight, padding: "20px", borderRadius: "16px" }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Admin Remarks</label>
                  <textarea 
                    style={{ ...css.input, minHeight: 80, resize: "none", marginBottom: 16 }}
                    placeholder="Add notes for the warden..."
                    value={adminRemarks}
                    onChange={e => setAdminRemarks(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 12 }}>
                    <button 
                      disabled={submitting}
                      style={{ ...css.btnPrimary, background: T.red, flex: 1, justifyContent: "center" }}
                      onClick={() => handleUpdateStatus(selectedReq._id, 'rejected')}
                    >
                      Reject Request
                    </button>
                    <button 
                      disabled={submitting}
                      style={{ ...css.btnPrimary, background: T.green, flex: 1, justifyContent: "center" }}
                      onClick={() => handleUpdateStatus(selectedReq._id, 'approved')}
                    >
                      Approve Request
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: T.bgLight, padding: "16px", borderRadius: "16px" }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Admin Remarks</label>
                  <div style={{ fontSize: 14, fontStyle: "italic" }}>{selectedReq.adminRemarks || "No remarks added"}</div>
                  {selectedReq.status === 'approved' && (
                     <button 
                      disabled={submitting}
                      style={{ ...css.btnPrimary, marginTop: 16, width: "100%", justifyContent: "center" }}
                      onClick={() => handleUpdateStatus(selectedReq._id, 'completed')}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-row:hover {
          background-color: ${T.bgLight};
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
          .status-select {
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
