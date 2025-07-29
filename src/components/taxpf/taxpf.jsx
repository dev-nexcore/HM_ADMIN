"use client"

import { useState } from "react"

const staffData = [
  {
    name: "Chimney Gowande",
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
    name: "Chimney Gowande",
    role: "Warden",
    basicSalary: "₹25,000",
    tax: "₹25,000",
    pf: "₹25,000",
    loanDeduction: "₹25,000",
    netSalary: "₹25,000",
    status: "Paid",
  },
  {
    name: "Chimney Gowande",
    role: "Warden",
    basicSalary: "₹25,000",
    tax: "₹25,000",
    pf: "₹25,000",
    loanDeduction: "₹25,000",
    netSalary: "₹25,000",
    status: "Paid",
  },
]

export default function TaxPf() {
  const [selectedMonth, setSelectedMonth] = useState("September 2025")

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with red line */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-red-500"></div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff Salary</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl shadow-xl p-8 border-none" style={{ backgroundColor: "#ADCE8C" }}>
            <div className="text-lg text-center font-semibold text-black mb-3">Total PAYROLL COST</div>
            <hr className="border-gray-600 mb-4" />
            <div className="text-2xl text-center font-bold text-gray-900">₹ 1,20,000</div>
          </div>

          <div className="rounded-lg p-8 border-none" style={{ backgroundColor: "#ADCE8C" }}>
            <div className="text-lg text-center font-semibold text-black mb-3">Total DEDUCTIONS</div>
            <hr className="border-gray-600 mb-4" />
            <div className="text-2xl text-center font-bold text-gray-900">₹ 15,000</div>
          </div>

          <div className="rounded-lg p-8 border-none" style={{ backgroundColor: "#ADCE8C" }}>
            <div className="text-lg text-center font-semibold text-black mb-3">Total PAYOUT</div>
            <hr className="border-gray-600 mb-4" />
            <div className="text-2xl text-center font-bold text-gray-900">₹ 1,05,000</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-5">
          <button
            className="px-4 py-2 rounded-md text-gray-900 border-none text-sm font-semibold cursor-pointer shadow-md hover:opacity-90"
            style={{ backgroundColor: "#ADCE8C" }}
          >
            Payroll Management
          </button>
          <button
            className="px-4 py-2 rounded-md text-gray-900 border-none text-sm font-semibold cursor-pointer shadow-md hover:opacity-90"
            style={{ backgroundColor: "#BEC5AD" }}
          >
            Tax PF & Loan Distribution
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-48 px-3 py-2 border border-gray-300 rounded-md font-semibold text-sm cursor-pointer"
              style={{ backgroundColor: "#ADCE8C" }}
            >
              <option value="September 2025">September 2025</option>
              <option value="August 2025">August 2025</option>
              <option value="July 2025">July 2025</option>
            </select>
          </div>

          <div className="flex items-center gap-5">
            <button className="px-4 py-2 bg-[#7BAC4A] text-black shadow-lg font-semibold border-none rounded-md text-sm cursor-pointer hover:bg-green-700">
              Add new deduction
            </button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="rounded-lg overflow-hidden border border-gray-300" style={{ backgroundColor: "#BEC5AD" }}>
          <style jsx>{`
            .custom-table th {
              position: relative;
            }
            .custom-table th:not(:last-child)::after {
              content: '';
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
              content: '';
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
    <td colSpan="9" className="py-2"></td> {/* spacer row */}
  </tr>
              <tr className="bg-white">
                <th className="font-bold text-gray-900 px-4 py-4 text-center">Staff Name</th>
                <th className="font-bold text-gray-900 px-4 py-4 text-center">Department</th>
                <th className="font-bold text-gray-900 px-4 py-4 text-center">Tax Deducted</th>
                <th className="font-bold text-gray-900 px-4 py-4 text-center">PF Deducted</th>
                <th className="font-bold text-gray-900 px-4 py-4 text-center">Loan Deducted</th>
                <th className="font-bold text-gray-900 px-4 py-4 text-center">Total Deduction</th>
                <th className="font-bold text-gray-900 px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffData.map((staff, index) => (
                <tr key={index} className="relative">
                  <td className="px-4 py-5 font-medium text-center">{staff.name}</td>
                  <td className="px-4 py-5 text-center">{staff.role}</td>
                  <td className="px-4 py-5 text-center">{staff.basicSalary}</td>
                  <td className="px-4 py-5 text-center">{staff.loanDeduction}</td>
                  <td className="px-4 py-5 text-center">{staff.netSalary}</td>
                  <td className="px-4 py-5 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium text-white ${
                        staff.status === "Paid" ? "bg-[#28C404]" : "bg-[#FF7700]"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <button className="bg-transparent border-none text-blue-600 cursor-pointer text-sm hover:text-blue-800">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
