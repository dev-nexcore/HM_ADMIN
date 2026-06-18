"use client";

import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { toast } from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";

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
  input: {
    background: "#fff",
    border: `1.5px solid ${T.accent}20`,
    borderRadius: "14px",
    padding: "10px 16px",
    fontSize: "13px",
    outline: "none",
    transition: "all 0.2s ease",
    width: "100%"
  },
};

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: "", title: "", type: "Other" });

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      // Fetch holidays for the current month and year
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const res = await api.get(`/api/adminauth/holidays`, {
        params: { month, year }
      });
      
      if (res.data.success) {
        setHolidays(res.data.holidays);
      }
    } catch (err) {
      toast.error("Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday.date || !newHoliday.title) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      const res = await api.post(`/api/adminauth/holidays`, newHoliday);
      if (res.data.success) {
        toast.success("Holiday added successfully");
        setShowAddModal(false);
        setNewHoliday({ date: "", title: "", type: "Other" });
        fetchHolidays();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add holiday");
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;
    try {
      const res = await api.delete(`/api/adminauth/holidays/${id}`);
      if (res.data.success) {
        toast.success("Holiday deleted");
        fetchHolidays();
      }
    } catch (err) {
      toast.error("Failed to delete holiday");
    }
  };

  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 rounded-xl border border-transparent"></div>);
    }

    // Days in month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      // Ensure local timezone doesn't mess up exact date match, matching YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const dayHolidays = holidays.filter(h => {
        const hDate = new Date(h.date);
        return hDate.getFullYear() === year && 
               hDate.getMonth() === month && 
               hDate.getDate() === d;
      });

      const isToday = new Date().toDateString() === dateObj.toDateString();

      days.push(
        <div key={d} className={`h-24 p-2 rounded-xl border ${isToday ? 'border-[#5A6E3A] bg-[#F8FAF5]' : 'border-gray-100 bg-white'} relative group hover:border-[#5A6E3A] transition-all`}>
          <span className={`font-bold ${isToday ? 'text-[#5A6E3A]' : 'text-gray-700'}`}>{d}</span>
          
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px]">
            {dayHolidays.map(h => (
              <div key={h._id} className="text-[10px] bg-[#E8EDDF] text-[#3E4B28] px-2 py-1 rounded truncate flex justify-between items-center group/item">
                <span title={h.title}>{h.title}</span>
                <button 
                  onClick={() => handleDeleteHoliday(h._id)}
                  className="opacity-0 group-hover/item:opacity-100 text-red-500 ml-1 shrink-0"
                >
                  <HiOutlineTrash size={12}/>
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              setNewHoliday(prev => ({ ...prev, date: dateStr }));
              setShowAddModal(true);
            }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[#5A6E3A] hover:bg-[#E8EDDF] p-1 rounded transition-all"
            title="Add Holiday"
          >
            <HiOutlinePlus size={14}/>
          </button>
        </div>
      );
    }

    return days;
  };

  return (
    <div style={css.page}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: 0 }}>Holiday Calendar</h1>
            <p style={{ color: T.textMuted, fontSize: 14 }}>Manage public holidays and off-days for staff salary calculation.</p>
          </div>
          
          <button onClick={() => setShowAddModal(true)} style={css.btnPrimary}>
            <HiOutlinePlus size={18} /> Add Holiday
          </button>
        </header>

        <div style={css.glassCard}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1A1F16]">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all">
                <HiOutlineChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-sm transition-all">
                Today
              </button>
              <button onClick={handleNextMonth} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all">
                <HiOutlineChevronRight size={20} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">Loading calendar...</div>
          ) : (
            <div>
              <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-black text-gray-400 uppercase tracking-widest">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-4">
                {renderCalendarGrid()}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Holiday</h3>
            <form onSubmit={handleAddHoliday} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                <input 
                  type="date" 
                  style={css.input}
                  value={newHoliday.date}
                  onChange={e => setNewHoliday({...newHoliday, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Holiday Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Diwali, Independence Day"
                  style={css.input}
                  value={newHoliday.title}
                  onChange={e => setNewHoliday({...newHoliday, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                <select 
                  style={css.input}
                  value={newHoliday.type}
                  onChange={e => setNewHoliday({...newHoliday, type: e.target.value})}
                >
                  <option value="National">National</option>
                  <option value="Festival">Festival</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#5A6E3A] text-white font-bold hover:bg-[#3E4B28] shadow-lg shadow-[#5A6E3A]/20">
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
