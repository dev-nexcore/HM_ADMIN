


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
  HiOutlinePencil,
  HiOutlineTrash,
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
import { FiPlus, FiX } from "react-icons/fi";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import AdminOnlinePayment from "./AdminOnlinePayment";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  // ── Local partial-payment input state (avoids stale DOM getElementById) ───
  const [partialAmt, setPartialAmt] = useState("");
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const [showOnlinePaymentModal, setShowOnlinePaymentModal] = useState(false);
  const [selectedOnlineInvoice, setSelectedOnlineInvoice] = useState(null);

  const [invoiceForm, setInvoiceForm] = useState({
    items: [{ invoiceType: "hostel_fee", customInvoiceType: "", amount: "" }],
    dueDate: new Date().toISOString().split("T")[0],
    description: "",
    billingCycleStart: "",
    billingCycleEnd: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [verifyingOCR, setVerifyingOCR] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [ocrSuccess, setOcrSuccess] = useState(null);
  const selectedYear = new Date().getFullYear();
  const [alertModalMsg, setAlertModalMsg] = useState("");

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
    let cycleStartDate = null;
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
      
      cycleStartDate = new Date(cycleStart);
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
      cycleStartDate,
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

  const availableBillingCycles = useMemo(() => {
    if (!activeStudent || !activeStudent.admissionDate) return [];
    const cycles = [];
    let start = new Date(activeStudent.admissionDate);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1); // Up to 1 year ahead

    while (start < maxDate) {
      let end = new Date(start);
      end.setMonth(end.getMonth() + 3); // Assuming 3-month billing cycles
      
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      
      const isPaid = activeStudent.allInvoices.some(inv => {
        if (inv.status !== "paid") return false;
        if (!inv.billingCycleStart) return false;
        const invStartStr = new Date(inv.billingCycleStart).toISOString().split('T')[0];
        return invStartStr === startStr;
      });

      cycles.push({
        start: startStr,
        end: endStr,
        display: `${start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} to ${end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        isPaid
      });

      start = new Date(end);
    }
    return cycles;
  }, [activeStudent]);

  const filteredStudents = useMemo(() => studentFeeStats.filter(s => {
    const matchesSearch =
      s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roomBedNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [studentFeeStats, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Generate Invoice ──────────────────────────────────────────────────────
  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!activeStudent) return;
    
    // ── Prevent duplicate security deposit billing ──
    const hasSecurityDeposit = invoiceForm.items.some(item => item.invoiceType === "security_deposit");
    if (hasSecurityDeposit) {
      const existingDeposit = activeStudent.allInvoices.find(inv => 
        inv.invoiceType === "security_deposit" || inv.items?.some(i => i.categoryName === "security_deposit")
      );
      if (existingDeposit && existingDeposit.status === "paid") {
        setAlertModalMsg("Security Deposit has already been paid for this student. You cannot generate a new invoice for it.");
        return;
      }
    }

    // ── Prevent duplicate hostel fee for the same billing cycle ──
    const hasHostelFee = invoiceForm.items.some(item => item.invoiceType === "hostel_fee");
    if (hasHostelFee && invoiceForm.billingCycleStart) {
      const selectedStart = new Date(invoiceForm.billingCycleStart).getTime();
      const existingHostelFee = activeStudent.allInvoices.find(inv => {
        const isHostelFee = inv.invoiceType === "hostel_fee" || inv.items?.some(i => i.categoryName === "hostel_fee");
        if (!isHostelFee || inv.status !== "paid" || !inv.billingCycleStart) return false;
        const invStart = new Date(inv.billingCycleStart).getTime();
        return invStart === selectedStart;
      });
      if (existingHostelFee) {
        setAlertModalMsg("Hostel Fees for this specific billing cycle have already been paid.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const finalItems = invoiceForm.items.map(item => ({
        categoryName: item.invoiceType === "other" && item.customInvoiceType ? item.customInvoiceType : item.invoiceType,
        amount: Number(item.amount || 0)
      }));
      const totalAmount = finalItems.reduce((sum, item) => sum + item.amount, 0);
      const combinedType = finalItems.length === 1 ? finalItems[0].categoryName : "Combined Invoice";

      if (editingInvoiceId) {
        await api.put(`/api/adminauth/invoices/student/${editingInvoiceId}`, {
          dueDate: invoiceForm.dueDate,
          description: invoiceForm.description,
          invoiceType: combinedType,
          items: finalItems,
          amount: totalAmount,
          billingCycleStart: invoiceForm.billingCycleStart || undefined,
          billingCycleEnd: invoiceForm.billingCycleEnd || undefined,
        });
        toast.success("Invoice updated successfully");
      } else {
        await api.post("/api/adminauth/invoices/student", {
          studentId: activeStudent.studentId,
          dueDate: invoiceForm.dueDate,
          description: invoiceForm.description,
          invoiceType: combinedType,
          items: finalItems,
          amount: totalAmount,
          billingCycleStart: invoiceForm.billingCycleStart || undefined,
          billingCycleEnd: invoiceForm.billingCycleEnd || undefined,
        });
        toast.success("Invoice generated successfully");
      }
      setShowGenerateModal(false);
      setEditingInvoiceId(null);
      fetchData();
      setInvoiceForm({
        items: [{ invoiceType: "hostel_fee", customInvoiceType: "", amount: "" }],
        dueDate: new Date().toISOString().split("T")[0],
        description: "",
        billingCycleStart: "",
        billingCycleEnd: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInvoice = (inv) => {
    setEditingInvoiceId(inv._id);
    let formItems = inv.items && inv.items.length > 0 
      ? inv.items.map(i => {
          let type = i.categoryName;
          let custom = "";
          if (!["hostel_fee", "security_deposit", "mess_fee", "maintenance_fee"].includes(type)) {
            custom = type;
            type = "other";
          }
          return { invoiceType: type, customInvoiceType: custom, amount: String(i.amount) };
        })
      : [{ invoiceType: ["hostel_fee", "security_deposit", "mess_fee", "maintenance_fee"].includes(inv.invoiceType) ? inv.invoiceType : "other", customInvoiceType: ["hostel_fee", "security_deposit", "mess_fee", "maintenance_fee"].includes(inv.invoiceType) ? "" : (inv.invoiceType || ""), amount: String(inv.amount || "") }];
    
    setInvoiceForm({
      items: formItems,
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: inv.description || "",
      billingCycleStart: inv.billingCycleStart ? new Date(inv.billingCycleStart).toISOString().split('T')[0] : "",
      billingCycleEnd: inv.billingCycleEnd ? new Date(inv.billingCycleEnd).toISOString().split('T')[0] : ""
    });
    setShowGenerateModal(true);
  };

  const handleDeleteInvoice = async (inv) => {
    if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      try {
        await api.delete(`/api/adminauth/invoices/student/${inv._id}`);
        toast.success("Invoice deleted successfully");
        if (selectedInvoice && selectedInvoice._id === inv._id) {
          setSelectedInvoice(null);
        }
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete invoice");
      }
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
  const handleRazorpayPayment = async (invoice, customAmount = null) => {
    try {
      setSubmitting(true);
      const invPaid = invoice.status === "paid" ? (invoice.paidAmount > 0 ? invoice.paidAmount : invoice.amount) : (invoice.paidAmount || 0);
      const invRemaining = Math.max(0, (invoice.amount || 0) - invPaid);
      const finalAmount = customAmount ? Number(customAmount) : invRemaining;

      if (!finalAmount || finalAmount <= 0) {
        toast.error("Invalid amount for online payment");
        setSubmitting(false);
        return;
      }

      const orderRes = await api.post("/api/adminauth/razorpay/create-order", {
        amount: finalAmount,
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
              amountPaid: finalAmount
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
      
      let statusClass = "status-unpaid";
      let statusText = "UNPAID";
      if (inv.status === "paid") {
         statusClass = "status-paid";
         statusText = "PAID";
      } else if (inv.status === "overdue") {
         statusClass = "status-overdue";
         statusText = "OVERDUE";
      } else if (paid > 0 && remaining > 0) {
         statusClass = "status-partial";
         statusText = "PARTIAL";
      }

      const formatD = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "";
      const cycleDisplay = (inv.billingCycleStart && inv.billingCycleEnd) 
        ? `${formatD(inv.billingCycleStart)} - ${formatD(inv.billingCycleEnd)}` 
        : "-";

      return `
        <tr>
          <td style="font-weight: 700;">${inv.invoiceNumber || "-"}</td>
          <td style="text-transform:capitalize;">${inv.invoiceType?.replace(/_/g, " ") || "-"}</td>
          <td>${cycleDisplay}</td>
          <td>${new Date(inv.dueDate).toLocaleDateString("en-IN")}</td>
          <td style="text-align:right;">${(inv.amount || 0).toLocaleString("en-IN")}</td>
          <td style="text-align:right; color:#15B76A;">${paid.toLocaleString("en-IN")}</td>
          <td style="text-align:right; color:${remaining > 0 ? '#EF4444' : '#15B76A'};">${remaining.toLocaleString("en-IN")}</td>
          <td style="text-align:center;">
            <span class="status-badge ${statusClass}">${statusText}</span>
          </td>
        </tr>
      `;
    }).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Fee Ledger - ${activeStudent.studentName}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; background: #fff; color: #1A1F16; font-size: 14px; margin: 0; padding: 0; }
          .container { width: 100%; max-width: 900px; margin: 0 auto; background: #fff; }
          
          /* Header */
          .header { background-color: #a8b096; padding: 24px; display: flex; align-items: center; justify-content: space-between; }
          .logo-box { background: #fff; padding: 4px; height: 80px; width: 80px; display: flex; align-items: center; justify-content: center; }
          .logo-box img { max-height: 100%; max-width: 100%; }
          .header-text { text-align: center; flex: 1; padding: 0 16px; }
          .header-text h2 { font-size: 24px; font-weight: 900; color: #1A1F16; margin: 0; line-height: 1.1; }
          .header-text p.org { font-size: 16px; font-weight: 600; color: #3E4B28; margin: 2px 0 0 0; }
          .header-text p.doc { font-size: 14px; font-style: italic; font-weight: 600; color: #333; margin: 4px 0 0 0; }
          .header-text p.addr { font-size: 12px; color: #333; margin: 2px 0 0 0; }
          .header-right { width: 80px; } 

          .content { padding: 32px; }
          
          /* Details Box */
          .details-box { border: 1px solid rgba(168, 176, 150, 0.5); border-radius: 4px; padding: 20px; margin-bottom: 24px; }
          .billed-to { border-bottom: 1px solid rgba(168, 176, 150, 0.3); padding-bottom: 16px; margin-bottom: 16px; }
          .billed-to .label { font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; margin: 0 0 6px 0; }
          .billed-to .name { font-size: 18px; font-weight: 700; color: #1E293B; margin: 0; text-transform: capitalize; }
          .billed-to .sub { font-size: 14px; color: #64748B; margin: 6px 0 0 0; }
          
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-block .label { font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; margin: 0 0 6px 0; }
          .info-block .value { font-size: 15px; font-weight: 700; color: #1E293B; margin: 0; }

          /* Summary Cards */
          .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 32px; }
          .summary-card { border: 1px solid rgba(168, 176, 150, 0.5); border-radius: 4px; padding: 16px 20px; text-align: center; }
          .summary-card .s-label { font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 10px; }
          .summary-card .s-value { font-size: 24px; font-weight: 700; }

          /* Table */
          table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
          thead th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748B; border-top: 2px solid #a8b096; border-bottom: 1px solid #a8b096; background: rgba(168, 176, 150, 0.1); }
          tbody td { padding: 14px 16px; font-size: 14px; color: #1E293B; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
          .totals-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #a8b096; border-bottom: 2px solid #a8b096; background: rgba(168, 176, 150, 0.1); }
          
          .status-badge { padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #fff; display: inline-block; }
          .status-paid { background: #15B76A; }
          .status-unpaid { background: #EF4444; }
          .status-overdue { background: #DC2626; }
          .status-partial { background: #F59E0B; }

          .footer { margin-top: 40px; font-size: 12px; color: #9CA3AF; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; }
          
          @media print { 
            body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
            .container { border: none; max-width: 100%; }
            @page { margin: 0.5in; size: A4; } 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-box">
              <img src="/photos/logo1.svg" alt="KGF Logo" onerror="this.style.display='none'" />
            </div>
            <div class="header-text">
              <h2>KGF Boys Hostel</h2>
              <p class="org">Kokan Global Foundation</p>
              <p class="doc">Official Fee Ledger</p>
              <p class="addr">KGF Hostel, Ground Floor, Admin Block</p>
            </div>
            <div class="header-right"></div>
          </div>
          
          <div class="content">
            <div class="details-box">
              <div class="billed-to">
                <p class="label">Student Details</p>
                <p class="name">${activeStudent.studentName}</p>
                <p class="sub">ID: ${activeStudent.studentId || "N/A"} | Room: ${activeStudent.roomBedNumber || "Unassigned"}</p>
              </div>
              <div class="info-grid">
                <div class="info-block">
                  <p class="label">Academic Year</p>
                  <p class="value">${selectedYear}-${selectedYear + 1}</p>
                </div>
                <div class="info-block">
                  <p class="label">Total Invoices</p>
                  <p class="value">${activeStudent.allInvoices.length}</p>
                </div>
              </div>
            </div>

            <div class="summary">
              <div class="summary-card">
                <div class="s-label">Total Billed</div>
                <div class="s-value" style="color: #1E293B;">Rs. ${activeStudent.totalFees.toLocaleString("en-IN")}</div>
              </div>
              <div class="summary-card">
                <div class="s-label">Total Paid</div>
                <div class="s-value" style="color: #15B76A;">Rs. ${activeStudent.paidFees.toLocaleString("en-IN")}</div>
              </div>
              <div class="summary-card">
                <div class="s-label">Outstanding</div>
                <div class="s-value" style="color: ${activeStudent.pendingFees > 0 ? "#EF4444" : "#15B76A"};">
                  Rs. ${activeStudent.pendingFees.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Fee Type</th>
                  <th>Billing Cycle</th>
                  <th>Due Date</th>
                  <th style="text-align:right;">Billed (Rs.)</th>
                  <th style="text-align:right;">Paid (Rs.)</th>
                  <th style="text-align:right;">Remaining (Rs.)</th>
                  <th style="text-align:center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="totals-row">
                  <td colspan="4">Total</td>
                  <td style="text-align:right;">${activeStudent.totalFees.toLocaleString("en-IN")}</td>
                  <td style="text-align:right; color:#15B76A;">${activeStudent.paidFees.toLocaleString("en-IN")}</td>
                  <td style="text-align:right; color:${activeStudent.pendingFees > 0 ? '#EF4444' : '#15B76A'};">${activeStudent.pendingFees.toLocaleString("en-IN")}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <p>This is a computer-generated document. No signature required.</p>
              <p>Generated on: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>
            </div>
          </div>
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
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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


        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 sf-fade-up">
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
        <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-6 border border-[#BEC5AD]/30 sf-fade-up" style={{ fontFamily: "Inter" }}>
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Fee Records
              </h2>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <div style={{ display: "flex", gap: 16, marginBottom: 32, alignItems: "center", flexWrap: "wrap", background: "#FFFFFF", padding: 16, borderRadius: 20, border: `1px solid ${T.border}` }} className="sf-search-row">
              <div style={{ position: "relative", flex: "1 1 auto", minWidth: 250 }} className="sf-search-box">
              <HiOutlineSearch size={18} color={T.textMuted} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Search students by name, ID or room..."
                style={{ ...css.input, paddingLeft: 48, background: "#fff", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select 
              style={{ ...css.input, flex: "0 1 auto", width: "auto", minWidth: 140, cursor: "pointer", background: "#fff", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.05em" }}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
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
                {currentStudents.map((s, i) => (
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
                          const start = s.cycleStartDate ? new Date(s.cycleStartDate.getTime() - (s.cycleStartDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0] : "";
                          let end = "";
                          if (s.cycleStartDate) {
                            const e = new Date(s.cycleStartDate);
                            e.setMonth(e.getMonth() + 3);
                            end = new Date(e.getTime() - (e.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
                          }
                          setInvoiceForm(f => ({ ...f, items: [{ invoiceType: "hostel_fee", customInvoiceType: "", amount: s.quarterlyFee > 0 ? String(s.quarterlyFee) : "" }], billingCycleStart: start, billingCycleEnd: end }));
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
            {currentStudents.map((s, i) => (
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
                    const start = s.cycleStartDate ? new Date(s.cycleStartDate.getTime() - (s.cycleStartDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0] : "";
                    let end = "";
                    if (s.cycleStartDate) {
                      const e = new Date(s.cycleStartDate);
                      e.setMonth(e.getMonth() + 3);
                      end = new Date(e.getTime() - (e.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
                    }
                    setInvoiceForm(f => ({ ...f, items: [{ invoiceType: "hostel_fee", customInvoiceType: "", amount: s.quarterlyFee > 0 ? String(s.quarterlyFee) : "" }], billingCycleStart: start, billingCycleEnd: end }));
                    setShowGenerateModal(true);
                  }}>New Bill</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <>
              <div className="hidden md:flex items-center justify-between mt-6 px-6 py-4 bg-[#f4f6f0] border-t border-[#BEC5AD]/30 rounded-xl">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${currentPage === idx + 1 ? 'bg-[#4F8DCF] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm'}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Mobile Pagination */}
              <div className="md:hidden flex justify-between items-center mt-6 px-4 py-4 border-t border-[#BEC5AD]/30 bg-[#f4f6f0] rounded-xl">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium shadow-sm transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>Prev</button>
                <span className="text-sm text-gray-600 font-medium">Page {currentPage} of {totalPages || 1}</span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className={`px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium shadow-sm transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>Next</button>
              </div>
            </>
          )}

        </div>
        </div>
      </div>



      {/* ── Generate Invoice Modal ── */}
      {showGenerateModal && activeStudent && (
        <ModalOverlay onClose={() => setShowGenerateModal(false)} zIndex={120}>
          <div className="bg-[#f4f6f0] rounded-2xl shadow-xl overflow-hidden w-full max-w-xl relative flex flex-col border border-[#BEC5AD]/30 sf-fade-up" style={{ fontFamily: "Inter", maxHeight: '90vh' }}>
            <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-6 flex flex-col justify-center relative shrink-0">
              <button onClick={() => setShowGenerateModal(false)} className="absolute top-4 right-4 text-black/70 hover:text-black transition-colors" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <HiOutlineX size={24} />
              </button>
              <h3 className="text-xl font-bold text-black m-0">Create Demand</h3>
              <p className="text-sm text-gray-800 m-0 mt-1 font-medium">Generating invoice for {activeStudent.studentName}</p>

            </div>
            <form onSubmit={handleGenerateInvoice} style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24, overflowY: "auto", flex: 1, background: "#f4f6f0" }} className="sf-modal-content hide-scrollbar">
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
              <div className="space-y-4 bg-[#F8FAF5] p-4 rounded-xl border border-[#BEC5AD]/40 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#3E4B28] uppercase tracking-widest">Fee Items</span>
                  <button type="button" onClick={() => {
                    setInvoiceForm({
                      ...invoiceForm,
                      items: [...invoiceForm.items, { invoiceType: "other", customInvoiceType: "", amount: "" }]
                    });
                  }} className="text-[#3E4B28] hover:bg-[#BEC5AD]/30 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-colors">
                    <FiPlus size={14} /> Add Item
                  </button>
                </div>
                {invoiceForm.items.map((item, index) => (
                  <div key={index} className="relative bg-white p-3 rounded-lg border border-[#BEC5AD]/30 shadow-sm">
                    {invoiceForm.items.length > 1 && (
                      <button type="button" onClick={() => {
                        const newItems = invoiceForm.items.filter((_, i) => i !== index);
                        setInvoiceForm({...invoiceForm, items: newItems});
                      }} className="absolute -top-2 -right-2 bg-red-50 text-red-600 rounded-full p-1 hover:bg-red-100 border border-red-200 transition-colors z-10" title="Remove Item">
                        <FiX size={14} />
                      </button>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <ModalField label={`Item ${index + 1} Category`}>
                        <select 
                          style={css.input} 
                          value={item.invoiceType} 
                          onChange={e => {
                            const type = e.target.value;
                            let amt = item.amount;
                            if (type === "security_deposit") amt = String(activeStudent.depositAmount);
                            else if (type === "hostel_fee") amt = String(activeStudent.quarterlyFee);
                            const newItems = [...invoiceForm.items];
                            newItems[index] = { ...newItems[index], invoiceType: type, amount: amt };
                            setInvoiceForm({ ...invoiceForm, items: newItems });
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
                          <option value="other">Custom (Other)</option>
                        </select>
                      </ModalField>
                      <ModalField label="Amount (₹)">
                        <div style={{ position: "relative" }}>
                          <HiOutlineCurrencyRupee size={18} color={T.textMuted} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                          <input style={{ ...css.input, paddingLeft: 44 }} type="number" required value={item.amount} onChange={e => {
                            const newItems = [...invoiceForm.items];
                            newItems[index] = { ...newItems[index], amount: e.target.value };
                            setInvoiceForm({ ...invoiceForm, items: newItems });
                          }} />
                        </div>
                      </ModalField>
                    </div>
                    {item.invoiceType === "other" && (
                      <div className="mt-3">
                        <ModalField label="Custom Category Name">
                          <input style={css.input} type="text" placeholder="e.g. Gym Fee, Laundry..." required value={item.customInvoiceType} onChange={e => {
                            const newItems = [...invoiceForm.items];
                            newItems[index] = { ...newItems[index], customInvoiceType: e.target.value };
                            setInvoiceForm({ ...invoiceForm, items: newItems });
                          }} />
                        </ModalField>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <ModalField label="Select Billing Cycle">
                  <select 
                    style={css.input} 
                    value={invoiceForm.billingCycleStart ? `${invoiceForm.billingCycleStart}|${invoiceForm.billingCycleEnd}` : ""}
                    onChange={e => {
                      const val = e.target.value;
                      if (!val) {
                        setInvoiceForm({ ...invoiceForm, billingCycleStart: "", billingCycleEnd: "" });
                      } else {
                        const [start, end] = val.split("|");
                        setInvoiceForm({ ...invoiceForm, billingCycleStart: start, billingCycleEnd: end });
                      }
                    }}
                  >
                    <option value="">-- Custom / No Specific Cycle --</option>
                    {availableBillingCycles.map((cycle, i) => (
                      <option key={i} value={`${cycle.start}|${cycle.end}`} disabled={cycle.isPaid} style={{ color: cycle.isPaid ? "#059669" : "inherit" }}>
                        {cycle.display} {cycle.isPaid ? "✅ (Paid)" : "⏳ (Unpaid)"}
                      </option>
                    ))}
                  </select>
                </ModalField>
                {(!invoiceForm.billingCycleStart || availableBillingCycles.length === 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    <ModalField label="Custom Start Date">
                      <input style={css.input} type="date" value={invoiceForm.billingCycleStart} onChange={e => setInvoiceForm({ ...invoiceForm, billingCycleStart: e.target.value })} />
                    </ModalField>
                    <ModalField label="Custom End Date">
                      <input style={css.input} type="date" value={invoiceForm.billingCycleEnd} onChange={e => setInvoiceForm({ ...invoiceForm, billingCycleEnd: e.target.value })} />
                    </ModalField>
                  </div>
                )}
              </div>
              <ModalField label="Due Date">
                <input style={css.input} type="date" required value={invoiceForm.dueDate} onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />
              </ModalField>
              <ModalField label="Administrative Notes">
                <textarea style={{ ...css.input, height: 100, resize: "none" }} placeholder="Optional notes for this demand..."
                  value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })} />
              </ModalField>
              {/* Professional Invoice Preview (Matching PDF Format) */}
              <div className="mt-8 mb-4 flex flex-col items-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 m-0 w-full text-center">Generated Invoice Preview</p>
                
                <div className="bg-white shadow-md mx-auto w-full max-w-[450px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {/* Header */}
                  <div className="bg-[#a8b096] p-4 flex items-center justify-between h-[100px]">
                    <div className="bg-white p-1 h-16 w-16 flex items-center justify-center">
                      <img src="/photos/logo1.svg" alt="Logo" className="max-h-full max-w-full" onError={(e) => e.target.style.display='none'} />
                    </div>
                    <div className="text-center flex-1 px-2">
                      <h2 className="text-lg font-black text-[#1A1F16] m-0 leading-tight">KGF Boys Hostel</h2>
                      <p className="text-xs font-semibold text-[#3E4B28] m-0">Kokan Global Foundation</p>
                      <p className="text-[10px] italic font-semibold text-gray-700 m-0 mt-0.5">Official Invoice</p>
                      <p className="text-[8px] text-gray-800 m-0 leading-tight">KGF Hostel, Ground Floor, Admin Block</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-5 pb-5 pt-0 bg-white">
                    
                    {/* Status Badge */}
                    <div className="flex justify-center -mt-3 mb-5 relative z-10">
                      <span className="bg-[#EF4444] text-white text-[11px] font-bold px-6 py-1 rounded-sm shadow-sm tracking-wider">UNPAID</span>
                    </div>

                    {/* Combined Details Box */}
                    <div className="border border-[#a8b096]/50 rounded-sm p-3 mb-4">
                      {/* Billed To Section */}
                      <div className="mb-3 pb-3 border-b border-[#a8b096]/30">
                        <p className="text-[9px] font-bold text-[#64748B] uppercase m-0 mb-1">Billed To</p>
                        <p className="text-[12px] font-bold text-[#1E293B] m-0 capitalize">{activeStudent?.studentName || "Student Name"}</p>
                        <p className="text-[10px] text-[#64748B] m-0 mt-0.5">ID: {activeStudent?.studentId || "—"} | Room: {activeStudent?.roomBedNumber || "—"}</p>
                      </div>

                      {/* Invoice Info Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] font-bold text-[#64748B] uppercase m-0">Invoice Number</p>
                          <p className="text-[11px] font-bold text-[#1E293B] m-0 mt-0.5">INV-KGF-Preview</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[#64748B] uppercase m-0">Date Issued</p>
                          <p className="text-[11px] font-bold text-[#1E293B] m-0 mt-0.5">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-[9px] font-bold text-[#64748B] uppercase m-0">Due Date</p>
                        <p className="text-[11px] font-bold text-[#1E293B] m-0 mt-0.5">{invoiceForm.dueDate ? new Date(invoiceForm.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Not Set"}</p>
                      </div>
                    </div>

                    {/* Items Box */}
                    <div className="border border-[#a8b096]/50 rounded-sm">
                      <div className="flex justify-between border-b border-[#a8b096]/50 bg-[#F8FAF5] p-2 px-3">
                        <span className="text-[9px] font-bold text-[#64748B] uppercase">Description</span>
                        <span className="text-[9px] font-bold text-[#64748B] uppercase">Amount</span>
                      </div>
                      <div className="p-3">
                        {invoiceForm.items.map((item, idx) => {
                          const categoryName = (item.invoiceType === "other" ? (item.customInvoiceType || "Custom Fee") : item.invoiceType).replace(/_/g, " ");
                          let itemDesc = null;
                          if (item.invoiceType === "security_deposit") {
                            itemDesc = <p className="text-[9px] text-[#64748B] m-0 mt-0.5 leading-tight">One-time refundable security deposit based on admission criteria. (Calculation: Rs. {activeStudent?.monthlyFee?.toLocaleString("en-IN")}/month × 3 months for a {activeStudent?.roomType}-Seater room)</p>;
                          }
                          else if (item.invoiceType === "hostel_fee") {
                            let monthBreakdown = null;
                            if (invoiceForm.billingCycleStart) {
                              const months = [];
                              for (let i = 0; i < 3; i++) {
                                const start = new Date(invoiceForm.billingCycleStart);
                                start.setMonth(start.getMonth() + i);
                                const end = new Date(start);
                                end.setMonth(end.getMonth() + 1);
                                end.setDate(end.getDate() - 1);
                                const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                                months.push(
                                  <div key={i} className="flex justify-between w-full mt-1">
                                    <span className="text-[8.5px] font-medium">• {fmt(start)} - {fmt(end)}</span>
                                    <span className="text-[8.5px] font-medium">Rs. {activeStudent?.monthlyFee?.toLocaleString("en-IN")}</span>
                                  </div>
                                );
                              }
                              monthBreakdown = <div className="mt-2 pt-1 border-t border-[#a8b096]/20">{months}</div>;
                            }
                            itemDesc = (
                              <div className="text-[9px] text-[#64748B] m-0 mt-0.5 leading-tight w-full">
                                <p className="m-0">Quarterly hostel fee allocation for Room {activeStudent?.roomBedNumber || "N/A"}. (Calculation: Rs. {activeStudent?.monthlyFee?.toLocaleString("en-IN")}/month × 3 months for a {activeStudent?.roomType}-Seater room)</p>
                                {monthBreakdown}
                              </div>
                            );
                          }
                          else if (item.invoiceType === "mess_fee") {
                            itemDesc = <p className="text-[9px] text-[#64748B] m-0 mt-0.5 leading-tight">Standard monthly mess and dining charges.</p>;
                          }
                          else if (item.invoiceType === "maintenance_fee") {
                            itemDesc = <p className="text-[9px] text-[#64748B] m-0 mt-0.5 leading-tight">Periodic maintenance and facility usage charges.</p>;
                          }

                          return (
                            <div key={idx} className="mb-3">
                              <div className="flex justify-between items-start">
                                <p className="text-[13px] font-bold text-[#1E293B] m-0 capitalize">{categoryName}</p>
                                <p className="text-[13px] font-bold text-[#1E293B] m-0 whitespace-nowrap">Rs. {Number(item.amount || 0).toLocaleString("en-IN")}</p>
                              </div>
                              {itemDesc}
                            </div>
                          );
                        })}
                        <div className="text-[10px] text-[#64748B] mb-4 mt-2 whitespace-pre-wrap leading-tight">
                          {invoiceForm.description || "Generated for current billing cycle."}
                        </div>
                        <div className="text-[10px] text-[#64748B] mb-2">
                          UTR / Ref: -
                        </div>
                      </div>
                      {(() => {
                        const displayPendingFees = activeStudent?.allInvoices?.reduce((sum, inv) => {
                          if (inv.status === 'paid' || inv._id === editingInvoiceId) return sum;
                          return sum + Math.max(0, (inv.amount || 0) - (inv.paidAmount || 0));
                        }, 0) || 0;
                        
                        return displayPendingFees > 0 ? (
                          <div className="border-t border-[#a8b096]/50 bg-[#F8FAF5] p-3 pb-2 pt-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[11px] font-bold text-red-600/90 uppercase tracking-wide">Previous Balance (Arrears)</span>
                              <span className="text-[12px] font-bold text-red-600/90">+ Rs. {displayPendingFees.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="pl-2 border-l-2 border-red-200 mt-2 space-y-1">
                              {activeStudent.allInvoices?.filter(inv => inv.status !== 'paid' && inv._id !== editingInvoiceId).map((inv, idx) => {
                                const pending = (inv.amount || 0) - (inv.paidAmount || 0);
                                if (pending <= 0) return null;
                                return (
                                  <div key={idx} className="flex justify-between text-[9px] text-red-500/80 mb-1">
                                    <span>• Previous {inv.invoiceType?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} - {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    <span>Rs. {pending.toLocaleString("en-IN")}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null;
                      })()}
                      <div className="border-t border-[#a8b096]/50 bg-[#F8FAF5] p-3 flex justify-between items-center">
                        <span className="text-xs font-black text-[#1E293B] uppercase tracking-wide">Total Payable</span>
                        {(() => {
                          const displayPendingFees = activeStudent?.allInvoices?.reduce((sum, inv) => {
                            if (inv.status === 'paid' || inv._id === editingInvoiceId) return sum;
                            return sum + Math.max(0, (inv.amount || 0) - (inv.paidAmount || 0));
                          }, 0) || 0;
                          const currentFormTotal = invoiceForm.items.reduce((s, i) => s + Number(i.amount || 0), 0);
                          return (
                            <span className="text-[13px] font-black text-[#1E293B]">Rs. {(currentFormTotal + displayPendingFees).toLocaleString("en-IN")}</span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Footer Note */}
                    <div className="text-center mt-6">
                      <p className="text-[8px] italic text-[#94A3B8] m-0 leading-tight">This is a computer generated receipt and does not require a physical signature.<br/>Thank you for choosing KGF Hostel.</p>
                    </div>

                  </div>
                </div>
              </div>
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
          <div className="bg-[#f4f6f0] rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl relative flex flex-col border border-[#BEC5AD]/30 sf-fade-up" style={{ fontFamily: "Inter", maxHeight: '90vh' }}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-black/10 flex items-center justify-center text-black font-bold text-2xl">
                  {activeStudent.studentName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black m-0">{activeStudent.studentName}</h3>
                  <p className="text-sm text-gray-800 m-0 font-semibold mt-1">
                    {activeStudent.studentId} • Room {activeStudent.roomBedNumber || "N/A"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowLedgerModal(false); setSelectedInvoice(null); }} className="text-black/70 hover:text-black transition-colors bg-transparent border-none cursor-pointer">
                <HiOutlineX size={24} />
              </button>
            </div>

            {/* Ledger Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: 32, background: "#f4f6f0" }} className="sf-modal-content hide-scrollbar">
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

                          {inv.status === "pending" && (!inv.paidAmount || inv.paidAmount === 0) && (
                            <>
                              <button
                                style={{ ...css.btnSecondary, padding: "8px 12px", color: T.accent, borderColor: T.accent }}
                                onClick={() => handleEditInvoice(inv)}
                                title="Edit Invoice"
                              >
                                <HiOutlinePencil size={16} />
                              </button>
                              <button
                                style={{ ...css.btnSecondary, padding: "8px 12px", color: "#DC2626", borderColor: "#FCA5A5" }}
                                onClick={() => handleDeleteInvoice(inv)}
                                title="Delete Invoice"
                              >
                                <HiOutlineTrash size={16} />
                              </button>
                            </>
                          )}

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
                                onClick={() => {
                                  setSelectedOnlineInvoice(inv);
                                  setShowOnlinePaymentModal(true);
                                }}
                              >
                                Online (QR)
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
          <div className="sf-fade-up hide-scrollbar" style={{ ...css.glassCard, width: "100%", maxWidth: 520, maxHeight: "90vh", padding: 0, overflowY: "auto" }}>
            {/* ── Invoice Details styled like the Preview ── */}
            <div className="bg-white shadow-md mx-auto w-full" style={{ fontFamily: 'Arial, sans-serif' }}>
              {/* Header */}
              <div className="bg-[#a8b096] p-4 flex items-center justify-between h-[100px] relative">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.1)", border: "none", borderRadius: 10, padding: 6, cursor: "pointer" }}
                >
                  <HiOutlineX size={18} color="#1A1F16" />
                </button>
                <div className="bg-white p-1 h-16 w-16 flex items-center justify-center">
                  <img src="/photos/logo1.svg" alt="Logo" className="max-h-full max-w-full" onError={(e) => e.target.style.display='none'} />
                </div>
                <div className="text-center flex-1 px-2 mt-2">
                  <h2 className="text-lg font-black text-[#1A1F16] m-0 leading-tight">KGF Boys Hostel</h2>
                  <p className="text-xs font-semibold text-[#3E4B28] m-0">Kokan Global Foundation</p>
                  <p className="text-[10px] italic font-semibold text-gray-700 m-0 mt-0.5">Official Invoice</p>
                  <p className="text-[8px] text-gray-800 m-0 leading-tight">KGF Hostel, Ground Floor, Admin Block</p>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 pb-5 pt-0 bg-white">
                
                {/* Status Badge */}
                <div className="flex justify-center -mt-3 mb-5 relative z-10">
                  <span className={`text-white text-[11px] font-bold px-6 py-1 rounded-sm shadow-sm tracking-wider ${selectedInvoice.status === 'paid' ? 'bg-[#10B981]' : selectedInvoice.status === 'pending_verification' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`}>
                    {selectedInvoice.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>

                {/* Combined Details Box */}
                <div className="border border-[#a8b096]/50 rounded-sm p-3 mb-4">
                  {/* Billed To Section */}
                  <div className="mb-3 pb-3 border-b border-[#a8b096]/30">
                    <p className="text-[9px] font-bold text-[#64748B] uppercase m-0 mb-1">Billed To</p>
                    <p className="text-[12px] font-bold text-[#1E293B] m-0 capitalize">{selectedInvoice.studentId?.firstName || activeStudent?.studentName} {selectedInvoice.studentId?.lastName || ""}</p>
                    <p className="text-[10px] text-[#64748B] m-0 mt-0.5">ID: {selectedInvoice.studentId?.studentId || activeStudent?.studentId || "—"} | Room: {activeStudent?.roomBedNumber || "—"}</p>
                  </div>

                  {/* Invoice Info Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-[#64748B] uppercase m-0">Invoice Number</p>
                      <p className="text-[11px] font-bold text-[#1E293B] m-0 mt-0.5">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#64748B] uppercase m-0">Date Issued</p>
                      <p className="text-[11px] font-bold text-[#1E293B] m-0 mt-0.5">{new Date(selectedInvoice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-[9px] font-bold text-[#64748B] uppercase m-0">Due Date</p>
                    <p className="text-[11px] font-bold text-[#1E293B] m-0 mt-0.5">{new Date(selectedInvoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Items Box */}
                <div className="border border-[#a8b096]/50 rounded-sm mb-4">
                  <div className="flex justify-between border-b border-[#a8b096]/50 bg-[#F8FAF5] p-2 px-3">
                    <span className="text-[9px] font-bold text-[#64748B] uppercase">Description</span>
                    <span className="text-[9px] font-bold text-[#64748B] uppercase">Amount</span>
                  </div>
                  <div className="p-3">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items.map((item, idx) => {
                      const categoryName = (item.categoryName || item.invoiceType || "Item").replace(/_/g, " ");
                      let itemDesc = null;
                      if (item.categoryName === "security_deposit" || item.invoiceType === "security_deposit") {
                        itemDesc = <p className="text-[9px] text-[#64748B] m-0 mt-0.5 leading-tight">One-time refundable security deposit based on admission criteria.</p>;
                      }
                      else if (item.categoryName === "hostel_fee" || item.invoiceType === "hostel_fee") {
                        let monthBreakdown = null;
                        if (selectedInvoice.billingCycleStart) {
                          const months = [];
                          for (let i = 0; i < 3; i++) {
                            const start = new Date(selectedInvoice.billingCycleStart);
                            start.setMonth(start.getMonth() + i);
                            const end = new Date(start);
                            end.setMonth(end.getMonth() + 1);
                            end.setDate(end.getDate() - 1);
                            const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                            months.push(
                              <div key={i} className="flex justify-between w-full mt-1">
                                <span className="text-[8.5px] font-medium">• {fmt(start)} - {fmt(end)}</span>
                                <span className="text-[8.5px] font-medium">Rs. {Math.round(item.amount / 3).toLocaleString("en-IN")}</span>
                              </div>
                            );
                          }
                          monthBreakdown = <div className="mt-2 pt-1 border-t border-[#a8b096]/20">{months}</div>;
                        }
                        itemDesc = (
                          <div className="text-[9px] text-[#64748B] m-0 mt-0.5 leading-tight w-full">
                            <p className="m-0">Quarterly hostel fee allocation.</p>
                            {monthBreakdown}
                          </div>
                        );
                      }
                      else if (item.categoryName === "mess_fee" || item.invoiceType === "mess_fee") {
                        itemDesc = <p className="text-[9px] text-[#64748B] m-0 mt-0.5 leading-tight">Standard monthly mess and dining charges.</p>;
                      }
                      else if (item.categoryName === "maintenance_fee" || item.invoiceType === "maintenance_fee") {
                        itemDesc = <p className="text-[9px] text-[#64748B] m-0 mt-0.5 leading-tight">Periodic maintenance and facility usage charges.</p>;
                      }

                      return (
                        <div key={idx} className="mb-3">
                          <div className="flex justify-between items-start">
                            <p className="text-[13px] font-bold text-[#1E293B] m-0 capitalize">{categoryName}</p>
                            <p className="text-[13px] font-bold text-[#1E293B] m-0 whitespace-nowrap">Rs. {Number(item.amount || 0).toLocaleString("en-IN")}</p>
                          </div>
                          {itemDesc}
                        </div>
                      );
                    }) : (
                      <div className="mb-3">
                        <div className="flex justify-between items-start">
                          <p className="text-[13px] font-bold text-[#1E293B] m-0 capitalize">{selectedInvoice.invoiceType?.replace(/_/g, " ") || "Combined Invoice"}</p>
                          <p className="text-[13px] font-bold text-[#1E293B] m-0 whitespace-nowrap">Rs. {Number(selectedInvoice.amount || 0).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    )}
                    <div className="text-[10px] text-[#64748B] mb-4 mt-2 whitespace-pre-wrap leading-tight">
                      {selectedInvoice.description || "Generated for current billing cycle."}
                    </div>
                    <div className="text-[10px] text-[#64748B] mb-2">
                      UTR / Ref: {selectedInvoice.transactionId || "-"}
                    </div>
                    {selectedInvoice.paymentMethod && (
                      <div className="text-[10px] text-[#64748B] mb-2">
                        Payment Method: <span className="capitalize">{selectedInvoice.paymentMethod.replace(/_/g, " ")}</span>
                      </div>
                    )}
                    {selectedInvoice.paymentMethod === 'online' && (selectedInvoice.parentScreenshot || selectedInvoice.adminScreenshot) && (
                      <div className="mt-4 flex gap-4">
                        {selectedInvoice.parentScreenshot && (
                          <div className="flex-1 text-center">
                            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-1">Student Receipt</p>
                            <a href={selectedInvoice.parentScreenshot.startsWith('http') ? selectedInvoice.parentScreenshot : `${process.env.NEXT_PUBLIC_PROD_API_URL || 'http://localhost:5000'}${selectedInvoice.parentScreenshot}`} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition">
                              <img src={selectedInvoice.parentScreenshot.startsWith('http') ? selectedInvoice.parentScreenshot : `${process.env.NEXT_PUBLIC_PROD_API_URL || 'http://localhost:5000'}${selectedInvoice.parentScreenshot}`} alt="Student Receipt" className="w-full h-24 object-contain bg-gray-50 border border-gray-200 rounded-md cursor-pointer" />
                            </a>
                          </div>
                        )}
                        {selectedInvoice.adminScreenshot && (
                          <div className="flex-1 text-center">
                            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-1">Admin SMS</p>
                            <a href={selectedInvoice.adminScreenshot.startsWith('http') ? selectedInvoice.adminScreenshot : `${process.env.NEXT_PUBLIC_PROD_API_URL || 'http://localhost:5000'}${selectedInvoice.adminScreenshot}`} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition">
                              <img src={selectedInvoice.adminScreenshot.startsWith('http') ? selectedInvoice.adminScreenshot : `${process.env.NEXT_PUBLIC_PROD_API_URL || 'http://localhost:5000'}${selectedInvoice.adminScreenshot}`} alt="Admin SMS" className="w-full h-24 object-contain bg-gray-50 border border-gray-200 rounded-md cursor-pointer" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-[#a8b096]/50 bg-[#F8FAF5] p-3 flex justify-between items-center">
                    <span className="text-xs font-black text-[#1E293B] uppercase tracking-wide">Total Invoice Amount</span>
                    <span className="text-[13px] font-black text-[#1E293B]">Rs. {(selectedInvoice.amount || 0).toLocaleString("en-IN")}</span>
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
                        border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden",
                        marginBottom: 24
                      }}>
                        {[
                          { label: "Paid So Far", value: formatCurrency(invPaid) },
                          { label: "Remaining", value: formatCurrency(invRemaining) },
                        ].map((item, i) => (
                          <div key={i} style={{
                            padding: "10px 14px",
                            background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                            borderRight: i === 0 ? `1px solid ${T.border}` : "none"
                          }}>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, margin: "0 0 2px" }}>
                              {item.label}
                            </p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>
                              {item.value}
                            </p>
                          </div>
                        ))}
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
                                onClick={() => {
                                  setSelectedOnlineInvoice(selectedInvoice);
                                  setShowOnlinePaymentModal(true);
                                }}
                              >
                                Pay Online (QR)
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
          </div>
        </ModalOverlay>
      )}

      {/* ── Admin Online Payment Modal ── */}
      {showOnlinePaymentModal && selectedOnlineInvoice && (
        <ModalOverlay onClose={() => {
          setShowOnlinePaymentModal(false);
          setSelectedOnlineInvoice(null);
        }} zIndex={140}>
          <div className="w-full max-w-5xl h-full max-h-[90vh] bg-[#f4f6f0] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
            <AdminOnlinePayment 
              fee={selectedOnlineInvoice}
              activeStudent={activeStudent || studentFeeStats.find(s => s._id === selectedOnlineInvoice.studentId?._id || s._id === selectedOnlineInvoice.studentId)}
              onBack={() => {
                setShowOnlinePaymentModal(false);
                setSelectedOnlineInvoice(null);
              }}
              onSuccess={() => {
                setShowOnlinePaymentModal(false);
                setSelectedOnlineInvoice(null);
                setSelectedInvoice(null);
                fetchData();
              }}
            />
          </div>
        </ModalOverlay>
      )}

      {alertModalMsg && (
        <ModalOverlay onClose={() => setAlertModalMsg("")} zIndex={130}>
          <div style={{ ...css.glassCard, maxWidth: "400px", width: "100%", textAlign: "center", padding: "30px 24px" }}>
            <div style={{ color: T.red, marginBottom: "16px" }}>
              <HiOutlineExclamationCircle size={48} style={{ margin: "0 auto" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: T.text, marginBottom: "12px" }}>
              Notice
            </h3>
            <p style={{ fontSize: "14px", color: T.textMuted, marginBottom: "24px", lineHeight: "1.5" }}>
              {alertModalMsg}
            </p>
            <button
              style={{ ...css.btnPrimary, width: "100%", justifyContent: "center" }}
              onClick={() => setAlertModalMsg("")}
            >
              OK
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

// ── Reusable Sub-Components ───────────────────────────────────────────────────
const ModalOverlay = ({ children, onClose, zIndex = 110 }) => (
  <div
    style={{
      position: "fixed", inset: 0, zIndex,
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