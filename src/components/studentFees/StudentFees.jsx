


"use client";

import React, { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineCurrencyRupee,
  HiOutlineDownload,
  HiOutlineEye,
} from "react-icons/hi";
import {
  FaGraduationCap,
  FaFileInvoiceDollar,
  FaHistory,
} from "react-icons/fa";
import {
  MdOutlinePayments,
  MdOutlinePendingActions,
  MdOutlineReceiptLong,
} from "react-icons/md";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

// ── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: "#4F8CCF",
  bgLight: "#F0F6FC",
  accent: "#4F8CCF",
  accentDark: "#3A6FA6",
  accentLight: "#E1EDF8",
  gold: "#F59E0B",
  goldLight: "#FEF3C7",
  text: "#1F2937",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  glass: "rgba(255, 255, 255, 0.95)",
  shadow: "rgba(0, 0, 0, 0.05)",
  shadowHover: "rgba(0, 0, 0, 0.1)",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F59E0B",
};

const css = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F3F4F6",
    padding: "24px",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  glassCard: {
    background: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    padding: "24px",
  },
  statCard: {
    background: "#FFFFFF",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    cursor: "pointer",
  },
  btnPrimary: {
    background: "#4F8CCF",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
  },
  btnSecondary: {
    background: "#FFFFFF",
    color: "#4F8CCF",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: 600,
    border: "1px solid #E5E7EB",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
  },
  input: {
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    color: "#1F2937",
    outline: "none",
    width: "100%",
    transition: "all 0.2s ease",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount || 0);

