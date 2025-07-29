"use client"
import { useState } from "react"

const staffData = [
  {
    name: "Chinmay Gawade",
    role: "Warden",
    basicSalary: "₹25,000",
    tax: "₹25,000",
    pf: "₹25,000",
    loanDeduction: "₹25,000",
    netSalary: "₹25,000",
    status: "Paid",
  },
  {
    name: "Sullivan Khan",
    role: "Warden",
    basicSalary: "₹25,000",
    tax: "₹25,000",
    pf: "₹25,000",
    loanDeduction: "₹25,000",
    netSalary: "₹25,000",
    status: "Pending",
  },
  {
    name: "Chinmay Gawade",
    role: "Warden",
    basicSalary: "₹25,000",
    tax: "₹25,000",
    pf: "₹25,000",
    loanDeduction: "₹25,000",
    netSalary: "₹25,000",
    status: "Paid",
  },
  {
    name: "Chinmay Gawade",
    role: "Warden",
    basicSalary: "₹25,000",
    tax: "₹25,000",
    pf: "₹25,000",
    loanDeduction: "₹25,000",
    netSalary: "₹25,000",
    status: "Paid",
  },
]

const staffMembers = ["Chimney Gowande", "Sullivan Khan", "John Doe", "Jane Smith", "Mike Johnson"]

