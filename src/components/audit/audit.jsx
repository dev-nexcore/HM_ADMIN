"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaDownload, FaSpinner, FaEye } from "react-icons/fa";
import api from "@/lib/api";

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

  // API base URL - adjust this to match your backend
  const API_BASE = process.env.NEXT_PUBLIC_PROD_API_URL // Update with your actual API URL

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
        ...(activeFilters.actionType !== 'all' && { actionType: activeFilters.actionType }),
        ...(activeFilters.startDate && { startDate: activeFilters.startDate }),
        ...(activeFilters.endDate && { endDate: activeFilters.endDate })
      };

      const response = await api.get(`/api/adminauth/audit-logs/export/csv`, {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting logs:', err);
      setError('Failed to export logs. Please try again.');
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

  // Initial load
  useEffect(() => {
    fetchAuditLogs();
    fetchStatistics();
  }, []);

  // Handle filter changes
  const applyFilters = () => {
    fetchAuditLogs(1, searchTerm, activeFilters);
    setIsFilterModalOpen(false);
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
  };

  const getColorForAction = (action) => {
    if (action === "Student Registered") return "text-blue-600";
    if (action === "Notice Issued") return "text-orange-600";
    if (action === "Leave Approved") return "text-green-600";
    if (action === "User Created") return "text-purple-600";
    if (action === "User Updated") return "text-yellow-600";
    if (action === "User Deleted") return "text-red-600";
    return "text-gray-600";
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
    }).replace(',', '\n');
  };

  const handlePageChange = (newPage) => {
    fetchAuditLogs(newPage, searchTerm, activeFilters);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-black border-l-4 border-[#4F8CCF] pl-3">
        Audit Logs
      </h2>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium text-gray-600">Total Logs</h3>
            <p className="text-2xl font-bold text-blue-600">{statistics.statistics.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium text-gray-600">Today</h3>
            <p className="text-2xl font-bold text-green-600">{statistics.statistics.today}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium text-gray-600">This Week</h3>
            <p className="text-2xl font-bold text-orange-600">{statistics.statistics.thisWeek}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium text-gray-600">This Month</h3>
            <p className="text-2xl font-bold text-purple-600">{statistics.statistics.thisMonth}</p>
          </div>
        </div>
      )}

      <div className="bg-[#A4B494] rounded-2xl p-4 md:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold text-black">Audit Log Entries</h3>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Logs…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 rounded-md bg-white border border-white pl-10 pr-4 text-sm text-black shadow"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>

            <button 
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md px-4 py-2 shadow-md whitespace-nowrap" 
              onClick={() => setIsFilterModalOpen(true)}
            >
              <FaFilter />
              <span>Filter</span>
            </button>

            <button 
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-4 py-2 shadow-md whitespace-nowrap"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />}
              <span>{exporting ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="text-2xl animate-spin text-gray-600" />
            <span className="ml-2 text-gray-600">Loading audit logs...</span>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={log._id || idx} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm text-gray-600">Timestamp:</span>
                        <span className="font-bold text-right whitespace-pre-line">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-gray-600">User:</span>
                        <p className="mt-1 font-semibold">{log.user}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-gray-600">Action Type:</span>
                        <p className={`mt-1 font-semibold ${getColorForAction(log.actionType)}`}>
                          {log.actionType}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-gray-600">Description:</span>
                        <p className="mt-1 font-semibold">{log.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-700">
                  No logs found.
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-base text-left text-black border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-white font-semibold text-black">
                    <th className="px-4 py-3 whitespace-nowrap">TimeStamp</th>
                    <th className="px-4 py-3 whitespace-nowrap">User</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">Action Type</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log, idx) => (
                      <tr key={log._id || idx} className="bg-[#A4B494] even:bg-opacity-90 hover:bg-[#90A884] transition-all rounded-md">
                        <td className="px-4 py-4 whitespace-pre-line font-semibold">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-4 py-4 whitespace-pre-line font-semibold">{log.user}</td>
                        <td className={`px-4 py-4 text-center font-semibold ${getColorForAction(log.actionType)}`}>
                          {log.actionType}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold">{log.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-6 font-medium">No logs found.</td>
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
                  className="px-4 py-2 bg-white text-black rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                
                <span className="text-black font-medium">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 bg-white text-black rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Filter Audit Logs</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">Action Type</label>
                <select 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700"
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
                <label className="block text-sm font-medium text-gray-700">Admin User</label>
                <select 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700"
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
                <label className="block text-sm font-medium text-gray-700">Target Type</label>
                <select 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700"
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
                <label className="block text-sm font-medium text-gray-700">Date From</label>
                <input
                  type="date"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700"
                  value={activeFilters.startDate}
                  onChange={(e) => setActiveFilters({...activeFilters, startDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date To</label>
                <input
                  type="date"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700"
                  value={activeFilters.endDate}
                  onChange={(e) => setActiveFilters({...activeFilters, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:justify-between">
              <button
                onClick={clearFilters}
                className="bg-gray-300 text-black px-4 py-2 rounded-md order-2 sm:order-1 hover:bg-gray-400"
              >
                Clear Filters
              </button>
              <button
                onClick={applyFilters}
                className="bg-green-500 text-white px-4 py-2 rounded-md order-1 sm:order-2 hover:bg-green-600"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}