"use client";

import { useEffect, useState } from "react";
import { FiEye, FiDownload } from "react-icons/fi";
import api from "@/lib/api";
import InvoiceModal from "./invoiceModal";
import {
DollarSign,
Clock3,
FileText,
CheckCircle,
} from "lucide-react";

export default function InvoicePage() {
  const [studentFees, setStudentFees] = useState([]);
  const [managementInvoices, setManagementInvoices] = useState([]);
  const [purchaseReceipts, setPurchaseReceipts] = useState([]);
  const [loading, setLoading] = useState({
    student: false,
    management: false,
    purchase: false,
  });

  const [modalData, setModalData] = useState({
    isOpen: false,
    section: "",
    headers: [],
    row: [],
  });

  // Statistics for cards
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    totalInvoices: 0,
    paidInvoices: 0,
  });

  useEffect(() => {
    // Simulated API data — replace with axios requests
    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchData = async () => {
    setLoading({ student: true, management: true, purchase: true });

    try {
      const [studentRes, salaryRes, purchaseRes] = await Promise.all([
        api.get('/api/adminauth/invoices/student'),
        api.get('/api/adminauth/salary'),
        api.get('/api/adminauth/invoices/management')
      ]);

      const studentData = (studentRes.data.invoices || []).map((inv) => [
        inv.studentName || 'Unknown',
        inv.roomNumber || 'N/A',
        formatCurrency(inv.amount),
        new Date(inv.dueDate).toLocaleDateString('en-IN'),
        inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : 'Pending'
      ]);

      const managementData = (salaryRes.data.salaries || []).map((sal) => [
        sal.staffName || 'Unknown',
        sal.role || 'Warden',
        formatCurrency(sal.netSalary),
        sal.paymentDate ? new Date(sal.paymentDate).toLocaleDateString('en-IN') : 'Pending',
        sal.status ? sal.status.charAt(0).toUpperCase() + sal.status.slice(1) : 'Pending'
      ]);

      const purchaseData = (purchaseRes.data.invoices || []).map((inv) => [
        inv.itemDescription || 'N/A',
        inv.vendorName || 'Unknown',
        formatCurrency(inv.amount),
        new Date(inv.purchaseDate).toLocaleDateString('en-IN'),
        inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : 'Pending'
      ]);

      setStudentFees(studentData);
      setManagementInvoices(managementData);
      setPurchaseReceipts(purchaseData);

      calculateStats(studentData, managementData, purchaseData);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading({ student: false, management: false, purchase: false });
    }
  };

  const calculateStats = (studentData, managementData, purchaseData) => {
    // Helper function to extract numeric amount from string like "₹35,000"
    const extractAmount = (amountStr) => {
      return parseInt(amountStr.replace(/[^0-9]/g, "")) || 0;
    };

    // Calculate total revenue from student fees (only paid ones)
    const studentRevenue = studentData
      .filter((row) => row[4] === "Paid")
      .reduce((sum, row) => sum + extractAmount(row[2]), 0);

    // Calculate pending payments
    const pendingStudent = studentData
      .filter((row) => row[4] === "Pending" || row[4] === "Overdue")
      .reduce((sum, row) => sum + extractAmount(row[2]), 0);

    const pendingManagement = managementData
      .filter((row) => row[4] === "Pending" || row[4] === "Overdue")
      .reduce((sum, row) => sum + extractAmount(row[2]), 0);

    const pendingPurchase = purchaseData
      .filter((row) => row[4] === "Pending")
      .reduce((sum, row) => sum + extractAmount(row[2]), 0);

    // Total invoices
    const totalInvoices = studentData.length + managementData.length + purchaseData.length;
    
    // Paid invoices
    const paidInvoices = 
      studentData.filter((row) => row[4] === "Paid").length +
      managementData.filter((row) => row[4] === "Paid").length +
      purchaseData.filter((row) => row[4] === "Approved").length;

    setStats({
      totalRevenue: studentRevenue,
      pendingPayments: pendingStudent + pendingManagement + pendingPurchase,
      totalInvoices: totalInvoices,
      paidInvoices: paidInvoices,
    });
  };

  const handleView = (row, section) => {
    let headers = [];

    if (section === "Student Fees Invoices") {
      headers = ["Student Name", "Room No.", "Amount", "Due Date", "Status"];
    } else if (section === "Management Invoices (Salaries)") {
      headers = ["Staff Name", "Role", "Amount", "Payment Date", "Status"];
    } else if (section === "Staff Purchase Receipts") {
      headers = ["Item/Description", "Vendor", "Amount", "Purchase Date", "Status"];
    }

    setModalData({
      isOpen: true,
      section,
      headers,
      row,
    });
  };

  const handleDownload = (row, section) => {
    console.log("Download clicked for:", row);
    alert(`Downloading invoice for: ${row[0]} from ${section}`);
    // In production, trigger file download here
  };



  // Card data for stats
  const statCards = [
    { 
      id: "revenue", 
      label: "Total Revenue", 
      value: formatCurrency(stats.totalRevenue), 
      subLabel: "From all sources",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: "💰"
    },
    { 
      id: "pending", 
      label: "Pending Payments", 
      value: formatCurrency(stats.pendingPayments), 
      subLabel: "Awaiting clearance",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      icon: "⏳"
    },
    { 
      id: "total", 
      label: "Total Invoices", 
      value: stats.totalInvoices, 
      subLabel: "All invoices",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: "📄"
    },
    { 
      id: "paid", 
      label: "Paid Invoices", 
      value: stats.paidInvoices, 
      subLabel: "Successfully paid",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      icon: "✅"
    },
  ];

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">
            <span className="border-l-4 border-[#4F8CCF] pl-3 inline-block">
              Hostel Invoices
            </span>
          </h1>
          <p className="text-gray-600 mt-2 ml-3">Manage all financial transactions</p>
        </div>

        {/* Stats Cards Section */}
       

        {/* Alternative Minimal Cards Design */}
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">

{/* Total Revenue */}

  <div className="bg-white rounded-2xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">


<div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-4">
  <DollarSign size={18} className="text-green-500" />
</div>

<div className="text-4xl font-bold text-black">
  {formatCurrency(stats.totalRevenue)}
</div>

<div className="text-gray-700 text-sm font-medium mt-1">
  Total Revenue
</div>

<div className="inline-block mt-4 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-600">
  Collected
</div>


  </div>

{/* Pending Payments */}

  <div className="bg-white rounded-2xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">


<div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-4">
  <Clock3 size={18} className="text-orange-500" />
</div>

<div className="text-4xl font-bold text-black">
  {formatCurrency(stats.pendingPayments)}
</div>

<div className="text-gray-700 text-sm font-medium mt-1">
  Pending Payments
</div>

<div className="inline-block mt-4 px-3 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-600">
  Due Amount
</div>


  </div>

{/* Total Invoices */}

  <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">


<div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
  <FileText size={18} className="text-blue-500" />
</div>

<div className="text-4xl font-bold text-black">
  {stats.totalInvoices}
</div>

<div className="text-gray-700 text-sm font-medium mt-1">
  Total Invoices
</div>

<div className="inline-block mt-4 px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
  Transactions
</div>


  </div>

{/* Paid Invoices */}

  <div className="bg-white rounded-2xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">


<div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-4">
  <CheckCircle size={18} className="text-purple-500" />
</div>

<div className="text-4xl font-bold text-black">
  {stats.paidInvoices}
</div>

<div className="text-gray-700 text-sm font-medium mt-1">
  Paid Invoices
</div>

<div className="inline-block mt-4 px-3 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-600">
  Completed
</div>


  </div>

</div>


        {/* Invoice Sections */}
        <div className="space-y-8">
          {/* Student Fees Section */}
          <InvoiceSection
            title="Student Fees Invoices"
            headers={[
              "Student Name",
              "Room no.",
              "Amount",
              "Due date",
              "Status",
              "Actions",
            ]}
            data={studentFees}
            loading={loading.student}
            onView={handleView}
            onDownload={handleDownload}
          />

          {/* Management Invoices Section */}
          <InvoiceSection
            title="Management Invoices (Salaries)"
            headers={[
              "Staff Name",
              "Role",
              "Amount",
              "Payment date",
              "Status",
              "Actions",
            ]}
            data={managementInvoices}
            loading={loading.management}
            onView={handleView}
            onDownload={handleDownload}
          />

          {/* Purchase Receipts Section */}
          <InvoiceSection
            title="Staff Purchase Receipts"
            headers={[
              "Item/description",
              "Vendor",
              "Amount",
              "Purchase date",
              "Status",
              "Actions",
            ]}
            data={purchaseReceipts}
            loading={loading.purchase}
            onView={handleView}
            onDownload={handleDownload}
          />
        </div>

        {/* Modal for details */}
        <InvoiceModal
          isOpen={modalData.isOpen}
          onClose={() =>
            setModalData({ isOpen: false, section: "", headers: [], row: [] })
          }
          section={modalData.section}
          headers={modalData.headers}
          row={modalData.row}
        />
      </div>
    </main>
  );
}