export default function StaffSalaryContent() {
  const [selectedMonth, setSelectedMonth] = useState("September 2025")
  const [activeTab, setActiveTab] = useState("payroll")
  const [showProcessSalary, setShowProcessSalary] = useState(false)
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

  const handleBackToSalary = () => {
    setShowProcessSalary(false)
  }

  const renderProcessSalaryForm = () => (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with red line and back button */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <button
            onClick={handleBackToSalary}
            className="mr-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            ← Back
          </button>
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

  const renderPayrollTable = () => (
    <div className="w-full overflow-x-auto">
      <div
        className="rounded-lg overflow-hidden border border-gray-300 min-w-[800px]"
        style={{ backgroundColor: "#BEC5AD", boxShadow: "0px 4px 20px 0px #00000040 inset" }}
      >
        <style jsx>{`
          .custom-table th {
            position: relative;
            background-color: white !important;
          }
          .custom-table th:not(:last-child)::after {
            content: "";
            position: absolute;
            right: 0;
            top: 8px;
            bottom: 8px;
            width: 1px;
            background-color: #9ca3af;
          }
          .custom-table tbody tr:not(:last-child) {
            border-bottom: 1px solid #9ca3af;
            border-left: 16px solid transparent;
            border-right: 16px solid transparent;
          }
          .custom-table tbody tr:not(:last-child)::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 16px;
            right: 16px;
            height: 1px;
            background-color: #00000;
          }
        `}</style>
        <table className="custom-table w-full border-collapse">
          <thead>
            <tr>
              <td colSpan="9" className="py-2">
                &nbsp;
              </td>
            </tr>
            <tr className="bg-white">
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Name
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Role
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Basic Salary
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">Tax</th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">PF</th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Loan Deduction
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Net Salary
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Status
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {staffData.map((staff, index) => (
              <tr key={index} className="relative">
                <td className="px-2 sm:px-4 py-3 sm:py-5 font-medium text-center text-xs sm:text-sm">{staff.name}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.role}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.basicSalary}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.tax}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.pf}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.loanDeduction}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.netSalary}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center">
                  <span
                    className={`px-1 sm:px-2 py-1 rounded text-xs font-medium text-white ${
                      staff.status === "Paid" ? "bg-[#28C404]" : "bg-[#FF7700]"
                    }`}
                  >
                    {staff.status}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center">
                  <button className="bg-transparent border-none text-blue-600 cursor-pointer text-xs sm:text-sm hover:text-blue-800">
                    View pay slip
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderTaxPfTable = () => (
    <div className="w-full overflow-x-auto">
      <div
        className="rounded-lg overflow-hidden border border-gray-300 min-w-[700px]"
        style={{ backgroundColor: "#BEC5AD", boxShadow: "0px 4px 20px 0px #00000040 inset" }}
      >
        <style jsx>{`
          .custom-table th {
            position: relative;
            background-color: white !important;
          }
          .custom-table th:not(:last-child)::after {
            content: "";
            position: absolute;
            right: 0;
            top: 8px;
            bottom: 8px;
            width: 1px;
            background-color: #9ca3af;
          }
          .custom-table tbody tr:not(:last-child) {
            border-bottom: 1px solid #9ca3af;
            border-left: 16px solid transparent;
            border-right: 16px solid transparent;
          }
          .custom-table tbody tr:not(:last-child)::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 16px;
            right: 16px;
            height: 1px;
            background-color: #00000;
          }
        `}</style>
        <table className="custom-table w-full border-collapse">
          <thead>
            <tr>
              <td colSpan="7" className="py-2">
                &nbsp;
              </td>
            </tr>
            <tr className="bg-white">
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Staff Name
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Department
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Tax Deducted
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                PF Deducted
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Loan Deducted
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Total Deduction
              </th>
              <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center bg-white text-xs sm:text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {staffData.map((staff, index) => (
              <tr key={index} className="relative">
                <td className="px-2 sm:px-4 py-3 sm:py-5 font-medium text-center text-xs sm:text-sm">{staff.name}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.role}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.tax}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.pf}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.loanDeduction}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.netSalary}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-5 text-center">
                  <button className="bg-transparent border-none text-[#1109FF] cursor-pointer text-xs sm:text-sm hover:text-blue-800">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // If showing process salary form, render that instead
  if (showProcessSalary) {
    return renderProcessSalaryForm()
  }

  return (
    <div className="p-3 sm:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with red line */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-[#FF0000]"></div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Staff Salary</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="rounded-xl shadow-xl p-4 sm:p-8 border-none" style={{ backgroundColor: "#ADCE8C" }}>
            <div className="text-lg sm:text-xl text-center font-semibold text-black mb-3">Total PAYROLL COST</div>
            <hr className="border-gray-600 mb-4" />
            <div className="text-xl sm:text-2xl text-center font-bold text-gray-900">₹ 1,20,000</div>
          </div>
          <div className="rounded-lg p-4 sm:p-8 shadow-xl border-none" style={{ backgroundColor: "#ADCE8C" }}>
            <div className="text-lg sm:text-xl text-center font-semibold text-black mb-3">Total DEDUCTIONS</div>
            <hr className="border-gray-600 mb-4" />
            <div className="text-xl sm:text-2xl text-center font-bold text-gray-900">₹ 15,000</div>
          </div>
          <div className="rounded-lg p-4 sm:p-8 shadow-xl border-none" style={{ backgroundColor: "#ADCE8C" }}>
            <div className="text-lg sm:text-xl text-center font-semibold text-black mb-3">Total PAYOUT</div>
            <hr className="border-gray-600 mb-4" />
            <div className="text-xl sm:text-2xl text-center font-bold text-gray-900">₹ 1,05,000</div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
          <button
            onClick={() => setActiveTab("payroll")}
            className={`cursor-pointer px-3 sm:px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 shadow-[0_6px_4px_-1px_rgba(0,0,0,0.6)] ${
              activeTab === "payroll" ? "bg-[#ADCE8C] text-black" : "bg-[#BEC5AD] text-black"
            }`}
          >
            Payroll Management
          </button>
          <button
            onClick={() => setActiveTab("taxpf")}
            className={`cursor-pointer px-3 sm:px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 shadow-[0_6px_4px_-1px_rgba(0,0,0,0.6)] ${
              activeTab === "taxpf" ? "bg-[#ADCE8C] text-black" : "bg-[#BEC5AD] text-black"
            }`}
          >
            Tax,PF & Loan Distribution
          </button>
        </div>

        <hr className="mb-3 sm:mb-5 text-gray-500" />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-48 px-3 py-3 border border-gray-300 rounded-md font-semibold text-xs sm:text-sm cursor-pointer shadow-lg"
              style={{ backgroundColor: "#ADCE8C" }}
            >
              <option value="September 2025">September 2025</option>
              <option value="August 2025">August 2025</option>
              <option value="July 2025">July 2025</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
            {activeTab === "payroll" ? (
              <>
                <button className="px-3 sm:px-4 py-2 text-[#7BAC4A] font-semibold shadow-lg rounded-md text-xs sm:text-sm cursor-pointer">
                  Generate Pay Slips
                </button>
                <button className="px-3 sm:px-4 py-2 bg-transparent text-[#7BAC4A] font-semibold shadow-lg rounded-md text-xs sm:text-sm cursor-pointer">
                  Export Report
                </button>
                <button
                  onClick={() => setShowProcessSalary(true)}
                  className="px-3 sm:px-4 py-2 bg-[#ADCE8C] text-black shadow-lg font-semibold border-none rounded-md text-xs sm:text-sm cursor-pointer hover:bg-[#9CAF88] transition-colors"
                >
                  Process Salary
                </button>
              </>
            ) : (
              <button className="px-3 sm:px-4 py-2 bg-[#ADCE8C] text-black shadow-lg font-semibold border-none rounded-md text-xs sm:text-sm cursor-pointer">
                Add New Deduction
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Table Content */}
        {activeTab === "payroll" ? renderPayrollTable() : renderTaxPfTable()}
      </div>
    </div>
  )
}
