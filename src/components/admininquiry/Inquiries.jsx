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
  User, 
  Trash2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const deleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await api.delete(`/api/inquiries/${id}`);
      if (res.data.success) {
        toast.success('Inquiry deleted');
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
    }
  };

  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
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
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <Clock className="w-4 h-4 text-slate-600" />
          </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredInquiries.map((item) => (
            <div key={item._id} className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col min-h-[500px]">
              {/* Status Badge */}
              <div className={`absolute top-8 right-8 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
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
                  <div className="mt-4 p-5 bg-slate-50 rounded-3xl relative italic">
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
      )}
    </div>
  );
};

export default Inquiries;
