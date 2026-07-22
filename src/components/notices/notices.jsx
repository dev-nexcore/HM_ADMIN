//notices.jsx

"use client";
import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Package,
  CheckCircle,
  Clock3,
  Wrench,
  AlertTriangle,
  FileText,
  Users,
  UserCheck,
  Eye,
  Trash2,
  Edit,
  Info,
  X
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_PROD_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const initialFormState = {
  template: "",
  title: "",
  recipient: "",
  individualRecipient: "",
  message: "",
  date: "",
  expiryDate: ""
};

const HostelNotices = () => {
  const [form, setForm] = useState(initialFormState);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "All",
    recipientType: "",
    page: 1,
    limit: 50
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [viewingNotice, setViewingNotice] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState(null);
  const [formErrors, setFormErrors] = useState(null);
  const [activeFilterCard, setActiveFilterCard] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [individualOptions, setIndividualOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const [activeTab, setActiveTab] = useState("issue");
  const [templates, setTemplates] = useState([
    { name: "Maintenance", title: "", message: "" },
    { name: "Announcement", title: "", message: "" },
    { name: "Event", title: "", message: "" },
    { name: "Fee Reminder", title: "", message: "" },
    { name: "Rule Change", title: "", message: "" },
    { name: "Emergency Alert", title: "", message: "" },
    { name: "Lost and Found", title: "", message: "" },
    { name: "Exam Schedule", title: "", message: "" },
    { name: "General Announcement", title: "", message: "" },
    { name: "Monthly fees reminder", title: "", message: "" }
  ]);

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get("/api/adminauth/notice-templates");
      if (data.success && data.templates && data.templates.length > 0) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/adminauth/notices", {
        params: filters,
      });
      if (data.success) setNotices(data.notices);
    } catch (err) {
      console.error("Failed to fetch notices:", err);
      toast.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [filters]);

  const handleIssueNotice = async () => {
    // Basic Frontend Validation
    if (!form.recipient) {
      toast.error("Please select a recipient type.");
      return;
    }
    if (!form.template) {
      toast.error("Please select a notice template.");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Please enter a notice title.");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Please enter the notice message.");
      return;
    }

    const toastId = toast.loading("Issuing notice...");

    try {
      const response = await api.post("/api/adminauth/issue-notice", {
        template: form.template,
        title: form.title,
        message: form.message,
        issueDate: form.date,
        expiryDate: form.expiryDate,
        recipientType: form.recipient === "All" ? "All" : form.recipient,
        individualRecipient: form.individualRecipient || "",
      });

      if (response.data.success) {
        toast.update(toastId, { render: "Notice issued successfully!", type: "success", isLoading: false, autoClose: 3000 });
        setForm({
          template: "",
          title: "",
          message: "",
          date: new Date().toISOString().split("T")[0],
          expiryDate: "",
          recipient: "",
          individualRecipient: "",
        });
        fetchNotices();
      } else {
        toast.update(toastId, { render: response.data.message || "Failed to issue notice.", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      console.error("Issue notice error:", err);
      const errorMessage = err.response?.data?.message || "Failed to issue notice. Please try again.";
      toast.update(toastId, { render: errorMessage, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const dateInputRef = useRef(null);
  const editDateInputRef = useRef(null);
  const expiryDateInputRef = useRef(null);
  const editExpiryDateInputRef = useRef(null);

  const handleCancel = () => {
    setForm(initialFormState);
  };

  const handleEdit = (notice) => {
    setEditingNotice({ ...notice });
    setIsPopupOpen(true);
  };

  const handleDelete = (noticeId) => {
    setDeleteNoticeId(noticeId);
    setShowDeleteConfirm(true);
  };


  const confirmDelete = async () => {
    try {
      await api.delete(`/api/adminauth/notices/${deleteNoticeId}`);
      setNotices((prev) => prev.filter((notice) => notice.id !== deleteNoticeId));
      toast.success("✅ Notice deleted successfully");
    } catch (err) {
      console.error("Failed to delete notice:", err);
      toast.error("❌ Failed to delete notice");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteNoticeId(null);
    }
  };

  const handleApproveTemplate = async (templateId) => {
    const toastId = toast.loading("Approving template...");
    try {
      const { data } = await api.patch(`/api/adminauth/notice-templates/${templateId}/approve`);
      if (data.success) {
        setTemplates(templates.map(t => t._id === templateId ? data.template : t));
        toast.update(toastId, { render: "Template approved successfully", type: "success", isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Failed to approve template", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleRejectTemplate = async (templateId) => {
    const toastId = toast.loading("Rejecting template...");
    try {
      const { data } = await api.patch(`/api/adminauth/notice-templates/${templateId}/reject`);
      if (data.success) {
        setTemplates(templates.map(t => t._id === templateId ? data.template : t));
        toast.update(toastId, { render: "Template rejected successfully", type: "success", isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Failed to reject template", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteNoticeId(null);
  };

  const handleApproveNotice = async (noticeId) => {
    const toastId = toast.loading("Approving notice action...");
    try {
      const response = await api.put(`/api/adminauth/notices/${noticeId}/approve`);
      if (response.data.success) {
        toast.update(toastId, { render: "Notice action approved", type: "success", isLoading: false, autoClose: 3000 });
        fetchNotices();
      } else {
        toast.update(toastId, { render: "Failed to approve", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(toastId, { render: "Failed to approve notice action", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleRejectNotice = async (noticeId) => {
    const reason = window.prompt("Please enter a reason for rejecting this notice:");
    if (reason === null) return; // User cancelled
    
    const toastId = toast.loading("Rejecting notice action...");
    try {
      const response = await api.put(`/api/adminauth/notices/${noticeId}/reject`, { rejectionReason: reason });
      if (response.data.success) {
        toast.update(toastId, { render: "Notice action rejected", type: "success", isLoading: false, autoClose: 3000 });
        fetchNotices();
      } else {
        toast.update(toastId, { render: "Failed to reject", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(toastId, { render: "Failed to reject notice action", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const parseToISO = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
      };

      const payload = {
        ...editingNotice,
        issueDate: parseToISO(editingNotice.date) || editingNotice.issueDate,
        expiryDate: parseToISO(editingNotice.expiryDate)
      };

      await api.put(`/api/adminauth/notices/${editingNotice.id}`, payload);
      fetchNotices();
      setIsPopupOpen(false);
      setEditingNotice(null);
      toast.success("Notice updated successfully");
    } catch (err) {
      console.error("Failed to update notice:", err);
      toast.error("Failed to update notice");
    }
  };

  const handleCancelEdit = () => {
    setIsPopupOpen(false);
    setEditingNotice(null);
  };

  const handleViewDetails = (notice) => {
    setViewingNotice(notice);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingNotice(null);
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handleEditCalendarClick = () => {
    if (editDateInputRef.current) {
      editDateInputRef.current.showPicker();
    }
  };

  const handleExpiryCalendarClick = () => {
    if (expiryDateInputRef.current) {
      expiryDateInputRef.current.showPicker();
    }
  };

  const handleEditExpiryCalendarClick = () => {
    if (editExpiryDateInputRef.current) {
      editExpiryDateInputRef.current.showPicker();
    }
  };

  // Filter card click handlers
  const handleFilterCardClick = (filterType) => {
    setActiveFilterCard(filterType);
    if (filterType === "all") {
      setFilters({ ...filters, status: "All", recipientType: "" });
    } else if (filterType === "active") {
      setFilters({ ...filters, status: "Active", recipientType: "" });
    } else if (filterType === "archived") {
      setFilters({ ...filters, status: "Archived", recipientType: "" });
    } else if (filterType === "students") {
      setFilters({ ...filters, status: "All", recipientType: "Student" });
    } else if (filterType === "warden") {
      setFilters({ ...filters, status: "All", recipientType: "Warden" });
    } else if (filterType === "parent") {
      setFilters({ ...filters, status: "All", recipientType: "Parent" });
    } else if (filterType === "worker") {
      setFilters({ ...filters, status: "All", recipientType: "Worker" });
    } else if (filterType === "scheduled") {
      // For scheduled, we might not have a direct filter via state right away unless we add it,
      // but we can just set a dummy status that we handle in filtering, or leave it as "All"
      // and let the frontend filter by date.
      setFilters({ ...filters, status: "Scheduled", recipientType: "" });
    }
  };

  // Calculate statistics for cards
  const getNoticeStats = () => {
    const total = notices.length;
    const active = notices.filter(n => n.status === "Active").length;
    const archived = notices.filter(n => n.status === "Archived").length;
    const toStudents = notices.filter(n => n.recipient === "Student" || n.recipient === "Students").length;
    const toWarden = notices.filter(n => n.recipient === "Warden").length;
    const toParent = notices.filter(n => n.recipient === "Parent").length;
    const toWorker = notices.filter(n => n.recipient === "Worker").length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduled = notices.filter(n => {
      if (!n.issueDate) return false;
      const iDate = new Date(n.issueDate);
      iDate.setHours(0, 0, 0, 0);
      return iDate.getTime() > today.getTime();
    }).length;

    return { total, active, archived, toStudents, toWarden, toParent, toWorker, scheduled };
  };

  const stats = getNoticeStats();

  // Card data array
  const filterCards = [
    { id: "all", label: "All", value: stats.total, subLabel: "Total Items", color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", icon: "📋" },
    { id: "active", label: "Active", value: stats.active, subLabel: "Ready", color: "from-green-500 to-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", icon: "✅" },
    { id: "archived", label: "Archived", value: stats.archived, subLabel: "In Use", color: "from-orange-500 to-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", icon: "📦" },
    { id: "students", label: "Students", value: stats.toStudents, subLabel: "To Students", color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200", icon: "👨‍🎓" },
    { id: "warden", label: "Warden", value: stats.toWarden, subLabel: "To Warden", color: "from-red-500 to-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", icon: "👔" },
  ];

  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-4 font-sans">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
              <h1 className="text-[25px] leading-[25px] font-extrabold text-black flex items-center" style={{ fontFamily: 'Inter' }}>
                Hostel Notices
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 text-sm ml-3" style={{ fontFamily: 'Poppins' }}>
              Manage and issue notices to students and staff
            </p>
          </div>
        </div>
       

        {/* Alternative Minimal Cards Design (Like your reference) */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-10">
  
  {/* Total Notices */}
  <div
    onClick={() => handleFilterCardClick("all")}
    className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
      activeFilterCard === "all"
        ? "border-blue-400 shadow-md ring-1 ring-blue-200"
        : "border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
        <FileText className="w-4 h-4 text-blue-500" />
      </div>
      <div className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 uppercase tracking-wider">
        All
      </div>
    </div>

    <div className="text-2xl font-bold text-black">{stats.total}</div>

    <div className="text-gray-500 text-[11px] font-bold uppercase tracking-tight mt-1">
      Total Notices
    </div>
  </div>

  {/* Active Notices */}
  <div
    onClick={() => handleFilterCardClick("active")}
    className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
      activeFilterCard === "active"
        ? "border-green-400 shadow-md ring-1 ring-green-200"
        : "border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-green-500" />
      </div>
      <div className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-50 text-green-600 uppercase tracking-wider">
        Visible
      </div>
    </div>

    <div className="text-2xl font-bold text-black">{stats.active}</div>

    <div className="text-gray-500 text-[11px] font-bold uppercase tracking-tight mt-1">
      Active
    </div>
  </div>

  {/* Archived Notices */}
  <div
    onClick={() => handleFilterCardClick("archived")}
    className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
      activeFilterCard === "archived"
        ? "border-orange-400 shadow-md ring-1 ring-orange-200"
        : "border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
        <Clock3 className="w-4 h-4 text-orange-500" />
      </div>
      <div className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-50 text-orange-600 uppercase tracking-wider">
        History
      </div>
    </div>

    <div className="text-2xl font-bold text-black">{stats.archived}</div>

    <div className="text-gray-500 text-[11px] font-bold uppercase tracking-tight mt-1">
      Archived
    </div>
  </div>

  {/* For Students */}
  <div
    onClick={() => handleFilterCardClick("students")}
    className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
      activeFilterCard === "students"
        ? "border-purple-400 shadow-md ring-1 ring-purple-200"
        : "border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
        <Users className="w-4 h-4 text-purple-500" />
      </div>
      <div className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-600 uppercase tracking-wider">
        Students
      </div>
    </div>

    <div className="text-2xl font-bold text-black">{stats.toStudents}</div>

    <div className="text-gray-500 text-[11px] font-bold uppercase tracking-tight mt-1">
      To Students
    </div>
  </div>

  {/* For Wardens */}
  <div
    onClick={() => handleFilterCardClick("warden")}
    className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
      activeFilterCard === "warden"
        ? "border-red-400 shadow-md ring-1 ring-red-200"
        : "border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
        <UserCheck className="w-4 h-4 text-red-500" />
      </div>
      <div className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-600 uppercase tracking-wider">
        Warden
      </div>
    </div>

    <div className="text-2xl font-bold text-black">{stats.toWarden}</div>

    <div className="text-gray-500 text-[11px] font-bold uppercase tracking-tight mt-1">
      To Warden
    </div>
  </div>

  {/* For Parents */}
  <div
    onClick={() => handleFilterCardClick("parent")}
    className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
      activeFilterCard === "parent"
        ? "border-pink-400 shadow-md ring-1 ring-pink-200"
        : "border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
        <Users className="w-4 h-4 text-pink-500" />
      </div>
      <div className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-pink-50 text-pink-600 uppercase tracking-wider">
        Parent
      </div>
    </div>

    <div className="text-2xl font-bold text-black">{stats.toParent}</div>

    <div className="text-gray-500 text-[11px] font-bold uppercase tracking-tight mt-1">
      To Parent
    </div>
  </div>

  {/* For Workers */}
  <div
    onClick={() => handleFilterCardClick("worker")}
    className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
      activeFilterCard === "worker"
        ? "border-teal-400 shadow-md ring-1 ring-teal-200"
        : "border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
        <Users className="w-4 h-4 text-teal-500" />
      </div>
      <div className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-50 text-teal-600 uppercase tracking-wider">
        Worker
      </div>
    </div>

    <div className="text-2xl font-bold text-black">{stats.toWorker}</div>

    <div className="text-gray-500 text-[11px] font-bold uppercase tracking-tight mt-1">
      To Worker
    </div>
  </div>

  {/* Scheduled Notices */}
  <div
    onClick={() => handleFilterCardClick("scheduled")}
    className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
      activeFilterCard === "scheduled"
        ? "border-indigo-400 shadow-md ring-1 ring-indigo-200"
        : "border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Clock3 className="w-4 h-4 text-indigo-500" />
      </div>
      <div className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wider">
        Scheduled
      </div>
    </div>

    <div className="text-2xl font-bold text-black">{stats.scheduled}</div>

    <div className="text-gray-500 text-[11px] font-bold uppercase tracking-tight mt-1">
      Future Issue
    </div>
  </div>
</div>
        {/* Tabs */}
        <div className="hidden sm:flex mb-4 gap-3 overflow-x-auto pb-2 custom-scrollbar whitespace-nowrap">
          {["issue", "template"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-[12px] font-semibold transition-colors text-sm ${activeTab === tab ? "bg-[#BEC5AD] text-black shadow-md border border-[#4F8CCF]/50" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`} style={{ fontFamily: "Poppins" }}>
              {tab === "issue" ? "Issue Notice" : "Create Template"}
            </button>
          ))}
        </div>
        <div className="sm:hidden mb-4 relative h-[45px] w-full">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full h-full px-4 bg-[#BEC5AD] rounded-[12px] outline-none cursor-pointer appearance-none text-[14px] font-semibold text-black shadow-md border border-[#4F8CCF]/50"
            style={{ WebkitAppearance: "none", fontFamily: "Poppins" }}
          >
            <option value="issue">Issue Notice</option>
            <option value="template">Create Template</option>
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {activeTab === "template" && (
          <div className="w-full">
          <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-10 border border-[#BEC5AD]/30">
            <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-black font-[Poppins]">
                  Create New Template
                </h2>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 w-full lg:w-3/4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-1 text-black ml-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" }}>Template Name</label>
                    <input 
                       type="text" 
                       placeholder="e.g. Monthly Fee Reminder"
                       id="newTemplateName"
                       className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]"
                       style={{ height: "40px", background: "#FFFFFF", boxShadow: "0px 4px 10px rgba(0,0,0,0.25)", borderRadius: "10px", color: "#000", border: "none", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-black ml-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" }}>Default Notice Title (Optional)</label>
                    <input 
                       type="text" 
                       placeholder="e.g. Please pay your fees"
                       id="newTemplateTitle"
                       className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]"
                       style={{ height: "40px", background: "#FFFFFF", boxShadow: "0px 4px 10px rgba(0,0,0,0.25)", borderRadius: "10px", color: "#000", border: "none", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-black ml-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" }}>Default Message Content (Optional)</label>
                  <textarea 
                     rows={4}
                     placeholder="Type the default message template here..."
                     id="newTemplateMessage"
                     className="w-full px-4 py-3 text-black font-semibold text-[12px] font-[Poppins] resize-none"
                     style={{ background: "#FFFFFF", boxShadow: "0px 4px 10px rgba(0,0,0,0.25)", borderRadius: "10px", color: "#000", border: "none", outline: "none" }}
                  />
                </div>

                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => {
                      const nameEl = document.getElementById('newTemplateName');
                      const titleEl = document.getElementById('newTemplateTitle');
                      const msgEl = document.getElementById('newTemplateMessage');
                      
                      const val = nameEl?.value.trim();
                      const titleVal = titleEl?.value.trim() || "";
                      const msgVal = msgEl?.value.trim() || "";
                      
                      if(!val) return toast.error('Enter template name');
                      if(templates.some(t => t.name === val)) return toast.error('Template already exists');
                      
                      const newT = { name: val, title: titleVal, message: msgVal };
                      api.post('/api/adminauth/notice-templates', newT).then(res => {
                        if (res.data.success) {
                          setTemplates([...templates, res.data.template]);
                          toast.success('Template created successfully!');
                          
                          if (nameEl) nameEl.value = '';
                          if (titleEl) titleEl.value = '';
                          if (msgEl) msgEl.value = '';
                        }
                      }).catch(err => {
                        toast.error(err.response?.data?.message || 'Failed to create template');
                      });
                      

                      setActiveTab('issue');
                    }}
                    className="bg-white border border-gray-200 cursor-pointer text-black px-8 py-3 rounded-xl shadow-sm font-semibold text-sm hover:bg-gray-50 transition-all duration-300"
                  >
                    Save Template
                  </button>
                </div>
             </div>
          </div>
          </div>

          {/* Templates List */}
          <div>
            <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-6 border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter' }}>
              <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-black">
                    Saved Templates
                  </h2>
                  <p className="text-sm text-gray-700 mt-1">Total: {templates.length} records</p>
                </div>
              </div>

              <div className="hidden lg:block overflow-x-auto p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Sr No</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Template Name</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Default Title</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t, index) => (
                    <tr key={t.name} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 font-bold whitespace-nowrap">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-bold whitespace-nowrap">{t.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{t.title || "-"}</td>
                      <td className="p-3">
                        {t.status === 'Pending Approval' || t.status === 'Pending Edit' || t.status === 'Pending Deletion' ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                            {t.status}
                          </span>
                        ) : t.status === 'Rejected' ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                            {t.status}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-3 rounded-r-lg">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setViewingTemplate(t)}
                            className="p-1.5 text-green-600 hover:text-green-800 transition-colors bg-white rounded-lg shadow-sm"
                            title="View Template"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {(t.status === 'Pending Approval' || t.status === 'Pending Edit' || t.status === 'Pending Deletion') && (
                            <>
                              <button
                                onClick={() => handleApproveTemplate(t._id)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors bg-white rounded-lg shadow-sm"
                                title="Approve Template Action"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleRejectTemplate(t._id)}
                                className="p-1.5 text-orange-600 hover:text-orange-800 transition-colors bg-white rounded-lg shadow-sm"
                                title="Reject Template Action"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}

                          {t._id && (
                            <>
                              <button
                                onClick={() => setEditingTemplate(t)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors bg-white rounded-lg shadow-sm"
                                title="Edit Template"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  api.delete(`/api/adminauth/notice-templates/${t._id}`).then(res => {
                                    if (res.data.success) {
                                      setTemplates(templates.filter((temp) => temp._id !== t._id));
                                      toast.success("Template deleted successfully!");
                                    }
                                  }).catch(() => toast.error("Failed to delete template"));
                                }}
                                className="p-1.5 text-red-600 hover:text-red-800 transition-colors bg-white rounded-lg shadow-sm"
                                title="Delete Template"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {templates.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center p-4 text-gray-500">No templates found</td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>

              {/* Mobile View for Templates */}
              <div className="space-y-4 sm:hidden">
                {templates.map((t, index) => (
                  <div key={t.name} className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#4F8CCF]">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-blue-600">Sr No: {index + 1}</span>
                    </div>
                    <div className="mb-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Template Name</p>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Default Title</p>
                      <p className="text-sm font-medium">{t.title || "-"}</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
                      <button
                        onClick={() => setViewingTemplate(t)}
                        className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                      >
                        View
                      </button>
                      {t._id && (
                        <>
                          <button
                            onClick={() => setEditingTemplate(t)}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              api.delete(`/api/adminauth/notice-templates/${t._id}`).then(res => {
                                if (res.data.success) {
                                  setTemplates(templates.filter((temp) => temp._id !== t._id));
                                  toast.success("Template deleted successfully!");
                                }
                              }).catch(() => toast.error("Failed to delete template"));
                            }}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Form Box */}
        {activeTab === "issue" && (
        <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-10 border border-[#BEC5AD]/30">
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-black font-[Poppins]">
                Issue Notice
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Select Template */}
              <div className="w-full">
                <label className="block mb-1 text-black ml-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" }}>
                  Select Template
                </label>
                <div className="relative shadow-[0px_4px_10px_rgba(0,0,0,0.25)] rounded-[10px] bg-white">
                  <select
                    className={`w-full appearance-none bg-transparent text-black px-4 font-semibold text-[12px] font-[Poppins] cursor-pointer outline-none border-none h-[40px] ${formErrors?.template ? "border border-red-500" : ""}`}
                  value={form.template}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const selectedTemplate = templates.find(t => t.name === selectedName);
                    setForm({ 
                      ...form, 
                      template: selectedName, 
                      title: selectedTemplate?.title || form.title, 
                      message: selectedTemplate?.message || form.message 
                    });
                    if (selectedName) {
                      setFormErrors((prev) => ({ ...prev, template: false }));
                    }
                  }}
                >
                  <option value="" disabled hidden>Select Template</option>
                  {templates.filter(t => !t.status || t.status === "Active").map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {formErrors?.template && (
                <p className="text-red-500 text-xs mt-1 ml-2">
                  Please select a template
                </p>
              )}
            </div>

            {/* Notice Title */}
            <div className="w-full">
              <label className="block mb-1 text-black ml-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" }}>
                Notice Title
              </label>
              <input
                type="text"
                placeholder="Enter Notice Title"
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  if (e.target.value) {
                    setFormErrors((prev) => ({ ...prev, title: false }));
                  }
                }}
                onBlur={(e) => {
                  if (!e.target.value) {
                    setFormErrors((prev) => ({ ...prev, title: true }));
                  }
                }}
                className={`w-full px-4 text-black font-semibold text-[12px] font-[Poppins] ${formErrors?.title ? "border border-red-500" : ""}`}
                style={{ height: "40px", background: "#FFFFFF", boxShadow: "0px 4px 10px rgba(0,0,0,0.25)", borderRadius: "10px", color: "#000", border: "none", outline: "none" }}
              />
              {formErrors?.title && (
                <p className="text-red-500 text-xs mt-1 ml-2">
                  Please enter a title
                </p>
              )}
            </div>

            {/* Recipient */}
            <div className="w-full">
              <label className="block mb-1 text-black ml-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" }}>
                Recipient
              </label>
              <div className="relative shadow-[0px_4px_10px_rgba(0,0,0,0.25)] rounded-[10px] bg-white">
                <select
                  className={`w-full appearance-none bg-transparent text-gray-500 px-4 font-semibold text-[12px] font-[Poppins] cursor-pointer outline-none border-none h-[40px] ${formErrors?.recipient ? "border border-red-500" : ""}`}
                  value={form.recipient}
                  onChange={async (e) => {
                    const recipientType = e.target.value;
                    setForm({ ...form, recipient: recipientType, individualRecipient: "" });
                    if (recipientType) {
                      setFormErrors(prev => ({ ...prev, recipient: false }));
                    }
                    
                    if (recipientType && recipientType !== "All") {
                       setLoadingOptions(true);
                       try {
                          let res;
                          if (recipientType === "Student") res = await api.get("/api/adminauth/students");
                          else if (recipientType === "Warden") res = await api.get("/api/adminauth/wardens");
                          else if (recipientType === "Worker") res = await api.get("/api/adminauth/students"); // STUW workers are registered as students
                          else if (recipientType === "Parent") res = await api.get("/api/adminauth/parents");
                          
                          if (res?.data) {
                             const list = res.data.parents || res.data.students || res.data.wardens || res.data.staff || res.data.staffs || res.data.data || res.data || [];
                             let filteredList = Array.isArray(list) ? list : [];
                             
                             filteredList = filteredList.filter(opt => {
                                const optId = opt.studentId || opt.wardenId || opt.staffId || opt._id || "";
                                if (typeof optId !== "string") return true;
                                
                                if (recipientType === "Worker") {
                                   return optId.startsWith("STUW") || optId.startsWith("STF") || optId.startsWith("WORK");
                                } else if (recipientType === "Warden") {
                                   return optId.startsWith("W");
                                } else if (recipientType === "Student" || recipientType === "Parent") {
                                   return optId.startsWith("STU") && !optId.startsWith("STUW");
                                }
                                return true;
                             });
                             
                             setIndividualOptions(filteredList);
                          }
                       } catch (err) {
                          console.error("Failed to fetch options", err);
                          setIndividualOptions([]);
                       } finally {
                          setLoadingOptions(false);
                       }
                    } else {
                       setIndividualOptions([]);
                    }
                  }}
                >
                  <option value="">Select recipient</option>
                  <option value="All">All</option>
                  <option value="Student">Student</option>
                  <option value="Warden">Warden</option>
                  <option value="Worker">Worker</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {formErrors?.recipient && (
                <p className="text-red-500 text-xs mt-1 ml-2">Please select a recipient</p>
              )}
            </div>

            {/* Individual Recipient Input */}
            <div className={`w-full ${form.recipient === "All" ? "opacity-50 pointer-events-none" : ""}`}>
              <label className="block mb-1 text-black ml-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" }}>
                Specific Recipient
              </label>
              <div className="relative shadow-[0px_4px_10px_rgba(0,0,0,0.25)] rounded-[10px] bg-white">
                <select
                  className="w-full appearance-none bg-transparent text-gray-500 px-4 font-semibold text-[12px] font-[Poppins] cursor-pointer outline-none border-none h-[40px]"
                  value={form.individualRecipient}
                  onChange={(e) => setForm({ ...form, individualRecipient: e.target.value })}
                  disabled={form.recipient === "All" || loadingOptions}
                >
                  <option value="">Select specific {form.recipient === "All" ? "recipient" : form.recipient?.toLowerCase() || "recipient"} (Optional)</option>
                  {loadingOptions ? (
                    <option disabled>Loading options...</option>
                  ) : (
                    individualOptions.map((opt, i) => {
                      const optName = opt.firstName ? `${opt.firstName} ${opt.lastName || ""}` : opt.name || opt.email;
                      const optId = opt.studentId || opt.wardenId || opt.staffId || opt._id;
                      return (
                        <option key={i} value={optId}>
                          {optName} ({optId})
                        </option>
                      );
                    })
                  )}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                  {loadingOptions ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full mt-6">
            <label className="block mb-1 text-black ml-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" }}>
              Message Content
            </label>
            <textarea
              rows={8}
              placeholder="Type your message here..."
              value={form.message}
              onChange={(e) => {
                setForm({ ...form, message: e.target.value });
                if (e.target.value) {
                  setFormErrors((prev) => ({ ...prev, message: false }));
                }
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  setFormErrors((prev) => ({ ...prev, message: true }));
                }
              }}
              className={`w-full px-4 py-3 text-black font-semibold text-[12px] font-[Poppins] resize-none ${formErrors?.message ? "border border-red-500" : ""}`}
              style={{ background: "#FFFFFF", boxShadow: "0px 4px 10px rgba(0,0,0,0.25)", borderRadius: "10px", color: "#000", border: "none", outline: "none" }}
            />
            {formErrors?.message && (
              <p className="text-red-500 text-xs mt-1 ml-2">
                Please enter a message
              </p>
            )}
          </div>

          <div className="w-full mt-6 flex flex-wrap items-center justify-between gap-4">
            {/* Issue Date */}
            <div className="w-full sm:w-auto">
              <label className="block mb-1 text-black ml-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" }}>
                Issue Date
              </label>
              <div className="relative flex items-center">
                <div className="relative w-full sm:w-[300px] max-w-full">
                  <input
                    ref={dateInputRef}
                    type="date"
                    name="issueDate"
                    value={
                      form.date ? form.date.split("-").reverse().join("-") : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        const selectedDate = new Date(e.target.value);
                        const formattedDate = `${selectedDate
                          .getDate()
                          .toString()
                          .padStart(2, "0")}-${(selectedDate.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}-${selectedDate.getFullYear()}`;
                        setForm((prev) => ({
                          ...prev,
                          date: formattedDate,
                        }));
                        setFormErrors((prev) => ({ ...prev, date: false }));
                      } else {
                        setForm((prev) => ({ ...prev, date: "" }));
                      }
                    }}
                    onBlur={(e) => {
                      if (!form.date) {
                        setFormErrors((prev) => ({ ...prev, date: true }));
                      }
                    }}
                    className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                    style={{ colorScheme: "light" }}
                  />
                  <div
                    className={`bg-white rounded-[10px] shadow-[0px_4px_10px_rgba(0,0,0,0.25)] px-4 h-[40px] flex items-center font-[Poppins] font-semibold text-[12px] tracking-widest text-gray-800 select-none z-10 ${formErrors?.date ? "border border-red-500" : "border-none"}`}
                  >
                    {form.date || ""}
                  </div>
                  {!form.date && (
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 z-0 text-gray-400 font-semibold text-sm tracking-[0.em] md:tracking-[0.4em] pointer-events-none select-none">
                      d&nbsp;d&nbsp;-&nbsp;m&nbsp;m&nbsp;-&nbsp;y&nbsp;y&nbsp;y&nbsp;y
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCalendarClick}
                  className="ml-3 p-2 cursor-pointer rounded-lg transition-colors flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
                  title="Open Calendar"
                >
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_370_4" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
                      <rect width="30" height="30" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_370_4)">
                      <path d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 15.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 21.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 21.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 21.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 21.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z" fill="#1C1B1F" />
                    </g>
                  </svg>
                </button>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="w-full sm:w-auto">
              <label className="block mb-1 text-black ml-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" }}>
                Expiry Date (Optional)
              </label>
              <div className="relative flex items-center">
                <div className="relative w-full sm:w-[300px] max-w-full">
                  <input
                    ref={expiryDateInputRef}
                    type="date"
                    name="expiryDate"
                    value={
                      form.expiryDate ? form.expiryDate.split("-").reverse().join("-") : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        const selectedDate = new Date(e.target.value);
                        const formattedDate = `${selectedDate
                          .getDate()
                          .toString()
                          .padStart(2, "0")}-${(selectedDate.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}-${selectedDate.getFullYear()}`;
                        setForm((prev) => ({
                          ...prev,
                          expiryDate: formattedDate,
                        }));
                      } else {
                        setForm((prev) => ({ ...prev, expiryDate: "" }));
                      }
                    }}
                    className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                    style={{ colorScheme: "light" }}
                  />
                  <div
                    className="bg-white rounded-[10px] shadow-[0px_4px_10px_rgba(0,0,0,0.25)] px-4 h-[40px] flex items-center font-[Poppins] font-semibold text-[12px] tracking-widest text-gray-800 select-none z-10 border-none"
                  >
                    {form.expiryDate || ""}
                  </div>
                  {!form.expiryDate && (
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 z-0 text-gray-400 font-semibold text-sm tracking-[0.em] md:tracking-[0.4em] pointer-events-none select-none">
                      d&nbsp;d&nbsp;-&nbsp;m&nbsp;m&nbsp;-&nbsp;y&nbsp;y&nbsp;y&nbsp;y
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleExpiryCalendarClick}
                  className="ml-3 p-2 cursor-pointer rounded-lg transition-colors flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
                  title="Open Calendar"
                >
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_370_4" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
                      <rect width="30" height="30" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_370_4)">
                      <path d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 15.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 21.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 21.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 21.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 21.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z" fill="#1C1B1F" />
                    </g>
                  </svg>
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="w-full flex justify-center mt-6 sm:mt-8">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white border border-gray-200 cursor-pointer text-black px-6 py-2 rounded-xl shadow-sm font-semibold text-sm hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => {
                    const errors = {};
                    if (!form.template) errors.template = true;
                    if (!form.title) errors.title = true;
                    if (!form.recipient) errors.recipient = true;
                    if (!form.message) errors.message = true;
                    if (!form.date) errors.date = true;

                    if (Object.keys(errors).length > 0) {
                      setFormErrors(errors);
                      return;
                    }

                    setFormErrors(null);
                    handleIssueNotice();
                  }}
                  className="bg-[#4F8CCF] border border-[#4F8CCF] cursor-pointer text-white px-6 py-2 rounded-xl shadow-sm font-semibold text-sm hover:bg-blue-600 transition-all duration-300"
                >
                  Issue Notice
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
        )}

        {/* Table */}
        <NoticesTable
          notices={notices}
          loading={loading}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleViewDetails={handleViewDetails}
          handleApproveNotice={handleApproveNotice}
          handleRejectNotice={handleRejectNotice}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        />
         {/* Edit Popup Modal */}
        {/* Edit Popup Modal */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black font-[Poppins]">
                  Edit Notice
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-[Poppins]">
                {/* Select Template */}
                <div className="w-full">
                  <label className="text-black font-medium mb-1 block ml-2">
                    Select Template
                  </label>
                  <div className="relative shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] rounded-lg">
                    <select
                      className="w-full appearance-none bg-white text-black px-4 py-3 rounded-lg outline-none border-none text-[12px]"
                      value={editingNotice?.template || ""}
                      onChange={(e) =>
                        setEditingNotice({
                          ...editingNotice,
                          template: e.target.value,
                        })
                      }
                    >
                      <option value="" disabled hidden>Select Template</option>
                      {templates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Notice Title */}
                <div className="w-full">
                  <label className="text-black font-medium mb-1 block ml-2">
                    Notice Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Notice Title"
                    value={editingNotice?.title || ""}
                    onChange={(e) =>
                      setEditingNotice({
                        ...editingNotice,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white text-black shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] outline-none border-none placeholder:font-medium placeholder:text-gray-400 text-[12px]"
                  />
                </div>

                {/* Recipient */}
                <div className="w-full">
                  <label className="text-black font-medium mb-1 block ml-2">
                    Recipient
                  </label>
                  <div className="relative shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] rounded-lg">
                    <select
                      className="w-full appearance-none bg-white text-gray-500 px-4 py-3 rounded-lg outline-none border-none text-[12px] font-medium"
                      value={editingNotice?.recipient || ""}
                      onChange={async (e) => {
                        const recipientType = e.target.value;
                        setEditingNotice({
                          ...editingNotice,
                          recipient: recipientType,
                          individualRecipient: "",
                        });
                        
                        if (recipientType && recipientType !== "All") {
                           setLoadingOptions(true);
                           try {
                              let res;
                              if (recipientType === "Student") res = await api.get("/api/adminauth/students");
                              else if (recipientType === "Warden") res = await api.get("/api/adminauth/wardens");
                              else if (recipientType === "Worker") res = await api.get("/api/adminauth/students");
                              else if (recipientType === "Parent") res = await api.get("/api/adminauth/parents");
                              
                              if (res?.data) {
                                 const list = res.data.parents || res.data.students || res.data.wardens || res.data.staff || res.data.staffs || res.data.data || res.data || [];
                                 let filteredList = Array.isArray(list) ? list : [];
                                 
                                 filteredList = filteredList.filter(opt => {
                                    const optId = opt.studentId || opt.wardenId || opt.staffId || opt._id || "";
                                    if (typeof optId !== "string") return true;
                                    
                                    if (recipientType === "Worker") {
                                       return optId.startsWith("STUW") || optId.startsWith("STF") || optId.startsWith("WORK");
                                    } else if (recipientType === "Warden") {
                                       return optId.startsWith("W");
                                    } else if (recipientType === "Student" || recipientType === "Parent") {
                                       return optId.startsWith("STU") && !optId.startsWith("STUW");
                                    }
                                    return true;
                                 });
                                 
                                 setIndividualOptions(filteredList);
                              }
                           } catch (err) {
                              console.error("Failed to fetch options", err);
                              setIndividualOptions([]);
                           } finally {
                              setLoadingOptions(false);
                           }
                        } else {
                           setIndividualOptions([]);
                        }
                      }}
                    >
                      <option value="All">All</option>
                      <option value="Student">Student</option>
                      <option value="Parent">Parent</option>
                      <option value="Warden">Warden</option>
                      <option value="Worker">Worker</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Individual Recipient Input */}
                <div className="w-full">
                  <label className="text-black font-medium mb-1 block ml-2 whitespace-nowrap">
                    Individual Recipient (ID/ name)
                  </label>
                  <div className="relative shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] rounded-lg">
                    <select
                      className="w-full appearance-none bg-white text-gray-500 px-4 py-3 rounded-lg outline-none border-none text-[12px] font-medium"
                      value={editingNotice?.individualRecipient || ""}
                      onChange={(e) =>
                        setEditingNotice({
                          ...editingNotice,
                          individualRecipient: e.target.value,
                        })
                      }
                      disabled={editingNotice?.recipient === "All" || loadingOptions}
                    >
                      <option value="">Select specific {editingNotice?.recipient === "All" ? "recipient" : editingNotice?.recipient?.toLowerCase() || "recipient"} (Optional)</option>
                      {loadingOptions ? (
                        <option disabled>Loading options...</option>
                      ) : (
                        individualOptions.map((opt, i) => {
                          const optName = opt.firstName ? `${opt.firstName} ${opt.lastName || ""}` : opt.name || opt.email;
                          const optId = opt.studentId || opt.wardenId || opt.staffId || opt._id;
                          return (
                            <option key={i} value={optId}>
                              {optName} ({optId})
                            </option>
                          );
                        })
                      )}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                      {loadingOptions ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="w-full">
                  <label className="text-black font-medium mb-1 block ml-2">
                    Status
                  </label>
                  <div className="relative shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] rounded-lg">
                    <select
                      className="w-full appearance-none bg-white text-gray-500 px-4 py-3 rounded-lg outline-none border-none text-[12px] font-medium"
                      value={editingNotice?.status || ""}
                      onChange={(e) =>
                        setEditingNotice({
                          ...editingNotice,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Archived">Archived</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full font-[Poppins] mt-6">
                <label className="text-black font-medium mb-2 block ml-2">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Type your message here..."
                  value={editingNotice?.message || ""}
                  onChange={(e) =>
                    setEditingNotice({
                      ...editingNotice,
                      message: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white text-black shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] outline-none border-none text-[12px] placeholder:font-medium placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="w-full mt-6 font-[Poppins] flex flex-wrap items-center gap-6">
                {/* Issue Date */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block mb-1 text-black ml-2 font-[Poppins] font-medium">
                    Issue Date
                  </label>
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative flex-1">
                      <input
                        ref={editDateInputRef}
                        type="date"
                        name="editIssueDate"
                        value={
                          editingNotice?.date
                            ? editingNotice.date.split("-").reverse().join("-")
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedDate = new Date(e.target.value);
                            const formattedDate = `${selectedDate
                              .getDate()
                              .toString()
                              .padStart(2, "0")}-${(selectedDate.getMonth() + 1)
                              .toString()
                              .padStart(2, "0")}-${selectedDate.getFullYear()}`;
                            setEditingNotice((prev) => ({
                              ...prev,
                              date: formattedDate,
                            }));
                          } else {
                            setEditingNotice((prev) => ({ ...prev, date: "" }));
                          }
                        }}
                        className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                        style={{ colorScheme: "light" }}
                      />
                      <div className="bg-white rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040] w-full">
                        {editingNotice?.date || ""}
                      </div>
                      {!editingNotice?.date && (
                        <div className="absolute top-1/2 left-4 -translate-y-1/2 z-0 text-gray-400 font-[Poppins] font-medium text-[15px] tracking-[0.4em] pointer-events-none select-none overflow-hidden text-ellipsis whitespace-nowrap pr-4">
                          d&nbsp;d&nbsp;-&nbsp;m&nbsp;m&nbsp;-&nbsp;y&nbsp;y&nbsp;y&nbsp;y
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleEditCalendarClick}
                      className="p-2 rounded-lg transition-colors flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
                      title="Open Calendar"
                    >
                      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_370_4_edit" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
                          <rect width="30" height="30" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_370_4_edit)">
                          <path d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 15.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 21.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 21.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 21.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 21.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z" fill="#1C1B1F" />
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block mb-1 text-black ml-2 font-[Poppins] font-medium">
                    Expiry Date (Optional)
                  </label>
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative flex-1">
                      <input
                        type="date"
                        name="editExpiryDate"
                        value={
                          editingNotice?.expiryDate
                            ? editingNotice.expiryDate.split("-").reverse().join("-")
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedDate = new Date(e.target.value);
                            const formattedDate = `${selectedDate
                              .getDate()
                              .toString()
                              .padStart(2, "0")}-${(selectedDate.getMonth() + 1)
                              .toString()
                              .padStart(2, "0")}-${selectedDate.getFullYear()}`;
                            setEditingNotice((prev) => ({
                              ...prev,
                              expiryDate: formattedDate,
                            }));
                          } else {
                            setEditingNotice((prev) => ({ ...prev, expiryDate: "" }));
                          }
                        }}
                        className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                        style={{ colorScheme: "light" }}
                      />
                      <div className="bg-white rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040] w-full">
                        {editingNotice?.expiryDate || ""}
                      </div>
                      {!editingNotice?.expiryDate && (
                        <div className="absolute top-1/2 left-4 -translate-y-1/2 z-0 text-gray-400 font-[Poppins] font-medium text-[15px] tracking-[0.4em] pointer-events-none select-none overflow-hidden text-ellipsis whitespace-nowrap pr-4">
                          d&nbsp;d&nbsp;-&nbsp;m&nbsp;m&nbsp;-&nbsp;y&nbsp;y&nbsp;y&nbsp;y
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling.querySelector('input[type="date"]');
                        if (input && typeof input.showPicker === 'function') {
                          input.showPicker();
                        }
                      }}
                      className="p-2 rounded-lg transition-colors flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
                      title="Open Calendar"
                    >
                      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_370_4_edit_exp" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
                          <rect width="30" height="30" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_370_4_edit_exp)">
                          <path d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 15.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 21.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 21.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 21.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 21.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z" fill="#1C1B1F" />
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-300 text-black px-6 py-2 rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] font-semibold text-[14px] hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-[#BEC5AD] text-black px-6 py-2 rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] font-semibold text-[14px] hover:bg-[#a8b096] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        {/* View Details Modal */}
        {isViewModalOpen && viewingNotice && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div 
                className="px-8 py-6 flex items-center justify-between shrink-0"
                style={{ backgroundColor: "#BEC5AD", boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.25)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/30 p-2.5 rounded-xl backdrop-blur-md shadow-inner">
                    <Info className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-black font-extrabold text-xl leading-tight font-[Poppins]">Notice Details</h3>
                    <p className="text-black/60 text-xs mt-1 font-bold tracking-wide uppercase">Ref: {viewingNotice.id || viewingNotice._id?.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={closeViewModal}
                  className="bg-white/40 hover:bg-white/60 p-2 rounded-full text-black transition-all duration-200 shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6 overflow-y-auto font-[Poppins]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#f3f4f0] p-4 rounded-xl border border-[#BEC5AD]/30 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Template</label>
                    <p className="text-black font-bold text-base">{viewingNotice.template}</p>
                  </div>
                  <div className="bg-[#f3f4f0] p-4 rounded-xl border border-[#BEC5AD]/30 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Title</label>
                    <p className="text-black font-bold text-base">{viewingNotice.title}</p>
                  </div>
                  <div className="bg-[#f3f4f0] p-4 rounded-xl border border-[#BEC5AD]/30 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Recipient</label>
                    <p className="text-black font-bold text-base">{viewingNotice.recipient}</p>
                  </div>
                  <div className="bg-[#f3f4f0] p-4 rounded-xl border border-[#BEC5AD]/30 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Issue Date</label>
                    <p className="text-black font-bold text-base">{viewingNotice.date}</p>
                  </div>
                  <div className="bg-[#f3f4f0] p-4 rounded-xl border border-[#BEC5AD]/30 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Expiry Date</label>
                    <p className="text-black font-bold text-base">{viewingNotice.expiryDate || "-"}</p>
                  </div>
                  <div className="bg-[#f3f4f0] p-4 rounded-xl border border-[#BEC5AD]/30 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Status</label>
                    <div className="mt-1">
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white uppercase ${viewingNotice.status === 'Active' ? 'bg-[#28C404] shadow-md shadow-green-100' : 'bg-[#5A5D50] shadow-md shadow-gray-100'}`}>
                        {viewingNotice.status}
                      </span>
                    </div>
                  </div>
                </div>

                {viewingNotice.individualRecipient && (
                  <div className="bg-[#BEC5AD]/10 p-4 rounded-xl border border-[#BEC5AD]/50">
                    <label className="text-[10px] font-bold text-[#7a816a] uppercase tracking-widest mb-1 block">Individual Recipient</label>
                    <p className="text-black font-bold text-sm">{viewingNotice.individualRecipient}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Message Content</label>
                  <div 
                    className="rounded-2xl p-6 text-black text-sm leading-relaxed whitespace-pre-wrap font-medium min-h-[150px]"
                    style={{ backgroundColor: "white", border: "1px solid #BEC5AD", boxShadow: "0px 2px 10px 0px rgba(0,0,0,0.05)" }}
                  >
                    {viewingNotice.message}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#f3f4f0] px-8 py-5 border-t border-[#BEC5AD]/20 shrink-0">
                <button
                  onClick={closeViewModal}
                  className="w-full py-3.5 text-black rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98]"
                  style={{ backgroundColor: "#BEC5AD" }}
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Template Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
              <div className="px-8 py-6 flex items-center justify-between shrink-0" style={{ backgroundColor: "#BEC5AD", boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.25)" }}>
                <div className="flex items-center gap-4">
                  <div className="bg-white/30 p-2.5 rounded-xl backdrop-blur-md shadow-inner">
                    <Edit className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-black font-extrabold text-xl leading-tight font-[Poppins]">Edit Template</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingTemplate(null)}
                  className="bg-white/40 hover:bg-white/60 p-2 rounded-full text-black transition-all duration-200 shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto font-[Poppins]">
                <div>
                  <label className="text-black font-medium mb-2 block">Template Name (Cannot be changed)</label>
                  <input 
                    type="text" 
                    value={editingTemplate.name}
                    disabled
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-500 shadow-sm outline-none border border-gray-200 text-[14px]"
                  />
                </div>
                <div>
                  <label className="text-black font-medium mb-2 block">Default Notice Title (Optional)</label>
                  <input 
                    type="text" 
                    value={editingTemplate.title}
                    onChange={(e) => setEditingTemplate({...editingTemplate, title: e.target.value})}
                    placeholder="e.g. Please pay your fees"
                    className="w-full px-4 py-3 rounded-lg bg-white text-black shadow-sm border border-gray-300 outline-none focus:border-[#4F8CCF] text-[14px]"
                  />
                </div>
                <div>
                  <label className="text-black font-medium mb-2 block">Default Message Content (Optional)</label>
                  <textarea 
                    rows={4}
                    value={editingTemplate.message}
                    onChange={(e) => setEditingTemplate({...editingTemplate, message: e.target.value})}
                    placeholder="Type the default message template here..."
                    className="w-full px-4 py-3 rounded-lg bg-white text-black shadow-sm border border-gray-300 outline-none focus:border-[#4F8CCF] text-[14px] resize-none"
                  />
                </div>
              </div>

              <div className="bg-[#f3f4f0] px-8 py-5 border-t border-[#BEC5AD]/20 shrink-0 flex justify-end gap-4">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-6 py-2.5 text-black rounded-lg font-bold text-sm bg-white border border-gray-300 shadow-sm transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    api.put(`/api/adminauth/notice-templates/${editingTemplate._id}`, editingTemplate)
                      .then(res => {
                        if (res.data.success) {
                          setTemplates(templates.map(t => t._id === editingTemplate._id ? res.data.template : t));
                          toast.success('Template updated successfully!');
                          setEditingTemplate(null);
                        }
                      })
                      .catch(err => {
                        toast.error(err.response?.data?.message || 'Failed to update template');
                      });
                  }}
                  className="px-6 py-2.5 text-black rounded-lg font-bold text-sm shadow-md transition-all hover:brightness-95"
                  style={{ backgroundColor: "#BEC5AD" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Template Modal */}
        {viewingTemplate && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
              <div className="px-8 py-6 flex items-center justify-between shrink-0" style={{ backgroundColor: "#BEC5AD", boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.25)" }}>
                <div className="flex items-center gap-4">
                  <div className="bg-white/30 p-2.5 rounded-xl backdrop-blur-md shadow-inner">
                    <Info className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-black font-extrabold text-xl leading-tight font-[Poppins]">Template Details</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingTemplate(null)}
                  className="bg-white/40 hover:bg-white/60 p-2 rounded-full text-black transition-all duration-200 shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto font-[Poppins]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#f3f4f0] p-4 rounded-xl border border-[#BEC5AD]/30 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Template Name</label>
                    <p className="text-black font-bold text-base">{viewingTemplate.name}</p>
                  </div>
                  <div className="bg-[#f3f4f0] p-4 rounded-xl border border-[#BEC5AD]/30 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Default Title</label>
                    <p className="text-black font-bold text-base">{viewingTemplate.title || "Not set"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Default Message Content</label>
                  <div className="rounded-2xl p-6 text-black text-sm leading-relaxed whitespace-pre-wrap font-medium min-h-[150px]" style={{ backgroundColor: "white", border: "1px solid #BEC5AD", boxShadow: "0px 2px 10px 0px rgba(0,0,0,0.05)" }}>
                    {viewingTemplate.message || "Not set"}
                  </div>
                </div>
              </div>

              <div className="bg-[#f3f4f0] px-8 py-5 border-t border-[#BEC5AD]/20 shrink-0">
                <button
                  onClick={() => setViewingTemplate(null)}
                  className="w-full py-3.5 text-black rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98]"
                  style={{ backgroundColor: "#BEC5AD" }}
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Popup Modal - Keep existing code */}
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col font-[Poppins]">
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="text-red-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Notice?</h3>
                <p className="text-gray-500 text-sm">
                  Are you sure you want to delete this notice? This action cannot be undone.
                </p>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 px-4 bg-red-600 rounded-xl text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

function NoticesTable({ notices, loading, handleEdit, handleDelete, handleViewDetails, handleApproveNotice, handleRejectNotice, currentPage, setCurrentPage, ITEMS_PER_PAGE }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRecipient, setFilterRecipient] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  let filteredNotices = notices;

  if (searchTerm.trim()) {
    const lowerSearch = searchTerm.toLowerCase();
    filteredNotices = filteredNotices.filter(
      (n) =>
        n.title?.toLowerCase().includes(lowerSearch) ||
        n.message?.toLowerCase().includes(lowerSearch) ||
        n.recipient?.toLowerCase().includes(lowerSearch) ||
        n.individualRecipient?.toLowerCase().includes(lowerSearch)
    );
  }

  if (filterStatus !== "All") {
    filteredNotices = filteredNotices.filter((n) => n.status === filterStatus);
  }

  if (filterRecipient !== "All") {
    filteredNotices = filteredNotices.filter((n) => n.recipientType === filterRecipient);
  }

  if (filterDate) {
    filteredNotices = filteredNotices.filter((n) => {
      const d = n.date || n.issueDate;
      if (!d) return false;
      
      let parsedDate = d;
      if (d.includes('T')) {
        parsedDate = d.split('T')[0];
      } else {
        const separator = d.includes('/') ? '/' : '-';
        const parts = d.split(separator);
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            parsedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          } else if (parts[2].length === 4) {
            parsedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
      }
      return parsedDate === filterDate || d === filterDate;
    });
  }

  const totalPages = Math.ceil(filteredNotices.length / ITEMS_PER_PAGE) || 1;
  
  // Ensure currentPage is within bounds
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const displayedNotices = filteredNotices.slice((validCurrentPage - 1) * ITEMS_PER_PAGE, validCurrentPage * ITEMS_PER_PAGE);

  if (notices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No notices found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 px-4 w-full">
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3 w-full items-center justify-between">
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-[#4F8CCF] text-sm font-semibold text-black"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-[#4F8CCF] text-sm font-semibold text-black cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Pending Edit">Pending Edit</option>
              <option value="Pending Deletion">Pending Deletion</option>
              <option value="Rejected">Rejected</option>
              <option value="Archived">Archived</option>
            </select>

            <select
              value={filterRecipient}
              onChange={(e) => {
                setFilterRecipient(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-[#4F8CCF] text-sm font-semibold text-black cursor-pointer"
            >
              <option value="All">All Recipients</option>
              <option value="Student">Student</option>
              <option value="Warden">Warden</option>
              <option value="Worker">Worker</option>
              <option value="Parent">Parent</option>
            </select>

            <div className="relative flex items-center">
              <div className="relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                  style={{ colorScheme: "light" }}
                />
                <div className="px-4 h-[38px] flex items-center rounded-xl border border-gray-200 bg-white shadow-sm text-sm font-semibold text-black min-w-[140px] z-10">
                  {filterDate ? filterDate.split("-").reverse().join("-") : <span className="text-gray-400">dd-mm-yyyy</span>}
                </div>
              </div>
              {filterDate && (
                <button
                  onClick={() => {
                    setFilterDate("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white px-1 z-30"
                  title="Clear date filter"
                >
                  &times;
                </button>
              )}
            <button
              onClick={(e) => {
                const input = e.currentTarget.parentElement.querySelector('input[type="date"]');
                if (input && typeof input.showPicker === 'function') {
                  input.showPicker();
                }
              }}
              className="ml-2 text-gray-500 z-10 hover:scale-110 transition-transform"
              title="Open Calendar"
            >
              <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask_filter_date" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
                  <rect width="30" height="30" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask_filter_date)">
                  <path d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 15.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 21.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 21.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 21.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 21.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z" fill="#1C1B1F" />
                </g>
              </svg>
            </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-6 border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter' }}>
        <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-black">
              Recent Notices
            </h2>
            <p className="text-sm text-gray-700 mt-1">Total: {filteredNotices.length} records</p>
          </div>
        </div>
        
        <div className="hidden lg:block overflow-x-auto p-4">
        {/* Desktop Table View */}
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Sr No</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Title</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Recipient</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Date Issued</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Expiry Date</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedNotices.map((n, index) => (
              <tr key={n.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-600 font-bold whitespace-nowrap">{(validCurrentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-800 font-bold whitespace-nowrap">{n.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600 font-medium whitespace-nowrap">{n.recipient}</td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{n.date}</td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{n.expiryDate || "-"}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span
                    className={`px-3 py-2 w-[150px] flex justify-center items-center rounded-[12px] font-semibold text-white text-[11px] text-center ${n.status === "Active" ? "bg-[#28C404]" : n.status === "Scheduled" ? "bg-[#3B82F6]" : n.status.startsWith("Pending") ? "bg-[#F59E0B]" : n.status === "Rejected" ? "bg-[#EF4444]" : "bg-[#5A5D50]"}`}
                  >
                    {n.status === 'Pending Approval' ? `Created by ${n.creatorName || n.pendingActionBy || 'Warden'}` : 
                     n.status === 'Pending Edit' ? `Edited by ${n.pendingActionBy || 'Warden'}` :
                     n.status === 'Pending Deletion' ? `Deleted by ${n.pendingActionBy || 'Warden'}` :
                     n.status}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewDetails(n)}
                      className="p-1.5 text-green-600 hover:text-green-800 transition-colors bg-white rounded-lg shadow-sm"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {n.status?.startsWith('Pending') ? (
                      <>
                        <button
                          onClick={() => handleApproveNotice(n.id)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors bg-white rounded-lg shadow-sm"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleRejectNotice(n.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 transition-colors bg-white rounded-lg shadow-sm"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(n)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors bg-white rounded-lg shadow-sm"
                          title="Edit Notice"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 transition-colors bg-white rounded-lg shadow-sm"
                          title="Delete Notice"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Mobile Card View */}
        <div className="space-y-4 sm:hidden">
          {displayedNotices.map((n, index) => (
            <div key={n.id} className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-blue-600">Sr No: {(validCurrentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase ${n.status === "Active" ? "bg-[#28C404]" : n.status === "Scheduled" ? "bg-[#3B82F6]" : n.status.startsWith("Pending") ? "bg-[#F59E0B]" : n.status === "Rejected" ? "bg-[#EF4444]" : "bg-[#5A5D50]"}`}
                >
                  {n.status === 'Pending Approval' ? `Created by ${n.creatorName || n.pendingActionBy || 'Warden'}` : 
                   n.status === 'Pending Edit' ? `Edited by ${n.pendingActionBy || 'Warden'}` :
                   n.status === 'Pending Deletion' ? `Deleted by ${n.pendingActionBy || 'Warden'}` :
                   n.status}
                </span>
              </div>
              <div className="mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</p>
                <p className="text-sm font-bold text-gray-900">{n.title}</p>
              </div>
              <div className="mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recipient</p>
                <p className="text-sm font-medium">{n.recipient}</p>
              </div>
              <div className="mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Issued</p>
                <p className="text-sm font-medium">{n.date}</p>
              </div>
              <div className="mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expiry Date</p>
                <p className="text-sm font-medium">{n.expiryDate || "-"}</p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
                <button
                  onClick={() => handleViewDetails(n)}
                  className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                >
                  View
                </button>
                {n.status?.startsWith('Pending') ? (
                  <>
                    <button
                      onClick={() => handleApproveNotice(n.id)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectNotice(n.id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(n)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 mt-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(validCurrentPage - 1, 1))}
                disabled={validCurrentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(validCurrentPage + 1, totalPages))}
                disabled={validCurrentPage >= totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 font-[Poppins]">
                  Showing <span className="font-medium">{filteredNotices.length > 0 ? (validCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to{" "}
                  <span className="font-medium">{Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredNotices.length)}</span> of{" "}
                  <span className="font-medium">{filteredNotices.length}</span> notices
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 font-[Poppins]"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === i + 1
                          ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 font-[Poppins]"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HostelNotices;