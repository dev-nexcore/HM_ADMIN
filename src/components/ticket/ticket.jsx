"use client";

import { useState, useEffect } from "react";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Paperclip, 
  Image as ImageIcon, 
  Video, 
  File, 
  AlertCircle,
  Ticket,
  Users,
  CheckSquare,
  MessageSquare
} from "lucide-react";
import api from "@/lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TicketsSection() {
  const [openTickets, setOpenTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [attachmentModal, setAttachmentModal] = useState({ show: false, url: '', type: '', filename: '' });
  const [activeFilter, setActiveFilter] = useState("total");

  // Calculate statistics dynamically
  const totalOpen = openTickets.length;
  const totalResolved = resolvedTickets.length;
  const highPriority = openTickets.filter(ticket => 
    ticket.complaintType?.toLowerCase().includes('urgent') || 
    ticket.complaintType?.toLowerCase().includes('emergency')
  ).length;

  const stats = {
    total: totalOpen + totalResolved,
    open: totalOpen,
    resolved: totalResolved,
    highPriority: highPriority
  };

  const displayedOpenTickets = openTickets.filter(ticket => {
    if (activeFilter === "priority") {
      return ticket.complaintType?.toLowerCase().includes('urgent') || ticket.complaintType?.toLowerCase().includes('emergency');
    }
    return true;
  });

  const displayedResolvedTickets = resolvedTickets.filter(ticket => {
    if (activeFilter === "priority") {
      return ticket.complaintType?.toLowerCase().includes('urgent') || ticket.complaintType?.toLowerCase().includes('emergency');
    }
    return true;
  });

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
        studentRoom: complaint.raisedBy ? complaint.raisedBy.roomNumber : '',
        status: "Pending",
        dateRaised: new Date(complaint.filedDate).toLocaleDateString('en-GB'),
        hasAttachments: complaint.hasAttachments,
        attachmentCount: complaint.attachmentCount,
        attachments: complaint.attachments || []
      }));
      
      setOpenTickets(formattedTickets);
    } catch (error) {
      console.error("Failed to fetch open tickets:", error);
      toast.error("Failed to fetch open tickets. Please try again.");
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
        studentRoom: complaint.raisedBy ? complaint.raisedBy.roomNumber : '',
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
      toast.error("Failed to fetch resolved tickets. Please try again.");
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
      toast.error("Failed to load attachment. Please try again.");
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

      toast.success("✅ Complaint has been approved and resolved successfully!");

    } catch (error) {
      console.error("Failed to approve complaint:", error);
      toast.error("❌ Failed to approve complaint. Please try again.");
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
      toast.error("❌ Complaint has been rejected and removed from the list.");
    } catch (error) {
      console.error("Failed to reject complaint:", error);
      toast.error("❌ Failed to reject complaint. Please try again.");
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

  // Card data for stats
  const statCards = [
{
id: "total",
label: "Total Tickets",
value: stats.total,
subLabel: "All Tickets",
borderColor: "border-blue-200",
bgColor: "bg-blue-50",
textColor: "text-blue-500",
badgeColor: "bg-blue-50 text-blue-600",
icon: <Ticket size={18} />,
},

{
id: "open",
label: "Open Tickets",
value: stats.open,
subLabel: "Pending Action",
borderColor: "border-orange-200",
bgColor: "bg-orange-50",
textColor: "text-orange-500",
badgeColor: "bg-orange-50 text-orange-600",
icon: <MessageSquare size={18} />,
},

{
id: "resolved",
label: "Resolved",
value: stats.resolved,
subLabel: "Completed",
borderColor: "border-green-200",
bgColor: "bg-green-50",
textColor: "text-green-500",
badgeColor: "bg-green-50 text-green-600",
icon: <CheckCircle size={18} />,
},

{
id: "priority",
label: "High Priority",
value: stats.highPriority,
subLabel: "Urgent",
borderColor: "border-red-200",
bgColor: "bg-red-50",
textColor: "text-red-500",
badgeColor: "bg-red-50 text-red-600",
icon: <AlertCircle size={18} />,
},
];


  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-black border-l-4 border-[#4F8CCF] pl-3">
              Tickets & Queries
            </h2>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black">
            <span className="border-l-4 border-[#4F8CCF] pl-3 inline-block">
              Tickets & Queries
            </span>
          </h2>
          <p className="text-gray-600 mt-2 ml-3">Manage student complaints and support tickets</p>
        </div>

        {/* Stats Cards Section */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
  {statCards.map((card) => (
    <div
      key={card.id}
      onClick={() => setActiveFilter(card.id)}
      className={`bg-white rounded-2xl p-5 border ${card.borderColor} ${activeFilter === card.id ? "ring-2 ring-offset-2 ring-" + card.borderColor.split("-")[1] + "-500" : ""} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
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

        {/* Alternative Minimal Cards Design */}
      

        {/* Open Tickets */}
        {(activeFilter === "total" || activeFilter === "open" || activeFilter === "priority") && (
        <div className="bg-[#BEC5AD] rounded-2xl p-6 shadow-inner mb-8">
          <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
            <MessageSquare size={20} />
            Open Tickets ({displayedOpenTickets.length})
          </h2>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-black font-semibold rounded-lg">
                  <th className="p-3 rounded-tl-lg">Ticket ID</th>
                  <th className="p-3">Subject & Files</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Raised By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedOpenTickets.length > 0 ? (
                  displayedOpenTickets.map((ticket, index) => (
                    <tr key={ticket.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-sm">{ticket.id}</td>
                      <td className="p-3">
                        <div className="text-sm font-medium truncate max-w-[200px]" title={ticket.subject}>
                          {ticket.subject}
                        </div>
                        {ticket.hasAttachments && (
                          <button
                            onClick={() => viewTicketDetails(ticket)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 flex items-center gap-1"
                          >
                            <Paperclip size={12} /> {ticket.attachmentCount} file(s)
                          </button>
                        )}
                      </td>
                      <td className="p-3 text-sm">{ticket.complaintType}</td>
                      <td className="p-3">
                        <div className="text-sm font-medium">{ticket.raisedBy}</div>
                        {ticket.studentId && (
                          <div className="text-xs text-gray-500">ID: {ticket.studentId}</div>
                        )}
                        {ticket.studentRoom && (
                          <div className="text-xs text-gray-500">Room: {ticket.studentRoom}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock size={12} /> {ticket.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{ticket.dateRaised}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewTicketDetails(ticket)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleApprove(index)}
                            disabled={actionLoading[`approve_${index}`] || actionLoading[`reject_${index}`]}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(index)}
                            disabled={actionLoading[`approve_${index}`] || actionLoading[`reject_${index}`]}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-600">
                      No open tickets available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {displayedOpenTickets.length > 0 ? (
              displayedOpenTickets.map((ticket, index) => (
                <div key={ticket.id} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Ticket ID</span>
                      <p className="font-bold text-sm">{ticket.id}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock size={12} /> {ticket.status}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Subject</span>
                    <p className="text-sm font-medium">{ticket.subject}</p>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Type</span>
                    <p className="text-sm">{ticket.complaintType}</p>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Raised By</span>
                    <p className="text-sm font-medium">{ticket.raisedBy}</p>
                    {ticket.studentId && (
                      <p className="text-xs text-gray-500">ID: {ticket.studentId}</p>
                    )}
                    {ticket.studentRoom && (
                      <p className="text-xs text-gray-500">Room: {ticket.studentRoom}</p>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-gray-500">Date</span>
                    <p className="text-sm">{ticket.dateRaised}</p>
                  </div>
                  
                  {ticket.hasAttachments && (
                    <button
                      onClick={() => viewTicketDetails(ticket)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1 mb-3"
                    >
                      <Paperclip size={12} /> {ticket.attachmentCount} attachment(s)
                    </button>
                  )}
                  
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(index)}
                      disabled={actionLoading[`approve_${index}`] || actionLoading[`reject_${index}`]}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(index)}
                      disabled={actionLoading[`approve_${index}`] || actionLoading[`reject_${index}`]}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600 bg-white rounded-xl">
                No open tickets available.
              </div>
            )}
          </div>
        </div>
        )}

        {/* Resolved Tickets */}
        {(activeFilter === "total" || activeFilter === "resolved" || activeFilter === "priority") && (
        <div className="bg-[#BEC5AD] rounded-2xl p-6 shadow-inner">
          <h3 className="text-xl font-semibold mb-4 text-black flex items-center gap-2">
            <CheckCircle size={20} />
            Resolved Tickets ({displayedResolvedTickets.length})
          </h3>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-black font-semibold rounded-lg">
                  <th className="p-3 rounded-tl-lg">Ticket ID</th>
                  <th className="p-3">Subject & Files</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Raised By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Filed</th>
                  <th className="p-3 rounded-tr-lg">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {displayedResolvedTickets.length > 0 ? (
                  displayedResolvedTickets.map((ticket) => (
                    <tr key={ticket.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-sm">{ticket.id}</td>
                      <td className="p-3">
                        <div className="text-sm font-medium truncate max-w-[200px]" title={ticket.subject}>
                          {ticket.subject}
                        </div>
                        {ticket.hasAttachments && (
                          <button
                            onClick={() => viewTicketDetails(ticket)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 flex items-center gap-1"
                          >
                            <Paperclip size={12} /> {ticket.attachmentCount} file(s)
                          </button>
                        )}
                      </td>
                      <td className="p-3 text-sm">{ticket.complaintType}</td>
                      <td className="p-3">
                        <div className="text-sm font-medium">{ticket.raisedBy}</div>
                        {ticket.studentId && (
                          <div className="text-xs text-gray-500">{ticket.studentId}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} /> {ticket.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{ticket.dateRaised}</td>
                      <td className="p-3 text-sm">{ticket.resolvedDate || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-600">
                      No resolved tickets available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {displayedResolvedTickets.length > 0 ? (
              displayedResolvedTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Ticket ID</span>
                      <p className="font-bold text-sm">{ticket.id}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} /> {ticket.status}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Subject</span>
                    <p className="text-sm font-medium">{ticket.subject}</p>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Type</span>
                    <p className="text-sm">{ticket.complaintType}</p>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Raised By</span>
                    <p className="text-sm font-medium">{ticket.raisedBy}</p>
                    {ticket.studentId && (
                      <p className="text-xs text-gray-500">{ticket.studentId}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Filed</span>
                      <p className="text-sm">{ticket.dateRaised}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Resolved</span>
                      <p className="text-sm">{ticket.resolvedDate || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {ticket.hasAttachments && (
                    <button
                      onClick={() => viewTicketDetails(ticket)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <Paperclip size={12} /> {ticket.attachmentCount} attachment(s)
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600 bg-white rounded-xl">
                No resolved tickets available.
              </div>
            )}
          </div>
        </div>
        )}

        {/* Ticket Details Modal */}
        {showModal && selectedTicket && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText size={24} /> Ticket Details
                  </h3>
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
                      <p className={`text-lg font-bold ${selectedTicket.status === 'Resolved' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedTicket.status}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">Subject</label>
                    <p className="text-gray-900">{selectedTicket.subject}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedTicket.description}</p>
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
                        <p className="text-sm text-gray-500">ID: {selectedTicket.studentId}</p>
                      )}
                      {selectedTicket.studentRoom && (
                        <p className="text-sm text-gray-500">Room: {selectedTicket.studentRoom}</p>
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
                          <div key={idx} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium truncate flex-1" title={attachment.originalName}>
                                {attachment.originalName || attachment.filename}
                              </span>
                              {attachment.mimeType?.startsWith('image/') ? (
                                <ImageIcon size={16} className="text-blue-500" />
                              ) : attachment.mimeType?.startsWith('video/') ? (
                                <Video size={16} className="text-purple-500" />
                              ) : (
                                <File size={16} className="text-gray-500" />
                              )}
                            </div>
                            <button
                              onClick={() => viewAttachment(selectedTicket._id, attachment._id, attachment.originalName, attachment.mimeType)}
                              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-sm transition-colors"
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
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 truncate">{attachmentModal.filename}</h3>
                <button
                  onClick={closeAttachmentModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-4 max-h-[calc(90vh-100px)] overflow-auto flex items-center justify-center bg-gray-100">
                {attachmentModal.type === 'image' && (
                  <img
                    src={attachmentModal.url}
                    alt={attachmentModal.filename}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                )}
                {attachmentModal.type === 'video' && (
                  <video
                    src={attachmentModal.url}
                    controls
                    className="max-w-full max-h-full rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                {attachmentModal.type === 'document' && (
                  <div className="text-center p-8">
                    <File size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                    <a
                      href={attachmentModal.url}
                      download={attachmentModal.filename}
                      className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FileText size={18} /> Download File
                    </a>
                  </div>
                )}
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