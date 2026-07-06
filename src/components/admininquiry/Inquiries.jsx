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
    <div className="py-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Inquiries</h1>
          <p className="text-sm text-slate-500 font-medium">Manage leads from the landing page</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
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
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex-shrink-0"
              title="Refresh Inquiries"
            >
              <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2rem]"></div>
          ))}
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No inquiries found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {currentInquiries.map((item) => (
              <div key={item._id} className="group relative bg-white border border-slate-100 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col min-h-0 sm:min-h-[500px]">
              {/* Status Badge */}
              <div className={`absolute top-5 right-5 sm:top-8 sm:right-8 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                {item.status}
              </div>

              {/* Header */}
              <div className="mb-8 pt-2">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 mb-6 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                  <User size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-2 break-words uppercase">
                  {item.name}
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">{item.roomType} Plan</span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl group/item hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover/item:text-blue-500 shadow-sm transition-colors">
                    <Mail size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Email</span>
                    <span className="text-sm text-slate-600 font-bold truncate">{item.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl group/item hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover/item:text-green-500 shadow-sm transition-colors">
                    <Phone size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Phone</span>
                    <span className="text-sm text-slate-600 font-bold">{item.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <Calendar size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Date</span>
                    <span className="text-sm text-slate-600 font-bold">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {item.message && (
                  <div 
                    className="mt-4 p-5 bg-slate-50 rounded-3xl relative italic max-h-32 overflow-y-auto"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">"{item.message}"</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex gap-1">
                  <button 
                    onClick={() => updateStatus(item._id, 'contacted')}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Mark as Contacted"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button 
                    onClick={() => updateStatus(item._id, 'converted')}
                    className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Mark as Converted"
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button 
                    onClick={() => updateStatus(item._id, 'rejected')}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Mark as Rejected"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
                <button 
                  onClick={() => deleteInquiry(item._id)}
                  className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-6 gap-4">
            <p className="text-sm text-slate-500 font-medium text-center sm:text-left">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredInquiries.length)}</span> of <span className="font-bold text-slate-900">{filteredInquiries.length}</span> inquiries
            </p>
            <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                        : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Inquiry</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this inquiry? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setInquiryToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
