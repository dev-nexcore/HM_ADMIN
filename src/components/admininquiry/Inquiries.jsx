"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Trash2,
  ExternalLink,
  MessageSquare,
  XCircle,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [inquiryToView, setInquiryToView] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/inquiries');
      if (res.data.success) {
        setInquiries(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/api/inquiries/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Status updated to ${status}`);
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteInquiry = (id) => {
    setInquiryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!inquiryToDelete) return;
    try {
      const res = await api.delete(`/api/inquiries/${inquiryToDelete}`);
      if (res.data.success) {
        toast.success('Inquiry deleted');
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
    } finally {
      setIsDeleteModalOpen(false);
      setInquiryToDelete(null);
    }
  };

  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const currentInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'contacted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'converted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
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
                Student Inquiries
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 text-sm ml-3" style={{ fontFamily: "Poppins" }}>Manage leads from the landing page</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Total Inquiries</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{inquiries.length}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-200">
            <p className="text-amber-600 text-sm font-medium">Pending</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{inquiries.filter(i => i.status === 'pending').length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
            <p className="text-blue-600 text-sm font-medium">Contacted</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{inquiries.filter(i => i.status === 'contacted').length}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-200">
            <p className="text-emerald-600 text-sm font-medium">Converted</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{inquiries.filter(i => i.status === 'converted').length}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-xl shadow-sm border border-rose-200">
            <p className="text-rose-600 text-sm font-medium">Rejected</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{inquiries.filter(i => i.status === 'rejected').length}</p>
          </div>
        </div>

        {/* Filtering */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email..."
              className="pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 outline-none text-sm font-semibold text-black shadow-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              className="flex-1 sm:flex-none px-4 py-2 bg-white rounded-xl outline-none text-sm font-semibold text-black shadow-sm border border-gray-200"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={fetchInquiries}
              className="p-2 bg-white shadow-sm border border-gray-200 rounded-xl text-black hover:bg-gray-50 transition-all flex-shrink-0"
              title="Refresh Inquiries"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-6 border border-[#BEC5AD]/30" style={{ fontFamily: "Inter" }}>
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Student Inquiries
              </h2>
              <p className="text-sm text-gray-700 mt-1">Total: {filteredInquiries.length} records</p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-16 bg-white/40">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">No inquiries found.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto p-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      {["Sr No", "Name", "Plan", "Email", "Phone", "Date", "Status", "Action"].map((h) => (
                        <th key={h} className="px-4 py-3 text-sm font-semibold text-gray-700">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentInquiries.map((item, i) => (
                      <tr key={item._id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600 font-bold whitespace-nowrap">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-bold whitespace-nowrap">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-medium whitespace-nowrap">{item.roomType} Bed</td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setInquiryToView(item); setIsViewModalOpen(true); }} className="text-gray-500 hover:text-gray-700 transition-colors" title="View Details"><Eye size={18} /></button>
                            <div className="w-px h-4 bg-gray-300" />
                            <button onClick={() => updateStatus(item._id, 'contacted')} className="text-blue-500 hover:text-blue-700 transition-colors" title="Mark as Contacted"><CheckCircle size={18} /></button>
                            <div className="w-px h-4 bg-gray-300" />
                            <button onClick={() => updateStatus(item._id, 'converted')} className="text-emerald-500 hover:text-emerald-700 transition-colors" title="Mark as Converted"><ExternalLink size={18} /></button>
                            <div className="w-px h-4 bg-gray-300" />
                            <button onClick={() => updateStatus(item._id, 'rejected')} className="text-rose-500 hover:text-rose-700 transition-colors" title="Mark as Rejected"><XCircle size={18} /></button>
                            <div className="w-px h-4 bg-gray-300" />
                            <button onClick={() => deleteInquiry(item._id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {currentInquiries.map((item, i) => (
                  <div key={item._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 relative">
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mb-2 pr-16">
                      <span className="text-xs font-semibold text-gray-500">Name:</span>
                      <span className="ml-2 text-sm text-gray-800 font-bold">{item.name}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-gray-500">Plan:</span>
                      <span className="ml-2 text-sm text-gray-700 font-medium">{item.roomType} Bed</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-gray-500">Email:</span>
                      <span className="ml-2 text-sm text-gray-700">{item.email}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-gray-500">Phone:</span>
                      <span className="ml-2 text-sm text-gray-700">{item.phone}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-gray-500">Date:</span>
                      <span className="ml-2 text-sm text-gray-700">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-3 pt-2 border-t border-gray-200 justify-between">
                      <div className="flex gap-3">
                        <button onClick={() => { setInquiryToView(item); setIsViewModalOpen(true); }} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-sm" title="View"><Eye size={16} /></button>
                        <button onClick={() => updateStatus(item._id, 'contacted')} className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors text-sm" title="Contacted"><CheckCircle size={16} /></button>
                        <button onClick={() => updateStatus(item._id, 'converted')} className="flex items-center gap-1 text-emerald-500 hover:text-emerald-700 transition-colors text-sm" title="Converted"><ExternalLink size={16} /></button>
                        <button onClick={() => updateStatus(item._id, 'rejected')} className="flex items-center gap-1 text-rose-500 hover:text-rose-700 transition-colors text-sm" title="Rejected"><XCircle size={16} /></button>
                      </div>
                      <button onClick={() => deleteInquiry(item._id)} className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors text-sm" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <>
                  <div className="hidden md:flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredInquiries.length)}</span> of <span className="font-medium">{filteredInquiries.length}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                      >
                        Previous
                      </button>
                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${currentPage === i + 1 ? 'bg-[#4F8DCF] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm'}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Mobile Pagination */}
                  <div className="md:hidden flex justify-between items-center px-4 py-4 border-t border-gray-100 bg-gray-50">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium shadow-sm transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>Prev</button>
                    <span className="text-sm text-gray-600 font-medium">Page {currentPage} of {totalPages || 1}</span>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className={`px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium shadow-sm transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>Next</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* View Details Modal */}
        {isViewModalOpen && inquiryToView && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#f4f6f0] rounded-2xl shadow-xl overflow-hidden w-full max-w-xl relative flex flex-col border border-[#BEC5AD]/30" style={{ fontFamily: "Inter", maxHeight: '90vh' }}>
              
              {/* Header */}
              <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-semibold text-black">Inquiry Details</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="text-black/70 hover:text-black transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Name</p>
                    <p className="text-sm font-bold text-gray-800">{inquiryToView.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Status</p>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-block ${getStatusColor(inquiryToView.status)}`}>
                      {inquiryToView.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-600 break-all">{inquiryToView.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-600">{inquiryToView.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Plan</p>
                    <p className="text-sm font-medium text-gray-600">{inquiryToView.roomType || inquiryToView.plan} Bed</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Date</p>
                    <p className="text-sm font-medium text-gray-600">
                      {new Date(inquiryToView.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                {inquiryToView.message && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Message</p>
                    <div className="text-sm font-medium text-gray-600 bg-white px-4 py-3.5 rounded-xl border border-gray-200 shadow-sm">
                      {inquiryToView.message}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200" style={{ fontFamily: "Poppins" }}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Delete Inquiry</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this inquiry? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setInquiryToDelete(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiries;
