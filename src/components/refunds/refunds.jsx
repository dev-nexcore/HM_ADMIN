"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"

const Refunds = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    refundAmount: "",
    reason: "",
    paymentMethod: "",
  })

  const [searchTerm, setSearchTerm] = useState("")

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
      date: "25-10-2025",
      recipientName: "Chinmay Gawade",
      amount: "₹500",
      reason: "Overpayment",
      status: "Pending",
      processedBy: "Admin A",
    },
    {
      date: "25-10-2025",
      recipientName: "Chinmay Gawade",
      amount: "₹500",
      reason: "Overpayment",
      status: "Rejected",
      processedBy: "Admin A",
    },
    {
      date: "25-10-2025",
      recipientName: "Chinmay Gawade",
      amount: "₹500",
      reason: "Overpayment",
      status: "Completed",
      processedBy: "Admin A",
    },
    {
      date: "25-10-2025",
      recipientName: "Chinmay Gawade",
      amount: "₹500",
      reason: "Overpayment",
      status: "Rejected",
      processedBy: "Admin A",
    },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancel = () => {
    setFormData({
      studentId: "",
      refundAmount: "",
      reason: "",
      paymentMethod: "",
    })
  }

  const handleProceedToPay = () => {
    console.log("Processing refund:", formData)
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold"
    switch (status) {
      case "Completed":
        return `${baseClasses} bg-green-500 text-white`
      case "Pending":
        return `${baseClasses} bg-red-500 text-white`
      case "Rejected":
        return `${baseClasses} bg-orange-500 text-white`
      default:
        return `${baseClasses} bg-gray-500 text-white`
    }
  }

  return (
    <div className="flex flex-col gap-8 p-8 bg-white min-h-screen w-full">
      <h1 className="text-xl font-bold text-black">Refunds</h1>

      {/* Initiate New Refund */}
      <div
        className="rounded-lg px-8 py-6"
        style={{
          backgroundColor: "#BEC5AD",
          boxShadow: "0px 4px 20px 0px #00000040 inset",
        }}
      >
        <h2 className="text-xl font-semibold text-black mb-6">Initiate New Refund</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="text-sm font-medium text-black mb-2 block">Student / Resident ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              placeholder="Enter Student ID/ Resident ID"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-2 block">Refund Amount</label>
            <input
              type="text"
              name="refundAmount"
              value={formData.refundAmount}
              onChange={handleInputChange}
              placeholder="Enter Amount"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-2 block">Reason For Refund</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Enter Reason"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-2 block">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select Method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCancel}
            className="bg-white border border-gray-400 px-6 py-2 rounded-md font-medium text-black hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleProceedToPay}
            className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-900"
          >
            Proceed To Pay
          </button>
        </div>
      </div>

      {/* Refund History */}
      <div
        className="rounded-lg px-6 py-4"
        style={{
          backgroundColor: "#BEC5AD",
          boxShadow: "0px 4px 20px 0px #00000040 inset",
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
          <h2 className="text-lg font-semibold text-black">Refund History</h2>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search For Refunds"
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button className="flex items-center gap-2 bg-[#50B848] text-white px-4 py-2 rounded-md hover:bg-green-600">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-md overflow-hidden text-sm text-left">
            <thead className="bg-[#BEC5AD] text-black">
              <tr>
                <th className="px-4 py-3 border border-gray-300">Date</th>
                <th className="px-4 py-3 border border-gray-300">Recipient Name</th>
                <th className="px-4 py-3 border border-gray-300">Amount</th>
                <th className="px-4 py-3 border border-gray-300">Reason</th>
                <th className="px-4 py-3 border border-gray-300">Status</th>
                <th className="px-4 py-3 border border-gray-300">Processed By</th>
              </tr>
            </thead>
            <tbody className="bg-white text-black">
              {refundHistory.map((refund, idx) => (
                <tr key={idx} className="border-t border-gray-200">
                  <td className="px-4 py-3 border border-gray-300">{refund.date}</td>
                  <td className="px-4 py-3 border border-gray-300">{refund.recipientName}</td>
                  <td className="px-4 py-3 border border-gray-300">{refund.amount}</td>
                  <td className="px-4 py-3 border border-gray-300">{refund.reason}</td>
                  <td className="px-4 py-3 border border-gray-300">
                    <span className={getStatusBadge(refund.status)}>{refund.status}</span>
                  </td>
                  <td className="px-4 py-3 border border-gray-300">{refund.processedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Refunds
