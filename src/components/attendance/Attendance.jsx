"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineIdentification,
  HiOutlineArrowNarrowRight,
  HiOutlineArrowNarrowLeft,
  HiOutlineChartBar,
  HiOutlinePrinter,
  HiOutlineDownload,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlus,
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
  border: "rgba(90,110,58,0.1)",
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
  tab: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: "3px solid transparent",
    color: T.textMuted,
  },
  activeTab: {
    color: T.accent,
    borderBottomColor: T.accent,
  },
  input: {
    background: "#fff",
    border: `1.5px solid ${T.accent}20`,
    borderRadius: "14px",
    padding: "10px 16px",
    fontSize: "13px",
    outline: "none",
    transition: "all 0.2s ease",
  },
};

const Attendance = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        api.get("/api/adminauth/attendance/logs", { params: { date: selectedDate } }),
        api.get("/api/adminauth/attendance/stats", { params: { date: selectedDate } })
      ]);
      
      if (logsRes.data.success) setLogs(logsRes.data.logs);
      if (statsRes.data.success) setStats(statsRes.data.stats);
    } catch (error) {
      toast.error("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const student = log.studentId;
      const name = student ? `${student.firstName} ${student.lastName}` : (log.employeeCode || "Unknown");
      const room = student?.roomBedNumber?.roomNo || "";
      const searchStr = searchTerm.toLowerCase();
      return name.toLowerCase().includes(searchStr) || 
             (student?.studentId || "").toLowerCase().includes(searchStr) ||
             room.toLowerCase().includes(searchStr);
    });
  }, [logs, searchTerm]);

  return (
    <div style={css.page}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: 0 }}>Attendance Dashboard</h1>
            <p style={{ color: T.textMuted, fontSize: 14 }}>Real-time student and staff check-in/out monitoring</p>
          </div>
          
          <div className="header-actions" style={{ display: "flex", gap: 12 }}>
             <div className="date-container" style={{ position: "relative" }}>
              <HiOutlineCalendar size={18} color={T.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="date" 
                className="date-input"
                style={{ ...css.btnSecondary, paddingLeft: 40, width: 180 }} 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            <button style={css.btnSecondary} className="action-btn" onClick={() => window.print()}>
              <HiOutlinePrinter size={18} /> Print
            </button>
            <button style={css.btnPrimary} className="action-btn">
               <HiOutlineDownload size={18} /> Export
            </button>
          </div>
        </header>

        {stats && (
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
            {[
              { label: "Total Strength", value: stats.totalStudents, icon: <HiOutlineUserGroup />, color: T.blue, bg: "#EBF5FF" },
              { label: "Present Today", value: stats.presentToday, icon: <HiOutlineCheckCircle />, color: T.green, bg: "#F0FDF4" },
              { label: "Absent / Leave", value: stats.absentToday, icon: <HiOutlineXCircle />, color: T.red, bg: "#FEF2F2" },
              { label: "Check-ins Today", value: logs.filter(l => l.direction === 'IN').length, icon: <HiOutlineClock />, color: T.orange, bg: "#FFFBEB" },
            ].map((stat, i) => (
              <div key={i} style={{ ...css.glassCard, padding: "20px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "14px", background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: T.text }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={css.glassCard} className="table-card">
          <div className="tabs-container" style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 24, overflowX: "auto" }}>
            <div 
              style={{ ...css.tab, ...(activeTab === "students" ? css.activeTab : {}) }}
              onClick={() => setActiveTab("students")}
            >
              Student Attendance
            </div>
            <div 
              style={{ ...css.tab, ...(activeTab === "staff" ? css.activeTab : {}) }}
              onClick={() => setActiveTab("staff")}
            >
              Staff Attendance
            </div>
          </div>

          <div className="filter-row" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <HiOutlineSearch size={18} color={T.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                placeholder="Search by name or ID..." 
                className="search-input"
                style={{ ...css.input, paddingLeft: 40, width: "100%" }} 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button style={css.btnSecondary} className="filter-btn">
              <HiOutlineFilter size={18} /> Filters
            </button>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: T.textMuted }}>Loading attendance logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: T.textMuted }}>No logs for this date</div>
          ) : (
            <div className="table-container">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {["Name / ID", "Room/Dept", "Direction", "Time", "Device", "Method"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "16px", fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "8px", background: T.accentLight, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, overflow: "hidden" }}>
                            {log.originalLog?.selfie ? (
                              <img src={log.originalLog.selfie} alt="selfie" style={{ width: "100%", height: "100%", objectCover: "cover" }} />
                            ) : (
                              (log.studentId?.firstName?.charAt(0) || "?")
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                              {log.studentId ? `${log.studentId.firstName} ${log.studentId.lastName}` : `Employee ${log.employeeCode}`}
                            </div>
                            <div style={{ fontSize: 11, color: T.textMuted }}>{log.studentId?.studentId || log.employeeCode}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: T.text }}>
                        {log.studentId?.roomBedNumber ? (
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 800 }}>Room {log.studentId.roomBedNumber.roomNo}</span>
                            <span style={{ fontSize: "10px", color: T.textMuted }}>Bed: {log.studentId.roomBedNumber.barcodeId}</span>
                          </div>
                        ) : "N/A"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ 
                          display: "inline-flex", alignItems: "center", gap: 4, 
                          padding: "4px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 800,
                          background: log.direction === 'IN' ? "#ECFDF5" : "#FEF2F2",
                          color: log.direction === 'IN' ? "#059669" : "#DC2626"
                        }}>
                          {log.direction === 'IN' ? <HiOutlineArrowNarrowRight /> : <HiOutlineArrowNarrowLeft />}
                          {log.direction}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: T.textMuted }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <HiOutlineLocationMarker /> {log.deviceName}
                        </div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 12, fontWeight: 600 }}>
                        {log.verificationType}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
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
          .date-container, .date-input, .action-btn {
            width: 100% !important;
            justify-content: center;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .filter-row {
            flex-direction: column;
          }
          .filter-btn {
            width: 100% !important;
            justify-content: center;
          }
          .table-container {
            overflow-x: auto;
            margin: 0 -24px;
            padding: 0 24px;
          }
          .tabs-container {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>

  );
};

export default Attendance;
