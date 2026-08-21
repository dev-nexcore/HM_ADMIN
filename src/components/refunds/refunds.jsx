"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, Calendar, DollarSign, User, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Loader2, Eye, Check } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "@/lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Refunds = () => {
  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    refundAmount: "",
    reason: "",
    paymentMethod: "",
    fees: "",
    securityDeposit: "",
    deduction: "",
    deductionReason: "",
  });

  // Form errors state
  const [formErrors, setFormErrors] = useState({
    studentId: "",
    refundAmount: "",
    reason: "",
    paymentMethod: "",
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
  });

  // Sample refund history data replaced with API state
  const [refundHistory, setRefundHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Details Modal states
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Process Refund states
  const [processData, setProcessData] = useState({
    status: "",
    adminNotes: "",
    paymentMethod: "",
    deduction: "",
    deductionReason: ""
  });
  const [processing, setProcessing] = useState(false);

  // Action Modal states
  const [actionModal, setActionModal] = useState({
    show: false,
    type: "", // 'accept', 'reject', 'pay'
    refund: null,
    reason: "",
    paymentMethod: "cheque",
    chequeNumber: "",
    bankName: "",
    deduction: "",
    deductionReason: "",
    chequeDate: "",
    chequeImage: null
  });
  const [actionProcessing, setActionProcessing] = useState(false);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/adminauth/refunds');
      if (res.data && res.data.refunds) {
        const mapped = res.data.refunds.map(r => ({
          id: r.refundId,
          date: new Date(r.date).toLocaleDateString("en-IN").replace(/\//g, '-'),
          recipientName: r.recipientName,
          studentId: r.studentId || "N/A",
          amount: `₹${r.amount}`,
          reason: r.reason,
          status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
          processedBy: r.processedBy,
          processedDate: r.processedDate ? new Date(r.processedDate).toLocaleDateString("en-IN").replace(/\//g, '-') : "-",
          fees: r.fees || 0,
          securityDeposit: r.securityDeposit || 0,
          deduction: r.deduction || 0,
          deductionReason: r.deductionReason || "",
          paymentMethod: r.paymentMethod || "",
          chequeNumber: r.chequeNumber || "",
          bankName: r.bankName || "",
          chequeDate: r.chequeDate ? new Date(r.chequeDate).toLocaleDateString("en-IN").replace(/\//g, '-') : "",
          chequeImage: r.chequeImage || "",
          adminNotes: r.adminNotes || ""
        }));
        setRefundHistory(mapped);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch refunds");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    try {
      setProcessing(true);
      await api.put(`/api/adminauth/refunds/${selectedRefund.id}/status`, {
        status: processData.status,
        adminNotes: processData.adminNotes,
        paymentMethod: processData.paymentMethod,
        deduction: processData.deduction,
        deductionReason: processData.deductionReason
      });
      toast.success(`Refund marked as ${processData.status}`);
      setShowDetailsModal(false);
      setProcessData({ status: "", adminNotes: "", paymentMethod: "", deduction: "", deductionReason: "" });
      fetchRefunds();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process refund");
    } finally {
      setProcessing(false);
    }
  };

  const handleActionConfirm = async () => {
    try {
      setActionProcessing(true);
      let status = "";
      let payload;
      let headers = {};

      if (actionModal.type === 'accept') {
        status = 'approved';
        payload = { status: 'approved' };
      } else if (actionModal.type === 'reject') {
        status = 'rejected';
        payload = { status: 'rejected', adminNotes: actionModal.reason };
      } else if (actionModal.type === 'pay') {
        status = 'completed';
        payload = new FormData();
        payload.append('status', 'completed');
        payload.append('paymentMethod', actionModal.paymentMethod);
        payload.append('chequeNumber', actionModal.chequeNumber);
        payload.append('bankName', actionModal.bankName);
        if (actionModal.chequeDate) payload.append('chequeDate', actionModal.chequeDate);
        if (actionModal.deduction) payload.append('deduction', actionModal.deduction);
        if (actionModal.deductionReason) payload.append('deductionReason', actionModal.deductionReason);
        if (actionModal.chequeImage) payload.append('chequeImage', actionModal.chequeImage);
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      await api.put(`/api/adminauth/refunds/${actionModal.refund.id}/status`, payload, { headers });
      toast.success(`Refund marked as ${status}`);
      setActionModal({ show: false, type: "", refund: null, reason: "", paymentMethod: "cheque", chequeNumber: "", bankName: "", deduction: "", deductionReason: "", chequeDate: "", chequeImage: null });
      fetchRefunds();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process action");
    } finally {
      setActionProcessing(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    const totalRefunds = refundHistory.length;
    const totalAmount = refundHistory.reduce((sum, refund) => {
      const amount = parseInt(refund.amount.replace("₹", "").replace(",", ""));
      return sum + amount;
    }, 0);
    const completed = refundHistory.filter(r => r.status === "Completed").length;
    const pending = refundHistory.filter(r => r.status === "Pending").length;
    const rejected = refundHistory.filter(r => r.status === "Rejected").length;
    
    return { totalRefunds, totalAmount, completed, pending, rejected };
  };

  const stats = calculateStats();

  // Card data for stats
 const statCards = [
{
id: "total",
label: "Total Refunds",
value: stats.totalRefunds,
subLabel: "All Requests",
borderColor: "border-blue-200",
bgColor: "bg-blue-50",
textColor: "text-blue-500",
badgeColor: "bg-blue-50 text-blue-600",
icon: <CreditCard size={18} />,
},

{
id: "amount",
label: "Total Amount",
value: `₹${stats.totalAmount.toLocaleString()}`,
subLabel: "Processed",
borderColor: "border-green-200",
bgColor: "bg-green-50",
textColor: "text-green-500",
badgeColor: "bg-green-50 text-green-600",
icon: <DollarSign size={18} />,
},

{
id: "completed",
label: "Completed",
value: stats.completed,
subLabel: "Successful",
borderColor: "border-emerald-200",
bgColor: "bg-emerald-50",
textColor: "text-emerald-500",
badgeColor: "bg-emerald-50 text-emerald-600",
icon: <CheckCircle size={18} />,
},

{
id: "pending",
label: "Pending",
value: stats.pending,
subLabel: "Awaiting",
borderColor: "border-orange-200",
bgColor: "bg-orange-50",
textColor: "text-orange-500",
badgeColor: "bg-orange-50 text-orange-600",
icon: <Clock size={18} />,
},

{
id: "rejected",
label: "Rejected",
value: stats.rejected,
subLabel: "Declined",
borderColor: "border-red-200",
bgColor: "bg-red-50",
textColor: "text-red-500",
badgeColor: "bg-red-50 text-red-600",
icon: <XCircle size={18} />,
},
];


  // Form validation
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.studentId.trim()) {
      errors.studentId = "Student ID is required";
      isValid = false;
    }

    if (!formData.refundAmount.trim()) {
      errors.refundAmount = "Amount is required";
      isValid = false;
    } else if (!/^\d+(\.\d{2})?$/.test(formData.refundAmount)) {
      errors.refundAmount = "Enter a valid amount";
      isValid = false;
    }

    if (!formData.reason.trim()) {
      errors.reason = "Reason is required";
      isValid = false;
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = "Payment method is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({
      studentId: "",
      refundAmount: "",
      reason: "",
      paymentMethod: "",
      fees: "",
      securityDeposit: "",
      deduction: "",
      deductionReason: "",
    });
    setFormErrors({
      studentId: "",
      refundAmount: "",
      reason: "",
      paymentMethod: "",
    });
  };

  // Submit form
  const handleProceedToPay = async () => {
    if (validateForm()) {
      try {
        await api.post('/api/adminauth/refunds', {
          studentId: formData.studentId,
          amount: parseFloat(formData.refundAmount),
          reason: formData.reason,
          paymentMethod: formData.paymentMethod,
          fees: parseFloat(formData.fees) || 0,
          securityDeposit: parseFloat(formData.securityDeposit) || 0,
          deduction: parseFloat(formData.deduction) || 0,
          deductionReason: formData.deductionReason
        });
        toast.success("Refund request submitted successfully!");
        handleCancel();
        fetchRefunds(); // Refresh the list
      } catch (err) {
        console.error("Refund error:", err);
        toast.error(err.response?.data?.message || "Failed to submit refund request");
      }
    } else {
      toast.error("Please fill all required fields correctly");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
    });
    toast.info("Filters cleared");
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Approved":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-orange-100 text-orange-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle size={14} className="text-green-600" />;
      case "Approved":
        return <CheckCircle size={14} className="text-blue-600" />;
      case "Pending":
        return <Clock size={14} className="text-orange-600" />;
      case "Rejected":
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <AlertCircle size={14} className="text-gray-600" />;
    }
  };

  // Date parsing helper
  const parseDate = (dateString) => {
    if (!dateString || dateString === "-") return null;
    const [day, month, year] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Filter and search functionality
  const filteredRefunds = refundHistory.filter((refund) => {
    const matchesSearch =
      refund.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.processedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.date.includes(searchTerm) ||
      refund.amount.includes(searchTerm) ||
      refund.studentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || refund.status === filters.status;
    
    const refundDate = parseDate(refund.date);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
    
    const matchesDateFrom = !fromDate || (refundDate && refundDate >= fromDate);
    const matchesDateTo = !toDate || (refundDate && refundDate <= toDate);

    const refundAmount = parseInt(refund.amount.replace("₹", "").replace(",", ""));
    const matchesAmountMin = !filters.amountMin || refundAmount >= parseInt(filters.amountMin);
    const matchesAmountMax = !filters.amountMax || refundAmount <= parseInt(filters.amountMax);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesAmountMin &&
      matchesAmountMax
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);
  const paginatedRefunds = filteredRefunds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getActiveCardId = () => {
    if (filters.status === "Completed") return "completed";
    if (filters.status === "Pending") return "pending";
    if (filters.status === "Rejected") return "rejected";
    return "total";
  };

  const handleCardClick = (cardId) => {
    let newStatus = "";
    if (cardId === "completed") newStatus = "Completed";
    else if (cardId === "pending") newStatus = "Pending";
    else if (cardId === "rejected") newStatus = "Rejected";
    
    setFilters(prev => ({ ...prev, status: newStatus }));
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#4F8CCF] rounded-full"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">Refunds</h1>
          </div>
          <p className="text-gray-600 mt-2 ml-3">Manage student refund requests and payment processing</p>
        </div>

        {/* Modern Stats Cards */}
       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
  {statCards.map((card) => (
    <div
      key={card.id}
      onClick={() => handleCardClick(card.id)}
      className={`bg-white rounded-2xl p-5 border ${card.borderColor} ${getActiveCardId() === card.id ? "ring-2 ring-offset-2 ring-" + card.borderColor.split("-")[1] + "-500" : ""} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
    >
      <div
        className={`w-10 h-10 rounded-full ${card.bgColor} flex items-center justify-center mb-4`}
      >
        <div className={card.textColor}>
          {card.icon}
        </div>
      </div>


  <div className="text-3xl font-bold text-black">
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

        {/* Alternative Minimal Cards */}
       


        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 font-sans">
          <div className="relative w-full lg:w-96">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search refunds..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all duration-300 shadow-sm"
          >
            <Filter size={18} />
            Filter
          </button>
        </div>

        {/* Active Filters Display */}
        {(filters.status || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax) && (
          <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-gray-700">Active Filters:</span>
              {filters.status && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-blue-100">
                  Status: {filters.status}
                </span>
              )}
              {filters.dateFrom && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-blue-100">
                  <Calendar size={12} /> From: {filters.dateFrom}
                </span>
              )}
              {filters.dateTo && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-blue-100">
                  <Calendar size={12} /> To: {filters.dateTo}
                </span>
              )}
              {filters.amountMin && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100">
                  Min: ₹{filters.amountMin}
                </span>
              )}
              {filters.amountMax && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100">
                  Max: ₹{filters.amountMax}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-100 ml-auto"
              >
                <X size={12} /> Clear All
              </button>
            </div>
          </div>
        )}

        {/* Refund History Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden font-sans">
          {/* Header */}
          <div className="bg-[#BEC5AD] px-6 py-5">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <Clock size={22} />
              Refund History
            </h2>
            <div className="text-sm font-medium text-gray-700 mt-1 ml-7">
              Total: {filteredRefunds.length} records
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12 bg-[#f4f6f0]">
                <Loader2 className="animate-spin text-gray-500" size={32} />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f4f6f0] border-b border-gray-200">
                    <th className="px-6 py-4 text-sm font-bold text-[#374151]">Refund ID</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#374151]">Date</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#374151]">Student Name</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#374151]">Refund Amount</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#374151]">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#374151]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredRefunds.length > 0 ? (
                    filteredRefunds.map((refund, idx) => (
                      <tr key={idx} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{refund.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{refund.date}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {refund.recipientName}
                          <div className="text-xs text-gray-500 font-normal">{refund.studentId}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">{refund.amount}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(refund.status)}`}>
                            {getStatusIcon(refund.status)}
                            {refund.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setSelectedRefund(refund); setShowDetailsModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="View Details">
                              <Eye size={18} />
                            </button>
                            {refund.status === 'Pending' && (
                              <>
                                <button onClick={() => setActionModal({ show: true, type: 'accept', refund, reason: '', paymentMethod: 'cheque', chequeNumber: '', bankName: '', deduction: '', deductionReason: '', chequeDate: '', chequeImage: null })} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Accept">
                                  <Check size={18} />
                                </button>
                                <button onClick={() => setActionModal({ show: true, type: 'reject', refund, reason: '', paymentMethod: 'cheque', chequeNumber: '', bankName: '', deduction: '', deductionReason: '', chequeDate: '', chequeImage: null })} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Reject">
                                  <X size={18} />
                                </button>
                                <button onClick={() => setActionModal({ show: true, type: 'pay', refund, reason: '', paymentMethod: 'cheque', chequeNumber: '', bankName: '', deduction: '', deductionReason: '', chequeDate: '', chequeImage: null })} className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors" title="Pay">
                                  <CreditCard size={18} />
                                </button>
                              </>
                            )}
                            {refund.status === 'Approved' && (
                               <button onClick={() => setActionModal({ show: true, type: 'pay', refund, reason: '', paymentMethod: 'cheque', chequeNumber: '', bankName: '', deduction: '', deductionReason: '', chequeDate: '', chequeImage: null })} className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors" title="Pay">
                                 <CreditCard size={18} />
                               </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-gray-600 bg-white">
                        No refunds found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-gray-500" size={32} />
              </div>
            ) : paginatedRefunds.length > 0 ? (
              paginatedRefunds.map((refund, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Refund ID</span>
                      <p className="font-mono text-sm font-semibold">{refund.id}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(refund.status)}`}>
                      {getStatusIcon(refund.status)}
                      {refund.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Date</span>
                      <p className="text-sm">{refund.date}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Amount</span>
                      <p className="text-sm font-bold text-gray-800">{refund.amount}</p>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Student</span>
                    <p className="text-sm font-medium">{refund.recipientName}</p>
                    <p className="text-xs text-gray-500">ID: {refund.studentId}</p>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => { setSelectedRefund(refund); setShowDetailsModal(true); }}
                      className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={16} /> View Details
                    </button>
                    {refund.status === 'Pending' && (
                      <div className="flex gap-1 flex-1">
                        <button onClick={() => setActionModal({ show: true, type: 'accept', refund, reason: '', paymentMethod: 'cheque', chequeNumber: '', bankName: '', deduction: '', deductionReason: '', chequeDate: '', chequeImage: null })} className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex justify-center items-center" title="Accept">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setActionModal({ show: true, type: 'reject', refund, reason: '', paymentMethod: 'cheque', chequeNumber: '', bankName: '', deduction: '', deductionReason: '', chequeDate: '', chequeImage: null })} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex justify-center items-center" title="Reject">
                          <X size={16} />
                        </button>
                        <button onClick={() => setActionModal({ show: true, type: 'pay', refund, reason: '', paymentMethod: 'cheque', chequeNumber: '', bankName: '', deduction: '', deductionReason: '', chequeDate: '', chequeImage: null })} className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex justify-center items-center" title="Pay">
                          <CreditCard size={16} />
                        </button>
                      </div>
                    )}
                    {refund.status === 'Approved' && (
                        <button onClick={() => setActionModal({ show: true, type: 'pay', refund, reason: '', paymentMethod: 'cheque', chequeNumber: '', bankName: '', deduction: '', deductionReason: '', chequeDate: '', chequeImage: null })} className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-purple-100 transition-colors" title="Pay">
                          <CreditCard size={16} /> Pay
                        </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600 bg-white rounded-xl">
                No refunds found matching your search criteria.
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6 md:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors shadow-sm"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-colors shadow-sm ${
                        currentPage === pageNum
                          ? 'bg-[#A4B494] text-white font-bold'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          )}
          
          {/* Total results info */}
          <div className="text-center mt-4 text-sm text-gray-600 md:hidden">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRefunds.length)} of {filteredRefunds.length} refunds
          </div>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Filter size={20} /> Filter Refunds
                  </h3>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                  >
                    <option value="">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Date From
                    </label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Date To
                    </label>
                    <input
                      type="date"
                      name="dateTo"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Min Amount
                    </label>
                    <input
                      type="number"
                      name="amountMin"
                      value={filters.amountMin}
                      onChange={handleFilterChange}
                      placeholder="Min ₹"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Max Amount
                    </label>
                    <input
                      type="number"
                      name="amountMax"
                      value={filters.amountMax}
                      onChange={handleFilterChange}
                      placeholder="Max ₹"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <AlertCircle className="text-blue-500" size={24} />
                Refund Details
              </h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 font-sans">
              {/* Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Refund ID</span>
                  <p className="font-mono text-sm font-bold text-gray-800 mt-1">{selectedRefund.id}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Date</span>
                  <p className="text-sm font-bold text-gray-800 mt-1">{selectedRefund.date}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(selectedRefund.status)}`}>
                      {selectedRefund.status}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Total Amount</span>
                  <p className="text-sm font-bold text-gray-800 mt-1">{selectedRefund.amount}</p>
                </div>
              </div>

              {/* Student Info */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Student Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Name</span>
                    <p className="font-medium text-gray-800">{selectedRefund.recipientName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Student ID</span>
                    <p className="font-medium text-gray-800">{selectedRefund.studentId}</p>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Financial Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Fees</span>
                    <p className="font-medium text-gray-800">₹{selectedRefund.fees}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Security Deposit</span>
                    <p className="font-medium text-gray-800">
                      {selectedRefund.securityDeposit !== 0 && selectedRefund.securityDeposit !== "0"
                        ? `₹${selectedRefund.securityDeposit}` 
                        : selectedRefund.amount}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Deduction</span>
                    <p className="font-medium text-red-600">₹{selectedRefund.deduction}</p>
                  </div>
                </div>
                {selectedRefund.deductionReason && (
                  <div className="mt-3 bg-red-50 p-3 rounded border border-red-100">
                    <span className="text-xs text-red-800 font-semibold block mb-1">Deduction Reason</span>
                    <p className="text-sm text-red-700 italic">{selectedRefund.deductionReason}</p>
                  </div>
                )}
              </div>

              {/* Refund Reason */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Reason for Refund</h4>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedRefund.reason}</p>
                </div>
              </div>

              {/* Payment Details (if completed) */}
              {selectedRefund.status === 'Completed' && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Payment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500">Payment Method</span>
                      <p className="font-medium text-gray-800 capitalize">{selectedRefund.paymentMethod ? selectedRefund.paymentMethod.replace('_', ' ') : "N/A"}</p>
                    </div>
                    {selectedRefund.paymentMethod === 'cheque' && (
                      <>
                        <div>
                          <span className="text-xs text-gray-500">Cheque Number</span>
                          <p className="font-medium text-gray-800">{selectedRefund.chequeNumber || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Bank Name</span>
                          <p className="font-medium text-gray-800">{selectedRefund.bankName || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Cheque Date</span>
                          <p className="font-medium text-gray-800">{selectedRefund.chequeDate || "N/A"}</p>
                        </div>
                      </>
                    )}
                  </div>
                  {selectedRefund.paymentMethod === 'cheque' && selectedRefund.chequeImage && (
                    <div className="mt-4">
                      <span className="text-xs text-gray-500 block mb-2">Cheque Image / Screenshot</span>
                      <a href={`http://localhost:5224${selectedRefund.chequeImage}`} target="_blank" rel="noopener noreferrer">
                        <img src={`http://localhost:5224${selectedRefund.chequeImage}`} alt="Cheque Screenshot" className="max-h-48 w-auto rounded border border-gray-200 hover:opacity-90 transition-opacity" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Notes */}
              {selectedRefund.adminNotes && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Admin Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedRefund.adminNotes}</p>
                  </div>
                </div>
              )}

              {/* Processing Info */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Processing Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Processed By</span>
                    <p className="font-medium text-gray-800">{selectedRefund.processedBy || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Processed Date</span>
                    <p className="font-medium text-gray-800">{selectedRefund.processedDate || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Process Refund Action for Pending Status */}
              {selectedRefund.status === 'Pending' && (
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Process Refund</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Action</label>
                      <select
                        value={processData.status}
                        onChange={(e) => setProcessData({...processData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select Action</option>
                        <option value="completed">Approve (Completed)</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </div>
                    {processData.status === 'completed' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Payment Method</label>
                            <select
                              value={processData.paymentMethod}
                              onChange={(e) => setProcessData({...processData, paymentMethod: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                              <option value="">Select Payment Method</option>
                              <option value="Cheque">Cheque</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Deduction Amount (₹)</label>
                            <input
                              type="number"
                              value={processData.deduction}
                              onChange={(e) => setProcessData({...processData, deduction: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>

                        {processData.deduction > 0 && (
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Reason for Deduction</label>
                            <input
                              type="text"
                              value={processData.deductionReason}
                              onChange={(e) => setProcessData({...processData, deductionReason: e.target.value})}
                              className="w-full px-3 py-2 border border-red-300 bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                              placeholder="E.g., Damages, unpaid dues..."
                            />
                          </div>
                        )}

                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4 flex justify-between items-center">
                          <span className="text-green-800 font-bold">Final Refund Total:</span>
                          <span className="text-xl font-black text-green-700">
                            ₹{Math.max(0, parseInt(selectedRefund.amount.replace(/\D/g, '')) - (parseInt(processData.deduction) || 0)).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Admin Notes (Optional)</label>
                      <textarea
                        value={processData.adminNotes}
                        onChange={(e) => setProcessData({...processData, adminNotes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows="2"
                        placeholder="Add any notes regarding this action..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => {
                  setShowDetailsModal(false);
                  setProcessData({ status: "", adminNotes: "", paymentMethod: "", deduction: "", deductionReason: "" });
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedRefund.status === 'Pending' && (
                <button 
                  onClick={handleProcessRefund}
                  disabled={processing || !processData.status || (processData.status === 'completed' && !processData.paymentMethod)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Process Refund'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      {/* Action Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md font-sans">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className={`px-6 py-4 border-b shrink-0 ${actionModal.type === 'accept' ? 'bg-green-50 border-green-100' : actionModal.type === 'reject' ? 'bg-red-50 border-red-100' : 'bg-purple-50 border-purple-100'}`}>
              <h3 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2">
                {actionModal.type === 'accept' && <CheckCircle size={20} className="text-green-600"/>}
                {actionModal.type === 'reject' && <XCircle size={20} className="text-red-600"/>}
                {actionModal.type === 'pay' && <CreditCard size={20} className="text-purple-600"/>}
                {actionModal.type === 'accept' ? 'Accept Refund' : actionModal.type === 'reject' ? 'Reject Refund' : 'Process Payment'}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {actionModal.type === 'accept' && (
                <p className="text-gray-700 font-medium">Are you sure you want to accept the refund request for <strong>{actionModal.refund?.recipientName}</strong>?</p>
              )}

              {actionModal.type === 'reject' && (
                <div className="space-y-4">
                  <p className="text-gray-700 font-medium">Are you sure you want to reject this refund?</p>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Reject Reason <span className="text-red-500">*</span></label>
                    <textarea
                      value={actionModal.reason}
                      onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                      className="w-full px-3 py-2 border border-red-300 bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                      rows="3"
                      placeholder="Please enter the reason for rejection..."
                    ></textarea>
                  </div>
                </div>
              )}

              {actionModal.type === 'pay' && (
                <div className="space-y-5">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Process Refund Payment For</p>
                    <p className="text-xl font-bold text-gray-900">{actionModal.refund?.recipientName}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">{actionModal.refund?.id}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">Original Request Amount</span>
                      <span className="font-bold text-gray-900">{actionModal.refund?.amount}</span>
                    </div>
                    
                    {Number(actionModal.deduction) > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">
                          Deduction {actionModal.deductionReason ? <span className="text-xs text-gray-400">({actionModal.deductionReason})</span> : ""}
                        </span>
                        <span className="font-bold text-red-600">- ₹{actionModal.deduction}</span>
                      </div>
                    )}
                    {(actionModal.refund?.deduction > 0 && !actionModal.deduction) && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">
                          Deduction {actionModal.refund?.deductionReason ? <span className="text-xs text-gray-400">({actionModal.refund?.deductionReason})</span> : ""}
                        </span>
                        <span className="font-bold text-red-600">- ₹{actionModal.refund?.deduction}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 font-bold">Final Amount to Pay</span>
                        <span className="text-lg font-black text-green-600">
                          ₹{Math.max(0, parseInt((actionModal.refund?.amount || '0').replace(/\D/g, '')) - (Number(actionModal.deduction) || parseInt(actionModal.refund?.deduction) || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Payment Details</label>
                    <div className="flex items-center gap-3 p-4 border-2 border-purple-200 bg-purple-50 rounded-xl cursor-default mb-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-purple-100">
                         <CreditCard size={18} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-purple-900">Cheque Payment</p>
                        <p className="text-xs text-purple-700 font-medium">Default mode for admin refunds</p>
                      </div>
                      <CheckCircle size={20} className="text-purple-600" />
                    </div>
                    {/* Hidden input to ensure state is always Cheque */}
                    <input type="hidden" value="cheque" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Cheque Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={actionModal.chequeNumber}
                          onChange={(e) => setActionModal({ ...actionModal, chequeNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                          placeholder="e.g. 123456"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Bank Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={actionModal.bankName}
                          onChange={(e) => setActionModal({ ...actionModal, bankName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                          placeholder="e.g. HDFC Bank"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Cheque Date (DD/MM/YYYY) <span className="text-red-500">*</span></label>
                        <DatePicker 
                          selected={actionModal.chequeDate ? new Date(actionModal.chequeDate) : null} 
                          onChange={date => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              setActionModal(prev => ({ ...prev, chequeDate: `${year}-${month}-${day}` }));
                            } else {
                              setActionModal(prev => ({ ...prev, chequeDate: "" }));
                            }
                          }} 
                          dateFormat="dd/MM/yyyy"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                          placeholderText="DD/MM/YYYY"
                          isClearable
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Upload Cheque Photo (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setActionModal({ ...actionModal, chequeImage: e.target.files[0] })}
                          className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                        />
                        {actionModal.chequeImage && (
                          <div className="mt-2 relative inline-block">
                            <img 
                              src={URL.createObjectURL(actionModal.chequeImage)} 
                              alt="Cheque Preview" 
                              className="h-16 w-24 object-cover rounded border border-gray-300"
                            />
                            <button 
                              type="button"
                              onClick={() => setActionModal({...actionModal, chequeImage: null})}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Deduction Amount (₹)</label>
                        <input
                          type="number"
                          value={actionModal.deduction}
                          onChange={(e) => setActionModal({ ...actionModal, deduction: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      {Number(actionModal.deduction) > 0 && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Deduction Reason <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={actionModal.deductionReason}
                            onChange={(e) => setActionModal({ ...actionModal, deductionReason: e.target.value })}
                            className="w-full px-3 py-2 border border-red-300 bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                            placeholder="E.g., Damages, dues..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t shrink-0">
              <button
                onClick={() => setActionModal({ show: false, type: "", refund: null, reason: "", paymentMethod: "cheque", chequeNumber: "", bankName: "", deduction: "", deductionReason: "" })}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleActionConfirm}
                disabled={actionProcessing || (actionModal.type === 'reject' && !actionModal.reason.trim()) || (actionModal.type === 'pay' && (!actionModal.chequeNumber.trim() || !actionModal.bankName.trim() || !actionModal.chequeDate || (Number(actionModal.deduction) > 0 && !actionModal.deductionReason.trim())))}
                className={`px-4 py-2 text-white rounded-lg font-bold transition-colors disabled:opacity-50 text-sm ${actionModal.type === 'accept' ? 'bg-green-600 hover:bg-green-700' : actionModal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {actionProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refunds;
