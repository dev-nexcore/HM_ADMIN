"use client"

import { useState } from "react"

export default function StaffSalaryContent() {
  // Staff data 
  const [staffData, setStaffData] = useState([
    {
      id: 1,
      name: "Chinmay Gawade",
      role: "Warden",
      basicSalary: "₹25,000",
      tax: "₹2,500",
      pf: "₹1,500",
      loanDeduction: "₹1,000",
      netSalary: "₹20,000",
      status: "Paid",
    },
    {
      id: 2,
      name: "Sullivan Khan",
      role: "Warden",
      basicSalary: "₹25,000",
      tax: "₹2,500",
      pf: "₹1,500",
      loanDeduction: "₹1,000",
      netSalary: "₹20,000",
      status: "Pending",
    },
    {
      id: 3,
      name: "Chinmay Gawade",
      role: "Warden",
      basicSalary: "₹25,000",
      tax: "₹2,500",
      pf: "₹1,500",
      loanDeduction: "₹1,000",
      netSalary: "₹20,000",
      status: "Paid",
    },
    {
      id: 4,
      name: "Chinmay Gawade",
      role: "Warden",
      basicSalary: "₹25,000",
      tax: "₹2,500",
      pf: "₹1,500",
      loanDeduction: "₹1,000",
      netSalary: "₹20,000",
      status: "Paid",
    },
  ]);

  const staffMembers = ["Chimney Gowande", "Sullivan Khan", "John Doe", "Jane Smith", "Mike Johnson"];
  const [selectedMonth, setSelectedMonth] = useState("September 2025");
  const [activeTab, setActiveTab] = useState("payroll");
  const [showProcessSalary, setShowProcessSalary] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [showEditDeductionModal, setShowEditDeductionModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Process Salary Form State
  const [formData, setFormData] = useState({
    staffMember: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    amountToPay: "",
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    basicSalary: "",
    tax: "",
    pf: "",
    loanDeduction: "",
    netSalary: ""
  });

  // Validate Process Salary Form
  const validateForm = () => {
    const errors = {};
    if (!formData.staffMember) errors.staffMember = "Staff member is required";
    if (!formData.bankName) errors.bankName = "Bank name is required";
    if (!formData.accountNumber) errors.accountNumber = "Account number is required";
    if (!formData.ifscCode) errors.ifscCode = "IFSC code is required";
    if (!formData.amountToPay) errors.amountToPay = "Amount is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when field is filled
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCancel = () => {
    setFormData({
      staffMember: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      amountToPay: "",
    });
    setFormErrors({});
    setShowProcessSalary(false);
  };

  const handleProceedToPay = () => {
    if (validateForm()) {
      console.log("Processing payment:", formData);
      setShowProcessSalary(false);
    }
  };

  const handleViewPayslip = (staff) => {
    setSelectedStaff(staff);
    setShowPayslipModal(true);
  };

  // Handle Edit Deduction - Initialize form with staff data
  const handleEditDeduction = (staff) => {
    setSelectedStaff(staff);
    setEditFormData({
      basicSalary: staff.basicSalary,
      tax: staff.tax,
      pf: staff.pf,
      loanDeduction: staff.loanDeduction,
      netSalary: staff.netSalary
    });
    setShowEditDeductionModal(true);
  };

  // Handle Edit Form Changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-calculate net salary when other fields change
    if (name !== 'netSalary') {
      const basic = parseInt(editFormData.basicSalary.replace(/[^0-9]/g, '')) || 0;
      const tax = parseInt(editFormData.tax.replace(/[^0-9]/g, '')) || 0;
      const pf = parseInt(editFormData.pf.replace(/[^0-9]/g, '')) || 0;
      const loan = parseInt(editFormData.loanDeduction.replace(/[^0-9]/g, '')) || 0;
      
      const net = basic - (tax + pf + loan);
      setEditFormData(prev => ({
        ...prev,
        netSalary: `₹${net.toLocaleString('en-IN')}`
      }));
    }
  };
  // Save Edited Deductions
  const handleSaveDeductions = () => {
    setStaffData(prev => 
      prev.map(staff => 
        staff.id === selectedStaff.id 
          ? { 
              ...staff, 
              basicSalary: editFormData.basicSalary,
              tax: editFormData.tax,
              pf: editFormData.pf,
              loanDeduction: editFormData.loanDeduction,
              netSalary: editFormData.netSalary
            } 
          : staff
      )
    );
    setShowEditDeductionModal(false);
  };

  // Convert currency string to number
  const currencyToNumber = (currency) => {
    return parseInt(currency.replace(/[^0-9]/g, '')) || 0;
  };

  // Render Process Salary Form
  const renderProcessSalaryForm = () => (
    <div className="min-h-screen mt-5 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <div className="w-1 h-6 bg-[#4F8CCF]"></div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Process Staff Salary</h1>
        </div>
        <div className="rounded-2xl p-6 sm:p-8 shadow-sm w-full bg-[#A4B494]">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">Enter Staff Payment Details</h2>
          <div className="space-y-5 sm:space-y-6">
            {/* Staff select dropdown */}
            <div className="w-full">
              <label htmlFor="staffMember" className="block text-lg font-semibold text-gray-900 mb-2">
                Select Staff member
              </label>
              <select
                id="staffMember"
                value={formData.staffMember}
                onChange={(e) => handleInputChange("staffMember", e.target.value)}
                className={`cursor-pointer w-full px-4 py-3 bg-white border ${formErrors.staffMember ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8a9079]`}
              >
                <option value="">Select Staff</option>
                {staffMembers.map((member, index) => (
                  <option key={index} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              {formErrors.staffMember && <p className="text-red-500 text-sm mt-1">{formErrors.staffMember}</p>}
            </div>
            
            {/* Side-by-side on large screen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="bankName" className="block text-lg font-semibold text-gray-900 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  placeholder="Enter Bank Name"
                  className={`w-full px-4 py-3 bg-white border ${formErrors.bankName ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8a9079]`}
                />
                {formErrors.bankName && <p className="text-red-500 text-sm mt-1">{formErrors.bankName}</p>}
              </div>
              <div>
                <label htmlFor="accountNumber" className="block text-lg font-semibold text-gray-900 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  placeholder="Enter Account number"
                  className={`w-full px-4 py-3 bg-white border ${formErrors.accountNumber ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8a9079]`}
                />
                {formErrors.accountNumber && <p className="text-red-500 text-sm mt-1">{formErrors.accountNumber}</p>}
              </div>
            </div>
            
            {/* IFSC and Amount */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="ifscCode" className="block text-lg font-semibold text-gray-900 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  id="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                  placeholder="Enter IFSC Code"
                  className={`w-full px-4 py-3 bg-white border ${formErrors.ifscCode ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8a9079]`}
                />
                {formErrors.ifscCode && <p className="text-red-500 text-sm mt-1">{formErrors.ifscCode}</p>}
              </div>
              <div>
                <label htmlFor="amountToPay" className="block text-lg font-semibold text-gray-900 mb-2">
                  Amount To Pay (₹)
                </label>
                <input
                  type="number"
                  id="amountToPay"
                  value={formData.amountToPay}
                  onChange={(e) => handleInputChange("amountToPay", e.target.value)}
                  placeholder="Enter Amount To Pay"
                  className={`w-full px-4 py-3 bg-white border ${formErrors.amountToPay ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8a9079]`}
                />
                {formErrors.amountToPay && <p className="text-red-500 text-sm mt-1">{formErrors.amountToPay}</p>}
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
              <button
                onClick={handleCancel}
                className="cursor-pointer px-8 py-3 bg-white text-black rounded-lg text-base font-semibold transition-colors hover:bg-gray-100 duration-200 focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPay}
                className="px-8 py-3 bg-white cursor-pointer text-black rounded-lg text-base font-semibold hover:bg-gray-100 hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
              >
                Proceed To Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

 const renderPayrollTable = () => (
  <>
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="w-full overflow-x-auto custom-table">
        <div
          className="rounded-lg overflow-hidden border border-gray-300 min-w-[800px]"
          style={{ backgroundColor: "#BEC5AD", boxShadow: "0px 4px 20px 0px #00000040 inset" }}
        >
          <table className="custom-table w-full border-collapse mt-4">
            <thead>
              <tr className="bg-white">
                <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">Name</th>
                <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">Role</th>
                <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">Basic Salary</th>
                <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">Tax</th>
                <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">PF</th>
                <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">Loan Deduction</th>
                <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">Net Salary</th>
                <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">Status</th>
                <th className="font-bold text-gray-900 px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffData.map((staff, index) => (
                <tr key={index} className="relative">
                  <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.name}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.role}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.basicSalary}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.tax}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.pf}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.loanDeduction}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm">{staff.netSalary}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-5 text-center">
                    <span className={`px-1 sm:px-2 py-1 rounded text-xs font-medium text-white ${staff.status === "Paid" ? "bg-[#28C404]" : "bg-[#FF7700]"}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-5 text-center">
                    <button onClick={() => handleViewPayslip(staff)} className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs sm:text-sm">
                      View Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="payroll-card space-y-4 sm:hidden mt-4">
        {staffData.map((staff, index) => (
          <div key={index} className="bg-[#BEC5AD] rounded-md p-4 text-sm shadow-md">
            <div className="mb-2"><strong>Name:</strong> {staff.name}</div>
            <div className="mb-2"><strong>Role:</strong> {staff.role}</div>
            <div className="mb-2"><strong>Basic Salary:</strong> {staff.basicSalary}</div>
            <div className="mb-2"><strong>Tax:</strong> {staff.tax}</div>
            <div className="mb-2"><strong>PF:</strong> {staff.pf}</div>
            <div className="mb-2"><strong>Loan Deduction:</strong> {staff.loanDeduction}</div>
            <div className="mb-2"><strong>Net Salary:</strong> {staff.netSalary}</div>
            <div className="mb-2">
              <strong>Status:</strong>{" "}
              <span className={`px-2 py-1 rounded text-xs font-medium text-white ${staff.status === "Paid" ? "bg-[#28C404]" : "bg-[#FF7700]"}`}>
                {staff.status}
              </span>
            </div>
            <div>
              <button onClick={() => handleViewPayslip(staff)} className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs">
                View Payslip
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* CSS Media Queries & Custom Styles */}
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
      @media (max-width: 640px) {
        .custom-table {
          display: none;
        }
        .payroll-card {
          display: block;
        }
      }
      @media (min-width: 641px) {
        .payroll-card {
          display: none;
        }
      }
    `}</style>
  </>
);

  // Render Tax/PF Table
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
                  <button 
                    onClick={() => handleEditDeduction(staff)}
                    className="bg-transparent border-none text-[#1109FF] cursor-pointer text-xs sm:text-sm hover:text-blue-800"
                  >
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

  if (showProcessSalary) {
    return renderProcessSalaryForm();
  }

  return (
    <div className="p-3 sm:p-6 min-h-screen mt-5">
      {/* Payslip Modal */}
       {showPayslipModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedStaff?.name}'s Payslip</h2>
              <button 
                onClick={() => setShowPayslipModal(false)}
                className="text-gray-500 cursor-pointer hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-semibold">Employee Name:</p>
                  <p>{selectedStaff?.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Designation:</p>
                  <p>{selectedStaff?.role}</p>
                </div>
                <div>
                  <p className="font-semibold">Month:</p>
                  <p>{selectedMonth}</p>
                </div>
                <div>
                  <p className="font-semibold">Status:</p>
                  <p className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${
                    selectedStaff?.status === "Paid" ? "bg-[#28C404]" : "bg-[#FF7700]"
                  }`}>
                    {selectedStaff?.status}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-bold mb-2">Earnings</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p>Basic Salary:</p>
                    <p>{selectedStaff?.basicSalary}</p>
                  </div>
                </div>
                
                <h3 className="font-bold mb-2">Deductions</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p>Tax:</p>
                    <p>{selectedStaff?.tax}</p>
                  </div>
                  <div>
                    <p>PF:</p>
                    <p>{selectedStaff?.pf}</p>
                  </div>
                  <div>
                    <p>Loan Deduction:</p>
                    <p>{selectedStaff?.loanDeduction}</p>
                  </div>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <p>Net Salary:</p>
                    <p>{selectedStaff?.netSalary}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowPayslipModal(false)}
                className="px-4 py-2 cursor-pointer bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deduction Modal */}
      {showEditDeductionModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Salary Details for {selectedStaff?.name}</h2>
              <button 
                onClick={() => setShowEditDeductionModal(false)}
                className="text-gray-500 cursor-pointer hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Basic Salary</label>
                  <input
                    type="text"
                    name="basicSalary"
                    value={editFormData.basicSalary}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Tax Deduction</label>
                  <input
                    type="text"
                    name="tax"
                    value={editFormData.tax}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">PF Deduction</label>
                  <input
                    type="text"
                    name="pf"
                    value={editFormData.pf}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Loan Deduction</label>
                  <input
                    type="text"
                    name="loanDeduction"
                    value={editFormData.loanDeduction}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-medium mb-1">Net Salary (Calculated)</label>
                  <input
                    type="text"
                    name="netSalary"
                    value={editFormData.netSalary}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  onClick={() => setShowEditDeductionModal(false)}
                  className="px-4 py-2 cursor-pointer bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveDeductions}
                  className="px-4 py-2 bg-green-600 cursor-pointer text-white rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
       <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with red line */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-[#4F8CCF]"></div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Staff Salary</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="rounded-xl shadow-xl p-4 sm:p-8 border-none" style={{ backgroundColor: "#ADCE8C" }}>
            <div className="text-lg sm:text-2xl text-center font-semibold text-black mb-3">Total PAYROLL COST</div>
            <hr className="border-gray-600 mb-4" />
            <div className="text-xl sm:text-3xl text-center font-bold text-gray-900">₹ 1,20,000</div>
          </div>
          <div className="rounded-lg p-4 sm:p-8 shadow-xl border-none" style={{ backgroundColor: "#ADCE8C" }}>
            <div className="text-lg sm:text-2xl text-center font-semibold text-black mb-3">Total DEDUCTIONS</div>
            <hr className="border-gray-600 mb-4" />
            <div className="text-xl sm:text-3xl text-center font-bold text-gray-900">₹ 15,000</div>
          </div>
          <div className="rounded-lg p-4 sm:p-8 shadow-xl border-none" style={{ backgroundColor: "#ADCE8C" }}>
            <div className="text-lg sm:text-2xl text-center font-semibold text-black mb-3">Total PAYOUT</div>
            <hr className="border-gray-600 mb-4" />
            <div className="text-xl sm:text-3xl text-center font-bold text-gray-900">₹ 1,05,000</div>
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
            <label htmlFor="monthSelect" className="sr-only">
              Select Month
            </label>
            <select
              id="monthSelect"
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
  );
}