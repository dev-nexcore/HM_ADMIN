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
      days.push(<div key={`empty-${i}`} className="min-h-[80px] md:h-24 rounded-xl border border-transparent"></div>);
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
        <div key={d} className={`min-h-[80px] md:h-24 p-1 md:p-2 rounded-xl border ${isToday ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200 bg-white'} relative group hover:border-blue-400 transition-all`}>
          <span className={`font-bold text-xs md:text-sm ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{d}</span>
          
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px]">
            {dayHolidays.map(h => (
              <div key={h._id} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded truncate flex justify-between items-center group/item font-bold">
                <span title={h.title}>{h.title}</span>
                <button 
                  onClick={() => handleDeleteHoliday(h._id)}
                  className="opacity-0 group-hover/item:opacity-100 text-red-500 ml-1 shrink-0 hover:text-red-700 transition-colors"
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
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-blue-500 hover:bg-blue-100 p-1 rounded transition-all"
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
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-4 font-sans">
      <div className="w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
              <h1 className="text-[25px] leading-[25px] font-extrabold text-black flex items-center" style={{ fontFamily: "Inter" }}>
                Holiday Calendar
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 text-sm ml-3" style={{ fontFamily: "Poppins" }}>Manage public holidays and off-days for staff salary calculation.</p>
          </div>
          
          <button onClick={() => setShowAddModal(true)} className="mt-4 sm:mt-0 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-md hover:bg-gray-800 transition-colors flex items-center gap-2">
            <HiOutlinePlus size={18} /> Add Holiday
          </button>
        </div>

        <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-6 border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter' }}>
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-xl font-bold text-black mb-4 sm:mb-0">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 bg-white/30 rounded-xl hover:bg-white/50 text-black transition-colors shadow-sm">
                <HiOutlineChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white/30 rounded-xl hover:bg-white/50 text-black font-semibold text-sm transition-colors shadow-sm">
                Today
              </button>
              <button onClick={handleNextMonth} className="p-2 bg-white/30 rounded-xl hover:bg-white/50 text-black transition-colors shadow-sm">
                <HiOutlineChevronRight size={20} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center font-bold text-gray-400 uppercase tracking-widest text-sm">Loading calendar...</div>
          ) : (
            <div className="w-full overflow-x-auto pb-4 p-4 md:p-6">
              <div className="min-w-full md:min-w-[700px]">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4 mb-2 md:mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest truncate">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4">
                  {renderCalendarGrid()}
                </div>
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
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] focus:ring-1 focus:ring-[#4F8CCF] text-sm"
                  value={newHoliday.date}
                  onChange={e => setNewHoliday({...newHoliday, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Holiday Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Diwali, Independence Day"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] focus:ring-1 focus:ring-[#4F8CCF] text-sm"
                  value={newHoliday.title}
                  onChange={e => setNewHoliday({...newHoliday, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Type</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] focus:ring-1 focus:ring-[#4F8CCF] text-sm"
                  value={newHoliday.type}
                  onChange={e => setNewHoliday({...newHoliday, type: e.target.value})}
                >
                  <option value="National">National</option>
                  <option value="Festival">Festival</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors shadow-md">
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