const StatusBadge = ({ status }) => {
  const map = {
    paid: { bg: "#ECFDF5", color: "#059669", label: "Paid", icon: <HiOutlineCheckCircle /> },
    overdue: { bg: "#FEF2F2", color: "#DC2626", label: "Overdue", icon: <HiOutlineExclamationCircle /> },
    pending: { bg: "#FFFBEB", color: "#D97706", label: "Pending", icon: <HiOutlineClock /> },
    pending_verification: { bg: "#EFF6FF", color: "#2563EB", label: "Verification Required", icon: <HiOutlineClock /> },
    no_invoice: { bg: "#F9FAFB", color: "#6B7280", label: "No Bill", icon: null },
  };
  const s = map[status] || map.no_invoice;
  return (
    <span style={{
      ...css.badge,
      background: s.bg,
      color: s.color,
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    }}>
      {s.icon && React.cloneElement(s.icon, { size: 14 })}
      {s.label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const StudentFees = () => {
  const [students, setStudents] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  // ── Local partial-payment input state (avoids stale DOM getElementById) ───
  const [partialAmt, setPartialAmt] = useState("");

  const [invoiceForm, setInvoiceForm] = useState({
    amount: "",
    invoiceType: "hostel_fee",
    dueDate: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [verifyingOCR, setVerifyingOCR] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [ocrSuccess, setOcrSuccess] = useState(null);
  const selectedYear = new Date().getFullYear();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, invoicesRes] = await Promise.all([
        api.get("/api/adminauth/students"),
        api.get("/api/adminauth/invoices/student?limit=1000"),
      ]);
      setStudents(studentsRes.data.students || []);
      setInvoices(invoicesRes.data.invoices || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load fee data");
    } finally {
      setLoading(false);
    }
  };



  // ── Derived fee stats ─────────────────────────────────────────────────────
  const studentFeeStats = useMemo(() => students.map(student => {
    const allStudentInvoices = invoices.filter(inv =>
      inv.studentId?._id?.toString() === student._id?.toString() ||
      inv.studentId?.toString() === student._id?.toString()
    );

    let roomDisplay = "Unassigned";
    const rb = student.roomBedNumber;
    if (rb) {
      if (typeof rb === "object") {
        const shortBed = rb.barcodeId ? rb.barcodeId.split("-").slice(0, 2).join("-") : "";
        roomDisplay = `${rb.roomNo || ""}${shortBed ? " / " + shortBed : ""}`;
      } else {
        roomDisplay = rb;
      }
    }

    const studentName =
      student.studentName ||
      `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
      "Unknown Student";

    const monthlyFee =
      student.roomType === "5" ? 4500 :
      student.roomType === "4" ? 5000 :
      student.roomType === "3" ? 5500 : 0;
    
    const depositAmount = monthlyFee * 3;
    const quarterlyFee = monthlyFee * 3;

    const invoicedTotalAllTime = allStudentInvoices.reduce((s, i) => s + (i.amount || 0), 0);
    const totalFeesAllTime = invoicedTotalAllTime > 0 ? Math.max(invoicedTotalAllTime, depositAmount + quarterlyFee) : depositAmount + quarterlyFee;

    const paidFeesAllTime = allStudentInvoices.reduce((s, i) => {
      if (i.status === "paid") return s + (i.paidAmount > 0 ? i.paidAmount : i.amount || 0);
      return s + (i.paidAmount || 0);
    }, 0);

    const pendingFeesAllTime = Math.max(0, totalFeesAllTime - paidFeesAllTime);

    let totalFees = totalFeesAllTime;
    let paidFees = paidFeesAllTime;
    let pendingFees = pendingFeesAllTime;
    let studentInvoices = allStudentInvoices;

    const isOverdue = allStudentInvoices.some(
      i => i.status !== "paid" && new Date(i.dueDate) < new Date()
    );

    let status;
    if (monthlyFee === 0 && allStudentInvoices.length === 0) {
      status = "no_invoice";
    } else if (pendingFeesAllTime <= 0) {
      status = "paid";
    } else if (isOverdue) {
      status = "overdue";
    } else {
      status = "pending";
    }

    // ── Billing Cycle Calculation ──────────────────────────────────────────────
    let billingCycleDisplay = "N/A";
    if (student.admissionDate) {
      let cycleStart = new Date(student.admissionDate);
      let cycleEnd = new Date(cycleStart);
      cycleEnd.setMonth(cycleEnd.getMonth() + 3);
      
      const now = new Date();
      while (cycleEnd < now) {
        cycleStart = new Date(cycleEnd);
        cycleEnd = new Date(cycleStart);
        cycleEnd.setMonth(cycleEnd.getMonth() + 3);
      }
      
      const formatD = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
      billingCycleDisplay = `${formatD(cycleStart)} - ${formatD(cycleEnd)}`;
    }

    return {
      ...student,
      roomBedNumber: roomDisplay,
      studentName,
      monthlyFee,
      quarterlyFee,
      depositAmount,
      billingCycleDisplay,
      totalFees,
      paidFees,
      pendingFees,
      invoiceCount: studentInvoices.length,
      status,
      allInvoices: studentInvoices,
    };
  }), [students, invoices]);

  const activeStudent = useMemo(() =>
    studentFeeStats.find(s => s._id === selectedStudentId),
    [studentFeeStats, selectedStudentId]
  );

  const filteredStudents = useMemo(() => studentFeeStats.filter(s => {
    const matchesSearch =
      s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roomBedNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [studentFeeStats, searchTerm, statusFilter]);

  // ── Generate Invoice ──────────────────────────────────────────────────────
  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!activeStudent) return;
    
    // ── Prevent duplicate security deposit billing ──
    if (invoiceForm.invoiceType === "security_deposit") {
      const existingDeposit = activeStudent.allInvoices.find(inv => inv.invoiceType === "security_deposit");
      if (existingDeposit && existingDeposit.status === "paid") {
        toast.error("Security Deposit has already been paid for this student.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post("/api/adminauth/invoices/student", {
        studentId: activeStudent.studentId,
        ...invoiceForm,
        amount: Number(invoiceForm.amount),
      });
      toast.success("Invoice generated successfully");
      setShowGenerateModal(false);
      fetchData();
      setInvoiceForm({
        amount: "",
        invoiceType: "hostel_fee",
        dueDate: new Date().toISOString().split("T")[0],
        description: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate invoice");
    } finally {
      setSubmitting(false);
    }
  };

  // ── FIX: Record partial/full cash payment ────────────────────────────────
  // Sends paidAmountToAdd so backend increments paidAmount correctly.
  const handleRecordPayment = async (invoiceId, amountStr, method = "cash") => {
    const amount = Number(amountStr);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      setSubmitting(true);
      await api.put(`/api/adminauth/invoices/student/${invoiceId}/status`, {
        paidAmountToAdd: amount,
        paymentMethod: method,
      });
      toast.success(`Payment of ${formatCurrency(amount)} recorded (${method})`);
      setSelectedInvoice(null);
      await fetchData();
    } catch (err) {
      console.error("Record payment error:", err);
      toast.error("Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  // ── FIX: Mark full invoice as paid via Cash ──────────────────────────────
  // Now sends paidAmountToAdd = full remaining balance so paidAmount is set correctly.
  const handleMarkFullyPaid = async (invoice, method = "cash") => {
    const remaining = (invoice.amount || 0) - (invoice.paidAmount || 0);
    try {
      setSubmitting(true);
      await api.put(`/api/adminauth/invoices/student/${invoice._id}/status`, {
        paidAmountToAdd: remaining > 0 ? remaining : invoice.amount,
        paymentMethod: method,
        status: "paid",
      });
      toast.success(`Marked as paid (${method})`);
      setSelectedInvoice(null);
      await fetchData();
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminVerifyOCR = async (invoiceId, file) => {
    if (!file) return;
    setVerifyingOCR(true);
    setOcrError(null);
    setOcrSuccess(null);

    const formData = new FormData();
    formData.append("screenshot", file);

    try {
      toast.loading("Running OCR and matching UTR...", { id: "ocr-toast" });
      const res = await api.post(`/api/adminauth/invoices/student/${invoiceId}/verify-ocr`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success(res.data.message || "Payment verified successfully!", { id: "ocr-toast" });
        setOcrSuccess(res.data.message);
        setSelectedInvoice(null);
        await fetchData();
      }
    } catch (err) {
      console.error("OCR matching error:", err);
      const errMsg = err.response?.data?.message || "Failed to verify screenshot OCR";
      setOcrError(errMsg);
      toast.error(errMsg, { id: "ocr-toast" });
    } finally {
      setVerifyingOCR(false);
    }
  };

  // ── Razorpay ──────────────────────────────────────────────────────────────
  const handleRazorpayPayment = async (invoice) => {
    try {
      setSubmitting(true);
      const orderRes = await api.post("/api/adminauth/razorpay/create-order", {
        amount: invoice.amount,
        receiptId: invoice.invoiceNumber,
        type: "student_invoice",
      });
      if (!orderRes.data.success) throw new Error("Order creation failed");
      const { order } = orderRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "KGF Hostel Management",
        description: `Payment for ${invoice.invoiceType?.replace(/_/g, " ")}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            setSubmitting(true);
            const verifyRes = await api.post("/api/adminauth/razorpay/verify-payment", {
              ...response,
              id: invoice._id,
              type: "student_invoice",
            });
            if (verifyRes.data.success) {
              toast.success("Payment successful!");
              fetchData();
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment verification error");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: activeStudent?.studentName,
          email: activeStudent?.email || "",
          contact: activeStudent?.contactNumber || "",
        },
        theme: { color: "#3E4B28" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      toast.error(err.response?.data?.message || "Razorpay initialization failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Export Ledger ─────────────────────────────────────────────────────────
  const handleExportLedger = () => {
    if (!activeStudent) return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Popup blocked. Please allow popups for this site.");
      return;
    }

    const rows = activeStudent.allInvoices.map(inv => {
      const paid = inv.status === "paid"
        ? (inv.paidAmount > 0 ? inv.paidAmount : inv.amount)
        : (inv.paidAmount || 0);
      const remaining = Math.max(0, (inv.amount || 0) - paid);
      return `
        <tr>
          <td>${inv.invoiceNumber || "—"}</td>
          <td style="text-transform:capitalize;">${inv.invoiceType?.replace(/_/g, " ") || "—"}</td>
          <td>${inv.description || "—"}</td>
          <td>${new Date(inv.dueDate).toLocaleDateString("en-IN")}</td>
          <td style="text-align:right; font-weight:600;">₹${(inv.amount || 0).toLocaleString("en-IN")}</td>
          <td style="text-align:right; color:#059669; font-weight:600;">₹${paid.toLocaleString("en-IN")}</td>
          <td style="text-align:right; color:${remaining > 0 ? "#D97706" : "#059669"}; font-weight:700;">₹${remaining.toLocaleString("en-IN")}</td>
          <td>
            <span style="
              padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700;
              text-transform: uppercase; letter-spacing: 0.05em;
              background: ${inv.status === "paid" ? "#ECFDF5" : inv.status === "overdue" ? "#FEF2F2" : "#FFFBEB"};
              color: ${inv.status === "paid" ? "#059669" : inv.status === "overdue" ? "#DC2626" : "#D97706"};
            ">${inv.status}</span>
          </td>
        </tr>
      `;
    }).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Fee Ledger — ${activeStudent.studentName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Outfit', Arial, sans-serif; background: #fff; color: #1A1F16; padding: 40px 52px; font-size: 14px; }
          .kgf-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; margin-bottom: 10px; border-bottom: 3px solid #3E4B28; }
          .kgf-left { display: flex; align-items: center; gap: 18px; }
          .kgf-logo-img { width: 90px; height: 90px; object-fit: contain; flex-shrink: 0; }
          .kgf-org-name { font-size: 26px; font-weight: 900; color: #1A1F16; letter-spacing: -0.02em; line-height: 1.1; }
          .kgf-org-sub { font-size: 11px; font-weight: 700; color: #5A6E3A; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 5px; }
          .kgf-org-division { font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
          .kgf-contact { text-align: right; font-size: 12px; color: #6B7280; line-height: 2; }
          .doc-title-strip { display: flex; justify-content: space-between; align-items: center; background: #3E4B28; color: #fff; padding: 12px 20px; border-radius: 10px; margin: 18px 0 28px; }
          .doc-title-strip .dtitle { font-size: 15px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
          .doc-title-strip .dmeta { font-size: 12px; opacity: 0.75; }
          .student-section { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; background: #F1F3EE; border-radius: 12px; padding: 20px 24px; }
          .student-section .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; margin-bottom: 4px; }
          .student-section .value { font-size: 14px; font-weight: 700; color: #1A1F16; }
          .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px; }
          .summary-card { border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; }
          .summary-card .s-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; margin-bottom: 8px; }
          .summary-card .s-value { font-size: 22px; font-weight: 800; }
          .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
          .section-title::after { content: ''; flex: 1; height: 1px; background: #E5E7EB; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #3E4B28; color: #fff; }
          th { text-align: left; padding: 11px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
          tbody tr { border-bottom: 1px solid #F1F3EE; }
          tbody tr:nth-child(even) { background: #FAFAFA; }
          td { padding: 12px 14px; font-size: 13px; color: #1A1F16; vertical-align: middle; }
          .totals-row td { font-weight: 800; font-size: 14px; background: #F1F3EE; border-top: 2px solid #3E4B28; }
          .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; }
          .footer p { font-size: 11px; color: #9CA3AF; }
          .watermark { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #D1D5DB; }
          @media print { body { padding: 24px 32px; } @page { margin: 0.5in; size: A4; } }
        </style>
      </head>
      <body>
        <div class="kgf-header">
          <div class="kgf-left">
            <img src="/photos/logo1.svg" alt="KGF Logo" class="kgf-logo-img" onerror="this.style.display='none'" />
            <div>
              <div class="kgf-org-name">KOKAN GLOBAL FOUNDATION</div>
              <div class="kgf-org-sub">Educational &amp; Welfare Trust &nbsp;|&nbsp; Reg No: E-3342/R</div>
              <div class="kgf-org-division">Hostel Management Division</div>
            </div>
          </div>
          <div class="kgf-contact">
            <div>📍 Maharashtra, India</div>
            <div>📞 +91-XXXXXXXXXX</div>
            <div style="margin-top:6px; font-size:11px; color:#9CA3AF;">
              Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
        <div class="doc-title-strip">
          <span class="dtitle">Fee Ledger &nbsp;/&nbsp; Official Statement</span>
          <span class="dmeta">Academic Year ${selectedYear}–${selectedYear + 1} &nbsp;•&nbsp; Hostel Management Division</span>
        </div>
        <div class="student-section">
          <div><div class="label">Student Name</div><div class="value">${activeStudent.studentName}</div></div>
          <div><div class="label">Student ID</div><div class="value">${activeStudent.studentId || "—"}</div></div>
          <div><div class="label">Room / Bed</div><div class="value">${activeStudent.roomBedNumber || "Unassigned"}</div></div>
          <div><div class="label">Total Invoices</div><div class="value">${activeStudent.allInvoices.length}</div></div>
        </div>
        <div class="summary">
          <div class="summary-card">
            <div class="s-label">Total Billed</div>
            <div class="s-value" style="color: #1A1F16;">₹${activeStudent.totalFees.toLocaleString("en-IN")}</div>
          </div>
          <div class="summary-card">
            <div class="s-label">Total Paid</div>
            <div class="s-value" style="color: #059669;">₹${activeStudent.paidFees.toLocaleString("en-IN")}</div>
          </div>
          <div class="summary-card">
            <div class="s-label">Outstanding</div>
            <div class="s-value" style="color: ${activeStudent.pendingFees > 0 ? "#D97706" : "#059669"};">
              ₹${activeStudent.pendingFees.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
        <div class="section-title">Transaction History</div>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Fee Type</th>
              <th>Description</th>
              <th>Due Date</th>
              <th style="text-align:right;">Billed</th>
              <th style="text-align:right;">Paid</th>
              <th style="text-align:right;">Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="totals-row">
              <td colspan="4">Total</td>
              <td style="text-align:right;">₹${activeStudent.totalFees.toLocaleString("en-IN")}</td>
              <td style="text-align:right; color:#059669;">₹${activeStudent.paidFees.toLocaleString("en-IN")}</td>
              <td style="text-align:right; color:${activeStudent.pendingFees > 0 ? "#D97706" : "#059669"};">₹${activeStudent.pendingFees.toLocaleString("en-IN")}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div class="footer">
          <div>
            <p>This is a computer-generated document. No signature required.</p>
            <p style="font-size:11px; color:#9CA3AF; margin-top:4px;">Kokan Global Foundation • Educational &amp; Welfare Trust • Reg No: E-3342/R</p>
          </div>
          <p class="watermark">KGF Hostel Mgmt Division</p>
        </div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ── Helper: remaining balance for an invoice ──────────────────────────────
  const invoiceRemaining = (inv) =>
    Math.max(0, (inv.amount || 0) - (inv.paidAmount || 0));

  const globalStats = useMemo(() => {
    let pending = 0;
    let overdue = 0;
    let collected = 0;

    studentFeeStats.forEach(x => {
      if (x.status === "pending") pending += x.pendingFees;
      if (x.status === "overdue") overdue += x.pendingFees;
      collected += x.paidFees;
    });
    return { pending, overdue, collected, totalDues: pending + overdue };
  }, [studentFeeStats]);

  const statsData = [
    { label: "Total Dues", value: globalStats.totalDues, icon: MdOutlinePendingActions, color: T.orange, bg: "#FFFBEB" },
    { label: "Pending Amount", value: globalStats.pending, icon: HiOutlineClock, color: T.gold, bg: T.goldLight },
    { label: "Collected", value: globalStats.collected, icon: MdOutlinePayments, color: T.green, bg: "#ECFDF5" },
    { label: "Overdue Amount", value: globalStats.overdue, icon: HiOutlineExclamationCircle, color: T.red, bg: "#FEF2F2" },
    { label: "Accounts", value: filteredStudents.length, icon: FaHistory, color: T.accent, bg: T.accentLight, isCount: true },
  ];

  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-4 font-sans sf-page-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .sf-stat-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(40,50,30,0.12); }
        .sf-row:hover { background: #F9FAFB !important; }
        .sf-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .inv-row:hover { background: #F9FAFB !important; }
        .inv-number-link { color: #3A6FA6; font-weight: 800; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
        .inv-number-link:hover { color: #4F8CCF; }
        @media (max-width: 1100px) {
          .sf-hide-mobile { display: none !important; }
          .sf-show-mobile { display: flex !important; }
          .sf-stat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .sf-header-flex { flex-direction: column !important; align-items: flex-start !important; }
          .sf-filter-tabs { width: 100% !important; overflow-x: auto !important; padding-bottom: 8px !important; }
          .sf-ledger-stats { grid-template-columns: 1fr !important; gap: 12px !important; }
          .sf-modal-content { padding: 16px !important; max-height: 90vh !important; overflow-y: auto !important; }
          .sf-transaction-row { flex-direction: column !important; align-items: flex-start !important; }
          .sf-transaction-amounts { width: 100% !important; justify-content: space-between !important; margin-top: 12px !important; }
          .sf-mobile-amount-box { grid-template-columns: 1fr !important; }
          .sf-modal-header-summary { gap: 10px !important; flex-wrap: wrap !important; }
          .sf-modal-summary-item { padding: 8px 12px !important; flex: 1 1 120px !important; }
          .sf-search-row { flex-direction: column !important; align-items: stretch !important; }
          .sf-search-box { min-width: 100% !important; }
        }
        @media (max-width: 640px) {
          .sf-stat-grid { grid-template-columns: 1fr !important; }
          .sf-modal-overlay { padding: 8px !important; }
          .sf-modal-header-main { padding: 24px 16px !important; }
          .sf-page-container { padding: 12px !important; }
          .sf-transaction-amounts { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .sf-modal-header-top { padding: 20px 16px !important; }
        }
        @media (min-width: 1101px) {
          .sf-show-mobile { display: none !important; }
        }
        .sf-desktop-table-container {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: thin;
          padding-bottom: 10px;
        }
        .sf-table-min {
          min-width: 1000px;
        }
      `}</style>
      <div className="w-full">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
              <h1 className="text-[25px] leading-[25px] font-extrabold text-black flex items-center" style={{ fontFamily: "Inter" }}>
                Student Fees
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 text-sm ml-3" style={{ fontFamily: "Poppins" }}>
              Financial Overview • {selectedYear} Academic Session
            </p>
          </div>
        </div>

        {/* Main Content Box matching Admin Panel */}
        <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8" style={{ boxShadow: "0px 4px 20px 0px #00000040 inset", fontFamily: "Poppins" }}>


        {/* ── Stat Cards ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24, marginBottom: 40
        }} className="sf-fade-up sf-stat-grid">
          {statsData.map((stat, i) => (
            <div key={i} className="sf-stat-card" style={css.statCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, background: stat.bg,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <div style={{ background: stat.color + "15", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 900, color: stat.color }}>
                  Live
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>
                  {stat.isCount ? stat.value : formatCurrency(stat.value)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Student Table ── */}
        <div style={css.glassCard} className="sf-fade-up">
          <div style={{ display: "flex", gap: 16, marginBottom: 32, alignItems: "center", flexWrap: "wrap", background: "#F9FAFB", padding: 16, borderRadius: 20, border: `1px solid ${T.border}` }} className="sf-search-row">
            <div style={{ position: "relative", flex: "1 1 auto", minWidth: 250 }} className="sf-search-box">
              <HiOutlineSearch size={18} color={T.textMuted} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Search students by name, ID or room..."
                style={{ ...css.input, paddingLeft: 48, background: "#fff", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              style={{ ...css.input, flex: "0 1 auto", width: "auto", minWidth: 140, cursor: "pointer", background: "#fff", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.05em" }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Desktop Table */}
          <div className="sf-hide-mobile sf-desktop-table-container">
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }} className="sf-table-min">
              <thead>
                <tr>
                  {["Student Identity", "Room/Bed", "Billing Cycle", "Fee Structure", "Total Billed", "Paid", "Outstanding", "Status", ""].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "0 20px 12px",
                      fontSize: 11, fontWeight: 800, color: T.textMuted,
                      textTransform: "uppercase", letterSpacing: "0.1em"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => (
                  <tr key={s._id || i} className="sf-row" style={{ transition: "all 0.2s ease" }}>
                    <td style={{ padding: "16px 20px", background: "#fff", borderRadius: "16px 0 0 16px", border: `1px solid ${T.border}`, borderRight: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 14,
                          background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 900, fontSize: 18,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}>
                          {s.studentName?.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, color: T.text, fontSize: 14, margin: 0 }}>{s.studentName}</p>
                          <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{s.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", background: "#fff", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                      <p style={{ fontWeight: 700, color: T.text, fontSize: 13, margin: 0 }}>{s.roomBedNumber || "Unassigned"}</p>
                      <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>Hostel Asset</p>
                    </td>
                    <td style={{ padding: "16px 20px", background: "#fff", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                      <p style={{ fontWeight: 800, color: T.text, fontSize: 13, margin: 0 }}>Quarterly</p>
                      <p style={{ fontSize: 11, color: T.textMuted, margin: 0, marginTop: 4, fontWeight: 700 }}>{s.billingCycleDisplay}</p>
                    </td>
                    <td style={{ padding: "16px 20px", background: "#fff", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 800, color: T.accent, fontSize: 13 }}>{formatCurrency(s.quarterlyFee)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 700, color: T.gold, fontSize: 12 }}>Deposit: {formatCurrency(s.depositAmount)}</span>
                          <span style={{ fontSize: 10, background: T.goldLight, color: T.gold, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>One-Time</span>
                        </div>
                        <span style={{ fontSize: 10, color: T.textMuted }}>Monthly Base: {formatCurrency(s.monthlyFee)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", background: "#fff", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                      <p style={{ fontWeight: 800, color: T.text, fontSize: 13, margin: 0 }}>{formatCurrency(s.totalFees)}</p>
                      <p style={{ fontSize: 10, color: T.textMuted, margin: 0 }}>All Invoices</p>
                    </td>
                    {/* ── FIX: Paid column now shown separately ── */}
                    <td style={{ padding: "16px 20px", background: "#fff", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                      <p style={{ fontWeight: 800, color: T.green, fontSize: 13, margin: 0 }}>{formatCurrency(s.paidFees)}</p>
                      <p style={{ fontSize: 10, color: T.textMuted, margin: 0 }}>Received</p>
                    </td>
                    <td style={{ padding: "16px 20px", background: "#fff", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                      <p style={{ fontWeight: 900, color: s.pendingFees > 0 ? T.orange : T.green, fontSize: 14, margin: 0 }}>{formatCurrency(s.pendingFees)}</p>
                      <p style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, margin: 0 }}>Outstanding</p>
                    </td>
                    <td style={{ padding: "16px 20px", background: "#fff", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                      <StatusBadge status={s.status} />
                    </td>
                    <td style={{ padding: "16px 20px", background: "#fff", borderRadius: "0 16px 16px 0", border: `1px solid ${T.border}`, borderLeft: "none", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button style={{ ...css.btnSecondary, padding: "10px 14px" }} onClick={() => { setSelectedStudentId(s._id); setShowLedgerModal(true); }}>
                          <MdOutlineReceiptLong size={18} />
                        </button>
                        <button style={{ ...css.btnPrimary, padding: "10px 18px" }} onClick={() => {
                          setSelectedStudentId(s._id);
                          setInvoiceForm(f => ({ ...f, amount: s.quarterlyFee > 0 ? String(s.quarterlyFee) : "" }));
                          setShowGenerateModal(true);
                        }}>
                          <HiOutlinePlus size={16} /> Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sf-show-mobile" style={{ flexDirection: "column", gap: 16 }}>
            {filteredStudents.map((s, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 20, border: `1px solid ${T.border}`, boxShadow: `0 4px 12px ${T.shadow}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: T.accent, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
                      {s.studentName?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 14, margin: 0 }}>{s.studentName}</p>
                      <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>{s.studentId}</p>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#F9FAFB", padding: 12, borderRadius: 12, marginBottom: 16, gap: 8 }}>
                  <div>
                    <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 700 }}>TOTAL</p>
                    <p style={{ fontWeight: 800, fontSize: 13 }}>{formatCurrency(s.totalFees)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 700 }}>PAID</p>
                    <p style={{ fontWeight: 800, fontSize: 13, color: T.green }}>{formatCurrency(s.paidFees)}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 700 }}>DUE</p>
                    <p style={{ fontWeight: 800, fontSize: 13, color: s.pendingFees > 0 ? T.orange : T.green }}>{formatCurrency(s.pendingFees)}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ ...css.btnSecondary, flex: 1, justifyContent: "center" }} onClick={() => { setSelectedStudentId(s._id); setShowLedgerModal(true); }}>Statement</button>
                  <button style={{ ...css.btnPrimary, flex: 1, justifyContent: "center" }} onClick={() => {
                    setSelectedStudentId(s._id);
                    setInvoiceForm(f => ({ ...f, amount: s.quarterlyFee > 0 ? String(s.quarterlyFee) : "" }));
                    setShowGenerateModal(true);
                  }}>New Bill</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>



      {/* ── Generate Invoice Modal ── */}
      {showGenerateModal && activeStudent && (
        <ModalOverlay onClose={() => setShowGenerateModal(false)}>
          <div className="sf-fade-up" style={{ ...css.glassCard, width: "100%", maxWidth: 500, padding: 0, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`, padding: "40px 32px", color: "#fff", position: "relative", flexShrink: 0 }} className="sf-modal-header-top">
              <button onClick={() => setShowGenerateModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 12, padding: 8, cursor: "pointer" }}>
                <HiOutlineX size={20} color="#fff" />
              </button>
              <h3 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>Create Demand</h3>
              <p style={{ opacity: 0.8, fontSize: 13, margin: 0 }}>Generating invoice for {activeStudent.studentName}</p>
              {/* ── Show fee summary in header ── */}
              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }} className="sf-modal-header-summary">
                {[
                  { label: "3 Months Hostel Fee", val: activeStudent.quarterlyFee },
                  { label: "Security Deposit", val: activeStudent.depositAmount, isDeposit: true },
                  { label: "Already Paid", val: activeStudent.paidFees },
                  { label: "Outstanding", val: activeStudent.pendingFees },
                ].map((item, i) => (
                  <div key={i} style={{ background: item.isDeposit ? "rgba(197,160,89,0.2)" : "rgba(255,255,255,0.12)", borderRadius: 12, padding: "8px 14px", border: item.isDeposit ? `1px solid ${T.gold}40` : "none" }} className="sf-modal-summary-item">
                    <p style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, margin: "0 0 2px" }}>{item.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 900, margin: 0, color: item.isDeposit ? T.goldLight : "#fff" }}>{formatCurrency(item.val)}</p>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleGenerateInvoice} style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24, overflowY: "auto", flex: 1 }} className="sf-modal-content">
              {/* ── Security Deposit Status ── */}
              {(() => {
                const depositInv = activeStudent.allInvoices.find(inv => inv.invoiceType === "security_deposit");
                if (!depositInv) return null;
                const isPaid = depositInv.status === "paid";
                return (
                  <div style={{
                    background: isPaid ? "#ECFDF5" : "#FEF2F2", 
                    border: `1.5px solid ${isPaid ? "#10B98130" : "#EF444430"}`, 
                    borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center"
                  }}>
                    {isPaid ? <HiOutlineCheckCircle size={18} color={T.green} /> : <HiOutlineExclamationCircle size={18} color={T.red} />}
                    <p style={{ fontSize: 12, color: isPaid ? "#065F46" : "#991B1B", fontWeight: 700, margin: 0 }}>
                      {isPaid ? "Security Deposit already fully paid." : `Unpaid Security Deposit exists: ${formatCurrency(depositInv.amount)}`}
                    </p>
                  </div>
                );
              })()}

              {/* ── Info banner if partial payment already made ── */}
              {activeStudent.paidFees > 0 && activeStudent.pendingFees > 0 && (
                <div style={{
                  background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 14,
                  padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start"
                }}>
                  <HiOutlineExclamationCircle size={18} color={T.orange} style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "#92400E", fontWeight: 600, margin: 0 }}>
                    Partial payment of {formatCurrency(activeStudent.paidFees)} already received. 
                    Outstanding balance is {formatCurrency(activeStudent.pendingFees)}.
                  </p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <ModalField label="Fee Category">
                  <select 
                    style={css.input} 
                    value={invoiceForm.invoiceType} 
                    onChange={e => {
                      const type = e.target.value;
                      let amt = invoiceForm.amount;
                      if (type === "security_deposit") amt = String(activeStudent.depositAmount);
                      else if (type === "hostel_fee") amt = String(activeStudent.quarterlyFee);
                      setInvoiceForm({ ...invoiceForm, invoiceType: type, amount: amt });
                    }}
                  >
                    <option value="hostel_fee">Hostel Fee</option>
                    <option value="mess_fee">Mess Fee</option>
                    {(() => {
                      const isPaid = activeStudent.allInvoices.find(inv => inv.invoiceType === "security_deposit")?.status === "paid";
                      return (
                        <option value="security_deposit" disabled={isPaid}>
                          Security Deposit {isPaid ? "(Paid)" : ""}
                        </option>
                      );
                    })()}
                    <option value="maintenance_fee">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </ModalField>
                <ModalField label="Amount (₹)">
                  <div style={{ position: "relative" }}>
                    <HiOutlineCurrencyRupee size={18} color={T.textMuted} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                    <input style={{ ...css.input, paddingLeft: 44 }} type="number" required value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} />
                  </div>
                </ModalField>
              </div>
              <ModalField label="Due Date">
                <input style={css.input} type="date" required value={invoiceForm.dueDate} onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />
              </ModalField>
              <ModalField label="Administrative Notes">
                <textarea style={{ ...css.input, height: 100, resize: "none" }} placeholder="Optional notes for this demand..."
                  value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })} />
              </ModalField>
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setShowGenerateModal(false)} style={{ ...css.btnSecondary, flex: 1, justifyContent: "center" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...css.btnPrimary, flex: 2, justifyContent: "center" }}>
                  {submitting ? "Creating..." : "Confirm & Send"}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ── Ledger Modal ── */}
      {showLedgerModal && activeStudent && (
        <ModalOverlay onClose={() => { setShowLedgerModal(false); setSelectedInvoice(null); }}>
          <div className="sf-fade-up" style={{
            ...css.glassCard, width: "100%", maxWidth: 820, padding: 0,
            overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column"
          }}>
            {/* Ledger Header */}
            <div style={{ padding: 32, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 900, fontSize: 24,
                  boxShadow: `0 10px 20px ${T.accent}30`
                }}>
                  {activeStudent.studentName?.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: T.text, margin: 0 }}>{activeStudent.studentName}</h3>
                  <p style={{ color: T.textMuted, fontSize: 13, fontWeight: 600, margin: 0 }}>
                    {activeStudent.studentId} • Room {activeStudent.roomBedNumber || "N/A"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowLedgerModal(false); setSelectedInvoice(null); }}
                style={{ background: "#F3F4F6", border: "none", borderRadius: 12, padding: 10, cursor: "pointer" }}>
                <HiOutlineX size={20} color={T.textMuted} />
              </button>
            </div>

            {/* Ledger Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: 32, background: "#F9FAFB" }} className="sf-modal-content">
              {/* Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }} className="sf-ledger-stats">
                {[
                  { label: "Total Billed", val: activeStudent.totalFees, color: T.accent },
                  { label: "Total Paid", val: activeStudent.paidFees, color: T.green },
                  { label: "Outstanding", val: activeStudent.pendingFees, color: T.orange },
                ].map((s, i) => (
                  <div key={i} style={{ padding: 20, borderRadius: 20, background: "#fff", border: `1px solid ${T.border}` }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{s.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: s.color, margin: 0 }}>{formatCurrency(s.val)}</p>
                  </div>
                ))}
              </div>

              {/* Section title */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Transaction History
                </h4>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>

              {/* Invoice Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activeStudent.allInvoices.map((inv, idx) => {
                  // ── FIX: compute per-invoice paid and remaining correctly ──
                  const invPaid = inv.status === "paid"
                    ? (inv.paidAmount > 0 ? inv.paidAmount : inv.amount)
                    : (inv.paidAmount || 0);
                  const invRemaining = Math.max(0, (inv.amount || 0) - invPaid);

                  return (
                    <div key={idx} className="inv-row" style={{
                      background: "#fff", padding: "16px 20px", borderRadius: 18,
                      border: `1px solid ${T.border}`,
                      transition: "background 0.15s"
                    }}>
                      {/* Row top: invoice info + amount + status */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }} className="sf-transaction-row">
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: inv.status === "paid" ? "#ECFDF5" : "#FFFBEB",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: inv.status === "paid" ? T.green : T.orange, flexShrink: 0
                          }}>
                            <FaFileInvoiceDollar size={18} />
                          </div>
                          <div>
                            <p
                              className="inv-number-link"
                              style={{ fontSize: 14, margin: 0 }}
                              onClick={() => { setSelectedInvoice(inv); setPartialAmt(String(invRemaining)); }}
                            >
                              {inv.invoiceNumber}
                            </p>
                            <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                              {inv.invoiceType?.replace(/_/g, " ")} • Due: {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                        </div>

                        {/* ── FIX: show billed / paid / remaining inline ── */}
                        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }} className="sf-transaction-amounts">
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, margin: 0 }}>BILLED</p>
                            <p style={{ fontWeight: 800, color: T.text, fontSize: 14, margin: 0 }}>{formatCurrency(inv.amount)}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 10, color: T.green, fontWeight: 700, margin: 0 }}>PAID</p>
                            <p style={{ fontWeight: 800, color: T.green, fontSize: 14, margin: 0 }}>{formatCurrency(invPaid)}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 10, color: invRemaining > 0 ? T.orange : T.green, fontWeight: 700, margin: 0 }}>DUE</p>
                            <p style={{ fontWeight: 900, color: invRemaining > 0 ? T.orange : T.green, fontSize: 14, margin: 0 }}>{formatCurrency(invRemaining)}</p>
                          </div>
                          <StatusBadge status={inv.status} />

                          <button
                            style={{ ...css.btnSecondary, padding: "8px 12px" }}
                            onClick={() => { setSelectedInvoice(inv); setPartialAmt(String(invRemaining)); }}
                            title="View Invoice"
                          >
                            <HiOutlineEye size={16} />
                          </button>

                          {inv.status !== "paid" && (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                disabled={submitting}
                                style={{ ...css.btnSecondary, padding: "8px 16px", fontSize: 11, opacity: submitting ? 0.7 : 1, borderColor: T.green, color: T.green }}
                                onClick={() => handleMarkFullyPaid(inv, "cash")}
                              >
                                Cash
                              </button>
                              <button
                                disabled={submitting}
                                style={{ ...css.btnPrimary, padding: "8px 16px", fontSize: 11, opacity: submitting ? 0.7 : 1 }}
                                onClick={() => handleRazorpayPayment(inv)}
                              >
                                Online
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ledger Footer */}
            <div style={{ padding: 24, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>
                {activeStudent.allInvoices.length} transaction(s) • FY {selectedYear}
              </p>
              <button style={css.btnSecondary} onClick={handleExportLedger}>
                <HiOutlineDownload size={18} />
                Download Ledger
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Invoice Detail Modal ── */}
      {selectedInvoice && (
        <ModalOverlay onClose={() => setSelectedInvoice(null)}>
          <div className="sf-fade-up" style={{ ...css.glassCard, width: "100%", maxWidth: 520, maxHeight: "90vh", padding: 0, overflowY: "auto" }}>
            {/* Invoice Header */}
            <div style={{
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
              padding: "32px 32px 28px", color: "#fff", position: "relative"
            }} className="sf-modal-header-main">
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer" }}
              >
                <HiOutlineX size={18} color="#fff" />
              </button>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7, marginBottom: 6 }}>
                    KGF Hostel Management
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: "-0.01em" }}>
                    {selectedInvoice.invoiceNumber || "Invoice"}
                  </p>
                  {selectedInvoice.description && (
                    <p style={{ fontSize: 13, opacity: 0.75, margin: "4px 0 0" }}>
                      {selectedInvoice.description}
                    </p>
                  )}
                </div>
                <StatusBadge status={selectedInvoice.status} />
              </div>
            </div>

            {/* Invoice Body */}
            <div style={{ padding: 32 }}>
              {/* Billed To / Date Row */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted, marginBottom: 6 }}>Billed To</p>
                  <p style={{ fontWeight: 800, fontSize: 15, color: T.text, margin: 0 }}>{activeStudent?.studentName}</p>
                  <p style={{ fontSize: 12, color: T.textMuted, margin: "2px 0 0" }}>
                    {activeStudent?.studentId} • Room {activeStudent?.roomBedNumber || "N/A"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted, marginBottom: 6 }}>Due Date</p>
                  <p style={{ fontWeight: 800, fontSize: 15, color: T.text, margin: 0 }}>
                    {new Date(selectedInvoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* ── FIX: Detail grid shows correct paid / remaining ── */}
              {(() => {
                const invPaid = selectedInvoice.status === "paid"
                  ? (selectedInvoice.paidAmount > 0 ? selectedInvoice.paidAmount : selectedInvoice.amount)
                  : (selectedInvoice.paidAmount || 0);
                const invRemaining = Math.max(0, (selectedInvoice.amount || 0) - invPaid);

                return (
                  <>
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr",
                      border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden",
                      marginBottom: 24
                    }} className="sf-mobile-amount-box">
                      {[
                        { label: "Fee Type", value: selectedInvoice.invoiceType?.replace(/_/g, " ") || "—" },
                        { label: "Paid So Far", value: formatCurrency(invPaid) },
                        { label: "Remaining", value: formatCurrency(invRemaining) },
                        { label: "Payment Method", value: selectedInvoice.paymentMethod || (selectedInvoice.status === "paid" ? "Recorded" : "Awaited") },
                        { label: "Invoice Date", value: selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString("en-IN") : "—" },
                        { label: "Academic Year", value: `FY ${selectedYear}–${selectedYear + 1}` },
                      ].map((item, i) => (
                        <div key={i} style={{
                          padding: "14px 18px",
                          background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                          borderBottom: i < 4 ? `1px solid ${T.border}` : "none",
                          borderRight: i % 2 === 0 ? `1px solid ${T.border}` : "none"
                        }}>
                          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, margin: "0 0 4px" }}>
                            {item.label}
                          </p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0, textTransform: "capitalize" }}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Amount Box */}
                    <div style={{
                      background: "#F1F3EE", borderRadius: 16, padding: "18px 24px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      marginBottom: 28
                    }}>
                      <p style={{ fontWeight: 700, color: T.textMuted, fontSize: 14, margin: 0 }}>Total Amount</p>
                      <p style={{ fontWeight: 900, fontSize: 28, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>
                        {formatCurrency(selectedInvoice.amount)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {selectedInvoice.status !== "paid" && invRemaining > 0 && (
                        selectedInvoice.status === 'pending_verification' ? (
                          <div style={{ background: "#F8FAF5", padding: 20, borderRadius: 20, border: `1.5px solid ${T.accent}40`, marginBottom: 8 }} className="sf-verification-panel animate-fade-in">
                            <p style={{ fontSize: 12, fontWeight: 900, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                              <span>🔒</span> UPI QR Double-Verification Required
                            </p>
                            
                            <div style={{ background: "#fff", padding: 14, borderRadius: 14, border: `1px solid ${T.border}`, marginBottom: 16 }}>
                              <p style={{ margin: "0 0 6px 0", color: T.textMuted, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Parent Submission Details</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                                <p style={{ margin: 0, fontWeight: 700, color: T.text }}>
                                  Submitted UTR: <span style={{ color: "#C2410C", fontFamily: "monospace", fontSize: 13, fontWeight: 800 }}>{selectedInvoice.transactionId}</span>
                                </p>
                                {selectedInvoice.parentScreenshot && (
                                  <div style={{ marginTop: 6 }}>
                                    <p style={{ margin: "0 0 4px 0", fontSize: 11, fontWeight: 700, color: T.textMuted }}>Parent Payment Screenshot:</p>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                      <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}`, background: "#F3F4F6", cursor: "zoom-in" }} onClick={() => window.open(`${process.env.NEXT_PUBLIC_PROD_API_URL || ''}/${selectedInvoice.parentScreenshot}`, '_blank')}>
                                        <img 
                                          src={`${process.env.NEXT_PUBLIC_PROD_API_URL || ''}/${selectedInvoice.parentScreenshot}`} 
                                          alt="Parent Receipt" 
                                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                      </div>
                                      <a 
                                        href={`${process.env.NEXT_PUBLIC_PROD_API_URL || ''}/${selectedInvoice.parentScreenshot}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{ fontSize: 11, color: T.accent, fontWeight: 700, textDecoration: "underline" }}
                                      >
                                        Open full size image ↗
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              <p style={{ margin: "0 0 2px 0", fontSize: 11, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Upload Bank credit SMS / Notification screenshot *
                              </p>
                              <div style={{ position: "relative" }}>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  disabled={verifyingOCR}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleAdminVerifyOCR(selectedInvoice._id, e.target.files[0]);
                                    }
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: 14,
                                    border: `1.5px dashed ${T.accent}50`,
                                    background: "#fff",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: "pointer"
                                  }}
                                />
                              </div>
                              <p style={{ margin: 0, fontSize: 10, color: T.textMuted, lineHeight: 1.4 }}>
                                💡 Upload the notification screenshot containing the credit reference message from your phone. The system will parse it, match the 12-digit UTR, and mark it as successful.
                              </p>

                              {verifyingOCR && (
                                <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.accent, fontSize: 12, fontWeight: 800, marginTop: 4 }} className="animate-pulse">
                                  <span>⏳</span> Running OCR engine & comparing UTRs...
                                </div>
                              )}

                              {ocrError && (
                                <div style={{ padding: 12, borderRadius: 12, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", fontSize: 11, fontWeight: 700, marginTop: 4, lineHeight: 1.4 }}>
                                  ⚠️ {ocrError}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div style={{ background: "#F9FAFB", padding: 16, borderRadius: 16, border: `1px solid ${T.border}` }}>
                            <p style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                              Record Payment
                            </p>
                            {/* ── FIX: controlled React state, no getElementById ── */}
                            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                              <div style={{ position: "relative", flex: 1 }}>
                                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.textMuted, fontWeight: 700 }}>₹</span>
                                <input
                                  type="number"
                                  value={partialAmt}
                                  onChange={e => setPartialAmt(e.target.value)}
                                  placeholder="Amount"
                                  max={invRemaining}
                                  style={{ width: "100%", padding: "10px 10px 10px 28px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 14, fontWeight: 700, outline: "none" }}
                                />
                              </div>
                              <button
                                style={{ ...css.btnPrimary, padding: "0 20px", fontSize: 13, borderRadius: 12 }}
                                disabled={submitting}
                                onClick={() => handleRecordPayment(selectedInvoice._id, partialAmt, "cash")}
                              >
                                {submitting ? "..." : "Record Cash"}
                              </button>
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                              <button
                                style={{ ...css.btnSecondary, flex: 1, justifyContent: "center", borderColor: T.green, color: T.green, fontSize: 12 }}
                                disabled={submitting}
                                onClick={() => handleMarkFullyPaid(selectedInvoice, "cash")}
                              >
                                Mark Fully Paid (Cash)
                              </button>
                              <button
                                style={{ ...css.btnPrimary, flex: 1, justifyContent: "center", fontSize: 12 }}
                                disabled={submitting}
                                onClick={() => handleRazorpayPayment(selectedInvoice)}
                              >
                                Pay Online
                              </button>
                            </div>
                          </div>
                        )
                      )}
                      <button
                        style={{ ...css.btnSecondary, width: "100%", justifyContent: "center", border: "none", background: "transparent", color: T.textMuted }}
                        onClick={() => setSelectedInvoice(null)}
                      >
                        Close Window
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

// ── Reusable Sub-Components ───────────────────────────────────────────────────
const ModalOverlay = ({ children, onClose }) => (
  <div
    style={{
      position: "fixed", inset: 0, zIndex: 110,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", background: "rgba(30,40,20,0.4)", backdropFilter: "blur(8px)"
    }}
    onClick={onClose}
    className="sf-modal-overlay"
  >
    <div onClick={e => e.stopPropagation()} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {children}
    </div>
  </div>
);

const ModalField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </label>
    {children}
  </div>
);

export default StudentFees;