// InvoiceSection Component with modern design
function InvoiceSection({ title, headers, data, loading, onView, onDownload }) {
  // Function to get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4">
          <h2 className="text-xl font-semibold text-black">{title}</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4">
          <h2 className="text-xl font-semibold text-black">{title}</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No {title.toLowerCase()} found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4">
        <h2 className="text-xl font-semibold text-black">{title}</h2>
        <p className="text-sm text-gray-700 mt-1">Total: {data.length} records</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-200">
              {headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 text-sm font-semibold text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-3 text-sm text-gray-600">
                    {cellIdx === row.length - 1 ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cell)}`}>
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onView(row, title)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Details"
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      onClick={() => onDownload(row, title)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Download"
                    >
                      <FiDownload size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-4">
        {data.map((row, rowIdx) => (
          <div key={rowIdx} className="bg-gray-50 rounded-lg p-4 shadow-sm">
            {headers.map((header, idx) => (
              idx < headers.length - 1 && (
                <div key={idx} className="mb-2">
                  <span className="text-xs font-semibold text-gray-500">{header}:</span>
                  <span className="ml-2 text-sm text-gray-700">
                    {idx === headers.length - 2 ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[idx])}`}>
                        {row[idx]}
                      </span>
                    ) : (
                      row[idx]
                    )}
                  </span>
                </div>
              )
            ))}
            <div className="flex gap-3 mt-3 pt-2 border-t border-gray-200">
              <button
                onClick={() => onView(row, title)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
              >
                <FiEye size={16} /> View
              </button>
              <button
                onClick={() => onDownload(row, title)}
                className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors text-sm"
              >
                <FiDownload size={16} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}