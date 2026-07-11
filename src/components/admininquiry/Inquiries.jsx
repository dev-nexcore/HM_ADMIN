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
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);

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

        <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8" style={{ boxShadow: "0px 4px 20px 0px #00000040 inset", fontFamily: "Poppins" }}>
          
          {/* Filtering */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between mb-8">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search by name, email..."
                className="pl-10 pr-4 py-2 bg-white rounded-[12px] border-0 outline-none text-[14px] font-semibold text-black shadow-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                className="flex-1 sm:flex-none px-4 py-2 bg-white rounded-[12px] outline-none text-[14px] font-semibold text-black shadow-md border-0"
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
                className="p-2 bg-white shadow-md rounded-[12px] text-black hover:bg-gray-100 transition-all flex-shrink-0"
                title="Refresh Inquiries"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white/40 animate-pulse rounded-[1.5rem]"></div>
              ))}
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-20 bg-white/40 rounded-[1.5rem] border border-white/50">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No inquiries found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {currentInquiries.map((item) => (
                  <div key={item._id} className="relative bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all duration-300 min-h-0">
                    
                    {/* Status Badge */}
                    <div className={`absolute top-6 right-6 sm:top-8 sm:right-8 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </div>

                    {/* Header */}
                    <div className="mb-6 pt-2">
                      <div className="w-14 h-14 rounded-[1.2rem] bg-gray-50 flex items-center justify-center text-gray-400 mb-5 shadow-sm border border-gray-100">
                        <User size={28} />
                      </div>
                      <h3 className="text-[17px] sm:text-[19px] font-black text-black tracking-tight leading-tight mb-2 pr-20 uppercase" style={{ fontFamily: "Inter" }}>
                        {item.name}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f8f9fa] border border-gray-100 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{item.roomType} Plan</span>
                      </div>
                    </div>

                    {/* Details List */}
                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 group/item">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover/item:text-blue-500 shadow-sm border border-gray-50 flex-shrink-0 transition-colors">
                          <Mail size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Email</span>
                          <span className="text-sm text-gray-700 font-bold truncate">{item.email}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 group/item">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover/item:text-green-500 shadow-sm border border-gray-50 flex-shrink-0 transition-colors">
                          <Phone size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Phone</span>
                          <span className="text-sm text-gray-700 font-bold">{item.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 group/item">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover/item:text-orange-500 shadow-sm border border-gray-50 flex-shrink-0 transition-colors">
                          <Calendar size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date</span>
                          <span className="text-sm text-gray-700 font-bold">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {item.message && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-[1.2rem] border border-gray-100 relative italic">
                          <p className="text-[12px] text-gray-500 font-medium leading-relaxed">"{item.message}"</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateStatus(item._id, 'contacted')}
                          className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 rounded-xl transition-colors shadow-sm"
                          title="Mark as Contacted"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => updateStatus(item._id, 'converted')}
                          className="p-2 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 rounded-xl transition-colors shadow-sm"
                          title="Mark as Converted"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button 
                          onClick={() => updateStatus(item._id, 'rejected')}
                          className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-colors shadow-sm"
                          title="Mark as Rejected"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                      <button 
                        onClick={() => deleteInquiry(item._id)}
                        className="p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-xl transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-4 py-2 rounded-lg border border-black font-semibold text-sm transition-colors text-black ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white"}`}>← Prev</button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-lg border border-black font-semibold text-sm transition-colors text-black ${currentPage === i + 1 ? "bg-white shadow-md" : "hover:bg-white/50"}`}>{i + 1}</button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-lg border border-black font-semibold text-sm transition-colors text-black ${currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-white"}`}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>

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
