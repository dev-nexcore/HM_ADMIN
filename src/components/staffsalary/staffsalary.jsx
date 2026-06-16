"use client"

import { useState, useEffect, useMemo } from "react"
import api from "../../lib/api"
import { toast } from "react-hot-toast"
import {
  HiOutlineUsers,
  HiOutlineCurrencyRupee,
  HiOutlineTrendingUp,
  HiOutlineDownload,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlinePrinter,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineBadgeCheck,
  HiOutlineHashtag,
  HiOutlineLibrary,
} from "react-icons/hi"
import { FaUniversity } from "react-icons/fa"
import { MdOutlinePayments } from "react-icons/md"

// ── Number to words (Indian style) ───────────────────────────────────────────
const numberToWords = (num) => {
  const first = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const tens  = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const mad   = ['','Thousand','Lakh','Crore'];
  const convert = (n) => {
    if (n < 20)  return first[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+first[n%10] : '');
    return first[Math.floor(n/100)] + 'Hundred ' + (n%100 ? convert(n%100) : '');
  };
  if (num === 0) return 'Zero';
  let word = '', i = 0;
  while (num > 0) {
    const rem = num % (i === 0 ? 1000 : 100);
    if (rem) word = convert(rem) + mad[i] + ' ' + word;
    num = Math.floor(num / (i === 0 ? 1000 : 100));
    i++;
  }
  return word.trim() + ' Rupees Only';
};

