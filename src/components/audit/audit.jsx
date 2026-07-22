"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Loader2, 
  Eye, 
  Calendar, 
  User, 
  Activity,
  Clock,
  TrendingUp,
  FileText,
  RefreshCw,
  X,
  XCircle
} from "lucide-react";
import api from "@/lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AuditLogsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [filters, setFilters] = useState({
    actionTypes: [],
    admins: [],
    targetTypes: []
  });
  const [activeFilters, setActiveFilters] = useState({
    actionType: 'all',
    adminId: 'all',
    targetType: 'all',
    startDate: '',
    endDate: ''
  });
  const [statistics, setStatistics] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeCard, setActiveCard] = useState("total");

  // Fetch audit logs
  const fetchAuditLogs = async (page = 1, search = '', filtersObj = activeFilters) => {
    try {
      setLoading(true);
      const limit = 20;
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(filtersObj.actionType !== 'all' && { actionType: filtersObj.actionType }),
        ...(filtersObj.adminId !== 'all' && { adminId: filtersObj.adminId }),
        ...(filtersObj.targetType !== 'all' && { targetType: filtersObj.targetType }),
        ...(filtersObj.startDate && { startDate: filtersObj.startDate }),
        ...(filtersObj.endDate && { endDate: filtersObj.endDate })
      };

      const response = await api.get(`/api/adminauth/audit-logs`, { params });
      
      if (response.data) {
        setLogs(response.data.logs || []);
        setPagination(response.data.pagination || {});
        setFilters(response.data.filters || { actionTypes: [], admins: [], targetTypes: [] });
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to fetch audit logs. Please try again.');
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await api.get(`/api/adminauth/audit-logs/statistics`);
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {
        ...(searchTerm && { search: searchTerm }),
        ...(activeFilters.actionType !== 'all' && { actionType: activeFilters.actionType }),
        ...(activeFilters.adminId !== 'all' && { adminId: activeFilters.adminId }),
        ...(activeFilters.targetType !== 'all' && { targetType: activeFilters.targetType }),
        ...(activeFilters.startDate && { startDate: activeFilters.startDate }),
        ...(activeFilters.endDate && { endDate: activeFilters.endDate })
      };

      const response = await api.get(`/api/adminauth/audit-logs/export/csv`, {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Audit logs exported successfully');
    } catch (err) {
      console.error('Error exporting logs:', err);
      toast.error('Failed to export logs. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchAuditLogs(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchAuditLogs(pagination.currentPage, searchTerm, activeFilters);
      fetchStatistics();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, pagination.currentPage, searchTerm, activeFilters]);

  // Initial load
  useEffect(() => {
    fetchAuditLogs();
    fetchStatistics();
  }, []);

  // Handle filter changes
  const applyFilters = () => {
    fetchAuditLogs(1, searchTerm, activeFilters);
    setIsFilterModalOpen(false);
    toast.info('Filters applied');
  };

  const clearFilters = () => {
    const resetFilters = {
      actionType: 'all',
      adminId: 'all',
      targetType: 'all',
      startDate: '',
      endDate: ''
    };
    setActiveFilters(resetFilters);
    fetchAuditLogs(1, searchTerm, resetFilters);
    setIsFilterModalOpen(false);
    toast.info('Filters cleared');
  };

  const getColorForAction = (action) => {
    const colorMap = {
      "Student Registered": "text-blue-600 bg-blue-50",
      "Notice Issued": "text-orange-600 bg-orange-50",
      "Leave Approved": "text-green-600 bg-green-50",
      "User Created": "text-purple-600 bg-purple-50",
      "User Updated": "text-yellow-600 bg-yellow-50",
      "User Deleted": "text-red-600 bg-red-50",
      "Complaint Resolved": "text-teal-600 bg-teal-50",
      "Inspection Scheduled": "text-indigo-600 bg-indigo-50",
      "Invoice Generated": "text-pink-600 bg-pink-50"
    };
    return colorMap[action] || "text-gray-600 bg-gray-50";
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handlePageChange = (newPage) => {
    fetchAuditLogs(newPage, searchTerm, activeFilters);
  };

 const statCards = statistics
? [
{
id: "total",
label: "Total Logs",
value: statistics.statistics.total,
subLabel: "All Records",
borderColor: "border-blue-200",
bgColor: "bg-blue-50",
textColor: "text-blue-500",
badgeColor: "bg-blue-50 text-blue-600",
icon: <FileText size={18} />,
},

  {
    id: "today",
    label: "Today",
    value: statistics.statistics.today,
    subLabel: "24 Hours",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    textColor: "text-green-500",
    badgeColor: "bg-green-50 text-green-600",
    icon: <Activity size={18} />,
  },

  {
    id: "week",
    label: "This Week",
    value: statistics.statistics.thisWeek,
    subLabel: "7 Days",
    borderColor: "border-orange-200",
    bgColor: "bg-orange-50",
    textColor: "text-orange-500",
    badgeColor: "bg-orange-50 text-orange-600",
    icon: <Calendar size={18} />,
  },

  {
    id: "month",
    label: "This Month",
    value: statistics.statistics.thisMonth,
    subLabel: "30 Days",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50",
    textColor: "text-purple-500",
    badgeColor: "bg-purple-50 text-purple-600",
    icon: <TrendingUp size={18} />,
  },
]


: [];

  const handleCardClick = (cardId) => {
    setActiveCard(cardId);
    let newFilters = { ...activeFilters };
    const today = new Date();
    
    if (cardId === "today") {
      newFilters.startDate = today.toISOString().split('T')[0];
      newFilters.endDate = today.toISOString().split('T')[0];
    } else if (cardId === "week") {
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      newFilters.startDate = lastWeek.toISOString().split('T')[0];
      newFilters.endDate = today.toISOString().split('T')[0];
    } else if (cardId === "month") {
      const lastMonth = new Date(today);
      lastMonth.setDate(today.getDate() - 30);
      newFilters.startDate = lastMonth.toISOString().split('T')[0];
      newFilters.endDate = today.toISOString().split('T')[0];
    } else {
      newFilters.startDate = '';
      newFilters.endDate = '';
    }
    
    setActiveFilters(newFilters);
    fetchAuditLogs(1, searchTerm, newFilters);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black">
            <span className="border-l-4 border-[#4F8CCF] pl-3 inline-block">
              Audit Logs
            </span>
          </h2>
          <p className="text-gray-600 mt-2 ml-3">Track all system activities and user actions</p>
        </div>

        {/* Modern Stats Cards */}
       {statistics && (

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
    {statCards.map((card) => (
      <div
        key={card.id}
        onClick={() => handleCardClick(card.id)}
        className={`bg-white rounded-2xl p-5 border ${card.borderColor} ${activeCard === card.id ? "ring-2 ring-offset-2 ring-" + card.borderColor.split("-")[1] + "-500" : ""} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
      >
        <div
          className={`w-10 h-10 rounded-full ${card.bgColor} flex items-center justify-center mb-4`}
        >
          <div className={card.textColor}>
            {card.icon}
          </div>
        </div>


    <div className="text-4xl font-bold text-black">
      {card.value}
    </div>

    <div className="text-gray-700 text-sm font-medium mt-1">
      {card.label}
    </div>

    <div
      className={`inline-block mt-4 px-3 py-1 text-xs font-medium rounded-full ${card.badgeColor}`}
    >
      {card.subLabel}
    </div>
  </div>
))}


  </div>
)}


        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
          
          {/* Top Sage Green Header */}
          <div className="bg-[#BEC5AD] px-6 py-5 text-black">
            <h3 className="text-xl font-bold">Audit Log Entries</h3>
            <p className="text-sm font-medium mt-1 text-gray-700">Total: {pagination.totalLogs || logs.length} records</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-end">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg px-4 py-2 transition-colors flex-1 sm:flex-none text-sm"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  <Filter size={16} />
                  <span>Filter</span>
                </button>

                <button 
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 transition-colors flex-1 sm:flex-none text-sm"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                  <span>{exporting ? 'Exporting...' : 'Export'}</span>
                </button>
                
                <button 
                  className={`flex items-center justify-center gap-2 font-medium rounded-lg px-4 py-2 transition-colors flex-1 sm:flex-none text-sm ${
                    autoRefresh 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
                >
                  <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                  <span>Auto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-6 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Loading Spinner */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="text-2xl animate-spin text-gray-600" size={32} />
              <span className="ml-2 text-gray-600 font-medium">Loading audit logs...</span>
            </div>
          ) : (
            <div className="p-2 sm:p-6 bg-white">
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4 font-sans">
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div key={log._id || idx} className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">{formatTimestamp(log.timestamp)}</span>
                          </div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getColorForAction(log.actionType)}`}>
                            {log.actionType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {log.user.charAt(0)}
                          </div>
                          <p className="font-semibold text-gray-800">{log.user}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-700 leading-relaxed">{log.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-200 font-medium">
                    No logs found matching your criteria.
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#f4f6f0]">
                      <th className="px-6 py-4 text-sm font-bold text-[#374151]">Sr<br/>No</th>
                      <th className="px-6 py-4 text-sm font-bold text-[#374151]">Timestamp</th>
                      <th className="px-6 py-4 text-sm font-bold text-[#374151]">User</th>
                      <th className="px-6 py-4 text-sm font-bold text-[#374151]">Action Type</th>
                      <th className="px-6 py-4 text-sm font-bold text-[#374151]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {logs.length > 0 ? (
                      logs.map((log, idx) => (
                        <tr key={log._id || idx} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-5 text-sm font-bold text-[#1f2937]">
                            {(pagination.currentPage - 1) * 20 + idx + 1}
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-[#1f2937]">
                            {log.user}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getColorForAction(log.actionType)}`}>
                              {log.actionType}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-gray-600 leading-relaxed max-w-2xl">
                            {log.description}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500 font-medium">
                          No logs found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 pb-4">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="px-4 py-2 bg-white text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            pagination.currentPage === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-black hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 bg-white text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
              
              {/* Total logs info */}
              <div className="text-center mt-4 mb-4 text-sm text-gray-600 font-medium">
                Showing {logs.length} of {pagination.totalLogs} logs
              </div>
            </div>
          )}
        </div>

        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4 font-sans">
            <div className="bg-[#f4f6f0] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-200">
              {/* Sage Green Header */}
              <div className="bg-[#BEC5AD] px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-black">
                  Filter Audit Logs
                </h3>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-black hover:text-gray-800 transition-colors rounded-full"
                >
                  <XCircle size={24} className="stroke-[2.5]" />
                </button>
              </div>
              
              {/* Form Body */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#2C3E50] mb-2">Action Type</label>
                  <select 
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BEC5AD] transition-shadow shadow-sm"
                    value={activeFilters.actionType}
                    onChange={(e) => setActiveFilters({...activeFilters, actionType: e.target.value})}
                  >
                    <option value="all">All Actions</option>
                    {filters.actionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2C3E50] mb-2">Admin User</label>
                  <select 
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BEC5AD] transition-shadow shadow-sm"
                    value={activeFilters.adminId}
                    onChange={(e) => setActiveFilters({...activeFilters, adminId: e.target.value})}
                  >
                    <option value="all">All Users</option>
                    {filters.admins.map(admin => (
                      <option key={admin._id} value={admin._id}>
                        {admin.name} ({admin.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2C3E50] mb-2">Target Type</label>
                  <select 
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BEC5AD] transition-shadow shadow-sm"
                    value={activeFilters.targetType}
                    onChange={(e) => setActiveFilters({...activeFilters, targetType: e.target.value})}
                  >
                    <option value="all">All Target Types</option>
                    {filters.targetTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E50] mb-2">Date From</label>
                    <input
                      type="date"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BEC5AD] transition-shadow shadow-sm"
                      value={activeFilters.startDate}
                      onChange={(e) => setActiveFilters({...activeFilters, startDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2C3E50] mb-2">Date To</label>
                    <input
                      type="date"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BEC5AD] transition-shadow shadow-sm"
                      value={activeFilters.endDate}
                      onChange={(e) => setActiveFilters({...activeFilters, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 bg-[#f4f6f0] border-t border-gray-200 flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-green-500 text-white font-bold px-4 py-3 rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
}