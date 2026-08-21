"use client"

import { useState, useEffect, useMemo } from "react"
import api from "../../lib/api"
import toast, { Toaster } from "react-hot-toast"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
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
  const isPaid = salary?.status === 'paid';
  const netWords      = numberToWords(salary?.netSalary || 0);
  const payDate       = salary?.paymentDate ? new Date(salary.paymentDate).toLocaleDateString('en-GB') : 'Processing';
  const accountDisplay = salary?.accountNumber ? `XXXX${salary.accountNumber.slice(-4)}` : 'N/A';
  const empId         = salary?.employeeId || `#${salary?._id?.slice(-6).toUpperCase() || 'N/A'}`;
  
  const formatAmt = (amt) => (amt || 0).toLocaleString('en-IN');
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
    @page { size: A4; margin: 0; }
    html, body { height: 100%; width: 100%; margin: 0; padding: 0; }
    body { 
      font-family: 'Inter', system-ui, -apple-system, sans-serif; 
      padding: 15mm; 
      color: #1A1F16; 
      background: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .header-main { 
      display: flex; justify-content: space-between; align-items: center; 
      padding-bottom: 20px; border-bottom: 1px solid #E5E7EB; margin-bottom: 30px;
    }
    .header-left { display: flex; align-items: center; gap: 20px; }
    .header-logo { width: 75px; height: 75px; object-fit: contain; }
    .brand-name { font-size: 28px; font-weight: 900; color: #111827; margin: 0; line-height: 1.1; text-transform: uppercase; letter-spacing: -0.02em; }
    .trust-info { font-size: 13px; font-weight: 700; color: #8A6D3B; margin: 6px 0 2px 0; text-transform: uppercase; }
    .division-info { font-size: 13px; font-weight: 700; color: #4F8CCF; margin: 0; text-transform: uppercase; }
    
    .header-right { text-align: right; font-size: 12px; color: #64748B; line-height: 1.6; }
    .contact-item { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-bottom: 4px; }
    
    .invoice-type-banner { 
      background: #F8FAF5; padding: 15px 25px; border-radius: 12px; margin-bottom: 30px;
      display: flex; justify-content: space-between; align-items: center; border: 1px solid #7A8B5E20;
    }
    .invoice-title { font-size: 16px; font-weight: 800; color: #7A8B5E; text-transform: uppercase; letter-spacing: 1px; }
    .status-badge { display: inline-block; padding: 6px 14px; border-radius: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .paid { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
    .pending { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .section-label { font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .info-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; }
    .info-val { font-weight: 700; color: #1A1F16; }

    .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .table th { background: #F1F5F9; text-align: left; padding: 12px 15px; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; }
    .table td { padding: 12px 15px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B; }
    .table td.amt { text-align: right; font-weight: 700; }
    .table th.amt { text-align: right; }

    .totals-section { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
    .words-box { max-width: 300px; font-size: 11px; color: #64748B; line-height: 1.5; font-weight: 600; }
    .totals-box { width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #E2E8F0; font-size: 13px;}
    .grand-total { border-top: 2px solid #1A1F16; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 800; color: #4A5D23; }

    .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #E2E8F0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header-main">
    <div class="header-left">
      <img src="/photos/logo1.svg" class="header-logo" alt="KGF Logo">
      <div>
        <h1 class="brand-name" style="color: #0F172A;">KGF BOYS HOSTEL</h1>
        <p class="trust-info" style="color: #6a5e15;">BY KOKAN GLOBAL FOUNDATION</p>
        <p class="division-info" style="color: #4A6E94;">HOSTEL MANAGEMENT DIVISION</p>
      </div>
    </div>
    <div class="header-right">
      <div class="contact-item"><span style="color: #DC2626; font-size: 14px;">📍</span> Maharashtra, India</div>
      <div class="contact-item"><span style="color: #DC2626; font-size: 14px;">📞</span> +91-7510012346</div>
      <div style="margin-top: 10px; font-weight: 800; color: #1E293B; display: flex; flex-direction: column; align-items: flex-end;">
        <span>Generated:</span>
        <span style="color: #0F172A; margin-top: 2px;">${new Date().toLocaleDateString('en-GB')}</span>
      </div>
    </div>
  </div>

  <div class="invoice-type-banner">
    <div class="invoice-title">Salary Slip / Remittance</div>
    <div class="status-badge ${isPaid ? 'paid' : 'pending'}">${salary?.status || 'Pending'}</div>
  </div>

  <div class="info-grid">
    <div>
      <div class="section-label">Employee Details</div>
      <div class="info-row"><span>Name:</span><span class="info-val">${(salary?.staffName || '').toUpperCase()}</span></div>
      <div class="info-row"><span>Designation:</span><span class="info-val">${salary?.role || 'Warden'}</span></div>
      <div class="info-row"><span>Emp ID:</span><span class="info-val" style="font-family:monospace;">${empId}</span></div>
    </div>
    <div>
      <div class="section-label">Payment Details</div>
      <div class="info-row"><span>Pay Period:</span><span class="info-val">${monthName} ${year}</span></div>
      <div class="info-row"><span>Pay Date:</span><span class="info-val">${payDate}</span></div>
      <div class="info-row"><span>Bank:</span><span class="info-val">${(salary?.bankName || 'Direct Transfer').toUpperCase()}</span></div>
      ${salary?.paymentMethod === 'cheque' ? `
      <div class="info-row"><span>Cheque No:</span><span class="info-val" style="font-family:monospace">${salary.chequeNumber || 'N/A'}</span></div>
      <div class="info-row"><span>Cheque Date:</span><span class="info-val">${salary.chequeDate ? new Date(salary.chequeDate).toLocaleDateString('en-GB') : 'N/A'}</span></div>
      ` : `
      <div class="info-row"><span>Account:</span><span class="info-val" style="font-family:monospace">${accountDisplay}</span></div>
      `}
    </div>
  </div>

  <div style="background: #F8FAF5; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 30px; width: 350px;">
    <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Attendance & Salary Calculation</div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #64748B;">
        <span>TOTAL DAYS</span>
        <span style="color: #1A1F16; border: 1px solid #E2E8F0; border-radius: 4px; padding: 2px 8px; background: white;">${salary?.totalDays || 0}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #64748B;">
        <span>ATTENDANCE</span>
        <span style="color: #1A1F16; border: 1px solid #E2E8F0; border-radius: 4px; padding: 2px 8px; background: white;">${salary?.attendanceDays || 0}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #10B981;">
        <span>PAID HOLIDAYS</span>
        <span style="border: 1px solid #A7F3D0; border-radius: 4px; padding: 2px 8px; background: white;">${salary?.paidHolidays || 0}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #64748B;">
        <span>ABSENCES</span>
        <span style="color: #EF4444; border: 1px solid #FECACA; border-radius: 4px; padding: 2px 8px; background: white;">${salary?.unpaidLeaves || 0}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #EF4444; border-top: 1px solid #E2E8F0; padding-top: 8px; margin-top: 4px;">
        <span>ABSENCE DEDUCTION (₹)</span>
        <span style="border: 1px solid #FECACA; border-radius: 4px; padding: 2px 8px; background: white;">${salary?.basicSalary && salary?.totalDays ? Math.round((salary.basicSalary / salary.totalDays) * (salary.unpaidLeaves || 0)) : 0}</span>
      </div>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th style="width: 40%">Earnings & Allowances</th>
        <th class="amt">Amount</th>
        <th style="width: 40%; padding-left: 30px;">Deductions</th>
        <th class="amt">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Basic Salary</td>
        <td class="amt" style="color: #15803d;">₹${formatAmt(salary?.basicSalary)}</td>
        <td style="padding-left: 30px;">Provident Fund (PF)</td>
        <td class="amt" style="color: #dc2626;">₹${formatAmt(salary?.pf)}</td>
      </tr>
      <tr>
        <td>Allowances</td>
        <td class="amt" style="color: #15803d;">₹${formatAmt(salary?.allowances)}</td>
        <td style="padding-left: 30px;">Tax Deductions</td>
        <td class="amt" style="color: #dc2626;">₹${formatAmt(salary?.tax)}</td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td style="padding-left: 30px;">Loan Deductions</td>
        <td class="amt" style="color: #dc2626;">₹${formatAmt(salary?.loanDeduction)}</td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td style="padding-left: 30px;">Other Deductions</td>
        <td class="amt" style="color: #dc2626;">₹${formatAmt(salary?.deductions)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals-section">
    <div class="words-box">
      <div style="text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; font-size: 10px;">Net Payout (In Words)</div>
      ${netWords}
    </div>
    <div class="totals-box">
      <div class="total-row">
        <span style="color: #64748B;">Total Earnings</span>
        <span style="font-weight: 700;">₹${formatAmt((salary?.basicSalary||0) + (salary?.allowances||0))}</span>
      </div>
      <div class="total-row">
        <span style="color: #64748B;">Total Deductions</span>
        <span style="font-weight: 700; color: #DC2626;">- ₹${formatAmt((salary?.pf||0) + (salary?.tax||0) + (salary?.loanDeduction||0) + (salary?.deductions||0))}</span>
      </div>
      <div class="total-row grand-total">
        <span>Take Home Pay</span>
        <span>₹${formatAmt(salary?.netSalary)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>
      <div style="font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;margin-bottom:4px;">Verification</div>
      <div style="color:#059669;font-weight:800;font-size:12px;">✓ Digital Record Verified</div>
      <div style="font-size:9px; color:#94A3B8; margin-top: 10px;">This is a system generated document. No physical signature is required.</div>
    </div>
    <div style="text-align:center;">
      <div style="width:160px; height:1px; background:#CBD5E1; margin:0 auto 8px;"></div>
      <div style="font-size:13px;font-weight:900;">${sigName}</div>
      <div style="font-size:10px;color:#64748B;font-weight:700;">Authorized Signatory</div>
    </div>
  </div>
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
  const [showChequeModal, setShowChequeModal] = useState(false)
  const [chequeSalary, setChequeSalary]     = useState(null)
  const [chequeFormData, setChequeFormData] = useState({ bankName: "", chequeNumber: "", chequeDate: "", chequeImage: null })
  const [showViewChequeModal, setShowViewChequeModal] = useState(false)
  const [viewChequeData, setViewChequeData] = useState(null)

  const [formData, setFormData] = useState({
    staffId: "", amountToPay: "", paymentMethod: "bank_transfer",
    allowances: 0, otherDeductions: 0, tax: 0, pf: 0, loanDeduction: 0, bankName: "", accountNumber: "", ifscCode: "",
    baseSalaryRaw: 0, presentDays: 0, daysInMonth: 0, absentDeduction: 0, paidHolidays: 0, actualAttendance: 0, absentDaysRaw: 0, isCalculating: false
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
      setFormData(prev => ({ ...prev, staffId: "", amountToPay: "", baseSalaryRaw: 0, presentDays: 0, daysInMonth: 0, isCalculating: false }));
      return;
    }
    
    // Set loading state for amount
    setFormData(prev => ({ ...prev, staffId, amountToPay: staff.salary || 0, baseSalaryRaw: staff.salary || 0, isCalculating: true }));

    try {
      const start = new Date(selectedYear, selectedMonth - 1, 1);
      const end = new Date(selectedYear, selectedMonth, 0); // Last day
      const daysInMonth = end.getDate();
      
      // Fetch attendance logs and holidays concurrently
      const [logsRes, holidaysRes] = await Promise.all([
        api.get(`/api/adminauth/attendance/logs`, {
          params: { startDate: start.toISOString(), endDate: end.toISOString() }
        }),
        api.get(`/api/adminauth/holidays`, {
          params: { month: selectedMonth, year: selectedYear }
        })
      ]);
      
      const logs = logsRes.data.logs || [];
      const holidays = holidaysRes.data.holidays || [];

      const staffLogs = logs.filter(log => (
        log.staffId?._id === staffId || 
        log.studentId?._id === staffId || 
        log.wardenId?._id === staffId
      ));
      
      const attendanceDates = new Set();
      
      // 1. Add days the staff was present
      staffLogs.forEach(log => {
        const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
        attendanceDates.add(dateStr);
      });

      const holidayDates = new Set();
      // 2. Add holidays (counted as paid days)
      holidays.forEach(holiday => {
        const hDate = new Date(holiday.date);
        // Add if it falls within the current month/year view
        if (hDate.getMonth() + 1 === selectedMonth && hDate.getFullYear() === selectedYear) {
           const dateStr = hDate.toISOString().split('T')[0];
           holidayDates.add(dateStr);
        }
      });

      const uniqueDates = new Set([...attendanceDates, ...holidayDates]);
      const presentDays = uniqueDates.size;
      
      const baseSalary = staff.salary || 0;
      const absentDaysRaw = Math.max(0, daysInMonth - presentDays);
      const absentDeduction = Math.round((baseSalary / daysInMonth) * absentDaysRaw);
      
      setFormData(prev => ({ 
        ...prev, 
        amountToPay: baseSalary || 0,
        baseSalaryRaw: baseSalary,
        presentDays: presentDays,
        daysInMonth: daysInMonth,
        absentDeduction: absentDeduction,
        otherDeductions: 0,
        paidHolidays: holidayDates.size,
        actualAttendance: attendanceDates.size,
        absentDaysRaw: absentDaysRaw,
        isCalculating: false
      }));
      toast.success(`Calculated: ${presentDays} paid days (${holidays.length} holidays included)`);
    } catch (err) {
      console.error("Failed to calculate attendance salary", err);
      setFormData(prev => ({ ...prev, amountToPay: staff.salary || 0, baseSalaryRaw: staff.salary || 0, absentDeduction: 0, isCalculating: false }));
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
        tax: Number(formData.tax) || 0, pf: Number(formData.pf) || 0, loanDeduction: Number(formData.loanDeduction) || 0,
        totalDays: formData.daysInMonth,
        attendanceDays: formData.actualAttendance,
        paidHolidays: formData.paidHolidays,
        unpaidLeaves: formData.absentDaysRaw
      })
      if (res.data.success) {
        toast.success("Salary processed successfully")
        setShowProcessSalary(false)
        fetchSalaries()
        setFormData({ staffId:"", amountToPay:"", paymentMethod:"bank_transfer", allowances:0, otherDeductions:0, tax:0, pf:0, loanDeduction:0, bankName:"", accountNumber:"", ifscCode:"", absentDeduction: 0, presentDays: 0, daysInMonth: 0 })
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

  const handleChequeSubmit = async (e) => {
    e.preventDefault();
    if (!chequeFormData.chequeNumber || !chequeFormData.chequeDate || !chequeFormData.bankName) {
      toast.error("Please fill all cheque details");
      return;
    }
    setProcessing(true);
    try {
      const payload = new FormData();
      payload.append('status', 'paid');
      payload.append('paymentMethod', 'cheque');
      payload.append('bankName', chequeFormData.bankName);
      payload.append('chequeNumber', chequeFormData.chequeNumber);
      payload.append('chequeDate', chequeFormData.chequeDate);
      if (chequeFormData.chequeImage) {
        payload.append('chequeImage', chequeFormData.chequeImage);
      }

      await api.put(`/api/adminauth/salary/${chequeSalary._id}/status`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(`Salary marked as paid (Cheque)`);
      fetchSalaries();
      setShowChequeModal(false);
      setChequeSalary(null);
      setChequeFormData({ bankName: "", chequeNumber: "", chequeDate: "", chequeImage: null });
    } catch {
      toast.error("Failed to process cheque payment");
    } finally {
      setProcessing(false);
    }
  };

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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm font-medium">Total Payroll Cost</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">₹{totals.totalPayroll.toLocaleString('en-IN')}</p>
      </div>
      <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-200">
        <p className="text-amber-600 text-sm font-medium">Total Payout</p>
        <p className="text-2xl font-bold text-amber-700 mt-1">₹{totals.totalPayout.toLocaleString('en-IN')}</p>
      </div>
      <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
        <p className="text-blue-600 text-sm font-medium">Staff Count</p>
        <p className="text-2xl font-bold text-blue-700 mt-1">{salaries.length}</p>
      </div>
    </div>
  )

  // ── Salary Table ──────────────────────────────────────────────────────────
  const renderTable = () => (
    <>
      {/* Filtering */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search staff name..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 outline-none text-sm font-semibold text-black shadow-sm w-full" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="px-4 py-2 text-sm font-semibold text-black bg-white shadow-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
            <HiOutlineDownload size={16} /><span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => setShowProcessSalary(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 shadow-sm rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
            <HiOutlinePlus size={16} /><span>Process Salary</span>
          </button>
        </div>
      </div>

      <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-6 border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter' }}>
        <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-black">
              Payroll Records
            </h2>
            <p className="text-sm text-gray-700 mt-1">Total: {filteredSalaries.length} records</p>
          </div>
        </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-left bg-white rounded-xl overflow-hidden shadow-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              {["Staff Member","Basic Salary","Net Salary","Status","Actions"].map(h => (
                <th key={h} className={`px-4 py-3 text-sm font-semibold text-gray-700 ${h==="Actions"?"text-right":""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_,i) => (
              <tr key={i} className="animate-pulse bg-white border-b border-gray-100">
                <td colSpan={5} className="px-4 py-3"><div className="h-10 bg-gray-100 rounded-lg"/></td>
              </tr>
            )) : filteredSalaries.length===0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 font-bold text-sm uppercase tracking-widest bg-white/40">No records found for this period</td></tr>
            ) : filteredSalaries.map(salary => (
              <tr key={salary._id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm uppercase shrink-0">
                      {salary.staffName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{salary.staffName}</div>
                      <div className="text-xs font-semibold text-gray-500">{salary.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-700">
                  ₹{salary.basicSalary.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-[#4F8CCF]">
                  ₹{salary.netSalary.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-block ${
                    salary.status==='paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {salary.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    {salary.status==='pending' && (
                      <div className="flex gap-2 border-r border-gray-200 pr-3 mr-1">
                        <button onClick={() => { setChequeSalary(salary); setShowChequeModal(true); }}
                          className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors text-xs font-bold shadow-sm" title="Pay via Cheque">
                          <FaUniversity size={12}/> Cheque
                        </button>
                      </div>
                    )}
                    {salary.status === 'paid' && salary.paymentMethod === 'cheque' && (
                      <button onClick={() => { setViewChequeData(salary); setShowViewChequeModal(true); }}
                        className="px-3 py-1.5 bg-[#f4f6f0] text-gray-700 hover:bg-[#e4e7dd] rounded-lg text-xs font-bold transition-colors border border-[#BEC5AD] flex items-center gap-1">
                        <FaUniversity size={12}/> View Cheque
                      </button>
                    )}
                    <button onClick={() => { setSelectedSalary(salary); setShowPayslipModal(true); }}
                      className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors border border-blue-200">
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
    </>
  )

  // ── Payslip Preview (React modal) ──────────────────────────────────────────
  // ── Payslip Preview (React modal) ──────────────────────────────────────────
  const PayslipPreview = ({ salary }) => {
    const isPaid = salary?.status === 'paid';
    return (
    <div className="bg-white text-gray-900 w-full mx-auto relative shadow-sm border border-gray-100" style={{ maxWidth: 800, fontFamily: 'Inter, sans-serif' }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-gray-200 mb-8 px-8 pt-8">
        <div className="flex items-center gap-5">
          <img src="/photos/logo1.svg" alt="KGF Logo" className="w-[75px] h-[75px] object-contain shrink-0" onError={e => { e.currentTarget.style.display = 'none' }} />
          <div>
            <h1 className="text-[28px] font-black text-[#0F172A] uppercase leading-[1.1] tracking-[-0.02em]">KGF BOYS HOSTEL</h1>
            <p className="text-[13px] text-[#6a5e15] font-bold uppercase mt-1.5">by Kokan Global Foundation</p>
            <p className="text-[13px] text-[#4A6E94] font-bold uppercase mt-0.5">Hostel Management Division</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 text-left sm:text-right text-[12px] text-[#64748B] leading-relaxed">
          <div className="flex justify-start sm:justify-end items-center gap-2 mb-1"><span className="text-red-600 text-sm">📍</span> Maharashtra, India</div>
          <div className="flex justify-start sm:justify-end items-center gap-2 mb-1"><span className="text-red-600 text-sm">📞</span> +91-7510012346</div>
          <div className="mt-2 text-[12px] flex flex-col justify-end sm:items-end">
            <span className="font-extrabold text-gray-800">Generated:</span> 
            <span className="font-bold text-[#0F172A] mt-0.5">{new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* ── Invoice Banner ── */}
        <div className="bg-[#F8FAF5] px-6 py-4 rounded-xl mb-8 flex justify-between items-center border border-[#7A8B5E]/20">
          <div className="text-[16px] font-black text-[#7A8B5E] uppercase tracking-widest">Salary Slip / Remittance</div>
          <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isPaid ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
            {salary?.status || 'Pending'}
          </div>
        </div>

        {/* ── Info Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {/* Employee */}
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Employee Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600 font-medium">Name:</span><span className="font-bold text-gray-900">{salary?.staffName?.toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-medium">Designation:</span><span className="font-bold text-gray-900">{salary?.role || 'Warden'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-medium">Emp ID:</span><span className="font-mono font-bold text-gray-900">{salary?.employeeId || `#${salary?._id?.slice(-6).toUpperCase()}`}</span></div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Payment Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600 font-medium">Pay Period:</span><span className="font-bold text-gray-900">{currentMonthName} {selectedYear}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-medium">Pay Date:</span><span className="font-bold text-gray-900">{salary?.paymentDate ? new Date(salary.paymentDate).toLocaleDateString('en-GB') : 'Processing'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-medium">Bank:</span><span className="font-bold text-gray-900">{(salary?.bankName || 'Direct Transfer').toUpperCase()}</span></div>
              {salary?.paymentMethod === 'cheque' ? (
                <>
                  <div className="flex justify-between"><span className="text-gray-600 font-medium">Cheque No:</span><span className="font-mono font-bold text-gray-900">{salary.chequeNumber || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 font-medium">Cheque Date:</span><span className="font-bold text-gray-900">{salary.chequeDate ? new Date(salary.chequeDate).toLocaleDateString('en-GB') : 'N/A'}</span></div>
                </>
              ) : (
                <div className="flex justify-between"><span className="text-gray-600 font-medium">Account:</span><span className="font-mono font-bold text-gray-900">{salary?.accountNumber ? `XXXX${salary.accountNumber.slice(-4)}` : 'N/A'}</span></div>
              )}
            </div>
          </div>
        </div>

        {/* ── Calculation Box ── */}
        <div className="mb-8">
          <div className="bg-[#F8FAF5] border border-gray-200 rounded-xl p-5 shadow-sm max-w-sm">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Attendance & Salary Calculation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 font-bold uppercase tracking-wider text-xs">Total Days</span>
                <span className="font-bold text-gray-900 border border-gray-200 rounded px-3 py-1 bg-white">{salary?.totalDays || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 font-bold uppercase tracking-wider text-xs">Attendance</span>
                <span className="font-bold text-gray-900 border border-gray-200 rounded px-3 py-1 bg-white">{salary?.attendanceDays || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#10b981] font-bold uppercase tracking-wider text-xs">Paid Holidays</span>
                <span className="font-bold text-[#10b981] border border-green-200 rounded px-3 py-1 bg-white">{salary?.paidHolidays || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 font-bold uppercase tracking-wider text-xs">Absences</span>
                <span className="font-bold text-red-600 border border-red-200 rounded px-3 py-1 bg-white">{salary?.unpaidLeaves || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 mt-2 border-t border-gray-200">
                <span className="text-red-600 font-black uppercase tracking-wider text-xs">Absence Deduction (₹)</span>
                <span className="font-bold text-red-600 border border-red-200 rounded px-3 py-1 bg-white">
                  {salary?.basicSalary && salary?.totalDays ? Math.round((salary.basicSalary / salary.totalDays) * (salary.unpaidLeaves || 0)) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="mb-8">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-widest">
                <th className="p-3 w-5/12">Earnings & Allowances</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 w-5/12 pl-6 border-l-2 border-white">Deductions</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-3 font-medium text-gray-800">Basic Salary</td>
                <td className="p-3 text-right font-bold text-green-700">₹{(salary?.basicSalary||0).toLocaleString('en-IN')}</td>
                <td className="p-3 pl-6 text-gray-600 border-l border-gray-100">Provident Fund (PF)</td>
                <td className="p-3 text-right font-bold text-red-600">₹{(salary?.pf||0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-gray-800">Allowances</td>
                <td className="p-3 text-right font-bold text-green-700">₹{(salary?.allowances || 0).toLocaleString('en-IN')}</td>
                <td className="p-3 pl-6 text-gray-600 border-l border-gray-100">Tax Deductions</td>
                <td className="p-3 text-right font-bold text-red-600">₹{(salary?.tax||0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="p-3"></td>
                <td className="p-3 text-right"></td>
                <td className="p-3 pl-6 text-gray-600 border-l border-gray-100">Loan Deductions</td>
                <td className="p-3 text-right font-bold text-red-600">₹{(salary?.loanDeduction||0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-gray-200"></td>
                <td className="p-3 text-right border-b border-gray-200"></td>
                <td className="p-3 pl-6 text-gray-600 border-l border-gray-100 border-b border-gray-200">Other Deductions</td>
                <td className="p-3 text-right font-bold text-red-600 border-b border-gray-200">₹{(salary?.deductions||0).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Totals ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          <div className="max-w-xs pt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Net Payout (In Words)</p>
            <p className="text-[11px] font-bold text-gray-600 capitalize leading-relaxed">
              {numberToWords(salary?.netSalary || 0)}
            </p>
          </div>
          <div className="w-full sm:w-72">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500 font-medium">Total Earnings</span>
              <span className="font-bold text-gray-900">₹{((salary?.basicSalary||0) + (salary?.allowances||0)).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 text-sm border-t border-gray-100">
              <span className="text-gray-500 font-medium">Total Deductions</span>
              <span className="font-bold text-red-600">- ₹{((salary?.pf||0) + (salary?.tax||0) + (salary?.loanDeduction||0) + (salary?.deductions||0)).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between pt-4 mt-2 border-t-2 border-gray-900 text-lg">
              <span className="font-black text-[#4A5D23]">Take Home Pay</span>
              <span className="font-black text-gray-900">₹{(salary?.netSalary||0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Cheque Image (If exists) */}
        {salary?.paymentMethod === 'cheque' && salary?.chequeImage && (
          <div className="mt-10 pt-6 border-t border-gray-100">
             <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Attached Cheque Reference</h4>
             <div className="w-full max-w-sm border border-gray-200 rounded-lg p-2 bg-gray-50">
               <img src={`http://localhost:5000${salary.chequeImage}`} alt="Cheque Scan" className="w-full h-auto rounded" />
             </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-16 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-end gap-8">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Verification</p>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <HiOutlineBadgeCheck size={16} /> Digital Record Verified
            </div>
            <p className="text-[9px] text-gray-400 mt-3 font-medium">This is a system generated document. No physical signature is required.</p>
          </div>
          <div className="text-center">
            <div className="w-40 h-[1px] bg-gray-300 mx-auto mb-2" />
            <p className="text-xs font-black text-gray-900 tracking-wider">
              {salary?.processedByName && !salary.processedByName.includes('undefined') ? salary.processedByName : 'Authorized Admin'}
            </p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  )};

  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-4 font-sans">
      <Toaster position="top-right" />
      <div className="w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
              <h1 className="text-[25px] leading-[25px] font-extrabold text-black flex items-center" style={{ fontFamily: 'Inter' }}>
                Staff Salary
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 text-sm ml-3" style={{ fontFamily: 'Poppins' }}>
              Manage and process monthly payroll with ease
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#f4f6f0] p-1.5 rounded-xl shadow-sm border border-[#BEC5AD]/30 w-full sm:w-auto mt-4 sm:mt-0">
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-transparent border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer">
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
            <div className="w-px h-5 bg-gray-300" />
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPayslipModal(false)} />
            <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-xl font-sans">

              {/* Modal header */}
              <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center shrink-0 sm:rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white/30 rounded-xl p-1.5 shrink-0">
                    <img src="/photos/logo1.svg" alt="Logo"
                      className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                      onError={e => { e.currentTarget.style.display='none' }} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-black leading-tight">Salary Slip</h2>
                    <p className="text-gray-800 text-xs font-semibold">{currentMonthName} {selectedYear}</p>
                  </div>
                </div>
                <button onClick={() => setShowPayslipModal(false)}
                  className="text-black/70 hover:text-black transition-colors">
                  <HiOutlineX size={20} />
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
        {showChequeModal && renderChequeModal()}
        {showViewChequeModal && renderViewChequeModal()}
      </div>
    </div>
  )

  // ── Process Salary Modal ──────────────────────────────────────────────────
  function renderProcessSalaryModal() {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[100] p-4">
        <div className="bg-[#f4f6f0] rounded-2xl shadow-xl overflow-hidden w-full max-w-2xl relative flex flex-col border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter', maxHeight: '90vh' }}>
          
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                Process Monthly Salary
              </h2>
            </div>
            <button onClick={() => setShowProcessSalary(false)} className="text-black/70 hover:text-black transition-colors">
              <HiOutlineX size={24} />
            </button>
          </div>

          <form onSubmit={handleProcessSalary} className="p-6 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Employment Info</p>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Staff Member</label>
                  <select value={formData.staffId}
                    onChange={e => handleStaffSelect(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[#BEC5AD] transition-all text-gray-600 font-medium"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Base Salary (₹)</label>
                  <div className="relative">
                    <HiOutlineCurrencyRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="number" value={formData.amountToPay}
                      onChange={e => setFormData(prev => ({ ...prev, amountToPay: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#BEC5AD] transition-all disabled:opacity-50 text-gray-800"
                      disabled={formData.isCalculating}
                      required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Allowances (₹)</label>
                    <input type="number" value={formData.allowances}
                      onChange={e => setFormData(prev => ({ ...prev, allowances: e.target.value }))}
                      className="w-full px-3 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[#BEC5AD] transition-all text-gray-600 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Other Deductions (₹)</label>
                    <input type="number" value={formData.otherDeductions}
                      onChange={e => setFormData(prev => ({ ...prev, otherDeductions: e.target.value }))}
                      className="w-full px-3 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[#BEC5AD] transition-all text-gray-600 font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tax (₹)</label>
                    <input type="number" value={formData.tax}
                      onChange={e => setFormData(prev => ({ ...prev, tax: e.target.value }))}
                      className="w-full px-3 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[#BEC5AD] transition-all text-gray-600 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">PF (₹)</label>
                    <input type="number" value={formData.pf}
                      onChange={e => setFormData(prev => ({ ...prev, pf: e.target.value }))}
                      className="w-full px-3 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[#BEC5AD] transition-all text-gray-600 font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Loan Deduction (₹)</label>
                    <input type="number" value={formData.loanDeduction}
                      onChange={e => setFormData(prev => ({ ...prev, loanDeduction: e.target.value }))}
                      className="w-full px-3 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[#BEC5AD] transition-all text-gray-600 font-medium" />
                  </div>
                </div>
                
                {formData.isCalculating && (
                  <div className="bg-white shadow-sm rounded-xl p-3 border border-gray-200 flex items-center justify-center animate-pulse">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Calculating Attendance...</span>
                  </div>
                )}
                
                {!formData.isCalculating && formData.daysInMonth > 0 && (
                  <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200 space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="font-semibold text-gray-600 uppercase tracking-wider text-xs">Total Days</span>
                      <input type="number" className="w-16 text-right font-bold text-gray-900 border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#BEC5AD]" value={formData.daysInMonth} onChange={e => setFormData(prev => ({...prev, daysInMonth: e.target.value}))} />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm pt-1">
                      <span className="font-semibold text-gray-600 uppercase tracking-wider text-xs">Attendance</span>
                      <input type="number" className="w-16 text-right font-bold text-gray-900 border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#BEC5AD]" value={formData.actualAttendance} onChange={e => setFormData(prev => ({...prev, actualAttendance: e.target.value}))} />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-[#10b981] uppercase tracking-wider text-xs">Paid Holidays</span>
                      <input type="number" className="w-16 text-right font-bold text-[#10b981] border border-green-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-green-400" value={formData.paidHolidays} onChange={e => setFormData(prev => ({...prev, paidHolidays: e.target.value}))} />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm pt-1 border-t border-gray-100 mt-1">
                      <span className="font-semibold text-gray-600 uppercase tracking-wider text-xs">Absences</span>
                      <input type="number" className="w-16 text-right font-bold text-red-600 border border-red-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-red-400" value={formData.absentDaysRaw} onChange={e => setFormData(prev => ({...prev, absentDaysRaw: e.target.value}))} />
                    </div>
                    <div className="flex justify-between items-center text-sm text-red-600 border-t border-red-50 pt-2 mt-1">
                      <span className="font-bold uppercase tracking-wider text-xs">Absence Deduction (₹)</span>
                      <input type="number" className="w-24 text-right font-bold text-red-600 border border-red-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-red-400" value={formData.absentDeduction} onChange={e => setFormData(prev => ({...prev, absentDeduction: e.target.value}))} />
                    </div>
                  </div>
                )}

                <div className="bg-white shadow-sm rounded-xl p-3 border border-gray-200 flex justify-between items-center mt-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Salary</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{((Number(formData.amountToPay) || 0) + (Number(formData.allowances) || 0) - (Number(formData.otherDeductions) || 0) - (Number(formData.tax) || 0) - (Number(formData.pf) || 0) - (Number(formData.loanDeduction) || 0) - (Number(formData.absentDeduction) || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bank Details</p>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Name</label>
                  <input type="text" value={formData.bankName}
                    onChange={e => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[#BEC5AD] transition-all text-gray-600 font-medium" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Account No.</label>
                    <input type="text" value={formData.accountNumber}
                      onChange={e => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full px-3 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[#BEC5AD] transition-all text-gray-600 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">IFSC Code</label>
                    <input type="text" value={formData.ifscCode}
                      onChange={e => setFormData(prev => ({ ...prev, ifscCode: e.target.value }))}
                      className="w-full px-3 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[#BEC5AD] uppercase transition-all text-gray-600 font-medium" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-4">
              <button type="button" onClick={() => setShowProcessSalary(false)}
                className="flex-1 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium py-3 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={processing || formData.isCalculating}
                className="flex-1 bg-[#10b981] text-white rounded-xl font-medium py-3 hover:bg-[#059669] transition-colors disabled:opacity-50">
                {processing ? "Processing..." : "Confirm & Process"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ── Cheque Payment Modal ──────────────────────────────────────────────────
  function renderChequeModal() {
    if (!showChequeModal || !chequeSalary) return null;
    return (
      <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#f4f6f0] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-[#BEC5AD]/30 flex flex-col max-h-[90vh]" style={{ fontFamily: 'Inter' }}>
          <div className="bg-gradient-to-r from-amber-500 to-amber-400 p-6 flex justify-between items-center text-white relative overflow-hidden shrink-0">
            <div className="absolute -right-6 -top-6 text-white/20">
              <FaUniversity size={100} />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold">Issue Cheque</h2>
              <p className="text-sm font-medium text-amber-50 opacity-90 mt-1">Payment for {chequeSalary.staffName}</p>
            </div>
            <button type="button" onClick={() => { setShowChequeModal(false); setChequeSalary(null); }} className="p-2 hover:bg-white/20 rounded-full transition-colors relative z-10">
              <HiOutlineX size={20} />
            </button>
          </div>
          
          <form onSubmit={handleChequeSubmit} className="p-6 space-y-5 bg-white m-2 rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex justify-between items-center">
              <span className="text-sm font-bold text-amber-800">Net Amount</span>
              <span className="text-xl font-black text-amber-600">₹{chequeSalary.netSalary.toLocaleString('en-IN')}</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Name</label>
              <input type="text" value={chequeFormData.bankName} required
                onChange={e => setChequeFormData(prev => ({ ...prev, bankName: e.target.value }))}
                placeholder="e.g. State Bank of India"
                className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-amber-500 transition-all text-gray-800 font-bold" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cheque Number</label>
              <input type="text" value={chequeFormData.chequeNumber} required
                onChange={e => setChequeFormData(prev => ({ ...prev, chequeNumber: e.target.value }))}
                placeholder="6-digit cheque number"
                maxLength={6}
                className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-amber-500 transition-all text-gray-800 font-bold tracking-widest" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cheque Date</label>
              <div className="relative">
                <DatePicker 
                  selected={chequeFormData.chequeDate ? new Date(chequeFormData.chequeDate) : null} 
                  onChange={date => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setChequeFormData(prev => ({ ...prev, chequeDate: `${year}-${month}-${day}` }));
                    } else {
                      setChequeFormData(prev => ({ ...prev, chequeDate: "" }));
                    }
                  }} 
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-amber-500 transition-all text-gray-800 font-bold"
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Cheque Photo (Optional)</label>
              <input type="file" id="cheque-upload" accept="image/*"
                onChange={e => setChequeFormData(prev => ({ ...prev, chequeImage: e.target.files[0] }))}
                className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-amber-500 transition-all text-gray-800 font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
              {chequeFormData.chequeImage && (
                <div className="mt-4 relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 h-40 flex items-center justify-center">
                  <img 
                    src={URL.createObjectURL(chequeFormData.chequeImage)} 
                    alt="Cheque Preview" 
                    className="max-h-full max-w-full object-contain" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setChequeFormData(prev => ({ ...prev, chequeImage: null }));
                      const fileInput = document.getElementById('cheque-upload');
                      if (fileInput) fileInput.value = '';
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <HiOutlineX size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6 pt-2">
              <button type="button" onClick={() => { setShowChequeModal(false); setChequeSalary(null); }}
                className="flex-1 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold py-3 hover:bg-gray-50 transition-colors shadow-sm">
                Cancel
              </button>
              <button type="submit" disabled={processing}
                className="flex-1 bg-amber-500 text-white rounded-xl font-bold py-3 hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50">
                {processing ? "Saving..." : "Confirm & Pay"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── View Cheque Modal ─────────────────────────────────────────────────────
  function renderViewChequeModal() {
    if (!viewChequeData) return null;
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[100] p-4">
        <div className="bg-[#f4f6f0] rounded-2xl shadow-xl overflow-hidden w-full max-w-lg relative flex flex-col border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter', maxHeight: '90vh' }}>
          
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center shrink-0">
            <h2 className="text-xl font-semibold text-black flex items-center gap-2">
              <FaUniversity /> Cheque Details
            </h2>
            <button onClick={() => { setShowViewChequeModal(false); setViewChequeData(null); }} className="text-black/70 hover:text-black transition-colors">
              <HiOutlineX size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-500 font-semibold">Bank Name:</span>
                <span className="text-sm font-bold text-gray-900">{viewChequeData.bankName || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-500 font-semibold">Cheque Number:</span>
                <span className="text-sm font-mono font-bold text-gray-900">{viewChequeData.chequeNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 font-semibold">Cheque Date:</span>
                <span className="text-sm font-bold text-gray-900">{viewChequeData.chequeDate ? new Date(viewChequeData.chequeDate).toLocaleDateString('en-GB') : 'N/A'}</span>
              </div>
            </div>

            {viewChequeData.chequeImage ? (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Cheque Photo</h3>
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-white p-2">
                  <img 
                    src={viewChequeData.chequeImage.startsWith('http') ? viewChequeData.chequeImage : `${(api.defaults.baseURL || 'http://localhost:5000').replace(/\/$/, '')}${viewChequeData.chequeImage.startsWith('/') ? '' : '/'}${viewChequeData.chequeImage}`} 
                    alt="Cheque" 
                    className="w-full h-auto object-contain max-h-[300px]"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                No cheque photo available.
              </div>
            )}
            
            <div className="pt-4">
              <button type="button" onClick={() => { setShowViewChequeModal(false); setViewChequeData(null); }}
                className="w-full bg-white text-gray-700 border border-gray-200 rounded-xl font-bold py-3 hover:bg-gray-50 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}