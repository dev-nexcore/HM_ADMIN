"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";

const Refunds = () => {
  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    refundAmount: "",
    reason: "",
    paymentMethod: "",
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

  // Sample refund history data
  const refundHistory = [
    {
      date: "25-10-2025",
      recipientName: "Chinmay Gawade",
      amount: "₹500",
      reason: "Overpayment",
      status: "Completed",
      processedBy: "Admin A",
    },
    {
      date: "26-10-2025",
      recipientName: "Sullivan Khan",
      amount: "₹750",
      reason: "Course Cancellation",
      status: "Pending",
      processedBy: "Admin B",
    },
    {
      date: "27-10-2025",
      recipientName: "Priya Sharma",
      amount: "₹300",
      reason: "Duplicate Payment",
      status: "Rejected",
      processedBy: "Admin A",
    },
    {
      date: "28-10-2025",
      recipientName: "Rahul Verma",
      amount: "₹1200",
      reason: "Overpayment",
      status: "Completed",
      processedBy: "Admin C",
    },
    {
      date: "29-10-2025",
      recipientName: "Anita Desai",
      amount: "₹450",
      reason: "Service Not Provided",
      status: "Pending",
      processedBy: "Admin B",
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
    } else if (!/^₹?\d+(,\d{3})*(\.\d{2})?$/.test(formData.refundAmount)) {
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

    // Clear error when field is changed
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
    });
    setFormErrors({
      studentId: "",
      refundAmount: "",
      reason: "",
      paymentMethod: "",
    });
  };

  // Submit form
  const handleProceedToPay = () => {
    if (validateForm()) {
      console.log("Processing refund:", formData);
      // Add logic to process refund
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
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const baseClasses = "px-2 sm:px-3 py-1 rounded-md text-xs font-semibold";
    switch (status) {
      case "Completed":
        return `${baseClasses} bg-[#28C404] text-white`;
      case "Pending":
        return `${baseClasses} bg-[#FF0000] text-white`;
      case "Rejected":
        return `${baseClasses} bg-[#FF7700] text-white`;
      default:
        return `${baseClasses} bg-gray-500 text-white`;
    }
  };

  // Date parsing helper
  const parseDate = (dateString) => {
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
      refund.amount.includes(searchTerm);

    const matchesStatus = !filters.status || refund.status === filters.status;
    const matchesDateFrom =
      !filters.dateFrom || parseDate(refund.date) >= new Date(filters.dateFrom);
    const matchesDateTo =
      !filters.dateTo || parseDate(refund.date) <= new Date(filters.dateTo);

    const refundAmount = Number.parseInt(
      refund.amount.replace("₹", "").replace(",", "")
    );
    const matchesAmountMin =
      !filters.amountMin || refundAmount >= Number.parseInt(filters.amountMin);
    const matchesAmountMax =
      !filters.amountMax || refundAmount <= Number.parseInt(filters.amountMax);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesAmountMin &&
      matchesAmountMax
    );
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-8 bg-white min-h-screen w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mt-1">
        <div className=" w-1 h-6 bg-[#4F8CCF]"></div>
        <h1 className="text-xl sm:text-2xl font-bold text-black">Refunds</h1>
      </div>

      {/* Initiate New Refund Form */}
    <div
  className="rounded-lg px-4 sm:px-6 py-6 mx-auto"
  style={{
    backgroundColor: "#A4B494",
    boxShadow: "0px 4px 20px 0px #00000040 inset",
    width: "95%",
    maxWidth: "1000px", // Adjusted container width
  }}
>
  <h2 className="text-lg sm:text-xl lg:text-2xl pt-3 font-bold text-black mb-6 pl-10">
    Initiate New Refund
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 justify-items-center">
    <div className="w-full max-w-[370px]"> 
      <label
        htmlFor="studentId"
        className="text-sm sm:text-md font-bold text-black mb-2 block"
      >
        Student / Resident ID
      </label>
      <input
        id="studentId"
        type="text"
        name="studentId"
        value={formData.studentId}
        onChange={handleInputChange}
        placeholder="Enter Student ID/ Resident ID"
        className={`w-full bg-white px-3 sm:px-4 py-2 rounded-lg border ${
          formErrors.studentId ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base`}
      />
      {formErrors.studentId && (
        <p className="text-red-500 text-xs mt-1">
          {formErrors.studentId}
        </p>
      )}
    </div>
    <div className="w-full max-w-[370px]"> 
      <label
        htmlFor="refundAmount"
        className="text-sm sm:text-md font-bold text-black mb-2 block"
      >
        Refund Amount
      </label>
      <input
        id="refundAmount"
        type="text"
        name="refundAmount"
        value={formData.refundAmount}
        onChange={handleInputChange}
        placeholder="Enter Amount"
        className={`w-full bg-white px-3 sm:px-4 py-2 rounded-lg border ${
          formErrors.refundAmount ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base`}
      />
      {formErrors.refundAmount && (
        <p className="text-red-500 text-xs mt-1">
          {formErrors.refundAmount}
        </p>
      )}
    </div>

    {/* Reason Input */}
    <div className="w-full max-w-[370px]"> 
      <label
        htmlFor="reason"
        className="text-sm sm:text-md font-bold text-black mb-2 block"
      >
        Reason For Refund
      </label>
      <input
        id="reason"
        type="text"
        name="reason"
        value={formData.reason}
        onChange={handleInputChange}
        placeholder="Enter Reason"
        className={`w-full bg-white px-3 sm:px-4 py-2 rounded-lg border ${
          formErrors.reason ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base`}
      />
      {formErrors.reason && (
        <p className="text-red-500 text-xs mt-1">{formErrors.reason}</p>
      )}
    </div>

    {/* Payment Method Select */}
    <div className="w-full max-w-[370px]"> 
      <label
        htmlFor="paymentMethod"
        className="text-sm sm:text-md font-bold text-black mb-2 block"
      >
        Payment Method
      </label>
      <select
        id="paymentMethod"
        name="paymentMethod"
        value={formData.paymentMethod}
        onChange={handleInputChange}
        className={`w-full text-gray-500 bg-white px-3 sm:px-4 py-2.5 rounded-lg border ${
          formErrors.paymentMethod ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base`}
      >
        <option value="">Select Method</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="upi">UPI</option>
        <option value="cash">Cash</option>
        <option value="cheque">Cheque</option>
      </select>
      {formErrors.paymentMethod && (
        <p className="text-red-500 text-xs mt-1">
          {formErrors.paymentMethod}
        </p>
      )}
    </div>
  </div>
  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-5 mb-5">
    <button
      onClick={handleCancel}
      className="bg-white cursor-pointer border border-gray-400 px-6 sm:px-8 py-2 rounded-xl font-bold text-black hover:bg-gray-100 text-sm sm:text-base shadow-[0px_4px_20px_0px_#0000001A]"
    >
      Cancel
    </button>
    <button
      onClick={handleProceedToPay}
      className="bg-white cursor-pointer text-black px-6 sm:px-8 py-2 rounded-xl font-bold hover:bg-gray-100 text-sm sm:text-base shadow-[0px_4px_20px_0px_#0000001A]"
    >
      Proceed To Pay
    </button>
  </div>
</div>

      {/* Refund History Section */}
      <div
        className="rounded-lg px-4 sm:px-6 py-4"
        style={{
          backgroundColor: "#A4B494",
          boxShadow: "0px 4px 20px 0px #00000040 inset",
        }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-semibold pl-0 sm:pl-10 text-black">
            Refund History
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search For Refunds"
                className="w-full sm:w-64 lg:w-80 pl-3 pr-4 py-1.5 rounded-md bg-white border border-[#BAC2A7] text-black focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
              />
              <Search className="absolute right-8 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className="ml-2 mr-7 flex items-center justify-center gap-2 sm:gap-4 bg-[#28C404] text-white px-4 sm:px-6 py-1.5 cursor-pointer rounded-md font-semibold text-sm sm:text-base hover:bg-[#22A803] transition-colors shadow-[0px_4px_20px_0px_#00000040]"
            >
              <svg
                width="18"
                height="12"
                viewBox="0 0 24 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.5 15.5V13H14.5V15.5H9.5ZM4.5 9.25V6.75H19.5V9.25H4.5ZM0.75 3V0.5H23.25V3H0.75Z"
                  fill="white"
                />
              </svg>
              Filter
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.status ||
          filters.dateFrom ||
          filters.dateTo ||
          filters.amountMin ||
          filters.amountMax) && (
          <div className="mb-4 p-3 bg-white rounded-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                Active Filters:
              </span>
              {filters.status && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Status: {filters.status}
                </span>
              )}
              {filters.dateFrom && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  From: {filters.dateFrom}
                </span>
              )}
              {filters.dateTo && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  To: {filters.dateTo}
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
                className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs hover:bg-red-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Refunds Table */}
        <div className="overflow-x-auto">
  <style jsx>{`
    .refund-table th {
      position: relative;
    }
    .refund-table th:not(:last-child)::after {
      content: "";
      position: absolute;
      right: 0;
      top: 6px;
      bottom: 6px;
      width: 1px;
      background-color: #000000;
    }
    @media (max-width: 640px) {
      .refund-table {
        display: none;
      }
      .refund-card {
        display: block;
      }
    }
    @media (min-width: 641px) {
      .refund-card {
        display: none;
      }
    }
  `}</style>

  {/* Table View (Desktop & Tablet) */}
  <table className="refund-table w-full bg-[#A4B494] rounded-md overflow-hidden text-xs sm:text-sm text-left border-separate border-spacing-0 min-w-[600px]">
    <thead>
      <tr className="text-black">
        <th className="px-2 sm:px-4 py-2 bg-white font-bold">Date</th>
        <th className="px-2 sm:px-4 py-2 bg-white font-bold">Recipient Name</th>
        <th className="px-2 sm:px-4 py-2 bg-white font-bold">Amount</th>
        <th className="px-2 sm:px-4 py-2 bg-white font-bold">Reason</th>
        <th className="px-2 sm:px-4 py-2 bg-white font-bold">Status</th>
        <th className="px-2 sm:px-4 py-2 bg-white font-bold">Processed By</th>
      </tr>
    </thead>
    <tbody className="text-black">
      {filteredRefunds.length > 0 ? (
        filteredRefunds.map((refund, idx) => (
          <tr key={idx} className="hover:bg-[#9BA085] transition-colors duration-200">
            <td className="px-2 sm:px-4 py-2">{refund.date}</td>
            <td className="px-2 sm:px-4 py-2">{refund.recipientName}</td>
            <td className="px-2 sm:px-4 py-2">{refund.amount}</td>
            <td className="px-2 sm:px-4 py-2">{refund.reason}</td>
            <td className="px-2 sm:px-4 py-2">
              <span className={getStatusBadge(refund.status)}>{refund.status}</span>
            </td>
            <td className="px-2 sm:px-4 py-2">{refund.processedBy}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={6} className="px-4 py-8 text-center text-gray-600">
            No refunds found matching your search criteria.
          </td>
        </tr>
      )}
    </tbody>
  </table>

  {/* Card View (Mobile Only) */}
  <div className="refund-card space-y-4">
    {filteredRefunds.length > 0 ? (
      filteredRefunds.map((refund, idx) => (
        <div key={idx} className="bg-[#A4B494] rounded-md p-4 text-sm shadow-md">
          <div className="mb-2">
            <strong>Date:</strong> {refund.date}
          </div>
          <div className="mb-2">
            <strong>Recipient Name:</strong> {refund.recipientName}
          </div>
          <div className="mb-2">
            <strong>Amount:</strong> {refund.amount}
          </div>
          <div className="mb-2">
            <strong>Reason:</strong> {refund.reason}
          </div>
          <div className="mb-2">
            <strong>Status:</strong>{" "}
            <span className={getStatusBadge(refund.status)}>{refund.status}</span>
          </div>
          <div>
            <strong>Processed By:</strong> {refund.processedBy}
          </div>
        </div>
      ))
    ) : (
      <div className="text-center text-gray-600 py-8">
        No refunds found matching your search criteria.
      </div>
    )}
  </div>
</div>

      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black">Filter Refunds</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close filter modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="filterStatus"
                  className="block text-sm font-bold text-black mb-2"
                >
                  Status
                </label>
                <select
                  id="filterStatus"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="dateFrom"
                  className="block text-sm font-bold text-black mb-2"
                >
                  Date From
                </label>
                <input
                  id="dateFrom"
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label
                  htmlFor="dateTo"
                  className="block text-sm font-bold text-black mb-2"
                >
                  Date To
                </label>
                <input
                  id="dateTo"
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label
                  htmlFor="amountRange"
                  className="block text-sm font-bold text-black mb-2"
                >
                  Amount Range
                </label>
                <div id="amountRange" className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="amountMin"
                    value={filters.amountMin}
                    onChange={handleFilterChange}
                    placeholder="Min Amount"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="number"
                    name="amountMax"
                    value={filters.amountMax}
                    onChange={handleFilterChange}
                    placeholder="Max Amount"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 bg-[#28C404] text-white rounded-md hover:bg-[#22A803]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refunds;
