"use client"
import { useState } from "react"
const staffMembers = ["Chimney Gowande", "Sullivan Khan", "John Doe", "Jane Smith", "Mike Johnson"]

export default function ProcessStaffSalary() {
  const [formData, setFormData] = useState({
    staffMember: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    amountToPay: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCancel = () => {
    setFormData({
      staffMember: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      amountToPay: "",
    })
  }

  const handleProceedToPay = () => {
    console.log("Processing payment:", formData)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with red line */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <div className="w-1 h-6 bg-red-500"></div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Process Staff Salary</h1>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl p-6 sm:p-8 shadow-sm" style={{ backgroundColor: "#ADCE8C" }}>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 sm:mb-8">Enter Staff Payment Details</h2>

          <div className="space-y-5 sm:space-y-6">
            {/* Select Staff Member */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-semibold text-gray-900 mb-2 w-4/5 max-w-md">
                Select Staff member
              </label>
              <select
                value={formData.staffMember}
                onChange={(e) => handleInputChange("staffMember", e.target.value)}
                className="w-4/5 max-w-md mx-auto px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 12px center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "16px",
                }}
              >
                <option value="">Select Staff</option>
                {staffMembers.map((member, index) => (
                  <option key={index} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            {/* Bank Name */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-semibold text-gray-900 mb-2 w-4/5 max-w-md">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleInputChange("bankName", e.target.value)}
                placeholder="Enter Bank Name"
                className="w-4/5 max-w-md mx-auto px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Account Number */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-semibold text-gray-900 mb-2 w-4/5 max-w-md">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                placeholder="Enter Account number"
                className="w-4/5 max-w-md mx-auto px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* IFSC Code */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-semibold text-gray-900 mb-2 w-4/5 max-w-md">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                placeholder="Enter IFSC Code"
                className="w-4/5 max-w-md mx-auto px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Amount To Pay */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-semibold text-gray-900 mb-2 w-4/5 max-w-md">Amount To Pay (₹)</label>
              <input
                type="number"
                value={formData.amountToPay}
                onChange={(e) => handleInputChange("amountToPay", e.target.value)}
                placeholder="Enter Amount To Pay"
                className="w-4/5 max-w-md mx-auto px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
              <button
                onClick={handleCancel}
                className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg text-base font-semibold hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPay}
                className="px-8 py-3 text-white rounded-lg text-base font-semibold hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                style={{ backgroundColor: "#BEC5AD" }}
              >
                Proceed To Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
