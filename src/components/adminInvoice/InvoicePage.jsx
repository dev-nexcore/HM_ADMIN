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
  const [activeFilter, setActiveFilter] = useState("total");
  const [searchTerm, setSearchTerm] = useState("");

  const filterData = (data, sectionName) => {
    let filtered = [...data];
    
    // Filter by status (activeFilter)
    if (activeFilter === "pending") {
      filtered = filtered.filter(row => row[4] === "Pending" || row[4] === "Overdue");
    } else if (activeFilter === "paid") {
      filtered = filtered.filter(row => row[4] === "Paid" || row[4] === "Approved");
    }

    // Filter by search term (Student Name or Room No)
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(row => 
        row[0].toLowerCase().includes(lowerSearch) || // Student Name
        row[1].toLowerCase().includes(lowerSearch)    // Room No
      );
    }
    
    return filtered;
  };

  const displayedStudentFees = filterData(studentFees, "Student Fees Invoices");
  const displayedManagementInvoices = filterData(managementInvoices, "Management Invoices (Salaries)");
  const displayedPurchaseReceipts = filterData(purchaseReceipts, "Staff Purchase Receipts");

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
    const isStudent = section === "Student Fees Invoices";
    const isSalary = section === "Management Invoices (Salaries)";
    const isPurchase = section === "Staff Purchase Receipts";

    // Create a stylized print template
    const printWindow = window.open('', '_blank');
    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice - ${row[0]}</title>
          <style>
            * { box-sizing: border-box; }
            
            @page {
              size: A4;
              margin: 0;
            }
            
            html, body {
              height: 297mm; /* Standard A4 height */
              width: 210mm;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
            
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 15mm; 
              color: #1A1F16; 
              background: white;
              -webkit-print-color-adjust: exact;
              display: flex;
              flex-direction: column;
            }
            
            @media print {
              body { height: 100vh; }
              .no-print { display: none; }
            }
            
            .header-main { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              padding-bottom: 20px; 
              border-bottom: 2px solid #E5E7EB;
              margin-bottom: 40px;
            }
            
            .header-left { display: flex; align-items: center; gap: 20px; }
            .header-logo { width: 80px; height: 80px; object-fit: contain; }
            
            .brand-name { font-size: 26px; font-weight: 800; color: #1A1F16; margin: 0; line-height: 1.2; text-transform: uppercase; }
            .trust-info { font-size: 13px; font-weight: 700; color: #4A5D23; margin: 4px 0; text-transform: uppercase; }
            .division-info { font-size: 13px; font-weight: 600; color: #64748B; margin: 0; text-transform: uppercase; }
            
            .header-right { text-align: right; font-size: 12px; color: #64748B; line-height: 1.6; }
            .contact-item { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-bottom: 4px; }
            
            .invoice-type-banner { 
              background: #F8FAF5; 
              padding: 15px 25px; 
              border-radius: 12px; 
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border: 1px solid #7A8B5E20;
            }
            .invoice-title { font-size: 18px; font-weight: 800; color: #7A8B5E; text-transform: uppercase; letter-spacing: 1px; }

            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 50px; }
            .section-label { font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .value { font-size: 16px; font-weight: 600; color: #1A1F16; }
            
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th { background: #F1F5F9; text-align: left; padding: 15px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; }
            .table td { padding: 15px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #1E293B; }
            
            .totals-section { margin-top: 40px; display: flex; justify-content: flex-end; }
            .totals-box { width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid #E2E8F0; }
            .grand-total { border-top: 2px solid #1A1F16; margin-top: 10px; padding-top: 15px; font-size: 20px; font-weight: 800; }

            .status-badge { display: inline-block; padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .paid { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
            .pending { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }

            .footer { margin-top: 80px; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 30px; color: #94A3B8; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header-main">
            <div class="header-left">
              <img src="/photos/logo1.svg" class="header-logo" alt="KGF Logo">
              <div>
                <h1 class="brand-name">KOKAN GLOBAL FOUNDATION</h1>
                <p class="trust-info">EDUCATIONAL & WELFARE TRUST | REG NO: E-3342/R</p>
                <p class="division-info">HOSTEL MANAGEMENT DIVISION</p>
              </div>
            </div>
            <div class="header-right">
              <div class="contact-item">📍 Maharashtra, India</div>
              <div class="contact-item">📞 +91-XXXXXXXXXX</div>
              <div style="margin-top: 10px; font-weight: 600; color: #1E293B;">Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          <div class="invoice-type-banner">
            <div class="invoice-title">Official Receipt</div>
            <div class="status-badge ${row[4].toLowerCase() === 'paid' || row[4].toLowerCase() === 'approved' ? 'paid' : 'pending'}">${row[4]}</div>
          </div>

          <div class="info-grid">
            <div>
              <div class="section-label">Billed To</div>
              <div class="value">${row[0]}</div>
              <div style="font-size: 13px; color: #64748B; margin-top: 4px;">
                ${isStudent ? `Room No: ${row[1]}` : isSalary ? `Staff Designation: ${row[1]}` : `Vendor Name: ${row[1]}`}
              </div>
            </div>
            <div style="text-align: right;">
              <div class="section-label">Invoice Details</div>
              <div class="value">REF: ${Date.now().toString().slice(-6)}</div>
              <div style="font-size: 13px; color: #64748B; margin-top: 4px;">Due Date: ${row[3]}</div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th style="width: 70%">Item Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="font-weight: 600;">${isStudent ? "Hostel Fees & Accommodation Charges" : isSalary ? "Monthly Salary Remuneration" : "Inventory/Service Purchase"}</div>
                  <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Period: ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}</div>
                </td>
                <td style="text-align: right; font-weight: 700;">${row[2]}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-box">
              <div class="total-row">
                <span style="color: #64748B;">Subtotal</span>
                <span style="font-weight: 600;">${row[2]}</span>
              </div>
              <div class="total-row">
                <span style="color: #64748B;">Taxes / Fees</span>
                <span style="font-weight: 600;">₹0</span>
              </div>
              <div class="total-row grand-total">
                <span>Total Amount</span>
                <span>${row[2]}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This is an electronically generated receipt. No physical signature is required.</p>
            <p>&copy; ${new Date().getFullYear()} Kokan Global Foundation. All rights reserved.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
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

          <div 
            onClick={() => setActiveFilter("revenue")}
            className={`bg-white rounded-2xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer ${activeFilter === "revenue" ? "ring-2 ring-offset-2 ring-green-500" : ""}`}
          >


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

          <div 
            onClick={() => setActiveFilter("pending")}
            className={`bg-white rounded-2xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer ${activeFilter === "pending" ? "ring-2 ring-offset-2 ring-orange-500" : ""}`}
          >


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

          <div 
            onClick={() => setActiveFilter("total")}
            className={`bg-white rounded-2xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer ${activeFilter === "total" ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
          >


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

          <div 
            onClick={() => setActiveFilter("paid")}
            className={`bg-white rounded-2xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer ${activeFilter === "paid" ? "ring-2 ring-offset-2 ring-purple-500" : ""}`}
          >


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

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search by student name or room number..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Filter Status:</span>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-all"
            >
              <option value="total">All Invoices</option>
              <option value="pending">Pending Only</option>
              <option value="paid">Paid Only</option>
            </select>
          </div>
        </div>

        {/* Invoice Sections */}
        <div className="space-y-8">
          {/* Student Fees Section */}
          <InvoiceSection
            title="Student Fees Invoices"
            headers={[
              "Sr. No.",
              "Student Name",
              "Room no.",
              "Amount",
              "Due date",
              "Status",
              "Actions",
            ]}
            data={displayedStudentFees}
            loading={loading.student}
            onView={handleView}
            onDownload={handleDownload}
          />

          {/* Management Invoices Section */}
          <InvoiceSection
            title="Management Invoices (Salaries)"
            headers={[
              "Sr. No.",
              "Staff Name",
              "Role",
              "Amount",
              "Payment date",
              "Status",
              "Actions",
            ]}
            data={displayedManagementInvoices}
            loading={loading.management}
            onView={handleView}
            onDownload={handleDownload}
          />


          {/* Purchase Receipts Section - Commented out as requested
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
            data={displayedPurchaseReceipts}
            loading={loading.purchase}
            onView={handleView}
            onDownload={handleDownload}
          />
          */}
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

// InvoiceSection Component with modern design and pagination
function InvoiceSection({ title, headers, data, loading, onView, onDownload }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to page 1 when data changes (e.g. on search)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
      <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-black">{title}</h2>
          <p className="text-sm text-gray-700 mt-1">Total: {data.length} records</p>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 bg-white/20 p-1 rounded-lg">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-md hover:bg-white/30 disabled:opacity-50 text-black transition-all"
            >
              ←
            </button>
            <span className="text-xs font-bold text-black px-2">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-md hover:bg-white/30 disabled:opacity-50 text-black transition-all"
            >
              →
            </button>
          </div>
        )}
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
            {currentData.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* Sr. No Column */}
                <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                  {startIndex + rowIdx + 1}
                </td>
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
        {currentData.map((row, rowIdx) => (
          <div key={rowIdx} className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 relative">
            <div className="absolute top-2 right-2 text-[10px] font-bold text-gray-400">
              #{startIndex + rowIdx + 1}
            </div>
            {headers.map((header, idx) => (
              idx > 0 && idx < headers.length - 1 && (
                <div key={idx} className="mb-2">
                  <span className="text-xs font-semibold text-gray-500">{header}:</span>
                  <span className="ml-2 text-sm text-gray-700">
                    {idx === headers.length - 2 ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[idx-1])}`}>
                        {row[idx-1]}
                      </span>
                    ) : (
                      row[idx-1]
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

      {/* Desktop Pagination Footer */}
      {totalPages > 1 && (
        <div className="hidden md:flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, data.length)}</span> of <span className="font-medium">{data.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${currentPage === i + 1 ? 'bg-[#4F8DCF] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}