// ── Print/PDF HTML builder ────────────────────────────────────────────────────
const buildPayslipHTML = (salary, monthName, year) => {
  const netWords      = numberToWords(salary?.netSalary || 0);
  const payDate       = salary?.paymentDate ? new Date(salary.paymentDate).toLocaleDateString('en-GB') : 'Processing';
  const accountDisplay = salary?.accountNumber ? `XXXX${salary.accountNumber.slice(-4)}` : 'N/A';
  const empId         = salary?.employeeId || `#${salary?._id?.slice(-6).toUpperCase() || 'N/A'}`;
  const basicFmt      = (salary?.basicSalary || 0).toLocaleString('en-IN');
  const netFmt        = (salary?.netSalary   || 0).toLocaleString('en-IN');
  const sigName       = salary?.processedByName && !salary.processedByName.includes('undefined')
    ? salary.processedByName : 'Authorized Admin';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Salary Slip – ${salary?.staffName || ''} – ${monthName} ${year}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{
      font-family:'Segoe UI',system-ui,-apple-system,sans-serif;
      background:#fff;color:#111827;
      padding:32px;max-width:800px;margin:0 auto;
      -webkit-print-color-adjust:exact!important;
      print-color-adjust:exact!important;
    }

    /* ── KGF HEADER ── */
    .kgf-header{
      display:flex;justify-content:space-between;align-items:flex-start;
      border-bottom:3px solid #2563eb;padding-bottom:24px;margin-bottom:28px;
      gap:16px;flex-wrap:wrap;
    }
    .kgf-left{display:flex;align-items:flex-start;gap:16px;}
    .kgf-logo{
      width:80px;height:80px;object-fit:contain;flex-shrink:0;
    }
    .kgf-org-name{
      font-size:22px;font-weight:900;color:#111827;
      letter-spacing:-0.03em;line-height:1.1;
    }
    .kgf-org-sub{
      font-size:10px;font-weight:700;color:#2563eb;
      text-transform:uppercase;letter-spacing:0.06em;margin-top:5px;
    }
    .kgf-org-division{
      font-size:10px;font-weight:600;color:#6b7280;
      text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;
    }
    .kgf-meta{display:flex;gap:16px;margin-top:8px;font-size:10px;color:#9ca3af;font-weight:600;}
    .kgf-right{text-align:right;flex-shrink:0;}
    .doc-badge{
      display:inline-block;background:#2563eb;color:#fff;
      padding:5px 16px;border-radius:8px;font-size:9px;
      font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;
    }
    .period-label{font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;}
    .period-value{font-size:15px;font-weight:900;color:#111827;margin-top:2px;}

    /* ── INFO GRID ── */
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:28px;}
    .section-label{font-size:9px;font-weight:900;color:#2563eb;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-bottom:12px;}
    .info-row{display:flex;align-items:center;gap:10px;font-size:13px;margin-bottom:10px;}
    .info-key{color:#6b7280;width:96px;flex-shrink:0;font-size:12px;}
    .info-val{font-weight:800;color:#111827;font-size:13px;}

    /* ── EARNINGS TABLE ── */
    .earnings-table{width:100%;border-collapse:collapse;border:2px solid #f3f4f6;border-radius:14px;overflow:hidden;margin-bottom:24px;}
    .earnings-table thead{background:#f9fafb;}
    .earnings-table th{padding:12px 20px;font-size:9px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:1.5px;text-align:left;}
    .earnings-table th:not(:first-child){text-align:right;}
    .earnings-table td{padding:14px 20px;font-size:13px;border-top:2px solid #f9fafb;}
    .earnings-table td:not(:first-child){text-align:right;}
    .row-label{font-weight:700;color:#374151;font-style:italic;}
    .row-earning{font-weight:900;color:#111827;}
    .row-deduction{color:#d1d5db;}

    /* ── NET PAY ── */
    .net-box{
      display:flex;justify-content:space-between;align-items:center;
      background:#eff6ff;border:2px solid #bfdbfe;border-radius:20px;
      padding:24px 28px;margin-bottom:28px;gap:16px;flex-wrap:wrap;
    }
    .net-words-label{font-size:9px;font-weight:900;color:#2563eb;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;}
    .net-words-text{font-size:12px;font-weight:900;color:#1e3a8a;text-transform:uppercase;font-style:italic;}
    .net-amount-label{font-size:9px;font-weight:900;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;text-align:right;}
    .net-amount{font-size:38px;font-weight:900;color:#2563eb;text-align:right;letter-spacing:-1px;}

    /* ── FOOTER ── */
    .doc-footer-row{display:flex;justify-content:space-between;align-items:flex-end;padding-top:28px;margin-top:8px;gap:20px;flex-wrap:wrap;}
    .sig-line{width:180px;height:1px;background:#e5e7eb;margin:0 auto 8px;}
    .sig-name{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#111827;}
    .sig-role{font-size:8px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-top:2px;}
    .sig-org{font-size:8px;color:#9ca3af;font-style:italic;margin-top:1px;}
    .doc-footer{text-align:center;font-size:8px;color:#9ca3af;text-transform:uppercase;font-weight:700;letter-spacing:1px;padding-top:20px;border-top:1px solid #f3f4f6;margin-top:16px;line-height:1.7;}

    @page{size:A4;margin:12mm;}
    @media print{body{padding:24px 32px;}}
  </style>
</head>
<body>

  <!-- KGF Branded Header -->
  <div class="kgf-header">
    <div class="kgf-left">
      <img src="/photos/logo1.svg" alt="KGF Logo" class="kgf-logo" onerror="this.style.display='none'" />
      <div>
        <div class="kgf-org-name">KOKAN GLOBAL FOUNDATION</div>
        <div class="kgf-org-sub">Educational &amp; Welfare Trust &nbsp;|&nbsp; Reg No: E-3342/R</div>
        <div class="kgf-org-division">Hostel Management Division</div>
        <div class="kgf-meta">
          <span>📍 Maharashtra, India</span>
          <span>📞 +91-XXXXXXXXXX</span>
        </div>
      </div>
    </div>
    <div class="kgf-right">
      <div class="doc-badge">Salary Certificate</div>
      <div class="period-label">Pay Period</div>
      <div class="period-value">${monthName}, ${year}</div>
    </div>
  </div>

  <!-- Divider strip -->
  <div style="background:#2563eb;height:3px;border-radius:4px;margin-bottom:28px;"></div>

  <div class="info-grid">
    <div>
      <div class="section-label">Employee Details</div>
      <div class="info-row">
        <span style="color:#d1d5db;">👤</span>
        <span class="info-key">Name:</span>
        <span class="info-val">${(salary?.staffName || '').toUpperCase()}</span>
      </div>
      <div class="info-row">
        <span style="color:#d1d5db;">🏢</span>
        <span class="info-key">Designation:</span>
        <span class="info-val">${salary?.role || 'Warden'}</span>
      </div>
      <div class="info-row">
        <span style="color:#d1d5db;">#</span>
        <span class="info-key">Emp ID:</span>
        <span class="info-val" style="font-family:monospace;font-style:italic">${empId}</span>
      </div>
    </div>
    <div>
      <div class="section-label">Payment Details</div>
      <div class="info-row">
        <span style="color:#d1d5db;">📅</span>
        <span class="info-key">Pay Date:</span>
        <span class="info-val">${payDate}</span>
      </div>
      <div class="info-row">
        <span style="color:#d1d5db;">🏦</span>
        <span class="info-key">Bank:</span>
        <span class="info-val">${(salary?.bankName || 'Direct Transfer').toUpperCase()}</span>
      </div>
      <div class="info-row">
        <span style="color:#d1d5db;">💳</span>
        <span class="info-key">Account:</span>
        <span class="info-val" style="font-family:monospace">${accountDisplay}</span>
      </div>
    </div>
  </div>

  <table class="earnings-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Earnings</th>
        <th>Deductions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="row-label">Basic Salary</td>
        <td class="row-earning">₹${basicFmt}</td>
        <td class="row-deduction">₹0.00</td>
      </tr>
      <tr>
        <td class="row-label">Allowances</td>
        <td class="row-earning">₹${(salary?.allowances || 0).toLocaleString('en-IN')}</td>
        <td class="row-deduction">₹0.00</td>
      </tr>
      <tr style="background:#fafafa">
        <td class="row-label">Total</td>
        <td class="row-earning">₹${netFmt}</td>
        <td class="row-deduction">₹${(salary?.deductions || 0).toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  <div class="net-box">
    <div>
      <div class="net-words-label">Net Payout In Words</div>
      <div class="net-words-text">${netWords}</div>
    </div>
    <div>
      <div class="net-amount-label">Take Home Pay</div>
      <div class="net-amount">₹${netFmt}</div>
    </div>
  </div>

  <div class="doc-footer-row">
    <div>
      <p style="font-size:9px;font-weight:900;color:#d1d5db;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Verification</p>
      <p style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#16a34a;">✅ Digital Record Verified</p>
    </div>
    <div style="text-align:center;">
      <div class="sig-line"></div>
      <div class="sig-name">${sigName}</div>
      <div class="sig-role">Authorized Signatory</div>
      <div class="sig-org">Kokan Global Foundation (HM)</div>
    </div>
  </div>

  <div class="doc-footer">
    This is a computer generated certificate and does not require a physical seal.<br/>
    © ${year} Kokan Global Foundation – All Rights Reserved.
  </div>

  <script>window.onload=function(){setTimeout(function(){window.print();},500);}<\/script>
</body>
</html>`;
};

// ── Open print window ────────────────────────────────────────────────────────
const openPayslipWindow = (salary, monthName, year, autoSave = false) => {
  const html = buildPayslipHTML(salary, monthName, year);
  const win  = window.open('', '_blank', 'width=900,height=700');
  if (!win) { toast.error("Popup blocked. Please allow popups for this site."); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  if (!autoSave) win.addEventListener('afterprint', () => win.close());
};

// ────────────────────────────────────────────────────────────────────────────

export default function StaffSalaryContent() {
  const [salaries, setSalaries]             = useState([])
  const [staffs, setStaffs]                 = useState([])
  const [loading, setLoading]               = useState(true)
  const [processing, setProcessing]         = useState(false)
  const [selectedMonth, setSelectedMonth]   = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear]     = useState(new Date().getFullYear())
  const [showProcessSalary, setShowProcessSalary] = useState(false)
  const [showPayslipModal, setShowPayslipModal]   = useState(false)
  const [selectedSalary, setSelectedSalary] = useState(null)
  const [searchTerm, setSearchTerm]         = useState("")
  const [totals, setTotals]                 = useState({ totalPayroll: 0, totalPayout: 0 })

  const [formData, setFormData] = useState({
    staffId: "", amountToPay: "", paymentMethod: "bank_transfer",
    allowances: 0, otherDeductions: 0, bankName: "", accountNumber: "", ifscCode: "",
    baseSalaryRaw: 0, presentDays: 0, daysInMonth: 0, absentDeduction: 0
  })

  const months = [
    { name: "January", value: 1 }, { name: "February", value: 2 }, { name: "March", value: 3 },
    { name: "April", value: 4 },   { name: "May", value: 5 },      { name: "June", value: 6 },
    { name: "July", value: 7 },    { name: "August", value: 8 },   { name: "September", value: 9 },
    { name: "October", value: 10 },{ name: "November", value: 11 },{ name: "December", value: 12 },
  ]
  const years = [2024, 2025, 2026]

  useEffect(() => { fetchSalaries(); fetchStaffs(); }, [selectedMonth, selectedYear])

  const fetchSalaries = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/adminauth/salary`, {
        params: { month: `${selectedYear}-${String(selectedMonth).padStart(2,'0')}`, year: selectedYear }
      })
      setSalaries(res.data.salaries || [])
      setTotals(res.data.totals || { totalPayroll: 0, totalPayout: 0 })
    } catch { toast.error("Failed to fetch salary data") }
    finally { setLoading(false) }
  }

  const fetchStaffs = async () => {
    try {
      const res = await api.get(`/api/adminauth/wardens`)
      if (res.data.success) setStaffs(res.data.wardens)
    } catch { console.error("Failed to fetch staff") }
  }

  const handleStaffSelect = async (staffId) => {
    const staff = staffs.find(s => s._id === staffId);
    if (!staff) {
      setFormData(prev => ({ ...prev, staffId: "", amountToPay: "", baseSalaryRaw: 0, presentDays: 0, daysInMonth: 0 }));
      return;
    }
    
    // Set loading state for amount
    setFormData(prev => ({ ...prev, staffId, amountToPay: "Calculating..." }));

    try {
      const start = new Date(selectedYear, selectedMonth - 1, 1);
      const end = new Date(selectedYear, selectedMonth, 0); // Last day
      const daysInMonth = end.getDate();
      
      const res = await api.get(`/api/adminauth/attendance/logs`, {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      });
      
      const logs = res.data.logs || [];
      const staffLogs = logs.filter(log => (
        log.staffId?._id === staffId || 
        log.studentId?._id === staffId || 
        log.wardenId?._id === staffId
      ));
      
      const uniqueDates = new Set();
      staffLogs.forEach(log => {
        const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
        uniqueDates.add(dateStr);
      });
      const presentDays = uniqueDates.size;
      
      const baseSalary = staff.salary || 0;
      const absentDays = Math.max(0, daysInMonth - presentDays);
      const absentDeduction = Math.round((baseSalary / daysInMonth) * absentDays);
      
      setFormData(prev => ({ 
        ...prev, 
        amountToPay: baseSalary || 0,
        baseSalaryRaw: baseSalary,
        presentDays: presentDays,
        daysInMonth: daysInMonth,
        absentDeduction: absentDeduction,
        otherDeductions: 0
      }));
      toast.success(`Calculated based on attendance: ${presentDays}/${daysInMonth} days`);
    } catch (err) {
      console.error("Failed to calculate attendance salary", err);
      setFormData(prev => ({ ...prev, amountToPay: staff.salary || 0, baseSalaryRaw: staff.salary || 0, absentDeduction: 0 }));
      toast.error("Failed to calculate attendance, using flat salary");
    }
  }

  const handleProcessSalary = async (e) => {
    e.preventDefault()
    if (!formData.staffId || !formData.amountToPay) { toast.error("Please fill all required fields"); return; }
    setProcessing(true)
    try {
      const res = await api.post(`/api/adminauth/salary/generate`, {
        staffId: formData.staffId,
        month: `${selectedYear}-${String(selectedMonth).padStart(2,'0')}`,
        year: selectedYear,
        basicSalary: Number(formData.amountToPay),
        allowances: Number(formData.allowances),
        deductions: Number(formData.otherDeductions) + Number(formData.absentDeduction),
        paymentMethod: formData.paymentMethod,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        tax: 0, pf: 0, loanDeduction: 0,
      })
      if (res.data.success) {
        toast.success("Salary processed successfully")
        setShowProcessSalary(false)
        fetchSalaries()
        setFormData({ staffId:"", amountToPay:"", paymentMethod:"bank_transfer", allowances:0, otherDeductions:0, bankName:"", accountNumber:"", ifscCode:"", absentDeduction: 0, presentDays: 0, daysInMonth: 0 })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process salary")
    } finally { setProcessing(false) }
  }

  const handleUpdateStatus = async (salaryId, status, method = 'bank_transfer') => {
    try {
      await api.put(`/api/adminauth/salary/${salaryId}/status`, { status, paymentMethod: method })
      toast.success(`Salary marked as ${status} (${method})`)
      fetchSalaries()
    } catch { toast.error("Failed to update status") }
  }

  const handleRazorpayPayment = async (salary) => {
    try {
      setProcessing(true);
      
      // 1. Create order on backend
      const orderRes = await api.post('/api/adminauth/razorpay/create-order', {
        amount: salary.netSalary,
        receiptId: `SAL-${salary._id.slice(-6)}`,
        type: 'staff_salary'
      });

      if (!orderRes.data.success) throw new Error("Order creation failed");

      const { order } = orderRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "KGF Hostel Management",
        description: `Salary Payout - ${salary.staffName}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            setProcessing(true);
            const verifyRes = await api.post('/api/adminauth/razorpay/verify-payment', {
              ...response,
              id: salary._id,
              type: 'staff_salary'
            });

            if (verifyRes.data.success) {
              toast.success("Salary Payment Successful!");
              fetchSalaries();
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment verification error");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: salary.staffName,
          email: "",
          contact: ""
        },
        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Razorpay error:", err);
      toast.error(err.response?.data?.message || "Razorpay initialization failed");
    } finally {
      setProcessing(false);
    }
  };

  const filteredSalaries = useMemo(() =>
    !searchTerm ? salaries : salaries.filter(s => s.staffName.toLowerCase().includes(searchTerm.toLowerCase())),
    [salaries, searchTerm]
  )

  const currentMonthName = months.find(m => m.value === selectedMonth)?.name || ''

  const handlePrint       = () => { if (!selectedSalary) return; openPayslipWindow(selectedSalary, currentMonthName, selectedYear, false) }
  const handleDownloadPDF = () => { if (!selectedSalary) return; openPayslipWindow(selectedSalary, currentMonthName, selectedYear, true)  }

  const handleExport = () => {
    if (!salaries.length) { toast.error("No data to export for this period"); return; }
    const headers = ["Staff Name","Role","Month","Year","Basic Salary","Allowances","Deductions","Net Salary","Status","Bank Name","Account Number","IFSC Code","Payment Date"];
    const rows = salaries.map(s => [
      s.staffName, s.role, currentMonthName, selectedYear,
      s.basicSalary, s.allowances||0, s.deductions||0, s.netSalary,
      s.status, s.bankName||"N/A", s.accountNumber||"N/A", s.ifscCode||"N/A",
      s.paymentDate ? new Date(s.paymentDate).toLocaleDateString('en-GB') : "Pending"
    ])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8;' }))
    a.download = `Payroll_${currentMonthName}_${selectedYear}.csv`
    a.click()
    toast.success("Excel report downloaded")
  }

  // ── Summary Cards ─────────────────────────────────────────────────────────
  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {[
        { label:"Total Payroll Cost", value:`₹${totals.totalPayroll.toLocaleString('en-IN')}`, Icon:HiOutlineCurrencyRupee, bg:"bg-blue-50",  text:"text-blue-600"   },
        { label:"Total Payout",       value:`₹${totals.totalPayout.toLocaleString('en-IN')}`,  Icon:HiOutlineTrendingUp,    bg:"bg-green-50", text:"text-green-600"  },
        { label:"Staff Count",        value:`${salaries.length} Members`,                       Icon:HiOutlineUsers,         bg:"bg-purple-50",text:"text-purple-600" },
      ].map(({ label, value, Icon, bg, text }) => (
        <div key={label} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-4 sm:gap-5 hover:shadow-md transition-all">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${bg} flex items-center justify-center ${text} shrink-0`}>
            <Icon size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider truncate">{label}</p>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">{value}</h3>
          </div>
        </div>
      ))}
    </div>
  )

  // ── Salary Table ──────────────────────────────────────────────────────────
  const renderTable = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <div className="relative w-full sm:w-72">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search staff name..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            <HiOutlineDownload size={16} /><span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => setShowProcessSalary(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            <HiOutlinePlus size={16} /><span>Process Salary</span>
          </button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-gray-50">
        {loading ? [...Array(3)].map((_,i) => (
          <div key={i} className="p-4 animate-pulse"><div className="h-12 bg-gray-100 rounded-lg" /></div>
        )) : filteredSalaries.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No records found for this period</div>
        ) : filteredSalaries.map(salary => (
          <div key={salary._id} className="p-4 hover:bg-gray-50/50 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                  {salary.staffName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{salary.staffName}</div>
                  <div className="text-xs text-gray-500">{salary.role}</div>
                </div>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold capitalize ${
                salary.status==='paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {salary.status==='paid' ? <HiOutlineCheckCircle size={10}/> : <HiOutlineClock size={10}/>}
                {salary.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-4">
                <div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">Basic</div>
                  <div className="text-sm font-bold text-gray-900">₹{salary.basicSalary.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">Net</div>
                  <div className="text-sm font-bold text-blue-600">₹{salary.netSalary.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {salary.status==='pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(salary._id,'paid', 'cash')}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Cash Payment">
                      <HiOutlineCheckCircle size={16}/>
                    </button>
                    <button onClick={() => handleRazorpayPayment(salary)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Online Payment">
                      <HiOutlineCurrencyRupee size={16}/>
                    </button>
                  </div>
                )}
                <button onClick={() => { setSelectedSalary(salary); setShowPayslipModal(true); }}
                  className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-all">
                  Payslip
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              {["Staff Member","Basic Salary","Net Salary","Status","Actions"].map(h => (
                <th key={h} className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${h==="Actions"?"text-right":""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? [...Array(5)].map((_,i) => (
              <tr key={i} className="animate-pulse">
                <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-gray-100 rounded-lg"/></td>
              </tr>
            )) : filteredSalaries.length===0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No records found for this period</td></tr>
            ) : filteredSalaries.map(salary => (
              <tr key={salary._id} className="hover:bg-gray-50/50 transition-all">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                      {salary.staffName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{salary.staffName}</div>
                      <div className="text-xs text-gray-500">{salary.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">₹{salary.basicSalary.toLocaleString('en-IN')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-blue-600">₹{salary.netSalary.toLocaleString('en-IN')}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    salary.status==='paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {salary.status==='paid' ? <HiOutlineCheckCircle size={12}/> : <HiOutlineClock size={12}/>}
                    {salary.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {salary.status==='pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateStatus(salary._id,'paid', 'cash')}
                          className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all text-xs font-semibold" title="Mark as Paid (Cash)">
                          <HiOutlineCheckCircle size={16}/> Cash
                        </button>
                        <button onClick={() => handleRazorpayPayment(salary)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-semibold shadow-sm" title="Pay Online">
                          <HiOutlineCurrencyRupee size={16}/> Online
                        </button>
                      </div>
                    )}
                    <button onClick={() => { setSelectedSalary(salary); setShowPayslipModal(true); }}
                      className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold transition-all">
                      View Payslip
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── Payslip Preview (React modal — uses react-icons) ─────────────────────
  const PayslipPreview = ({ salary }) => (
    <div className="p-4 sm:p-8 space-y-5 bg-white text-gray-900 w-full mx-auto" style={{ maxWidth: 760 }}>

      {/* ── KGF Header ── */}
      <div className="flex flex-col xs:flex-row justify-between items-start border-b-[3px] border-blue-600 pb-6 gap-4">
        <div className="flex items-start gap-4">
          <img
            src="/photos/logo1.svg"
            alt="KGF Logo"
            className="w-16 h-16 object-contain shrink-0"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 leading-none tracking-tight">
              KOKAN GLOBAL FOUNDATION
            </h1>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1.5">
              Educational &amp; Welfare Trust &nbsp;|&nbsp; Reg No: E-3342/R
            </p>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">
              Hostel Management Division
            </p>
            <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-gray-400 font-semibold">
              <span className="flex items-center gap-1">
                <HiOutlineLocationMarker size={11} /> Maharashtra, India
              </span>
              <span className="flex items-center gap-1">
                <HiOutlinePhone size={11} /> +91-XXXXXXXXXX
              </span>
            </div>
          </div>
        </div>

        {/* Badge + period */}
        <div className="text-left xs:text-right shrink-0">
          <div className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest mb-2">
            Salary Certificate
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pay Period</p>
          <p className="text-sm font-black text-gray-900 mt-0.5">{currentMonthName}, {selectedYear}</p>
        </div>
      </div>

      {/* ── Blue divider strip ── */}
      <div className="h-1 bg-blue-600 rounded-full -mt-2" />

      {/* ── Employee & Payment Info ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
        {/* Employee */}
        <div>
          <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-gray-100 pb-1.5 mb-3">
            Employee Details
          </h4>
          {[
            { Icon: HiOutlineUser,         label: "Name",        value: salary?.staffName?.toUpperCase(), mono: false },
            { Icon: HiOutlineOfficeBuilding,label: "Designation", value: salary?.role || 'Warden',        mono: false },
            { Icon: HiOutlineHashtag,      label: "Emp ID",      value: salary?.employeeId || `#${salary?._id?.slice(-6).toUpperCase()}`, mono: true  },
          ].map(({ Icon, label, value, mono }) => (
            <div key={label} className="flex items-center gap-2 text-xs mb-2.5">
              <Icon size={14} className="text-gray-300 shrink-0" />
              <span className="text-gray-500 w-24 shrink-0">{label}:</span>
              <span className={`font-bold text-gray-900 truncate ${mono ? 'font-mono italic' : ''}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Payment */}
        <div>
          <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-gray-100 pb-1.5 mb-3">
            Payment Details
          </h4>
          {[
            { Icon: HiOutlineCalendar,  label: "Pay Date", value: salary?.paymentDate ? new Date(salary.paymentDate).toLocaleDateString('en-GB') : 'Processing', mono: false },
            { Icon: HiOutlineLibrary,   label: "Bank",     value: (salary?.bankName || 'Direct Transfer').toUpperCase(), mono: false },
            { Icon: HiOutlineCreditCard,label: "Account",  value: salary?.accountNumber ? `XXXX${salary.accountNumber.slice(-4)}` : 'N/A', mono: true },
          ].map(({ Icon, label, value, mono }) => (
            <div key={label} className="flex items-center gap-2 text-xs mb-2.5">
              <Icon size={14} className="text-gray-300 shrink-0" />
              <span className="text-gray-500 w-24 shrink-0">{label}:</span>
              <span className={`font-bold text-gray-900 truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Earnings Table ── */}
      <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[9px] font-black tracking-widest">
            <tr>
              <th className="px-4 sm:px-5 py-3 text-left">Description</th>
              <th className="px-4 sm:px-5 py-3 text-right">Earnings</th>
              <th className="px-4 sm:px-5 py-3 text-right">Deductions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-50">
            <tr>
              <td className="px-4 sm:px-5 py-3 font-bold text-gray-700 italic">Basic Salary</td>
              <td className="px-4 sm:px-5 py-3 text-right font-black text-gray-900">₹{salary?.basicSalary?.toLocaleString('en-IN')}</td>
              <td className="px-4 sm:px-5 py-3 text-right text-gray-300">₹0.00</td>
            </tr>
            <tr>
              <td className="px-4 sm:px-5 py-3 font-bold text-gray-700 italic">Allowances</td>
              <td className="px-4 sm:px-5 py-3 text-right font-black text-gray-900">₹{(salary?.allowances||0).toLocaleString('en-IN')}</td>
              <td className="px-4 sm:px-5 py-3 text-right text-gray-300">₹0.00</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="px-4 sm:px-5 py-3 font-bold text-gray-700 italic">Total</td>
              <td className="px-4 sm:px-5 py-3 text-right font-black text-gray-900">₹{salary?.netSalary?.toLocaleString('en-IN')}</td>
              <td className="px-4 sm:px-5 py-3 text-right text-gray-300">₹{(salary?.deductions||0).toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Net Pay Box ── */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center bg-blue-50 p-4 sm:p-6 rounded-2xl border-2 border-blue-100 gap-3">
        <div>
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Net Payout In Words</p>
          <p className="text-xs font-black text-blue-900 uppercase italic leading-tight max-w-xs">
            {numberToWords(salary?.netSalary || 0)}
          </p>
        </div>
        <div className="text-left xs:text-right">
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Take Home Pay</p>
          <p className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tighter">
            ₹{salary?.netSalary?.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-end pt-6 gap-6">
        <div>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Verification</p>
          <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
            <HiOutlineBadgeCheck size={14} /> Digital Record Verified
          </div>
        </div>
        <div className="text-center">
          <div className="w-40 h-px bg-gray-200 mx-auto mb-2" />
          <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
            {salary?.processedByName && !salary.processedByName.includes('undefined') ? salary.processedByName : 'Authorized Admin'}
          </p>
          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">Authorized Signatory</p>
          <p className="text-[8px] text-gray-400 italic mt-0.5">Kokan Global Foundation (HM)</p>
        </div>
      </div>

      <div className="text-[8px] text-gray-400 text-center uppercase font-bold tracking-widest pt-4 border-t border-gray-50 leading-relaxed">
        Computer generated certificate · No physical seal required<br />
        © {selectedYear} Kokan Global Foundation – All Rights Reserved.
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Staff Salary</h1>
            </div>
            <p className="text-sm text-gray-500 font-medium pl-3.5">Manage and process monthly payroll with ease</p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-full sm:w-auto">
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-transparent border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer">
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
            <div className="w-px h-5 bg-gray-100" />
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-transparent border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {renderSummaryCards()}
        {renderTable()}

        {/* ── Payslip Modal ── */}
        {showPayslipModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowPayslipModal(false)} />
            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl">

              {/* Modal header */}
              <div className="bg-blue-600 p-4 sm:p-5 text-white flex justify-between items-center rounded-t-3xl shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 rounded-xl p-1.5 shrink-0">
                    <img src="/photos/logo1.svg" alt="Logo"
                      className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                      onError={e => { e.currentTarget.style.display='none' }} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold leading-tight">Salary Slip</h2>
                    <p className="text-blue-100 text-xs">{currentMonthName} {selectedYear}</p>
                  </div>
                </div>
                <button onClick={() => setShowPayslipModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-all">
                  <HiOutlineX size={18} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1">
                <PayslipPreview salary={selectedSalary} />
              </div>

              {/* Footer buttons */}
              <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex flex-col xs:flex-row justify-end gap-2 sm:gap-3 shrink-0 rounded-b-3xl">
                <button onClick={handlePrint}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-sm">
                  <HiOutlinePrinter size={16} /> Print Slip
                </button>
                <button onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  <HiOutlineDownload size={16} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {showProcessSalary && renderProcessSalaryModal()}
      </div>
    </div>
  )

  // ── Process Salary Modal ──────────────────────────────────────────────────
  function renderProcessSalaryModal() {
    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowProcessSalary(false)} />
        <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[85vh] flex flex-col shadow-2xl">

          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0 rounded-t-3xl">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Process Monthly Salary</h2>
              <p className="text-xs text-gray-500 font-medium">Enter payment and bank details</p>
            </div>
            <button onClick={() => setShowProcessSalary(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <HiOutlineX size={18} />
            </button>
          </div>

          <form onSubmit={handleProcessSalary} className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest border-b pb-2">Employment Info</h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Staff Member</label>
                  <select value={formData.staffId}
                    onChange={e => handleStaffSelect(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    required>
                    <option value="">Choose member...</option>
                    {staffs.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName} — {s.role || (s.wardenId ? 'Warden' : 'Staff')} ({s.wardenId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Base Salary (₹)</label>
                  <div className="relative flex flex-col gap-1">
                    <div className="relative">
                      <HiOutlineCurrencyRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type={formData.amountToPay === "Calculating..." ? "text" : "number"} value={formData.amountToPay}
                        onChange={e => setFormData(prev => ({ ...prev, amountToPay: e.target.value }))}
                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                        disabled={formData.amountToPay === "Calculating..."}
                        required />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Allowances (₹)</label>
                    <input type="number" value={formData.allowances}
                      onChange={e => setFormData(prev => ({ ...prev, allowances: e.target.value }))}
                      className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Other Deductions (₹)</label>
                    <input type="number" value={formData.otherDeductions}
                      onChange={e => setFormData(prev => ({ ...prev, otherDeductions: e.target.value }))}
                      className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                </div>
                
                {formData.daysInMonth > 0 && (
                  <div className="bg-red-50 rounded-xl p-3 border border-red-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-red-800 uppercase tracking-wide">
                      Absent Deduction ({Math.max(0, formData.daysInMonth - formData.presentDays)} Days)
                    </span>
                    <span className="text-sm font-black text-red-700">
                      -₹{formData.absentDeduction}
                    </span>
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex justify-between items-center mt-2">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Net Salary</span>
                  <span className="text-lg font-black text-blue-700">
                    ₹{((Number(formData.amountToPay) || 0) + (Number(formData.allowances) || 0) - (Number(formData.otherDeductions) || 0) - (Number(formData.absentDeduction) || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest border-b pb-2">Bank Details</h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Bank Name</label>
                  <input type="text" value={formData.bankName}
                    onChange={e => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Account No.</label>
                    <input type="text" value={formData.accountNumber}
                      onChange={e => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">IFSC Code</label>
                    <input type="text" value={formData.ifscCode}
                      onChange={e => setFormData(prev => ({ ...prev, ifscCode: e.target.value }))}
                      className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 uppercase transition-all" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="button" onClick={() => setShowProcessSalary(false)}
                className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all order-2 sm:order-1">
                Cancel
              </button>
              <button type="submit" disabled={processing}
                className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all disabled:opacity-50 order-1 sm:order-2">
                {processing ? "Processing..." : "Confirm & Process Payout"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}