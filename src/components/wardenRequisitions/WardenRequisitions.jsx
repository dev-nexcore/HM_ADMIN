"use client";

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import {
  Search,
  CheckCircle,
  Clock,
  RefreshCw,
  User,
  Users,
  Briefcase,
  FileText,
  XCircle,
  Eye,
  MessageSquare,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const WardenRequisitions = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReq, setSelectedReq] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequisitions();
    fetchStats();
  }, []);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const [reqRes, compRes] = await Promise.all([
        api.get('/api/adminauth/requisitions'),
        api.get('/api/adminauth/complaints?limit=200')
      ]);
      
      let allItems = [];
      if (reqRes.data.success) {
        allItems = [...reqRes.data.requisitions];
      }

      if (compRes.data.complaints) {
        const relevantComplaints = compRes.data.complaints.filter(c => 
          c.status === 'pending_approval' || c.status === 'resolved'
        );
        
        const complaints = relevantComplaints.map(c => ({
          _id: c._id,
          isComplaint: true,
          requestedByName: 'Hostel Warden',
          requestedBy: { wardenId: 'Warden Team' },
          requisitionType: 'complaint_resolution',
          status: c.status === 'pending_approval' ? 'pending' : 'approved', 
          createdAt: c.filedDate,
          approvedAt: c.updatedAt,
          approvedByName: 'Admin',
          data: {
            subject: c.subject,
            description: c.description,
            complaintType: c.displayType,
            ticketId: c.ticketId,
            studentName: c.raisedBy?.name,
            studentEmail: c.raisedBy?.email,
            adminNotes: c.adminNotes,
            targetStatus: c.targetStatus
          }
        }));
        allItems = [...allItems, ...complaints];
      }

      allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequisitions(allItems);
    } catch (error) {
      toast.error('Failed to fetch requisitions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [reqRes, compRes] = await Promise.all([
        api.get('/api/adminauth/requisitions/stats'),
        api.get('/api/adminauth/complaints?limit=200')
      ]);
      
      let s = { total: 0, pending: 0, approved: 0, rejected: 0 };
      if (reqRes.data.success) {
        s = { ...reqRes.data.stats };
      }
      
      if (compRes.data.complaints) {
        const cPending = compRes.data.complaints.filter(c => c.status === 'pending_approval').length;
        const cApproved = compRes.data.complaints.filter(c => c.status === 'resolved').length;
        s.total += (cPending + cApproved);
        s.pending += cPending;
        s.approved += cApproved;
      }
      setStats(s);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      setSubmitting(true);
      
      if (selectedReq.isComplaint) {
        const targetStatus = selectedReq.data?.targetStatus || 'resolved';
        await api.put(`/api/adminauth/complaints/${id}/status`, {
          status: targetStatus,
          adminNotes: notes || 'Request approved by Admin.'
        });
        toast.success(`Complaint request approved! Status changed to ${targetStatus}.`);
        setShowModal(false);
        setNotes('');
        fetchRequisitions();
        fetchStats();
        return;
      }

      const res = await api.put(`/api/adminauth/requisitions/${id}/status`, {
        status: 'approved',
        notes
      });
      if (res.data.success) {
        let successMsg = `Registration approved successfully! ID: ${res.data.entityId}`;
        
        if (selectedReq.requisitionType === 'notice') {
          successMsg = 'Notice approved and issued successfully!';
        } else if (selectedReq.requisitionType === 'inventory_replacement') {
          successMsg = 'Inventory replacement request approved!';
        }
          
        toast.success(successMsg);
        setShowModal(false);
        setNotes('');
        fetchRequisitions();
        fetchStats();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve requisition';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (selectedReq.isComplaint) {
        const targetStatus = selectedReq.data?.targetStatus;
        let returnStatus = 'in progress'; 
        
        if (targetStatus === 'in progress' || targetStatus === 'rejected') {
          returnStatus = 'pending';
        }

        await api.put(`/api/adminauth/complaints/${id}/status`, {
          status: returnStatus,
          adminNotes: rejectionReason
        });
        toast.success(`Resolution rejected. Complaint set to ${returnStatus}.`);
        setShowModal(false);
        setShowRejectModal(false);
        setRejectionReason('');
        setNotes('');
        fetchRequisitions();
        fetchStats();
        return;
      }

      const res = await api.put(`/api/adminauth/requisitions/${id}/status`, {
        status: 'rejected',
        rejectionReason,
        notes
      });
      if (res.data.success) {
        toast.success('Requisition rejected successfully');
        setShowModal(false);
        setShowRejectModal(false);
        setRejectionReason('');
        setNotes('');
        fetchRequisitions();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to reject requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(req => {
      const matchesSearch = 
        req.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.data?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.data?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.data?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.data?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesType = typeFilter === 'all' || req.requisitionType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requisitions, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'student': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'parent': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'worker': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'staff': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'notice': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'inventory_replacement': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'complaint_resolution': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
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
              <h1 className="text-[25px] leading-[25px] font-extrabold text-black flex items-center" style={{ fontFamily: 'Inter' }}>
                Warden Requisitions
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 text-sm ml-3" style={{ fontFamily: 'Poppins' }}>
              Review and approve registration requests from wardens
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Total Requests</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-200">
            <p className="text-amber-600 text-sm font-medium">Pending</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-200">
            <p className="text-emerald-600 text-sm font-medium">Approved</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-xl shadow-sm border border-rose-200">
            <p className="text-rose-600 text-sm font-medium">Rejected</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{stats.rejected}</p>
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

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select
              className="flex-1 sm:flex-none px-4 py-2 bg-white rounded-xl outline-none text-sm font-semibold text-black shadow-sm border border-gray-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              className="flex-1 sm:flex-none px-4 py-2 bg-white rounded-xl outline-none text-sm font-semibold text-black shadow-sm border border-gray-200"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="worker">Worker</option>
              <option value="staff">Staff</option>
              <option value="notice">Notice</option>
              <option value="inventory_replacement">Replacement</option>
              <option value="complaint_resolution">Complaint</option>
            </select>

            <button
              onClick={fetchRequisitions}
              className="p-2 bg-white shadow-sm border border-gray-200 rounded-xl text-black hover:bg-gray-50 transition-all flex-shrink-0"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-6 border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter' }}>
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Warden Requisitions
              </h2>
              <p className="text-sm text-gray-700 mt-1">Total: {filteredRequisitions.length} records</p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredRequisitions.length === 0 ? (
            <div className="text-center py-16 bg-white/40">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">No requisitions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    {["Warden", "Type", "Registrant", "Email", "Contact", "Status", "Submitted", "Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-sm font-semibold text-gray-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.map((req) => (
                    <tr key={req._id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-800 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {req.requestedByName?.charAt(0) || 'W'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm">{req.requestedByName}</div>
                            <div className="text-xs text-gray-500 font-medium">ID: {req.requestedBy?.wardenId || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(req.requisitionType)}`}>
                          {req.requisitionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-bold whitespace-nowrap">
                        {req.requisitionType === 'notice' ? req.data?.title : 
                         req.requisitionType === 'inventory_replacement' ? req.data?.itemName :
                         req.requisitionType === 'complaint_resolution' ? req.data?.subject :
                         `${req.data?.firstName} ${req.data?.lastName}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {req.requisitionType === 'notice' ? `To: ${req.data?.recipientType}` : 
                         req.requisitionType === 'inventory_replacement' ? `ID: ${req.data?.barcodeId}` :
                         req.requisitionType === 'complaint_resolution' ? `Student: ${req.data?.studentName}` :
                         req.data?.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {req.requisitionType === 'notice' ? (req.data?.individualRecipient || 'All') : 
                         req.requisitionType === 'inventory_replacement' ? 'N/A' :
                         req.requisitionType === 'complaint_resolution' ? req.data?.ticketId :
                         req.data?.contactNumber}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setSelectedReq(req); setNotes(req.notes || ''); setRejectionReason(''); setShowModal(true); }}
                            className="text-gray-500 hover:text-gray-700 transition-colors" 
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Details Modal */}
        {showModal && selectedReq && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#f4f6f0] rounded-2xl shadow-xl overflow-hidden w-full max-w-2xl relative flex flex-col border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter', maxHeight: '90vh' }}>
              
              <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-semibold text-black">Requisition Details</h2>
                  <p className="text-sm text-gray-800 mt-1 font-medium">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-white/50 border-black/10 inline-block mr-2`}>
                      {selectedReq.requisitionType.replace('_', ' ')}
                    </span>
                    Submitted {new Date(selectedReq.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-black/70 hover:text-black transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Requested By</p>
                  <p className="text-sm font-bold text-gray-800">{selectedReq.requestedByName}</p>
                  <p className="text-sm font-medium text-gray-500">Warden ID: {selectedReq.requestedBy?.wardenId || 'N/A'}</p>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    {selectedReq.requisitionType === 'complaint_resolution' 
                      ? 'Complaint Details' 
                      : `${selectedReq.requisitionType.charAt(0).toUpperCase() + selectedReq.requisitionType.slice(1).replace('_', ' ')} Information`}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                    
                    {selectedReq.requisitionType !== 'notice' && selectedReq.requisitionType !== 'inventory_replacement' && selectedReq.requisitionType !== 'complaint_resolution' && (
                      <>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">First Name</p>
                          <p className="text-sm font-medium text-gray-600">{selectedReq.data?.firstName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Last Name</p>
                          <p className="text-sm font-medium text-gray-600">{selectedReq.data?.lastName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                          <p className="text-sm font-medium text-gray-600">{selectedReq.data?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Contact Number</p>
                          <p className="text-sm font-medium text-gray-600">{selectedReq.data?.contactNumber || 'N/A'}</p>
                        </div>
                      </>
                    )}

                    {(selectedReq.requisitionType === 'student' || selectedReq.requisitionType === 'worker') && (
                      <>
                        {selectedReq.data?.roomNumber && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Room Number</p>
                            <p className="text-sm font-medium text-gray-600">{selectedReq.data.roomNumber}</p>
                          </div>
                        )}
                        {selectedReq.data?.bedNumber && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Bed Number</p>
                            <p className="text-sm font-medium text-gray-600">{selectedReq.data.bedNumber}</p>
                          </div>
                        )}
                        {selectedReq.data?.emergencyContact && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Emergency Contact</p>
                            <p className="text-sm font-medium text-gray-600">{selectedReq.data.emergencyContact}</p>
                          </div>
                        )}
                        {selectedReq.data?.emergencyContactName && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Emergency Contact Name</p>
                            <p className="text-sm font-medium text-gray-600">{selectedReq.data.emergencyContactName}</p>
                          </div>
                        )}
                        {selectedReq.data?.admissionDate && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Admission Date</p>
                            <p className="text-sm font-medium text-gray-600">{new Date(selectedReq.data.admissionDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedReq.data?.feeStatus && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Fee Status</p>
                            <p className="text-sm font-medium text-gray-600">{selectedReq.data.feeStatus}</p>
                          </div>
                        )}
                      </>
                    )}

                    {selectedReq.requisitionType === 'notice' && (
                      <>
                        {selectedReq.data?.template && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Template</p>
                            <p className="text-sm font-medium text-gray-600">{selectedReq.data.template}</p>
                          </div>
                        )}
                        {selectedReq.data?.recipientType && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Recipient Type</p>
                            <p className="text-sm font-medium text-gray-600">{selectedReq.data.recipientType}</p>
                          </div>
                        )}
                        {selectedReq.data?.individualRecipient && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Recipient ID</p>
                            <p className="text-sm font-medium text-gray-600">{selectedReq.data.individualRecipient}</p>
                          </div>
                        )}
                        {selectedReq.data?.issueDate && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Issue Date</p>
                            <p className="text-sm font-medium text-gray-600">{new Date(selectedReq.data.issueDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div className="col-span-1 md:col-span-2">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Message</p>
                          <div className="text-sm font-medium text-gray-600 bg-white px-4 py-3.5 rounded-xl border border-gray-200 shadow-sm">
                            {selectedReq.data.message}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedReq.requisitionType === 'parent' && (
                      <>
                        {selectedReq.data?.relation && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Relation</p>
                            <p className="text-sm font-medium text-gray-600">{selectedReq.data.relation}</p>
                          </div>
                        )}
                        {selectedReq.data?.studentId && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Student ID</p>
                            <p className="text-sm font-medium text-gray-600">{selectedReq.data.studentId}</p>
                          </div>
                        )}
                      </>
                    )}

                    {selectedReq.requisitionType === 'inventory_replacement' && (
                      <>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Item Name</p>
                          <p className="text-sm font-medium text-gray-600">{selectedReq.data?.itemName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Barcode ID</p>
                          <p className="text-sm font-medium text-gray-600">{selectedReq.data?.barcodeId}</p>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Replacement Reason</p>
                          <div className="text-sm font-medium text-gray-600 bg-white px-4 py-3.5 rounded-xl border border-gray-200 shadow-sm">
                            {selectedReq.data?.reason}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedReq.requisitionType === 'complaint_resolution' && (
                      <>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Ticket ID</p>
                          <p className="text-sm font-medium text-gray-600">{selectedReq.data?.ticketId}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Requested Action</p>
                          <p className={`text-sm font-bold uppercase ${selectedReq.data?.targetStatus === 'in progress' ? 'text-blue-600' : selectedReq.data?.targetStatus === 'resolved' ? 'text-emerald-600' : selectedReq.data?.targetStatus === 'rejected' ? 'text-rose-600' : 'text-gray-800'}`}>
                            {selectedReq.data?.targetStatus === 'in progress' ? 'Start Processing' : 
                             selectedReq.data?.targetStatus === 'resolved' ? 'Mark as Resolved' : 
                             selectedReq.data?.targetStatus === 'rejected' ? 'Reject Complaint' : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Student</p>
                          <p className="text-sm font-medium text-gray-600">{selectedReq.data?.studentName} ({selectedReq.data?.studentEmail})</p>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Subject</p>
                          <p className="text-sm font-medium text-gray-600">{selectedReq.data?.subject}</p>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Description</p>
                          <div className="text-sm font-medium text-gray-600 bg-white px-4 py-3.5 rounded-xl border border-gray-200 shadow-sm">
                            {selectedReq.data?.description}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {(selectedReq.documents?.aadharCard || selectedReq.documents?.panCard || selectedReq.documents?.photo) && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Documents / Evidence</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedReq.documents.aadharCard && (
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Aadhar Card</p>
                          <div 
                            className="w-full h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center cursor-pointer relative group"
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5224'}/${selectedReq.documents.aadharCard.path}`, '_blank')}
                          >
                            {selectedReq.documents.aadharCard.path.toLowerCase().endsWith('.pdf') ? (
                              <iframe src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5224'}/${selectedReq.documents.aadharCard.path}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-[150%] pointer-events-none transform origin-top" title="Aadhar Preview" />
                            ) : (
                              <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5224'}/${selectedReq.documents.aadharCard.path}`} className="w-full h-full object-cover" alt="Aadhar Card" />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-[#4F8CCF] text-[10px] font-bold px-3 py-1.5 rounded shadow-sm transition-opacity">Click to View</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedReq.documents.panCard && (
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                          <p className="text-xs font-semibold text-gray-700 mb-2">PAN Card</p>
                          <div 
                            className="w-full h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center cursor-pointer relative group"
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5224'}/${selectedReq.documents.panCard.path}`, '_blank')}
                          >
                            {selectedReq.documents.panCard.path.toLowerCase().endsWith('.pdf') ? (
                              <iframe src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5224'}/${selectedReq.documents.panCard.path}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-[150%] pointer-events-none transform origin-top" title="PAN Preview" />
                            ) : (
                              <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5224'}/${selectedReq.documents.panCard.path}`} className="w-full h-full object-cover" alt="PAN Card" />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-[#4F8CCF] text-[10px] font-bold px-3 py-1.5 rounded shadow-sm transition-opacity">Click to View</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedReq.documents.photo && (
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Item Photo</p>
                          <div 
                            className="w-full h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center cursor-pointer relative group"
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5224'}/uploads/wardens/${selectedReq.documents.photo.filename}`, '_blank')}
                          >
                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5224'}/uploads/wardens/${selectedReq.documents.photo.filename}`} className="w-full h-full object-cover" alt="Item Photo" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-[#4F8CCF] text-[10px] font-bold px-3 py-1.5 rounded shadow-sm transition-opacity">Click to View</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedReq.status !== 'pending' && (
                  <div className={`p-4 rounded-xl border mb-6 ${selectedReq.status === 'approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {selectedReq.status === 'approved' ? 'Approval Details' : 'Rejection Details'}
                    </p>
                    <p className="text-sm font-bold text-gray-800 mb-1">
                      {selectedReq.status === 'approved' ? `Approved by ${selectedReq.approvedByName}` : `Rejected by ${selectedReq.rejectedByName}`}
                    </p>
                    <p className="text-xs font-medium text-gray-500 mb-3">
                      {selectedReq.status === 'approved' 
                        ? new Date(selectedReq.approvedAt).toLocaleString()
                        : new Date(selectedReq.rejectedAt).toLocaleString()
                      }
                    </p>
                    {selectedReq.rejectionReason && (
                      <div className="text-sm font-medium text-gray-700 bg-white/60 px-4 py-3 rounded-lg">
                        <strong>Reason:</strong> {selectedReq.rejectionReason}
                      </div>
                    )}
                    {selectedReq.notes && (
                      <div className="text-sm font-medium text-gray-700 bg-white/60 px-4 py-3 rounded-lg mt-2">
                        <strong>Notes:</strong> {selectedReq.notes}
                      </div>
                    )}
                  </div>
                )}

                {selectedReq.status === 'pending' && (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Admin Notes (Optional)</p>
                    <textarea 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-y min-h-[80px] mb-4"
                      placeholder="Add internal notes about this requisition..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                    <div className="flex gap-3">
                      <button 
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                        onClick={() => setShowRejectModal(true)}
                      >
                        <XCircle size={18} /> Reject
                      </button>
                      <button 
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                        onClick={() => handleApprove(selectedReq._id)}
                      >
                        <CheckCircle size={18} /> {submitting ? 'Processing...' : 'Approve & Register'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Confirmation Modal */}
        {showRejectModal && selectedReq && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200" style={{ fontFamily: 'Poppins' }}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Reject Requisition</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Please provide a reason for rejecting this registration request. This will be visible to the warden.
                </p>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-y min-h-[100px] mb-6 text-left"
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedReq._id)}
                    disabled={submitting || !rejectionReason.trim()}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50"
                  >
                    {submitting ? 'Rejecting...' : 'Reject'}
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

export default WardenRequisitions;
