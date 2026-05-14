"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, Calendar, DollarSign, User, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Loader2 } from "lucide-react";
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

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/adminauth/refunds');
      if (res.data && res.data.refunds) {
        const mapped = res.data.refunds.map(r => ({
          id: r.refundId,
          date: new Date(r.date).toLocaleDateString("en-IN").replace(/\//g, '-'),
          recipientName: r.recipientName,
          studentId: "N/A", // Backend doesn't return student ID string by default in mapping, fallback to N/A
          amount: `₹${r.amount}`,
          reason: r.reason,
          status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
          processedBy: r.processedBy,
          processedDate: r.processedDate ? new Date(r.processedDate).toLocaleDateString("en-IN").replace(/\//g, '-') : "-",
          fees: r.fees || 0,
          securityDeposit: r.securityDeposit || 0,
          deduction: r.deduction || 0,
          deductionReason: r.deductionReason || "",
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
       

        {/* Initiate New Refund Form */}
        <div
          className="rounded-2xl p-6 mb-10"
          style={{
            backgroundColor: "#BEC5AD",
            boxShadow: "0px 4px 20px 0px rgba(0, 0, 0, 0.25) inset",
          }}
        >
          <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
            <CreditCard size={22} />
            Initiate New Refund
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-black mb-2 block">
                Student / Resident ID
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  placeholder="Enter Student ID / Resident ID"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border ${
                    formErrors.studentId ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
                />
              </div>
              {formErrors.studentId && (
                <p className="text-red-500 text-xs mt-1">{formErrors.studentId}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-black mb-2 block">
                Refund Amount
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="refundAmount"
                  value={formData.refundAmount}
                  onChange={handleInputChange}
                  placeholder="Enter Amount"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border ${
                    formErrors.refundAmount ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
                />
              </div>
              {formErrors.refundAmount && (
                <p className="text-red-500 text-xs mt-1">{formErrors.refundAmount}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-black mb-2 block">
                Reason For Refund
              </label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Enter Reason"
                className={`w-full px-4 py-2.5 rounded-lg bg-white border ${
                  formErrors.reason ? "border-red-500" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
              />
              {formErrors.reason && (
                <p className="text-red-500 text-xs mt-1">{formErrors.reason}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-black mb-2 block">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg bg-white border ${
                  formErrors.paymentMethod ? "border-red-500" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-700`}
              >
                <option value="">Select Method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
              {formErrors.paymentMethod && (
                <p className="text-red-500 text-xs mt-1">{formErrors.paymentMethod}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-black mb-2 block">Fees</label>
              <input
                type="text"
                name="fees"
                value={formData.fees}
                onChange={handleInputChange}
                placeholder="Enter Fees"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-black mb-2 block">Security Deposit</label>
              <input
                type="text"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleInputChange}
                placeholder="Enter Security Deposit"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-black mb-2 block">Deduction</label>
              <input
                type="text"
                name="deduction"
                value={formData.deduction}
                onChange={handleInputChange}
                placeholder="Enter Deduction"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-black mb-2 block">Deduction Reason</label>
              <input
                type="text"
                name="deductionReason"
                value={formData.deductionReason}
                onChange={handleInputChange}
                placeholder="Enter Deduction Reason"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={handleCancel}
              className="bg-white cursor-pointer px-8 py-2 rounded-xl font-bold text-black hover:bg-gray-100 transition-all duration-300 shadow-md"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToPay}
              className="bg-white cursor-pointer text-black px-8 py-2 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-md"
            >
              Proceed To Pay
            </button>
          </div>
        </div>

        {/* Refund History Section */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "#BEC5AD",
            boxShadow: "0px 4px 20px 0px rgba(0, 0, 0, 0.25) inset",
          }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-3">
            <h2 className="text-xl font-semibold text-black flex items-center gap-2">
              <Clock size={20} />
              Refund History
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search refunds..."
                  className="w-full sm:w-80 pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-green-600 transition-all duration-300 shadow-md"
              >
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.status || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax) && (
            <div className="mb-4 p-3 bg-white rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
                {filters.status && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                    Status: {filters.status}
                  </span>
                )}
                {filters.dateFrom && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                    <Calendar size={12} /> From: {filters.dateFrom}
                  </span>
                )}
                {filters.dateTo && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                    <Calendar size={12} /> To: {filters.dateTo}
                  </span>
                )}
                {filters.amountMin && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Min: ₹{filters.amountMin}
                  </span>
                )}
                {filters.amountMax && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Max: ₹{filters.amountMax}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs hover:bg-red-200 transition-colors flex items-center gap-1"
                >
                  <X size={12} /> Clear All
                </button>
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-gray-500" size={32} />
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white rounded-lg">
                    <th className="px-4 py-3 rounded-tl-lg text-sm font-semibold text-gray-700">Refund ID</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Fees</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Security Deposit</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Deduction</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Refund Amount</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Reason</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg text-sm font-semibold text-gray-700">Processed By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRefunds.length > 0 ? (
                    filteredRefunds.map((refund, idx) => (
                      <tr key={idx} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{refund.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{refund.date}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {refund.recipientName}
                          <div className="text-xs text-gray-500 font-normal">{refund.studentId}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">₹{refund.fees}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">₹{refund.securityDeposit}</td>
                        <td className="px-4 py-3 text-sm text-red-600">
                          ₹{refund.deduction}
                          {refund.deductionReason && (
                            <div className="text-[10px] text-gray-500 italic leading-tight">{refund.deductionReason}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">{refund.amount}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{refund.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(refund.status)}`}>
                            {getStatusIcon(refund.status)}
                            {refund.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{refund.processedBy}</td>
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
            ) : filteredRefunds.length > 0 ? (
              filteredRefunds.map((refund, idx) => (
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
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Fees</span>
                      <p className="text-sm">₹{refund.fees}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Security Deposit</span>
                      <p className="text-sm text-gray-800">₹{refund.securityDeposit}</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Deduction</span>
                    <p className="text-sm text-red-600 font-medium">₹{refund.deduction}</p>
                    {refund.deductionReason && (
                      <p className="text-[10px] text-gray-500 italic mt-0.5">{refund.deductionReason}</p>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Refund Reason</span>
                    <p className="text-sm">{refund.reason}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Processed By</span>
                    <p className="text-sm">{refund.processedBy}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600 bg-white rounded-xl">
                No refunds found matching your search criteria.
              </div>
            )}
          </div>
          
          {/* Total results info */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Showing {filteredRefunds.length} of {refundHistory.length} refunds
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
};

export default Refunds;