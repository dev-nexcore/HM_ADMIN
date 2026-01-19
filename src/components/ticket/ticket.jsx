"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
export default function TicketsSection() {
  const [openTickets, setOpenTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [attachmentModal, setAttachmentModal] = useState({ show: false, url: '', type: '', filename: '' });

  // Fetch open complaints/tickets
  const fetchOpenTickets = async () => {
    try {
      const response = await api.get(
        `/api/adminauth/complaints/open`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      
      const formattedTickets = response.data.complaints.map(complaint => ({
        id: complaint.ticketId,
        _id: complaint._id,
        subject: complaint.subject,
        description: complaint.description,
        complaintType: complaint.displayType || complaint.complaintType,
        raisedBy: complaint.raisedBy ? complaint.raisedBy.name : 'Unknown Student',
        studentId: complaint.raisedBy ? complaint.raisedBy.studentId : '',
        status: "Pending",
        dateRaised: new Date(complaint.filedDate).toLocaleDateString('en-GB'),
        hasAttachments: complaint.hasAttachments,
        attachmentCount: complaint.attachmentCount,
        attachments: complaint.attachments || []
      }));
      
      setOpenTickets(formattedTickets);
    } catch (error) {
      console.error("Failed to fetch open tickets:", error);
      alert("Failed to fetch open tickets. Please try again.");
    }
  };

  // Fetch resolved complaints/tickets
  const fetchResolvedTickets = async () => {
    try {
      const response = await api.get(
        `/api/adminauth/complaints/resolved`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      
      const formattedTickets = response.data.complaints.map(complaint => ({
        id: complaint.ticketId,
        _id: complaint._id,
        subject: complaint.subject,
        description: complaint.description,
        complaintType: complaint.complaintType,
        raisedBy: complaint.raisedBy ? complaint.raisedBy.name : 'Unknown Student',
        studentId: complaint.raisedBy ? complaint.raisedBy.studentId : '',
        status: "Resolved",
        dateRaised: new Date(complaint.filedDate).toLocaleDateString('en-GB'),
        resolvedDate: new Date(complaint.resolvedDate).toLocaleDateString('en-GB'),
        hasAttachments: complaint.hasAttachments,
        attachmentCount: complaint.attachmentCount,
        attachments: complaint.attachments || []
      }));
      
      setResolvedTickets(formattedTickets);
    } catch (error) {
      console.error("Failed to fetch resolved tickets:", error);
      alert("Failed to fetch resolved tickets. Please try again.");
    }
  };

  // Fetch ticket details with attachments
  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await api.get(
        `/api/adminauth/complaints/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      return response.data.complaint;
    } catch (error) {
      console.error("Failed to fetch ticket details:", error);
      return null;
    }
  };

  // View ticket details
  const viewTicketDetails = async (ticket) => {
    const details = await fetchTicketDetails(ticket._id);
    if (details) {
      setSelectedTicket({ ...ticket, ...details });
      setShowModal(true);
    }
  };

  // View attachment
  const viewAttachment = async (complaintId, attachmentId, filename, mimeType) => {
    try {
      const response = await api.get(
        `/api/adminauth/complaints/${complaintId}/attachment/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          responseType: 'blob'
        }
      );

      const url = URL.createObjectURL(response.data);
      const type = mimeType.startsWith('image/') ? 'image' : 
                   mimeType.startsWith('video/') ? 'video' : 'document';
      
      setAttachmentModal({ show: true, url, type, filename });
    } catch (error) {
      console.error("Failed to fetch attachment:", error);
      alert("Failed to load attachment. Please try again.");
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchOpenTickets(), fetchResolvedTickets()]);
      } catch (error) {
        console.error("Failed to load tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  // Handle approve (resolve complaint)
  const handleApprove = async (index) => {
    const ticket = openTickets[index];
    const complaintId = ticket._id;

    setActionLoading(prev => ({ ...prev, [`approve_${index}`]: true }));

    try {
      await api.put(
        `/api/adminauth/complaints/${complaintId}/status`,
        {
          status: "resolved",
          adminNotes: "Complaint has been approved and resolved by admin."
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const resolvedTicket = {
        ...ticket,
        status: "Resolved",
        resolvedDate: new Date().toLocaleDateString('en-GB')
      };

      setResolvedTickets(prev => [resolvedTicket, ...prev]);
      setOpenTickets(prev => prev.filter((_, i) => i !== index));

      alert("✅ Complaint has been approved and resolved successfully!");

    } catch (error) {
      console.error("Failed to approve complaint:", error);
      alert("❌ Failed to approve complaint. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [`approve_${index}`]: false }));
    }
  };

  // Handle reject
  const handleReject = async (index) => {
    const ticket = openTickets[index];
    const confirmReject = confirm(
      `Are you sure you want to reject this complaint?\n\nSubject: ${ticket.subject}\n\nThis action cannot be undone.`
    );

    if (!confirmReject) return;

    setActionLoading(prev => ({ ...prev, [`reject_${index}`]: true }));

    try {
      setOpenTickets(prev => prev.filter((_, i) => i !== index));
      alert("❌ Complaint has been rejected and removed from the list.");
    } catch (error) {
      console.error("Failed to reject complaint:", error);
      alert("❌ Failed to reject complaint. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [`reject_${index}`]: false }));
    }
  };

  // Close attachment modal
  const closeAttachmentModal = () => {
    if (attachmentModal.url) {
      URL.revokeObjectURL(attachmentModal.url);
    }
    setAttachmentModal({ show: false, url: '', type: '', filename: '' });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <h2 className="text-2xl font-bold text-black border-l-4 border-[#4F8CCF] pl-3">
          Tickets & Queries
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-black border-l-4 border-[#4F8CCF] pl-3">
        Tickets & Queries
      </h2>

      {/* Open Tickets */}
      <div className="bg-[#A4B494] rounded-2xl p-4 md:p-6 shadow-md">
        <h2 className="text-xl font-semibold text-black mb-4">
          Open Tickets ({openTickets.length})
        </h2>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {openTickets.length > 0 ? (
            openTickets.map((ticket, index) => (
              <div key={ticket.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-gray-600">ID:</span>
                    <span className="font-bold">{ticket.id}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-600">Subject:</span>
                    <p className="mt-1 font-medium">{ticket.subject}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-600">Type:</span>
                    <p className="text-sm text-gray-700">{ticket.complaintType}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Raised By:</span>
                      <p className="text-sm">{ticket.raisedBy}</p>
                      {ticket.studentId && (
                        <p className="text-xs text-gray-500">({ticket.studentId})</p>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Date:</span>
                      <p className="text-sm">{ticket.dateRaised}</p>
                    </div>
                  </div>
                  {ticket.hasAttachments && (
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Attachments:</span>
                      <button
                        onClick={() => viewTicketDetails(ticket)}
                        className="block text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        📎 {ticket.attachmentCount} file(s) - View Details
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Status:</span>
                      <span className="ml-2 font-bold text-[#4F8CCF]">{ticket.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      className="bg-lime-500 text-black font-semibold flex-1 py-2 rounded-md hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleApprove(index)}
                      disabled={actionLoading[`approve_${index}`] || actionLoading[`reject_${index}`]}
                    >
                      {actionLoading[`approve_${index}`] ? "Processing..." : "Approve"}
                    </button>
                    <button
                      className="bg-red-600 text-white font-semibold flex-1 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleReject(index)}
                      disabled={actionLoading[`approve_${index}`] || actionLoading[`reject_${index}`]}
                    >
                      {actionLoading[`reject_${index}`] ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-700">
              No open tickets available.
            </div>
          )}
        </div>

        {/* Desktop Table View - Responsive */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-2 bg-white text-black font-bold p-3 rounded-t-lg">
            <div className="col-span-1 text-sm">Ticket ID</div>
            <div className="col-span-3 text-sm">Subject & Files</div>
            <div className="col-span-2 text-sm">Type</div>
            <div className="col-span-2 text-sm">Raised By</div>
            <div className="col-span-1 text-sm">Status</div>
            <div className="col-span-1 text-sm">Date</div>
            <div className="col-span-2 text-sm">Actions</div>
          </div>
          
          <div className="space-y-2">
            {openTickets.length > 0 ? (
              openTickets.map((ticket, index) => (
                <div key={ticket.id} className="grid grid-cols-12 gap-2 bg-white p-3 rounded-lg shadow-sm">
                  <div className="col-span-1 text-sm font-semibold">{ticket.id}</div>
                  <div className="col-span-3">
                    <div className="text-sm font-medium truncate" title={ticket.subject}>
                      {ticket.subject}
                    </div>
                    {ticket.hasAttachments && (
                      <button
                        onClick={() => viewTicketDetails(ticket)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                      >
                        📎 {ticket.attachmentCount} file(s) - View
                      </button>
                    )}
                  </div>
                  <div className="col-span-2 text-sm">{ticket.complaintType}</div>
                  <div className="col-span-2">
                    <div className="text-sm font-medium">{ticket.raisedBy}</div>
                    {ticket.studentId && (
                      <div className="text-xs text-gray-500">({ticket.studentId})</div>
                    )}
                  </div>
                  <div className="col-span-1 font-bold text-[#4F8CCF] text-sm">{ticket.status}</div>
                  <div className="col-span-1 text-sm">{ticket.dateRaised}</div>
                  <div className="col-span-2 space-y-1">
                    <button
                      className="bg-lime-500 text-black font-semibold w-full py-1 rounded-md hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      onClick={() => handleApprove(index)}
                      disabled={actionLoading[`approve_${index}`] || actionLoading[`reject_${index}`]}
                    >
                      {actionLoading[`approve_${index}`] ? "..." : "Approve"}
                    </button>
                    <button
                      className="bg-red-600 text-white font-semibold w-full py-1 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      onClick={() => handleReject(index)}
                      disabled={actionLoading[`approve_${index}`] || actionLoading[`reject_${index}`]}
                    >
                      {actionLoading[`reject_${index}`] ? "..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-700 col-span-12">
                No open tickets available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolved Tickets */}
      <div className="bg-[#A4B494] rounded-2xl p-4 md:p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-black">
          Resolved Tickets ({resolvedTickets.length})
        </h3>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {resolvedTickets.length > 0 ? (
            resolvedTickets.map((ticket, index) => (
              <div key={ticket.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-gray-600">ID:</span>
                    <span className="font-bold">{ticket.id}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-600">Subject:</span>
                    <p className="mt-1 font-medium">{ticket.subject}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-600">Type:</span>
                    <p className="text-sm text-gray-700">{ticket.complaintType}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Raised By:</span>
                      <p className="text-sm">{ticket.raisedBy}</p>
                      {ticket.studentId && (
                        <p className="text-xs text-gray-500">({ticket.studentId})</p>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Filed:</span>
                      <p className="text-sm">{ticket.dateRaised}</p>
                      {ticket.resolvedDate && (
                        <>
                          <span className="font-semibold text-sm text-gray-600">Resolved:</span>
                          <p className="text-sm">{ticket.resolvedDate}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {ticket.hasAttachments && (
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Attachments:</span>
                      <button
                        onClick={() => viewTicketDetails(ticket)}
                        className="block text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        📎 {ticket.attachmentCount} file(s) - View Details
                      </button>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-sm text-gray-600">Status:</span>
                    <span className="ml-2 text-green-600 font-semibold">{ticket.status}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-900 font-semibold">
              No resolved tickets available.
            </div>
          )}
        </div>

        {/* Desktop Grid View */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-2 bg-white text-black font-bold p-3 rounded-t-lg">
            <div className="col-span-1 text-sm">Ticket ID</div>
            <div className="col-span-3 text-sm">Subject & Files</div>
            <div className="col-span-2 text-sm">Type</div>
            <div className="col-span-2 text-sm">Raised By</div>
            <div className="col-span-1 text-sm">Status</div>
            <div className="col-span-1 text-sm">Filed</div>
            <div className="col-span-2 text-sm">Resolved</div>
          </div>
          
          <div className="space-y-2">
            {resolvedTickets.length > 0 ? (
              resolvedTickets.map((ticket, index) => (
                <div key={ticket.id} className="grid grid-cols-12 gap-2 bg-white p-3 rounded-lg shadow-sm">
                  <div className="col-span-1 text-sm font-semibold">{ticket.id}</div>
                  <div className="col-span-3">
                    <div className="text-sm font-medium truncate" title={ticket.subject}>
                      {ticket.subject}
                    </div>
                    {ticket.hasAttachments && (
                      <button
                        onClick={() => viewTicketDetails(ticket)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                      >
                        📎 {ticket.attachmentCount} file(s) - View
                      </button>
                    )}
                  </div>
                  <div className="col-span-2 text-sm">{ticket.complaintType}</div>
                  <div className="col-span-2">
                    <div className="text-sm font-medium">{ticket.raisedBy}</div>
                    {ticket.studentId && (
                      <div className="text-xs text-gray-500">({ticket.studentId})</div>
                    )}
                  </div>
                  <div className="col-span-1 text-green-600 font-semibold text-sm">{ticket.status}</div>
                  <div className="col-span-1 text-sm">{ticket.dateRaised}</div>
                  <div className="col-span-2 text-sm">{ticket.resolvedDate || 'N/A'}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-900 font-semibold">
                No resolved tickets available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">Ticket Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">Ticket ID</label>
                    <p className="text-lg font-bold">{selectedTicket.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">Status</label>
                    <p className="text-lg font-bold text-blue-600">{selectedTicket.status}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Subject</label>
                  <p className="text-gray-900">{selectedTicket.subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Description</label>
                  <p className="text-gray-900">{selectedTicket.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">Type</label>
                    <p className="text-gray-900">{selectedTicket.complaintType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">Raised By</label>
                    <p className="text-gray-900">{selectedTicket.raisedBy}</p>
                    {selectedTicket.studentId && (
                      <p className="text-sm text-gray-500">({selectedTicket.studentId})</p>
                    )}
                  </div>
                </div>
                
                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Attachments ({selectedTicket.attachments.length})
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedTicket.attachments.map((attachment, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium truncate" title={attachment.originalName}>
                              {attachment.originalName || attachment.filename}
                            </span>
                            <span className="text-xs text-gray-500">
                              {attachment.mimeType?.startsWith('image/') ? '📷' : 
                               attachment.mimeType?.startsWith('video/') ? '🎥' : '📄'}
                            </span>
                          </div>
                          <button
                            onClick={() => viewAttachment(selectedTicket._id, attachment._id, attachment.originalName, attachment.mimeType)}
                            className="w-full bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 text-sm"
                          >
                            View File
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Viewer Modal */}
      {attachmentModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{attachmentModal.filename}</h3>
              <button
                onClick={closeAttachmentModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4 max-h-[calc(90vh-100px)] overflow-auto flex items-center justify-center">
              {attachmentModal.type === 'image' && (
                <img
                  src={attachmentModal.url}
                  alt={attachmentModal.filename}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              {attachmentModal.type === 'video' && (
                <video
                  src={attachmentModal.url}
                  controls
                  className="max-w-full max-h-full"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {attachmentModal.type === 'document' && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                  <a
                    href={attachmentModal.url}
                    download={attachmentModal.filename}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}