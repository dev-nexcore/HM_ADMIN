"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import {
  Search,
  Filter,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeft,
  Printer,
  Download,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDirection, setFilterDirection] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUserLogs, setSelectedUserLogs] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const socketURL = process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5000";
    const socket = io(`${socketURL}/admin`);

    socket.on('connect', () => {
      console.log('Connected to real-time attendance feed');
    });

    socket.on('NEW_ATTENDANCE', (data) => {
      toast.success(`${data.count} new attendance log(s) received`);
      setRefetchTrigger(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, refetchTrigger]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        api.get("/api/adminauth/attendance/logs", { params: { date: selectedDate } }),
        api.get("/api/adminauth/attendance/stats", { params: { date: selectedDate } })
      ]);
      
      if (logsRes.data.success) {
        const uniqueLogs = [];
        const seenLogs = new Set();
        logsRes.data.logs.forEach(l => {
           const id = l.studentId?.studentId || l.staffId?.staffId || l.employeeCode || 'Unknown';
           const timeStr = new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
           const key = `${id}-${timeStr}-${l.direction}`;
           if (!seenLogs.has(key)) {
             seenLogs.add(key);
             uniqueLogs.push(l);
           }
        });
        setLogs(uniqueLogs);
      }
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
      const staff = log.staffId;
      
      let category = "unknown";
      if (student) {
         category = student.isWorking ? "workers" : "students";
      } else if (staff) {
         category = "staff";
      } else {
         const code = log.employeeCode || "";
         if (code.startsWith("STUW")) category = "workers";
         else if (code.startsWith("EMP") || code.startsWith("STAFF")) category = "staff";
         else if (code.startsWith("STU")) category = "students";
         else category = "staff"; 
      }
      
      if (activeTab !== category) return false;

      if (filterDirection !== "ALL" && log.direction !== filterDirection) return false;

      const name = student ? `${student.firstName} ${student.lastName}` : (staff ? `${staff.firstName} ${staff.lastName}` : (log.employeeCode || "Unknown"));
      const room = student?.roomBedNumber?.roomNo || staff?.designation || "";
      const searchStr = searchTerm.toLowerCase();
      return name.toLowerCase().includes(searchStr) || 
             (student?.studentId || staff?.staffId || "").toLowerCase().includes(searchStr) ||
             room.toLowerCase().includes(searchStr);
    });
  }, [logs, searchTerm, activeTab, filterDirection]);

  const groupedFilteredLogs = useMemo(() => {
    const groups = {};
    filteredLogs.forEach(log => {
      const id = log.studentId?.studentId || log.staffId?.staffId || log.employeeCode || `Unknown-${Math.random()}`;
      if (!groups[id]) {
        groups[id] = [];
      }
      groups[id].push(log);
    });
    
    const uniqueLogs = Object.values(groups).map(group => {
      group.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return group[0];
    });
    return uniqueLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [filteredLogs]);

  const handleExport = () => {
    if (groupedFilteredLogs.length === 0) {
      toast.error('No records to export');
      return;
    }
    const headers = ['Name', 'ID', 'Category', 'Room/Designation', 'Direction', 'Date', 'Time', 'Device', 'Method'];
    const csvContent = [
      headers.join(','),
      ...groupedFilteredLogs.map(log => {
        const student = log.studentId;
        const staff = log.staffId;
        const warden = log.wardenId;
        const name = student ? `${student.firstName} ${student.lastName}` : (staff ? `${staff.firstName} ${staff.lastName}` : (warden ? `${warden.firstName} ${warden.lastName}` : (log.employeeCode || "Unknown")));
        const id = student?.studentId || staff?.staffId || warden?.wardenId || log.employeeCode || '';
        const room = activeTab === "staff" ? (staff?.designation || (warden ? "Warden" : "Staff")) : (student?.roomBedNumber?.roomNo || "-");
        const date = new Date(log.timestamp).toLocaleDateString('en-IN');
        const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `"${name}","${id}","${activeTab}","${room}","${log.direction}","${date}","${time}","${log.deviceName}","${log.verificationType}"`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-4 font-sans">
      <div className="w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7">
          <div className="flex flex-col mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
              <h1 className="text-[25px] leading-[25px] font-extrabold text-black flex items-center" style={{ fontFamily: 'Inter' }}>
                Attendance Dashboard
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 text-sm ml-3" style={{ fontFamily: 'Poppins' }}>
              Real-time student and staff check-in/out monitoring
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input 
                type="date" 
                className="pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 outline-none text-sm font-semibold text-black shadow-sm cursor-pointer w-full"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
              />
            </div>
            <button 
              className="px-4 py-2 bg-white shadow-sm border border-gray-200 rounded-xl text-black hover:bg-gray-50 transition-all font-semibold text-sm flex items-center justify-center gap-2 flex-1 md:flex-none" 
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-[#4F8CCF] shadow-sm rounded-xl text-white hover:bg-[#3A6FA6] transition-all font-semibold text-sm flex items-center justify-center gap-2 flex-1 md:flex-none"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
              <div className="flex items-center gap-3 mb-1">
                <Users className="text-blue-600" size={20} />
                <p className="text-blue-600 text-sm font-bold uppercase tracking-wider">Total Strength</p>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {activeTab === "students" ? stats.studentStats?.totalStudents : (activeTab === "workers" ? stats.workerStats?.totalWorkers : stats.staffStats?.totalStaff) || 0}
              </p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-200">
              <div className="flex items-center gap-3 mb-1">
                <CheckCircle className="text-emerald-600" size={20} />
                <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Present Today</p>
              </div>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {activeTab === "students" ? stats.studentStats?.presentToday : (activeTab === "workers" ? stats.workerStats?.presentToday : stats.staffStats?.presentToday) || 0}
              </p>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl shadow-sm border border-rose-200">
              <div className="flex items-center gap-3 mb-1">
                <XCircle className="text-rose-600" size={20} />
                <p className="text-rose-600 text-sm font-bold uppercase tracking-wider">Absent / Leave</p>
              </div>
              <p className="text-2xl font-bold text-rose-700 mt-1">
                {activeTab === "students" ? stats.studentStats?.absentToday : (activeTab === "workers" ? stats.workerStats?.absentToday : stats.staffStats?.absentToday) || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-200">
              <div className="flex items-center gap-3 mb-1">
                <Clock className="text-purple-600" size={20} />
                <p className="text-purple-600 text-sm font-bold uppercase tracking-wider">Check-ins</p>
              </div>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {filteredLogs.filter(l => l.direction === 'IN').length}
              </p>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-6 border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter' }}>
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Attendance Logs
              </h2>
              <p className="text-sm text-gray-700 mt-1">Total: {groupedFilteredLogs.length} records</p>
            </div>
          </div>

          <div className="bg-white border-b border-gray-200 px-4 flex overflow-x-auto hide-scrollbar">
            <button 
              className={`px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap outline-none transition-colors ${activeTab === 'students' ? 'border-[#4F8CCF] text-[#4F8CCF]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('students')}
            >Student Attendance</button>
            <button 
              className={`px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap outline-none transition-colors ${activeTab === 'workers' ? 'border-[#4F8CCF] text-[#4F8CCF]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('workers')}
            >Worker Attendance</button>
            <button 
              className={`px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap outline-none transition-colors ${activeTab === 'staff' ? 'border-[#4F8CCF] text-[#4F8CCF]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('staff')}
            >Staff Attendance</button>
          </div>
          
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="Search by name or ID..."
                className="pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 outline-none text-sm font-semibold text-black shadow-sm w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="w-full sm:w-auto px-4 py-2 bg-white rounded-xl border border-gray-200 outline-none text-sm font-semibold text-black shadow-sm flex-1 sm:flex-none"
                value={filterDirection}
                onChange={e => setFilterDirection(e.target.value)}
              >
                <option value="ALL">All Directions</option>
                <option value="IN">Check In (IN)</option>
                <option value="OUT">Check Out (OUT)</option>
              </select>
              <button
                onClick={fetchAttendance}
                className="p-2 bg-white shadow-sm border border-gray-200 rounded-xl text-black hover:bg-gray-50 transition-all flex-shrink-0"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : groupedFilteredLogs.length === 0 ? (
            <div className="text-center py-16 bg-white/40">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">No logs for this date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Name / ID</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">{activeTab === "staff" ? "Designation" : "Room"}</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Direction</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Time</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Device</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Method</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedFilteredLogs.map((log, i) => (
                    <tr key={i} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-800 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#4F8CCF]/10 text-[#4F8CCF] flex items-center justify-center font-bold text-sm overflow-hidden border border-[#4F8CCF]/20">
                            {log.originalLog?.selfie ? (
                              <img src={log.originalLog.selfie} alt="selfie" className="w-full h-full object-cover" />
                            ) : (
                              (log.studentId?.firstName?.charAt(0) || log.staffId?.firstName?.charAt(0) || log.wardenId?.firstName?.charAt(0) || "?")
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm">
                              {log.studentId ? `${log.studentId.firstName} ${log.studentId.lastName}` : (log.staffId ? `${log.staffId.firstName} ${log.staffId.lastName}` : (log.wardenId ? `${log.wardenId.firstName} ${log.wardenId.lastName}` : (log.employeeCode || "Unknown")))}
                            </div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">
                              ID: {log.studentId?.studentId || log.staffId?.staffId || log.wardenId?.wardenId || log.employeeCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                          {activeTab === "staff" ? (log.staffId?.designation || (log.wardenId ? "Warden" : "Staff")) : (log.studentId?.roomBedNumber?.roomNo || "-")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${log.direction === 'IN' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                          {log.direction === 'IN' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                          {log.direction}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-sm text-gray-800">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <MapPin size={16} className="text-gray-400" /> {log.deviceName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-600 whitespace-nowrap uppercase tracking-wide">
                        {log.verificationType}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {(() => {
                           const id = log.studentId?.studentId || log.staffId?.staffId || log.wardenId?.wardenId || log.employeeCode;
                           if (!id) return null;
                           const userLogs = logs.filter(l => (l.studentId?.studentId || l.staffId?.staffId || l.wardenId?.wardenId || l.employeeCode) === id);
                           if (userLogs.length > 1) {
                             return (
                               <button 
                                 onClick={() => {
                                   const sorted = [...userLogs].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
                                   setSelectedUserLogs(sorted);
                                   setShowModal(true);
                                 }}
                                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#4F8CCF] bg-[#4F8CCF]/10 border border-[#4F8CCF]/20 rounded-lg hover:bg-[#4F8CCF]/20 transition-colors"
                               >
                                 View All <span className="bg-[#4F8CCF] text-white px-1.5 py-0.5 rounded text-[10px]">{userLogs.length}</span>
                               </button>
                             );
                           }
                           return null;
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedUserLogs && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-[#f4f6f0] rounded-2xl shadow-xl overflow-hidden w-full max-w-xl relative flex flex-col border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter', maxHeight: '90vh' }}>
            
            <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-black">Check-in History</h2>
                <p className="text-sm text-gray-800 mt-1 font-medium">
                  {selectedUserLogs[0].studentId ? `${selectedUserLogs[0].studentId.firstName} ${selectedUserLogs[0].studentId.lastName}` : 
                  (selectedUserLogs[0].staffId ? `${selectedUserLogs[0].staffId.firstName} ${selectedUserLogs[0].staffId.lastName}` : 
                  (selectedUserLogs[0].employeeCode || "Unknown"))}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-black/70 hover:text-black transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex flex-col gap-3">
                {selectedUserLogs.map((l, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-4 rounded-xl border ${l.direction === 'IN' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${l.direction === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {l.direction === 'IN' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-[15px]">
                          {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                          <MapPin size={14} /> {l.deviceName}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide bg-white/60 px-3 py-1.5 rounded-lg border border-gray-200">
                      {l.verificationType}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Attendance;
