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
  X
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
      const params = {
        page,
        limit: 20,
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
        <div className="bg-[#BEC5AD] rounded-2xl p-6 shadow-inner">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-black" />
              <h3 className="text-xl font-semibold text-black">Audit Log Entries</h3>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search logs by user, action, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg px-4 py-2 shadow-md transition-all duration-300 flex-1 sm:flex-none"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  <Filter size={16} />
                  <span>Filter</span>
                </button>

                <button 
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 shadow-md transition-all duration-300 flex-1 sm:flex-none"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                  <span>{exporting ? 'Exporting...' : 'Export'}</span>
                </button>

                <button 
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 shadow-md transition-all duration-300 flex-1 sm:flex-none ${
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
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
              <span className="ml-2 text-gray-600">Loading audit logs...</span>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div key={log._id || idx} className="bg-white rounded-xl p-4 shadow-md">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-500" />
                            <span className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User size={14} className="text-gray-500" />
                            <span className="text-xs font-semibold text-gray-600">User:</span>
                          </div>
                          <p className="font-semibold text-sm ml-6">{log.user}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-600">Action:</span>
                          <p className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium ${getColorForAction(log.actionType)}`}>
                            {log.actionType}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-600">Description:</span>
                          <p className="mt-1 text-sm text-gray-700">{log.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600 bg-white rounded-xl">
                    No logs found matching your criteria.
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white rounded-lg">
                      <th className="px-4 py-3 rounded-tl-lg text-sm font-semibold text-gray-700">Timestamp</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700">User</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700">Action Type</th>
                      <th className="px-4 py-3 rounded-tr-lg text-sm font-semibold text-gray-700">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map((log, idx) => (
                        <tr key={log._id || idx} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{log.user}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getColorForAction(log.actionType)}`}>
                              {log.actionType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.description}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-600">
                          No logs found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
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
              <div className="text-center mt-4 text-sm text-gray-600">
                Showing {logs.length} of {pagination.totalLogs} logs
              </div>
            </>
          )}
        </div>

        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Filter size={20} /> Filter Audit Logs
                  </h3>
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin User</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={activeFilters.targetType}
                    onChange={(e) => setActiveFilters({...activeFilters, targetType: e.target.value})}
                  >
                    <option value="all">All Target Types</option>
                    {filters.targetTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={activeFilters.startDate}
                    onChange={(e) => setActiveFilters({...activeFilters, startDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={activeFilters.endDate}
                    onChange={(e) => setActiveFilters({...activeFilters, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
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