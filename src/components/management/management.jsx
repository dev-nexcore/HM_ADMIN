
// export default StudentManagement;
"use client";
import { useState, useEffect } from "react";
import { Eye, Check, X, ChevronDown, Info } from "lucide-react";
import api from "@/lib/api";
import Tesseract from "tesseract.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const getDocumentUrl = (studentId, docType) =>
  `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/student-document/${studentId}/${docType}`;

const getParentDocumentUrl = (parentId, docType) =>
  `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/parent-document/${parentId}/${docType}`;

const hasDocument = (docObj) => {
  if (!docObj) return false;
  return !!(docObj.filename || docObj.path || docObj.name);
};

const getDocumentName = (docObj) => {
  if (!docObj) return null;
  return docObj.filename || docObj.name || docObj.path || null;
};

// ─── Stat Card Component ───────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, isActive, onClick, total }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-xl border transition-all duration-300 min-h-[140px] flex flex-col justify-between p-5 w-full text-left relative overflow-hidden group ${
        isActive 
          ? "border-[#4F8CCF] shadow-md ring-1 ring-[#4F8CCF]" 
          : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5"
      }`}
    >
      <div className="flex justify-between items-start w-full z-10">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
          <h3 className="text-3xl font-extrabold text-gray-800">{value}</h3>
        </div>
        <div 
          className="p-3 rounded-xl transition-all duration-300"
          style={{ 
            color: isActive ? '#fff' : accent, 
            backgroundColor: isActive ? accent : `${accent}15` 
          }}
        >
          {icon}
        </div>
      </div>
      
      {/* Decorative subtle background accent */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.04] transform group-hover:scale-125 transition-transform duration-500 pointer-events-none">
        <div style={{ width: '100px', height: '100px', color: accent }}>{icon}</div>
      </div>

      <div className="w-full mt-4 z-10">
        {label !== "Total Students" && label !== "Total Parents" && (
          <>
            <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${pct}%`, background: accent }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 font-semibold text-right">{pct}% of total</p>
          </>
        )}
      </div>
    </button>
  );
};

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Icons = {
  total: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  paid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  pending: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  assigned: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  unassigned: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

// ══════════════════════════════════════════════════════════════════════════════
const StudentManagement = () => {
  const getTodaysDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", contactNumber: "", email: "",
    roomNumber: "", bedNumber: "", emergencyContactNumber: "",
    admissionDate: getTodaysDate(), emergencyContactName: "",
    feeStatus: "", hasCollegeId: true, studentIdCard: null, feesReceipt: null, isWorking: false,
    roomType: "",
    relation: "",
  });

  const [editingStudent, setEditingStudent] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableRoomNumbers, setAvailableRoomNumbers] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsWithoutParents, setStudentsWithoutParents] = useState([]);
  const [bedData, setBedData] = useState({ totalBeds: 0, occupiedBeds: 0, availableBeds: 0 });
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [studentDetailsData, setStudentDetailsData] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReqId, setRejectReqId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("student");
  const [parents, setParents] = useState([]);
  const [parentDetailsData, setParentDetailsData] = useState(null);
  const [showParentDetailsModal, setShowParentDetailsModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [showParentEditModal, setShowParentEditModal] = useState(false);

  const [parentFormData, setParentFormData] = useState({
    firstName: "", lastName: "", email: "", relation: "", contactNumber: "", studentId: "",
  });
  const [studentDocuments, setStudentDocuments] = useState({ aadharCard: null, panCard: null, studentIdCard: null, feesReceipt: null });
  const [parentDocuments, setParentDocuments] = useState({ aadharCard: null, panCard: null });
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [parentErrors, setParentErrors] = useState({});
  const [parentLoading, setParentLoading] = useState(false);
  const [workerFormData, setWorkerFormData] = useState({
    firstName: "", lastName: "", contactNumber: "", email: "",
    roomNumber: "", bedNumber: "", emergencyContactNumber: "",
    admissionDate: getTodaysDate(), emergencyContactName: "",
    feeStatus: "", hasCollegeId: true, studentIdCard: null, feesReceipt: null, isWorking: true,
    roomType: "", relation: ""
  });
  const [workerDocuments, setWorkerDocuments] = useState({ aadharCard: null, panCard: null });
  const [workerLoading, setWorkerLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [studentInvoices, setStudentInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [reqLoading, setReqLoading] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonText, setReasonText] = useState("");
  const itemsPerPage = 8;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const STAT_CARDS = [
    { key: "Total Students", label: "Total Students", value: students.filter(s => !s.isWorking).length, accent: "#4F8CCF", icon: Icons.total, total: students.length },
    { key: "Total Workers", label: "Total Workers", value: students.filter(s => s.isWorking).length, accent: "#FF9D00", icon: Icons.pending, total: students.length },
    { key: "Total Parents", label: "Total Parents", value: parents.length, accent: "#22C55E", icon: Icons.paid, total: parents.length },
    { key: "Total Beds", label: "Total Beds", value: bedData.totalBeds, accent: "#6366F1", icon: Icons.total, total: bedData.totalBeds },
    { key: "Occupied Beds", label: "Occupied Beds", value: bedData.occupiedBeds, accent: "#8B5CF6", icon: Icons.assigned, total: bedData.totalBeds },
    { key: "Available Beds", label: "Available Beds", value: bedData.availableBeds, accent: "#EF4444", icon: Icons.unassigned, total: bedData.totalBeds },
  ];

  useEffect(() => {
    if (formData.hasCollegeId) {
      setStudentDocuments((p) => ({ ...p, feesReceipt: null }));
    } else {
      setStudentDocuments((p) => ({ ...p, studentIdCard: null }));
    }
  }, [formData.hasCollegeId]);

  useEffect(() => { setCurrentPage(1); }, [activeFilter]);

  // ── API helpers ────────────────────────────────────────────────────────────
  const registerStudentAPI = async (studentData) => {
    try {
      const fd = new FormData();
      ["firstName", "lastName", "contactNumber", "roomBedNumber", "email", "admissionDate", "feeStatus", "emergencyContactName", "emergencyContactNumber", "roomType", "relation"].forEach(k => fd.append(k, studentData[k] || ""));
      fd.append("hasCollegeId", studentData.hasCollegeId);
      fd.append("isWorking", studentData.isWorking);
      if (studentData.aadharCard instanceof File) fd.append("aadharCard", studentData.aadharCard);
      if (studentData.panCard instanceof File) fd.append("panCard", studentData.panCard);
      if (studentData.hasCollegeId && studentData.studentIdCard instanceof File) fd.append("studentIdCard", studentData.studentIdCard);
      if (!studentData.hasCollegeId && studentData.feesReceipt instanceof File) fd.append("feesReceipt", studentData.feesReceipt);
      const res = await api.post(`/api/adminauth/register-student`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data;
    } catch (e) { throw e.response?.data || { message: "Failed to register student" }; }
  };

  const registerParentAPI = async (parentData) => {
    try {
      const fd = new FormData();
      Object.keys(parentData).forEach(k => { if (k !== "aadharCard" && k !== "panCard") fd.append(k, parentData[k]); });
      if (parentData.aadharCard) fd.append("aadharCard", parentData.aadharCard);
      if (parentData.panCard) fd.append("panCard", parentData.panCard);
      const res = await api.post(`/api/adminauth/register-parent`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data;
    } catch (e) { throw e.response?.data || { message: "Failed to register parent" }; }
  };

  const registerWorkerAPI = async (workerData) => {
    try {
      const fd = new FormData();
      ["firstName", "lastName", "contactNumber", "roomBedNumber", "email", "admissionDate", "feeStatus", "emergencyContactName", "emergencyContactNumber", "roomType", "relation"].forEach(k => fd.append(k, workerData[k] || ""));
      fd.append("hasCollegeId", workerData.hasCollegeId);
      fd.append("isWorking", true);
      if (workerDocuments.aadharCard) fd.append("aadharCard", workerDocuments.aadharCard);
      if (workerDocuments.panCard) fd.append("panCard", workerDocuments.panCard);
      if (workerData.hasCollegeId && workerDocuments.studentIdCard) fd.append("studentIdCard", workerDocuments.studentIdCard);
      if (!workerData.hasCollegeId && workerDocuments.feesReceipt) fd.append("feesReceipt", workerDocuments.feesReceipt);
      const res = await api.post(`/api/adminauth/register-student`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data;
    } catch (e) { throw e.response?.data || { message: "Failed to register worker student" }; }
  };

  const updateStudentAPI = async (studentId, data) => {
    try {
      const res = await api.put(`/api/adminauth/update-student/${studentId}`, data);
      return res.data;
    } catch (e) { throw e.response?.data || { message: "Failed to update student" }; }
  };

  const fetchStudentsAPI = async () => { try { return (await api.get(`/api/adminauth/students`)).data; } catch (e) { throw e.response?.data || { message: "Failed to fetch students" }; } };
  const fetchStudentsWithoutParentsAPI = async () => { try { return (await api.get(`/api/adminauth/students-without-parents`)).data; } catch (e) { throw e.response?.data; } };
  const fetchAvailableRoomsAPI = async () => { try { return (await api.get(`/api/adminauth/inventory/available-beds`)).data; } catch (e) { throw e.response?.data; } };
  const fetchAvailableRoomsNumbersAPI = async () => { try { return (await api.get(`/api/adminauth/inventory/available-rooms`)).data; } catch (e) { throw e.response?.data; } };
  const fetchBedOccupancyAPI = async () => { try { return (await api.get(`/api/adminauth/bed-occupancy-status`)).data; } catch (e) { throw e.response?.data; } };
  const fetchRoomDetailsAPI = async (id) => { try { return (await api.get(`/api/adminauth/inventory/${id}`)).data; } catch (e) { return null; } };
  const fetchParentsAPI = async () => { try { return (await api.get(`/api/adminauth/parents`)).data; } catch (e) { throw e.response?.data; } };
  const deleteParentAPI = async (id) => { try { return (await api.delete(`/api/adminauth/delete-parent/${id}`)).data; } catch (e) { throw e.response?.data; } };
  const updateParentAPI = async (id, data) => { try { return (await api.put(`/api/adminauth/update-parent/${id}`, data)).data; } catch (e) { throw e.response?.data; } };

  const loadStudents = async () => {
    try {
      const { students: raw = [] } = await fetchStudentsAPI();
      const transformed = await Promise.all(raw.map(async (s) => {
        let roomDisplay = "Not Assigned", roomDetails = null;
        if (s.roomBedNumber && typeof s.roomBedNumber === "string" && s.roomBedNumber.length === 24) {
          roomDetails = await fetchRoomDetailsAPI(s.roomBedNumber);
          if (roomDetails?.inventory) {
            const shortBarcode = (roomDetails.inventory.barcodeId || "").split("-").slice(0, 2).join("-");
            roomDisplay = `${roomDetails.inventory.roomNo}/${shortBarcode}`;
          }
        } else if (s.roomBedNumber && typeof s.roomBedNumber === "object") {
          const shortBarcode = (s.roomBedNumber.barcodeId || "").split("-").slice(0, 2).join("-");
          roomDisplay = `${s.roomBedNumber.roomNo}/${shortBarcode}`;
          roomDetails = s.roomBedNumber;
        } else if (s.roomBedNumber) {
          roomDisplay = s.roomBedNumber;
        }
        const isWorking = s.isWorking === true;
        const capacityMap = {
          "101": 5, "102": 5, "103": 5, "104": 5, "201": 5, "202": 5, "203": 5, "204": 5, "205": 5,
          "301": 4, "302": 4, "303": 4, "304": 4, "305": 4, "401": 3, "402": 3, "403": 3, "404": 3, "405": 3,
        };
        const actualRoomNo = roomDetails?.inventory?.roomNo || roomDetails?.roomNo || "";
        const rType = String(s.roomType || (actualRoomNo ? capacityMap[actualRoomNo] : ""));
        const monthlyFee = isWorking
          ? (rType === "5" ? "₹ 6,000" : rType === "4" ? "₹ 6,500" : rType === "3" ? "₹ 7,000" : "-")
          : (rType === "5" ? "₹ 4,500" : rType === "4" ? "₹ 5,000" : rType === "3" ? "₹ 5,500" : "-");
        return { id: s.id || s.studentId, firstName: s.firstName, lastName: s.lastName, name: `${s.firstName} ${s.lastName}`, room: roomDisplay, contact: s.contactNumber, email: s.email, emergencyContactNumber: s.emergencyContactNumber, admissionDate: s.admissionDate, emergencyContactName: s.emergencyContactName, relation: s.relation, feeStatus: s.feeStatus, dues: `₹ ${s.dues || 0}/-`, roomType: rType, monthlyFee, roomDetails, roomObjectId: (s.roomBedNumber && typeof s.roomBedNumber === 'object') ? s.roomBedNumber._id : s.roomBedNumber, documents: s.documents || {}, isWorking: s.isWorking, isAddedToBiometric: s.isAddedToBiometric, isPendingApproval: s.isPendingApproval, requisitionId: s.requisitionId, reqStatus: s.reqStatus, rejectionReason: s.rejectionReason };
      }));
      setStudents(transformed);
    } catch (e) { console.error(e); }
  };

  const loadParents = async () => {
    try {
      const { parents: raw = [] } = await fetchParentsAPI();
      setParents(raw);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    (async () => {
      try {
        await loadStudents();
        await loadParents();
        setAvailableRooms((await fetchAvailableRoomsAPI()).availableBeds || []);
        setAvailableRoomNumbers((await fetchAvailableRoomsNumbersAPI()).availableRooms || []);
        setStudentsWithoutParents((await fetchStudentsWithoutParentsAPI()).students || []);
        const occupancy = await fetchBedOccupancyAPI();
        if (occupancy) setBedData(occupancy);
      } catch (e) { console.error(e); }
    })();
  }, [refreshTrigger, activeTab]);

  useEffect(() => {
    if (studentDetailsData?._id) {
      (async () => {
        setInvoicesLoading(true);
        try {
          const res = await api.get(`/api/adminauth/invoices/student?studentId=${studentDetailsData._id}&limit=50`);
          setStudentInvoices(res.data.invoices || []);
        } catch (e) { console.error("Error fetching invoices:", e); }
        finally { setInvoicesLoading(false); }
      })();
    } else {
      setStudentInvoices([]);
    }
  }, [studentDetailsData]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (["firstName", "lastName", "emergencyContactName", "relation"].includes(name)) value = value.replace(/[^A-Za-z\s]/g, "");
    if (["contactNumber", "emergencyContactNumber"].includes(name)) value = value.replace(/\D/g, "").slice(0, 10);
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
  };

  const validateForm = (data, isEdit = false) => {
    const e = {};
    if (!data.firstName.trim()) e.firstName = "First Name is required.";
    else if (!/^[A-Za-z\s]+$/.test(data.firstName)) e.firstName = "First Name can only contain letters.";
    if (!data.lastName.trim()) e.lastName = "Last Name is required.";
    else if (!/^[A-Za-z\s]+$/.test(data.lastName)) e.lastName = "Last Name can only contain letters.";
    if (!data.contactNumber.trim()) e.contactNumber = "Contact Number is required.";
    else if (!/^\d{10}$/.test(data.contactNumber)) e.contactNumber = "Contact Number must be exactly 10 digits.";
    if (!isEdit && !data.email.trim()) e.email = "Email is required.";
    else if (data.email.trim() && !/\S+@\S+\.\S+/.test(data.email)) e.email = "Email is invalid.";
    if (!data.roomType) e.roomType = "Room Type is required.";
    if (data.emergencyContactNumber && !/^\d{10}$/.test(data.emergencyContactNumber)) {
      e.emergencyContactNumber = "Emergency Contact Number must be exactly 10 digits.";
    }
    if (data.emergencyContactName && !/^[A-Za-z\s]+$/.test(data.emergencyContactName)) {
      e.emergencyContactName = "Emergency Contact Name can only contain letters.";
    }
    if (data.relation && !/^[A-Za-z\s]+$/.test(data.relation)) {
      e.relation = "Relation can only contain letters.";
    }
    return e;
  };

  const extractAadharInfo = (text) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let firstName = "", lastName = "", dob = "", aadharNumber = "", mobileNumber = "";
    for (const l of lines) { const m = l.match(/DOB[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i); if (m) { dob = m[1].replace(/\//g, "-"); break; } }
    for (const l of lines) { const m = l.match(/(\d{4}\s*\d{4}\s*\d{4})/); if (m) { const n = m[1].replace(/\s/g, ""); if (n.length === 12) { aadharNumber = n; break; } } }
    for (const l of lines) {
      if (/\d{4}\s*\d{4}\s*\d{4}/.test(l)) continue;
      const m = l.match(/(?:Mobile\s*No\.?[:\s]*)?([6-9]\d{9})(?!\d)/i);
      if (m && m[1].length === 10) { mobileNumber = m[1]; break; }
    }
    let dobIdx = lines.findIndex(l => /DOB/i.test(l));
    if (dobIdx > 0) {
      for (let i = dobIdx - 1; i >= Math.max(0, dobIdx - 3); i--) {
        const l = lines[i], ll = l.toLowerCase();
        if (ll.includes("government") || ll.includes("india") || ll.includes("mobile") || /\d{4}\s*\d{4}\s*\d{4}/.test(l) || l.length < 4 || l.length > 50) continue;
        const words = l.split(/\s+/).filter(w => w.length > 1);
        if (words.length >= 2 && words.length <= 4) {
          const ar = (l.match(/[a-zA-Z]/g) || []).length / l.replace(/\s/g, "").length;
          const pc = words.every(w => /^[A-Z][a-z]*$/.test(w) || /^[A-Z]+$/.test(w));
          if (ar > 0.85 && pc && !/[:\-_@#$%^&*()+=\[\]{}|\\;'"<>?/]/.test(l)) {
            firstName = words[0];
            lastName = words.length === 2 ? words[1] : words[words.length - 1];
            break;
          }
        }
      }
    }
    return { firstName, lastName, dob, aadharNumber, mobileNumber };
  };

  const extractPanInfo = (text) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let name = "", panNumber = "", dob = "";
    const ni = lines.findIndex(l => l.toLowerCase().includes("name"));
    if (ni !== -1 && lines[ni + 1]) name = lines[ni + 1];
    for (const l of lines) { const m = l.match(/([A-Z]{5}\d{4}[A-Z])/); if (m) { panNumber = m[1]; break; } }
    for (const l of lines) { const m = l.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/); if (m) { dob = m[1].replace(/\//g, "-"); break; } }
    return { name, dob, panNumber };
  };

  const processDocument = async (file, documentType, formType) => {
    setOcrLoading(true); setOcrProgress(0);
    try {
      const result = await Tesseract.recognize(file, "eng", { logger: (m) => { if (m.status === "recognizing text") setOcrProgress(Math.round(m.progress * 100)); } });
      const info = documentType === "aadhar" ? extractAadharInfo(result.data.text) : extractPanInfo(result.data.text);
      if (formType === "student") setFormData(p => ({ ...p, firstName: info.firstName || p.firstName, lastName: info.lastName || p.lastName, contactNumber: info.mobileNumber || p.contactNumber }));
      else if (formType === "worker") setWorkerFormData(p => ({ ...p, firstName: info.firstName || p.firstName, lastName: info.lastName || p.lastName, contactNumber: info.mobileNumber || p.contactNumber }));
      else setParentFormData(p => ({ ...p, firstName: info.firstName || p.firstName, lastName: info.lastName || p.lastName, contactNumber: info.mobileNumber || p.contactNumber }));
      if (info.firstName || info.lastName) toast.success(`Extracted: ${info.firstName} ${info.lastName}\nDOB: ${info.dob || "—"}\nMobile: ${info.mobileNumber || "—"}`);
      else toast.error("Could not extract name. Please fill manually.");
    } catch (e) { toast.error("OCR failed. Please try again."); }
    finally { setOcrLoading(false); setOcrProgress(0); }
  };

  const handleDocumentUpload = async (e, documentType, formType) => {
    const file = e.target.files[0]; if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) { toast.warning("Please upload a valid file"); return; }
    const fieldMap = { aadhar: "aadharCard", pan: "panCard", studentId: "studentIdCard", feesReceipt: "feesReceipt" };
    const fieldName = fieldMap[documentType] || documentType;
    if (formType === "student") setStudentDocuments(p => ({ ...p, [fieldName]: file }));
    else if (formType === "worker") setWorkerDocuments(p => ({ ...p, [fieldName]: file }));
    else setParentDocuments(p => ({ ...p, [fieldName]: file }));
    if (file.type.includes("image") && (documentType === "aadhar" || documentType === "pan")) await processDocument(file, documentType, formType);
  };

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", contactNumber: "", email: "", roomNumber: "", bedNumber: "", emergencyContactNumber: "", admissionDate: getTodaysDate(), emergencyContactName: "", feeStatus: "", hasCollegeId: true, isWorking: false, roomType: "", relation: "" });
    setStudentDocuments({ aadharCard: null, panCard: null, studentIdCard: null, feesReceipt: null });
    setEditingStudent(null); setErrors({}); setShowEditModal(false);
  };

  const handleSubmit = async () => {
    const errs = validateForm(formData); if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await registerStudentAPI({ ...formData, roomBedNumber: formData.bedNumber || "Not Assigned", aadharCard: studentDocuments.aadharCard, panCard: studentDocuments.panCard, studentIdCard: studentDocuments.studentIdCard, feesReceipt: studentDocuments.feesReceipt, relation: formData.relation });
      setRefreshTrigger(p => p + 1); resetForm();
      toast.success(`Student registered successfully!`, { autoClose: 3000 });
    } catch (e) { toast.error(e.message || "Error registering student."); }
    finally { setLoading(false); }
  };

  const handleApproveReq = async (reqId) => {
    if (reqLoading) return;
    setReqLoading(true);
    try {
      await api.put(`/api/adminauth/requisitions/${reqId}/status`, {
        status: 'approved',
        adminNotes: 'Approved directly from Management'
      });
      toast.success("Request approved successfully!");
      setRefreshTrigger(p => p + 1);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to approve request");
    } finally {
      setReqLoading(false);
    }
  };

  const handleRejectReq = (reqId) => {
    setRejectReqId(reqId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) return toast.error("Please provide a rejection reason.");
    if (reqLoading) return;
    setReqLoading(true);
    try {
      await api.put(`/api/adminauth/requisitions/${rejectReqId}/status`, {
        status: 'rejected',
        rejectionReason: rejectionReason
      });
      toast.success("Student rejected");
      setShowRejectModal(false);
      setRefreshTrigger(p => p + 1);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to reject student");
    } finally {
      setReqLoading(false);
    }
  };

  const handleViewReason = (reason) => {
    setReasonText(reason || "No reason provided");
    setShowReasonModal(true);
  };

  const handleEdit = (studentId) => {
    const s = students.find(s => s.id === studentId); if (!s) return;
    setFormData({
      firstName: s.firstName || "",
      lastName: s.lastName || "",
      contactNumber: s.contact,
      email: s.email || "",
      roomNumber: s.roomDetails?.roomNo || "",
      bedNumber: s.roomObjectId || "",
      emergencyContactNumber: s.emergencyContactNumber || "",
      admissionDate: s.admissionDate ? new Date(s.admissionDate).toISOString().split("T")[0] : "",
      emergencyContactName: s.emergencyContactName || "",
      feeStatus: s.feeStatus,
      hasCollegeId: s.hasCollegeId ?? true,
      isWorking: s.isWorking ?? false,
      roomType: s.roomType || "",
      relation: s.relation || ""
    });
    setStudentDocuments({ aadharCard: s.documents?.aadharCard || null, panCard: s.documents?.panCard || null, studentIdCard: s.documents?.studentIdCard || null, feesReceipt: s.documents?.feesReceipt || null });
    setEditingStudent(studentId); setErrors({}); setShowEditModal(true);
  };

  const handleUpdate = async () => {
    const errs = validateForm(formData, true); if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      ["firstName", "lastName", "contactNumber", "email", "emergencyContactNumber", "admissionDate", "emergencyContactName", "feeStatus", "roomType", "relation"].forEach(k => fd.append(k, formData[k]));
      fd.append("roomBedNumber", formData.bedNumber);
      fd.append("hasCollegeId", formData.hasCollegeId);
      fd.append("isWorking", formData.isWorking);
      ["aadharCard", "panCard", "studentIdCard", "feesReceipt"].forEach(k => { if (studentDocuments[k] instanceof File) fd.append(k, studentDocuments[k]); });
      await updateStudentAPI(editingStudent, fd);
      setRefreshTrigger(p => p + 1); resetForm(); toast.success("Student updated successfully!");
    } catch (e) { toast.error(e.message || "Error updating student."); }
    finally { setLoading(false); }
  };

  const handleParentInputChange = (e) => {
    let { name, value } = e.target;
    if (["firstName", "lastName", "relation"].includes(name)) value = value.replace(/[^A-Za-z\s]/g, "");
    if (["contactNumber"].includes(name)) value = value.replace(/\D/g, "").slice(0, 10);
    setParentFormData(p => ({ ...p, [name]: value }));
    if (parentErrors[name]) setParentErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const validateParentForm = (data) => {
    const e = {};
    if (!data.firstName.trim()) e.firstName = "First Name is required.";
    else if (!/^[A-Za-z\s]+$/.test(data.firstName)) e.firstName = "First Name can only contain letters.";
    if (!data.lastName.trim()) e.lastName = "Last Name is required.";
    else if (!/^[A-Za-z\s]+$/.test(data.lastName)) e.lastName = "Last Name can only contain letters.";
    if (!data.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = "Email is invalid.";
    if (!data.contactNumber.trim()) e.contactNumber = "Contact Number is required.";
    else if (!/^\d{10}$/.test(data.contactNumber)) e.contactNumber = "Contact Number must be exactly 10 digits.";
    if (!data.relation.trim()) e.relation = "Relation is required";
    else if (!/^[A-Za-z\s]+$/.test(data.relation)) e.relation = "Relation can only contain letters.";
    if (!data.studentId.trim()) e.studentId = "Student ID is required.";
    return e;
  };

  const resetParentForm = () => {
    setParentFormData({ firstName: "", lastName: "", email: "", relation: "", contactNumber: "", studentId: "" });
    setParentDocuments({ aadharCard: null, panCard: null });
    setParentErrors({});
  };

  const handleParentSubmit = async () => {
    const errs = validateParentForm(parentFormData);
    if (Object.keys(errs).length) {
      setParentErrors(errs);
      return;
    }
    setParentLoading(true);
    try {
      await registerParentAPI({
        ...parentFormData,
        aadharCard: parentDocuments.aadharCard,
        panCard: parentDocuments.panCard
      });
      setRefreshTrigger(p => p + 1);
      resetParentForm();
      toast.success(`Parent registered! Instructions sent to ${parentFormData.email}`);
    } catch (e) {
      toast.error(e.message || "Error registering parent.");
    } finally {
      setParentLoading(false);
    }
  };

  const handleWorkerInputChange = (e) => {
    let { name, value } = e.target;
    if (["firstName", "lastName", "emergencyContactName"].includes(name)) value = value.replace(/[^A-Za-z\s]/g, "");
    if (["contactNumber", "emergencyContactNumber"].includes(name)) value = value.replace(/\D/g, "").slice(0, 10);
    setWorkerFormData(p => ({ ...p, [name]: value }));
  };

  const validateWorkerForm = (data) => {
    const e = {};
    if (!data.firstName.trim()) e.firstName = "First Name is required.";
    else if (!/^[A-Za-z\s]+$/.test(data.firstName)) e.firstName = "First Name can only contain letters.";
    if (!data.lastName.trim()) e.lastName = "Last Name is required.";
    else if (!/^[A-Za-z\s]+$/.test(data.lastName)) e.lastName = "Last Name can only contain letters.";
    if (!data.contactNumber.trim()) e.contactNumber = "Contact Number is required.";
    else if (!/^\d{10}$/.test(data.contactNumber)) e.contactNumber = "Contact Number must be exactly 10 digits.";
    if (!data.email.trim()) e.email = "Email is required.";
    else if (data.email.trim() && !/\S+@\S+\.\S+/.test(data.email)) e.email = "Email is invalid.";
    if (!data.roomType) e.roomType = "Room Type is required.";
    if (data.emergencyContactNumber && !/^\d{10}$/.test(data.emergencyContactNumber)) {
      e.emergencyContactNumber = "Emergency Contact Number must be exactly 10 digits.";
    }
    if (data.emergencyContactName && !/^[A-Za-z\s]+$/.test(data.emergencyContactName)) {
      e.emergencyContactName = "Emergency Contact Name can only contain letters.";
    }
    return e;
  };

  const resetWorkerForm = () => {
    setWorkerFormData({
      firstName: "", lastName: "", contactNumber: "", email: "",
      roomNumber: "", bedNumber: "", emergencyContactNumber: "",
      admissionDate: getTodaysDate(), emergencyContactName: "",
      feeStatus: "", hasCollegeId: false, studentIdCard: null, feesReceipt: null, isWorking: true,
      roomType: "", relation: ""
    });
    setWorkerDocuments({ aadharCard: null, panCard: null });
  };

  const handleWorkerSubmit = async () => {
    const errs = validateWorkerForm(workerFormData);
    if (Object.keys(errs).length) {
      toast.error("Please fill all required fields");
      return;
    }
    setWorkerLoading(true);
    try {
      const res = await registerWorkerAPI({ ...workerFormData, roomBedNumber: workerFormData.bedNumber || "Not Assigned" });
      setRefreshTrigger(p => p + 1);
      resetWorkerForm();
      toast.success(`Worker registered successfully!`, { autoClose: 3000 });
    } catch (e) { toast.error(e.message || "Error registering worker."); }
    finally { setWorkerLoading(false); }
  };

  const handleViewDetails = (studentId) => {
    const s = students.find(s => s.id === studentId);
    if (s) { setStudentDetailsData(s); setShowDetailsModal(true); }
  };

  const getBedsForRoom = (roomNumber) =>
    roomNumber ? availableRooms.filter(b => b.roomNo === roomNumber) : availableRooms;

  const getFeeStatusStyle = (status) => ({
    width: "120px", height: "26px", display: "inline-flex", alignItems: "center", justifyContent: "center",
    borderRadius: "8px", fontFamily: "Poppins", fontWeight: "600", textAlign: "center", fontSize: "12px",
    background: status === "Paid" ? "#22C55E" : status === "Unpaid" ? "#FF9D00" : status === "Partial" ? "#F59E0B" : "#e5e7eb",
    color: ["Paid", "Unpaid", "Partial"].includes(status) ? "#FFFFFF" : "#000000",
  });

  const inputStyle = { height: "40px", background: "#FFFFFF", boxShadow: "0px 4px 10px rgba(0,0,0,0.25)", borderRadius: "10px", color: "#000", border: "none", outline: "none" };
  const labelStyle = { fontFamily: "Poppins", fontWeight: "500", fontSize: "18px", lineHeight: "100%", textAlign: "left" };

  // ── Filtered + Paginated ───────────────────────────────────────────────────
  const filteredStudents = students.filter(s => {
    if (activeTab === "worker") { if (!s.isWorking) return false; }
    else if (activeTab === "student") { if (s.isWorking) return false; }

    if (activeFilter === "Total Students") return !s.isWorking;
    if (activeFilter === "Total Workers") return s.isWorking;
    if (activeFilter === "Occupied Beds") return s.room && s.room !== "Not Assigned";
    // For "Total Parents" and "Available Beds", we don't have a direct student filter, so show all
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (n) => {
    setCurrentPage(n);
    document.getElementById("student-list-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Form JSX ──────────────────────────────────────────────────────────────
  const ChevronDown = () => (
    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );

  const DocumentPreviewBox = ({ fileData, docKey, label, studentIdOverride, isParent }) => {
    if (!fileData || (!hasDocument(fileData) && !(fileData instanceof File))) return null;
    const isFile = fileData instanceof File;
    const objectId = studentIdOverride || (isParent ? editingParent?._id : editingStudent);
    const url = isFile 
      ? URL.createObjectURL(fileData) 
      : (isParent 
         ? `${getParentDocumentUrl(objectId, docKey)}?token=${localStorage.getItem('adminToken') || ''}`
         : `${getDocumentUrl(objectId, docKey)}?token=${localStorage.getItem('adminToken') || ''}`);
    const name = isFile ? fileData.name : getDocumentName(fileData);

    return (
      <div className="mt-2 flex items-start gap-3 bg-white/50 p-2 rounded-lg border border-gray-100 shadow-sm">
        <div 
          className="w-16 h-12 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#4F8CCF] transition-colors flex-shrink-0"
          onClick={() => window.open(url, "_blank")}
        >
          <img 
            src={url} 
            alt={`${label} Preview`} 
            className="w-full h-full object-contain"
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.parentElement.innerHTML = '<div class="text-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-auto text-gray-400 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg><span class="text-[9px] text-gray-500 font-medium leading-tight block">File</span></div>'; 
            }} 
          />
        </div>
        <div className="flex flex-col justify-center h-12 min-w-0">
          <span className="text-[11px] text-green-700 font-medium truncate w-full" title={name}>✓ {name}</span>
          <button type="button" onClick={() => window.open(url, "_blank")} className="text-[11px] text-[#4F8CCF] hover:text-blue-700 font-bold underline text-left mt-1">Open Full</button>
        </div>
      </div>
    );
  };


  const formContent = (isEditMode) => (
    <>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6" style={{ fontFamily: "Inter", fontWeight: "700" }}>
        {isEditMode ? (formData.isWorking ? "Edit Worker Details" : "Edit Student & Allot Bed") : "Register New Student & Allot Bed"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* First Name */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>First Name</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter First Name" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
          {errors.firstName && <p className="text-red-500 text-xs mt-1 ml-2">{errors.firstName}</p>}
        </div>

        {/* Last Name */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Last Name</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter Last Name" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
          {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-2">{errors.lastName}</p>}
        </div>

        {/* Documents */}
        <div className="w-full px-2 md:col-span-2">
          <div className="bg-white/50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-black mb-2">Upload Documents</h3>

            {/* Aadhar */}
            <div>
              <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>Aadhar Card</label>
              <input type="file" accept="image/*" onChange={e => handleDocumentUpload(e, "aadhar", "student")} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" disabled={ocrLoading} />
              <DocumentPreviewBox fileData={studentDocuments.aadharCard} docKey="aadharCard" label="Aadhar Card" />
            </div>

            {/* PAN Card (Worker Only) */}
            {formData.isWorking && (
              <div>
                <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>PAN Card</label>
                <input type="file" accept="image/*" onChange={e => handleDocumentUpload(e, "pan", "student")} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" disabled={ocrLoading} />
                <DocumentPreviewBox fileData={studentDocuments.panCard} docKey="panCard" label="PAN Card" />
              </div>
            )}

            {/* College ID checkbox */}
            {!formData.isWorking && (
              <>
                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" checked={!formData.hasCollegeId} onChange={e => setFormData(p => ({ ...p, hasCollegeId: !e.target.checked }))} className="w-4 h-4" />
                  <label className="text-sm font-medium text-black">College ID Card Not Received Yet</label>
                </div>

                {formData.hasCollegeId && (
                  <div>
                    <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>Student ID Card</label>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setStudentDocuments(p => ({ ...p, studentIdCard: e.target.files[0] }))} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" />
                    <DocumentPreviewBox fileData={studentDocuments.studentIdCard} docKey="studentIdCard" label="Student ID Card" />
                  </div>
                )}

                {!formData.hasCollegeId && (
                  <div>
                    <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>Fees Receipt</label>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setStudentDocuments(p => ({ ...p, feesReceipt: e.target.files[0] }))} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" />
                    <DocumentPreviewBox fileData={studentDocuments.feesReceipt} docKey="feesReceipt" label="Fees Receipt" />
                    <p className="text-xs text-gray-600 mt-1">Temporary document until student gets college ID card</p>
                  </div>
                )}
              </>
            )}

            {ocrLoading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                </div>
                <p className="text-xs text-center mt-1">Processing document... {ocrProgress}%</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Contact Number</label>
          <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="Enter Phone Number" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
          {errors.contactNumber && <p className="text-red-500 text-xs mt-1 ml-2">{errors.contactNumber}</p>}
        </div>

        {/* Email */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>E-Mail</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter E-Mail" className="w-full h-[40px] px-4 bg-white rounded-[10px] border-0 outline-none text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
          {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email}</p>}
        </div>

        {/* Room Type */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Room Type</label>
          <div className="relative h-[40px]">
            <select name="roomType" value={formData.roomType} onChange={e => { setFormData(p => ({ ...p, roomType: e.target.value, roomNumber: "", bedNumber: "" })); }} className="w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins]" style={{ WebkitAppearance: "none", boxShadow: "0px 4px 10px 0px #00000040", color: formData.roomType === "" ? "#0000008A" : "#000" }}>
              <option value="" disabled hidden>Select Room Type</option>
              <option value="5">5 Bed (4.5k)</option>
              <option value="4">4 Bed (5k)</option>
              <option value="3">3 Bed (5.5k)</option>
            </select>
            <ChevronDown />
          </div>
          {errors.roomType && <p className="text-red-500 text-xs mt-1 ml-2">{errors.roomType}</p>}
        </div>

        {/* Fee Information (Dynamic) */}
        {formData.roomType && (
          <div className="w-full px-2 col-span-1">
            {formData.isWorking ? (
              <div className="bg-orange-50 p-2 rounded-[10px] border border-orange-100 flex flex-col gap-1 px-4 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-orange-800">Monthly Fee: ₹{formData.roomType === "5" ? "6,000" : formData.roomType === "4" ? "6,500" : "7,000"}</span>
                  <span className="text-[10px] text-orange-600 font-semibold">(No Student Discount)</span>
                </div>
                <div className="border-t border-orange-200 pt-1 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-orange-800">Refundable Deposit (One-time):</span>
                    <span className="text-[11px] font-extrabold text-orange-900">₹{formData.roomType === "5" ? "18,000" : formData.roomType === "4" ? "19,500" : "21,000"}</span>
                  </div>
                  <p className="text-[9px] text-orange-600 italic leading-tight">* Deposit is held by hostel and refunded when leaving. Fees are payable monthly.</p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 p-2 rounded-[10px] border border-blue-100 flex flex-col gap-1 px-4 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-blue-800">Fee: ₹{formData.roomType === "5" ? "4,500" : formData.roomType === "4" ? "5,000" : "5,500"}</span>
                  <span className="text-[10px] text-blue-500 line-through">₹{formData.roomType === "5" ? "6,000" : formData.roomType === "4" ? "6,500" : "7,000"}</span>
                </div>
                <div className="border-t border-blue-200 pt-1 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-blue-800">Refundable Deposit (One-time):</span>
                    <span className="text-[11px] font-extrabold text-blue-900">₹{formData.roomType === "5" ? "13,500" : formData.roomType === "4" ? "15,000" : "16,500"}</span>
                  </div>
                  <p className="text-[9px] text-blue-600 italic leading-tight">* Deposit is held by hostel and refunded when leaving. Fees are payable monthly.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Room Number */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px]">Room Number</label>
          <div className="relative h-[40px]">
            <select name="roomNumber" value={formData.roomNumber} onChange={e => { handleInputChange(e); setFormData(p => ({ ...p, bedNumber: "" })); }} className="w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins]" style={{ WebkitAppearance: "none", boxShadow: "0px 4px 10px 0px #00000040", color: formData.roomNumber === "" ? "#0000008A" : "#000" }}>
              <option value="" disabled hidden>Select Room</option>
              {availableRoomNumbers
                .filter(r => !formData.roomType || String(r.totalBeds) === formData.roomType)
                .map(r => <option key={r._id} value={r._id}>Room {r._id} - Floor {r.floor} ({r.totalBeds} Beds)</option>)}
            </select>
            <ChevronDown />
          </div>
        </div>

        {/* Bed Number */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px]">Bed Number</label>
          <div className="relative h-[40px]">
            <select name="bedNumber" value={formData.bedNumber} onChange={handleInputChange} disabled={!formData.roomNumber} className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins] ${!formData.roomNumber ? "cursor-not-allowed opacity-60" : ""}`} style={{ WebkitAppearance: "none", boxShadow: "0px 4px 10px 0px #00000040", color: formData.bedNumber === "" ? "#0000008A" : "#000" }}>
              <option value="" disabled hidden>{!formData.roomNumber ? "Select Room First" : "Select Bed"}</option>
              {getBedsForRoom(formData.roomNumber).map(b => {
                const shortBarcode = (b.barcodeId || "").split("-").slice(0, 2).join("-");
                return <option key={b._id} value={b._id}>{shortBarcode} - Floor {b.floor}</option>;
              })}
            </select>
            <ChevronDown />
          </div>
        </div>

        {/* Emergency Contact Number */}
        <div className="w-full px-2">
          <label className="block mb-2 text-black ml-2" style={labelStyle}>Emergency Contact Number</label>
          <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleInputChange} placeholder="Enter Contact Number" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
        </div>

        {/* Admission Date */}
        <div className="w-full px-2">
          <label className="block mb-2 text-black ml-2" style={labelStyle}>Admission Date</label>
          <div className="bg-gray-100 rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 shadow-[0px_4px_10px_0px_#00000040] cursor-not-allowed w-fit min-w-[200px]">
            {formData.admissionDate}
          </div>
          <p className="text-xs text-gray-600 mt-1 ml-2">Automatically set to today's date</p>
        </div>

        {/* Emergency Contact Name */}
        <div className="w-full px-2">
          <label className="block mb-2 text-black ml-2" style={labelStyle}>Emergency Contact Name</label>
          <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} placeholder="Enter Name" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
        </div>

        {/* Relation */}
        <div className="w-full px-2">
          <label className="block mb-2 text-black ml-2" style={labelStyle}>Relation</label>
          <input type="text" name="relation" value={formData.relation} onChange={handleInputChange} placeholder="e.g. Father, Mother" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
        </div>


      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={isEditMode ? handleUpdate : handleSubmit} disabled={loading} className={`mt-6 px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] font-semibold text-[15px] cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {loading ? "Updating..." : (isEditMode ? (formData.isWorking ? "Update Worker" : "Update Student") : "Register Student")}
        </button>
        {isEditMode && <button type="button" onClick={resetForm} disabled={loading} className="mt-6 px-6 py-2 bg-gray-400 text-white rounded-[10px] shadow font-medium hover:bg-gray-500 transition-colors cursor-pointer">Cancel</button>}
      </div>
    </>
  );

  const parentFormContent = () => (
    <>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6" style={{ fontFamily: "Inter", fontWeight: "700" }}>Register Parent Account</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {[
          { name: "firstName", label: "First Name", type: "text", placeholder: "Enter First Name", error: parentErrors.firstName },
          { name: "lastName", label: "Last Name", type: "text", placeholder: "Enter Last Name", error: parentErrors.lastName },
          { name: "email", label: "E-Mail", type: "email", placeholder: "Enter E-Mail", error: parentErrors.email },
          { name: "contactNumber", label: "Contact Number", type: "tel", placeholder: "Enter Phone Number", error: parentErrors.contactNumber },
          { name: "relation", label: "Relation", type: "text", placeholder: "Enter relation to the student", error: parentErrors.relation },
        ].map(f => (
          <div key={f.name} className="w-full px-2">
            <label className="block mb-1 text-black ml-2" style={labelStyle}>{f.label}</label>
            <input type={f.type} name={f.name} value={parentFormData[f.name]} onChange={handleParentInputChange} placeholder={f.placeholder} className="w-full h-[40px] px-4 bg-white rounded-[10px] border-0 outline-none text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
            {f.error && <p className="text-red-500 text-xs mt-1 ml-2">{f.error}</p>}
          </div>
        ))}

        {/* Parent docs */}
        <div className="w-full px-2 md:col-span-2">
          <div className="bg-white/50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-black mb-2">Upload Documents (Optional — Auto-fill with OCR)</h3>
            {["aadhar", "pan"].map(type => {
              const docKey = type === "aadhar" ? "aadharCard" : "panCard";
              return (
                <div key={type}>
                  <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>{type === "aadhar" ? "Aadhar Card" : "PAN Card"}</label>
                  <input type="file" accept="image/*" onChange={e => handleDocumentUpload(e, type, "parent")} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" disabled={ocrLoading} />
                  <DocumentPreviewBox fileData={parentDocuments[docKey]} docKey={docKey} label={type === "aadhar" ? "Aadhar Card" : "PAN Card"} isParent={true} />
                </div>
              );
            })}
            {ocrLoading && (
              <div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${ocrProgress}%` }} /></div><p className="text-xs text-center mt-1">Processing... {ocrProgress}%</p></div>
            )}
          </div>
        </div>

        {/* Student ID */}
        <div className="w-full px-2 md:col-span-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Student ID</label>
          <div className="relative h-[40px]">
            <select name="studentId" value={parentFormData.studentId} onChange={handleParentInputChange} className="w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins]" style={{ WebkitAppearance: "none", boxShadow: "0px 4px 10px 0px #00000040", color: parentFormData.studentId === "" ? "#0000008A" : "#000" }}>
              <option value="" disabled hidden>Select Student ID</option>
              {studentsWithoutParents.map(s => <option key={s.studentId} value={s.studentId}>{s.studentId} - {s.firstName} {s.lastName}</option>)}
            </select>
            <ChevronDown />
          </div>
          {parentErrors.studentId && <p className="text-red-500 text-xs mt-1 ml-2">{parentErrors.studentId}</p>}
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handleParentSubmit} disabled={parentLoading} className={`mt-6 px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] font-semibold text-[15px] cursor-pointer ${parentLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {parentLoading ? "Registering..." : "Register Parent"}
        </button>
      </div>
    </>
  );

  const workerFormContent = () => (
    <>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6" style={{ fontFamily: "Inter", fontWeight: "700" }}>
        Register New Worker
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* First Name */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>First Name</label>
          <input type="text" name="firstName" value={workerFormData.firstName} onChange={handleWorkerInputChange} placeholder="Enter First Name" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
        </div>

        {/* Last Name */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Last Name</label>
          <input type="text" name="lastName" value={workerFormData.lastName} onChange={handleWorkerInputChange} placeholder="Enter Last Name" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
        </div>

        {/* Documents */}
        <div className="w-full px-2 md:col-span-2">
          <div className="bg-white/50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-black mb-2">Upload Documents (Required: Aadhar & PAN)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>Aadhar Card</label>
                <input type="file" accept="image/*" onChange={e => handleDocumentUpload(e, "aadhar", "worker")} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" disabled={ocrLoading} />
                {workerDocuments.aadharCard && <p className="text-xs text-green-600 mt-1">✓ {workerDocuments.aadharCard.name}</p>}
              </div>
              <div>
                <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>PAN Card</label>
                <input type="file" accept="image/*" onChange={e => handleDocumentUpload(e, "pan", "worker")} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" disabled={ocrLoading} />
                {workerDocuments.panCard && <p className="text-xs text-green-600 mt-1">✓ {workerDocuments.panCard.name}</p>}
              </div>
            </div>
            {ocrLoading && (
              <div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${ocrProgress}%` }} /></div><p className="text-xs text-center mt-1">Processing... {ocrProgress}%</p></div>
            )}
          </div>
        </div>

        {/* Contact Number */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Contact Number</label>
          <input type="tel" name="contactNumber" value={workerFormData.contactNumber} onChange={handleWorkerInputChange} placeholder="Enter Phone Number" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
        </div>

        {/* Email */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>E-Mail</label>
          <input type="email" name="email" value={workerFormData.email} onChange={handleWorkerInputChange} placeholder="Enter E-Mail" className="w-full h-[40px] px-4 bg-white rounded-[10px] border-0 outline-none text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
        </div>
        {/* Room Type */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Room Type</label>
          <div className="relative h-[40px]">
            <select name="roomType" value={workerFormData.roomType} onChange={handleWorkerInputChange} className="w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins]" style={{ WebkitAppearance: "none", boxShadow: "0px 4px 10px 0px #00000040", color: workerFormData.roomType === "" ? "#0000008A" : "#000" }}>
              <option value="" disabled hidden>Select Room Type</option>
              <option value="3">3 Bed Sharing</option>
              <option value="4">4 Bed Sharing</option>
              <option value="5">5 Bed Sharing</option>
            </select>
            <ChevronDown />
          </div>
        </div>

        {/* Fee Information (Full Price - No Discount) */}
        {workerFormData.roomType && (
          <div className="w-full px-2 col-span-1">
            <div className="bg-orange-50 p-2 rounded-[10px] border border-orange-100 flex flex-col gap-1 px-4 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-orange-800">Monthly Fee: ₹{workerFormData.roomType === "5" ? "6,000" : workerFormData.roomType === "4" ? "6,500" : "7,000"}</span>
                <span className="text-[10px] text-orange-600 font-semibold">(No Student Discount)</span>
              </div>
              <div className="border-t border-orange-200 pt-1 flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-orange-800">Refundable Deposit (One-time):</span>
                  <span className="text-[11px] font-extrabold text-orange-900">₹{workerFormData.roomType === "5" ? "18,000" : workerFormData.roomType === "4" ? "19,500" : "21,000"}</span>
                </div>
                <p className="text-[9px] text-orange-600 italic leading-tight">* Deposit is held by hostel and refunded when leaving. Fees are payable monthly.</p>
              </div>
            </div>
          </div>
        )}

        {/* Room Number */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Room Number</label>
          <div className="relative h-[40px]">
            <select name="roomNumber" value={workerFormData.roomNumber} onChange={handleWorkerInputChange} className="w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins]" style={{ WebkitAppearance: "none", boxShadow: "0px 4px 10px 0px #00000040", color: workerFormData.roomNumber === "" ? "#0000008A" : "#000" }}>
              <option value="" disabled hidden>Select Room</option>
              {availableRoomNumbers
                .filter(r => !workerFormData.roomType || String(r.totalBeds) === workerFormData.roomType)
                .map(r => <option key={r._id} value={r._id}>Room {r._id} - Floor {r.floor} ({r.totalBeds} Beds)</option>)}
            </select>
            <ChevronDown />
          </div>
        </div>

        {/* Bed Number */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Bed Number</label>
          <div className="relative h-[40px]">
            <select name="bedNumber" value={workerFormData.bedNumber} onChange={handleWorkerInputChange} className="w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins]" style={{ WebkitAppearance: "none", boxShadow: "0px 4px 10px 0px #00000040", color: workerFormData.bedNumber === "" ? "#0000008A" : "#000" }}>
              <option value="" disabled hidden>{workerFormData.roomNumber ? "Select Bed" : "Select Room First"}</option>
              {getBedsForRoom(workerFormData.roomNumber).map(b => {
                const shortBarcode = (b.barcodeId || "").split("-").slice(0, 2).join("-");
                return <option key={b._id} value={b._id}>{shortBarcode} - Floor {b.floor}</option>;
              })}
            </select>
            <ChevronDown />
          </div>
        </div>

        {/* Emergency Contact Number */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Emergency Contact Number</label>
          <input type="tel" name="emergencyContactNumber" value={workerFormData.emergencyContactNumber} onChange={handleWorkerInputChange} placeholder="Enter Contact Number" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
        </div>

        {/* Emergency Contact Name */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Emergency Contact Name</label>
          <input type="text" name="emergencyContactName" value={workerFormData.emergencyContactName} onChange={handleWorkerInputChange} placeholder="Enter Name" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
        </div>

        {/* Relation */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Relation</label>
          <input type="text" name="relation" value={workerFormData.relation} onChange={handleWorkerInputChange} placeholder="e.g. Father, Mother" className="w-full px-4 text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
        </div>

        {/* Admission Date */}
        <div className="w-full px-2">
          <label className="block mb-2 text-black ml-2" style={labelStyle}>Admission Date</label>
          <div className="bg-gray-100 rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 shadow-[0px_4px_10px_0px_#00000040] cursor-not-allowed w-fit min-w-[200px]">
            {workerFormData.admissionDate}
          </div>
          <p className="text-xs text-gray-600 mt-1 ml-2">Automatically set to today's date</p>
        </div>


      </div>

      <div className="flex justify-center">
        <button onClick={handleWorkerSubmit} disabled={workerLoading} className={`mt-6 px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] font-semibold text-[15px] cursor-pointer ${workerLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {workerLoading ? "Registering..." : "Register Worker"}
        </button>
      </div>
    </>
  );

  const handleDeleteParent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this parent account?")) return;
    try {
      await api.delete(`/api/adminauth/delete-parent/${id}`);
      toast.success("Parent deleted successfully");
      setRefreshTrigger(p => p + 1);
    } catch (e) { toast.error(e.message || "Failed to delete parent"); }
  };

  const handleParentView = (parent) => {
    setParentDetailsData(parent);
    setShowParentDetailsModal(true);
  };

  const handleParentEdit = (parent) => {
    setEditingParent(parent);
    setParentFormData({
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      relation: parent.relation,
      contactNumber: parent.contactNumber,
      studentId: parent.studentId
    });
    setParentDocuments({
      aadharCard: parent.documents?.aadharCard || null,
      panCard: parent.documents?.panCard || null
    });
    setShowParentEditModal(true);
  };

  const handleParentUpdate = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      Object.keys(parentFormData).forEach(k => {
        if (k !== "aadharCard" && k !== "panCard") fd.append(k, parentFormData[k] || "");
      });
      if (parentDocuments.aadharCard instanceof File) fd.append("aadharCard", parentDocuments.aadharCard);
      if (parentDocuments.panCard instanceof File) fd.append("panCard", parentDocuments.panCard);

      await api.put(`/api/adminauth/update-parent/${editingParent._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Parent details updated!");
      setShowParentEditModal(false);
      setEditingParent(null);
      resetParentForm();
      setRefreshTrigger(p => p + 1);
    } catch (e) { toast.error(e.response?.data?.message || e.message || "Update failed"); }
    finally { setLoading(false); }
  };

  const parentTable = () => (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black" style={{ fontFamily: "Inter" }}>Parent List</h2>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-black rounded-[19.6px] overflow-hidden">
        <div className="bg-white text-black grid grid-cols-6 text-center font-bold text-[13px] py-3 border-b border-black">
          <div className="relative border-r border-black/10 last:border-0">Parent Name</div>
          <div className="relative border-r border-black/10 last:border-0">Contact</div>
          <div className="relative border-r border-black/10 last:border-0">Relation</div>
          <div className="relative border-r border-black/10 last:border-0">Student ID</div>
          <div className="relative border-r border-black/10 last:border-0">Status</div>
          <div>Action</div>
        </div>
        <div className="bg-[#BEC5AD] flex flex-col gap-y-2 p-2 min-h-[100px]">
          {parents.length === 0 ? (
            <div className="py-12 text-center text-gray-600 font-medium italic">No parents registered yet.</div>
          ) : (
            parents.map((p, i) => (
              <div key={p._id} className="bg-white/40 rounded-xl grid grid-cols-6 text-center text-xs py-3 items-center border border-black/5 hover:bg-white/60 transition-colors">
                <div className="font-bold text-black">{p.firstName} {p.lastName}</div>
                <div className="text-black font-medium">{p.contactNumber}</div>
                <div className="text-black">{p.relation}</div>
                <div className="font-semibold text-blue-800">{p.studentId}</div>
                <div className="flex justify-center">
                  {p.isPendingApproval ? (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md text-center ${p.reqStatus === 'rejected' ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'}`}>
                      {p.reqStatus === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md text-center">Approved</span>
                  )}
                </div>
                <div className="flex justify-center items-center gap-3">
                  {p.isPendingApproval ? (
                    <>
                      <button onClick={() => handleParentView(p)} className="hover:scale-110 transition-transform text-black" title="View Details"><Eye size={18} /></button>
                      {p.reqStatus === 'rejected' && p.rejectionReason && (
                        <>
                          <div className="w-px h-4 bg-black/20" />
                          <button onClick={() => handleViewReason(p.rejectionReason)} className="hover:scale-110 transition-transform text-red-500" title="View Reason"><Info size={18} /></button>
                        </>
                      )}
                      {p.reqStatus !== 'rejected' && (
                        <>
                          <div className="w-px h-4 bg-black/20" />
                          <button onClick={() => handleApproveReq(p.requisitionId)} className="hover:scale-110 transition-transform text-green-600" title="Approve"><Check size={18} strokeWidth={3} /></button>
                          <div className="w-px h-4 bg-black/20" />
                          <button onClick={() => handleRejectReq(p.requisitionId)} className="hover:scale-110 transition-transform text-red-600" title="Reject"><X size={18} strokeWidth={3} /></button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleParentView(p)} className="hover:scale-110 transition-transform text-black" title="View Details"><Eye size={18} /></button>
                      <div className="w-px h-4 bg-black/20" />
                      <button onClick={() => handleParentEdit(p)} className="hover:scale-110 transition-transform text-black" title="Edit Parent">
                        <svg width="18" height="18" viewBox="0 0 27 26" fill="none"><mask id={`mp${i}`} style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="27" height="26"><rect x=".678" y=".025" width="25.736" height="25.736" fill="#D9D9D9" /></mask><g mask={`url(#mp${i})`}><path d="M2.824 25.761V21.472h21.446v4.289H2.824ZM7.113 17.182h1.501l8.364-8.337-1.528-1.528-8.337 8.365v1.5ZM4.968 19.327V14.77l12.01-11.983c.197-.197.425-.348.683-.462.26-.113.532-.17.818-.17.286 0 .563.057.831.17.268.107.51.268.725.482l1.474 1.501c.215.197.371.429.469.697.098.268.147.545.147.831 0 .268-.049.504-.147.763-.098.26-.254.497-.469.712L9.526 19.327H4.968Z" fill="currentColor" /></g></svg>
                      </button>
                      <div className="w-px h-4 bg-black/20" />
                      <button onClick={() => handleDeleteParent(p._id)} className="hover:scale-110 transition-transform text-red-600" title="Delete Parent">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Cards for Parents */}
      <div className="md:hidden space-y-3">
        {parents.length === 0 ? (
          <div className="py-8 text-center text-gray-600 font-medium italic">No parents registered yet.</div>
        ) : (
          parents.map((p, i) => (
            <div key={p._id} className="bg-white rounded-xl p-4 border border-black/10 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-black">{p.firstName} {p.lastName}</h3>
                  <p className="text-xs text-blue-800 font-semibold mt-0.5">ID: {p.studentId}</p>
                  {p.isPendingApproval && <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${p.reqStatus === 'rejected' ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'}`}>{p.reqStatus === 'rejected' ? 'Rejected' : 'Pending'}</span>}
                </div>
                <div className="flex gap-2">
                  {p.isPendingApproval ? (
                    <>
                      <button onClick={() => handleParentView(p)} className="p-2 bg-gray-100 rounded-lg"><Eye size={16} /></button>
                      {p.reqStatus === 'rejected' && p.rejectionReason && (
                        <button onClick={() => handleViewReason(p.rejectionReason)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title="View Reason"><Info size={16} /></button>
                      )}
                      {p.reqStatus !== 'rejected' && (
                        <>
                          <button onClick={() => handleApproveReq(p.requisitionId)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" title="Approve"><Check size={16} strokeWidth={3} /></button>
                          <button onClick={() => handleRejectReq(p.requisitionId)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title="Reject"><X size={16} strokeWidth={3} /></button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleParentView(p)} className="p-2 bg-gray-100 rounded-lg"><Eye size={16} /></button>
                      <button onClick={() => handleParentEdit(p)} className="p-2 bg-gray-100 rounded-lg text-black">
                        <svg width="16" height="16" viewBox="0 0 27 26" fill="none"><path d="M2.824 25.761V21.472h21.446v4.289H2.824ZM7.113 17.182h1.501l8.364-8.337-1.528-1.528-8.337 8.365v1.5ZM4.968 19.327V14.77l12.01-11.983c.197-.197.425-.348.683-.462.26-.113.532-.17.818-.17.286 0 .563.057.831.17.268.107.51.268.725.482l1.474 1.501c.215.197.371.429.469.697.098.268.147.545.147.831 0 .268-.049.504-.147.763-.098.26-.254.497-.469.712L9.526 19.327H4.968Z" fill="currentColor" /></svg>
                      </button>
                      <button onClick={() => handleDeleteParent(p._id)} className="p-2 bg-red-50 rounded-lg text-red-600"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div>
                  <p className="text-gray-500">Contact</p>
                  <p className="font-medium">{p.contactNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Relation</p>
                  <p className="font-medium">{p.relation}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-4 font-sans">
      <div className="w-full">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7">
          <div className="flex items-center">
            <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
            <h1 className="text-[25px] leading-[25px] font-extrabold text-black flex items-center" style={{ fontFamily: "Inter" }}>
              Student Management
            </h1>
          </div>
        </div>

        {/* ── STATS CARDS (TOP) ── */}
        <div className="w-full mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STAT_CARDS.map(card => (
              <StatCard
                key={card.key}
                icon={card.icon}
                label={card.label}
                value={card.value}
                accent={card.accent}
                isActive={activeFilter === card.key}
                onClick={() => setActiveFilter(prev => prev === card.key ? "All" : card.key)}
                total={card.total}
              />
            ))}
          </div>

          {/* Active filter badge */}
          {activeFilter !== "All" && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtering by:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4F8CCF]/10 text-[#4F8CCF] text-sm font-semibold rounded-full border border-[#4F8CCF]/30">
                {activeFilter}
                <button onClick={() => setActiveFilter("All")} className="ml-1 hover:text-red-500 transition-colors font-bold">×</button>
              </span>
              <span className="text-sm text-gray-500">({filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""})</span>
            </div>
          )}
        </div>

        {/* ── Registration Tabs ── */}
        {!editingStudent && (
          <div className="w-full mb-10">
            {/* Desktop Tabs */}
            <div className="hidden sm:flex mb-4 gap-3 overflow-x-auto pb-2 custom-scrollbar whitespace-nowrap">
              {["student", "parent", "worker"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-[12px] font-semibold transition-colors text-sm ${activeTab === tab ? "bg-[#BEC5AD] text-black shadow-md border border-[#4F8CCF]/50" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`} style={{ fontFamily: "Poppins" }}>
                  {tab === "student" ? "Register Student" : tab === "parent" ? "Register Parent" : "Register Worker"}
                </button>
              ))}
            </div>
            {/* Mobile Dropdown */}
            <div className="sm:hidden mb-4 relative h-[45px] w-full">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full h-full px-4 bg-[#BEC5AD] rounded-[12px] outline-none cursor-pointer appearance-none text-[14px] font-semibold text-black shadow-md border border-[#4F8CCF]/50"
                style={{ WebkitAppearance: "none", fontFamily: "Poppins" }}
              >
                <option value="student">Register Student</option>
                <option value="parent">Register Parent</option>
                <option value="worker">Register Worker</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8" style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}>
              {activeTab === "student" ? formContent(false) : activeTab === "parent" ? parentFormContent() : workerFormContent()}
            </div>
          </div>
        )}
        {/* ── Edit Modal ── */}
        {showEditModal && editingStudent && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}>
              <button onClick={resetForm} className="absolute top-4 right-4 text-black hover:text-gray-700 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {formContent(true)}
            </div>
          </div>
        )}

        {/* ── Details Modal ── */}
        {showDetailsModal && studentDetailsData && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}>
              <button onClick={() => { setShowDetailsModal(false); setStudentDetailsData(null); }} className="absolute top-4 right-4 text-black hover:text-gray-700 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-xl font-bold text-black mb-6" style={{ fontFamily: "Inter" }}>{studentDetailsData.isWorking ? "Worker Details" : "Student Details"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                {[
                  [studentDetailsData.isWorking ? "Worker ID" : "Student ID", studentDetailsData.isPendingApproval ? "Pending" : studentDetailsData.id],
                  [studentDetailsData.isWorking ? "Worker Name" : "Student Name", studentDetailsData.name],
                  ["Contact Number", studentDetailsData.contact],
                  ["Email", studentDetailsData.email || "N/A"],
                  ["Room/Bed", studentDetailsData.room],
                  ["Room Type", studentDetailsData.roomType ? `${studentDetailsData.roomType} Bed` : "N/A"],
                  ["Emergency Contact", studentDetailsData.emergencyContactNumber || "N/A"],
                  ["Admission Date", studentDetailsData.admissionDate ? new Date(studentDetailsData.admissionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"],
                  ["Emergency Contact Name", studentDetailsData.emergencyContactName || "N/A"],
                  ["Relation", studentDetailsData.relation || "N/A"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="font-semibold text-sm text-gray-600 mb-0.5">{k}</p>
                    <p className="font-medium text-black">{v}</p>
                  </div>
                ))}
                <div>
                  <p className="font-semibold text-sm text-gray-600 mb-1">Fee Status</p>
                  <span style={getFeeStatusStyle(studentDetailsData.feeStatus)}>{studentDetailsData.feeStatus}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600 mb-0.5">Dues</p>
                  <p className="font-medium text-black">{studentDetailsData.dues}</p>
                </div>
              </div>


              {/* Documents */}
              <div className="mt-6 border-t border-black/20 pt-5">
                <h3 className="text-base font-bold text-black mb-3" style={{ fontFamily: "Inter" }}>Uploaded Documents</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[["Aadhar Card", "aadharCard"], ["PAN Card", "panCard"], ["Student ID Card", "studentIdCard"], ["Fees Receipt", "feesReceipt"]].map(([label, key]) => (
                    <div key={key} className="bg-white/50 rounded-lg p-3">
                      <p className="font-semibold text-black text-sm mb-2">{label}</p>
                      {hasDocument(studentDetailsData.documents?.[key]) ? (
                        <div className="flex flex-col gap-2">
                          <div 
                            className="w-full h-24 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#4F8CCF] transition-colors"
                            onClick={() => {
                              const token = localStorage.getItem('adminToken');
                              window.open(`${getDocumentUrl(studentDetailsData.id, key)}?token=${token}`, '_blank');
                            }}
                          >
                            <img 
                              src={`${getDocumentUrl(studentDetailsData.id, key)}?token=${localStorage.getItem('adminToken')}`} 
                              alt={label} 
                              className="w-full h-full object-contain" 
                              onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.parentElement.innerHTML = '<div class="text-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg><span class="text-[10px] text-gray-500 font-medium leading-tight block">Document<br/>Click to view</span></div>'; 
                              }} 
                            />
                          </div>
                          <button onClick={() => {
                            const token = localStorage.getItem('adminToken');
                            window.open(`${getDocumentUrl(studentDetailsData.id, key)}?token=${token}`, '_blank');
                          }} className="w-full py-1.5 bg-[#4F8CCF] text-white rounded hover:bg-blue-600 transition-colors text-[11px] font-bold tracking-wide uppercase">Open</button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Not uploaded</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button onClick={() => { setShowDetailsModal(false); handleEdit(studentDetailsData.id); }} className="px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] font-semibold text-[15px] cursor-pointer">Edit Student</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Parent Details Modal ── */}
        {showParentDetailsModal && parentDetailsData && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}>
              <button onClick={() => { setShowParentDetailsModal(false); setParentDetailsData(null); }} className="absolute top-4 right-4 text-black hover:text-gray-700 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-xl font-bold text-black mb-6" style={{ fontFamily: "Inter" }}>Parent Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                {[
                  ["First Name", parentDetailsData.firstName],
                  ["Last Name", parentDetailsData.lastName],
                  ["Contact Number", parentDetailsData.contactNumber],
                  ["Email", parentDetailsData.email || "N/A"],
                  ["Relation", parentDetailsData.relation],
                  ["Student ID", parentDetailsData.studentId],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="font-semibold text-sm text-gray-600 mb-0.5">{k}</p>
                    <p className="font-medium text-black">{v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-black/20 pt-5">
                <h3 className="text-base font-bold text-black mb-3" style={{ fontFamily: "Inter" }}>Uploaded Documents</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[["Aadhar Card", "aadharCard"], ["PAN Card", "panCard"]].map(([label, key]) => (
                    <div key={key} className="bg-white/50 rounded-lg p-3">
                      <p className="font-semibold text-black text-sm mb-2">{label}</p>
                      {hasDocument(parentDetailsData.documents?.[key]) ? (
                        <div className="flex flex-col gap-2">
                          <div 
                            className="w-full h-24 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#4F8CCF] transition-colors"
                            onClick={() => {
                              const token = localStorage.getItem('adminToken');
                              window.open(`${getParentDocumentUrl(parentDetailsData._id, key)}?token=${token}`, '_blank');
                            }}
                          >
                            <img 
                              src={`${getParentDocumentUrl(parentDetailsData._id, key)}?token=${localStorage.getItem('adminToken')}`} 
                              alt={label} 
                              className="w-full h-full object-contain" 
                              onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.parentElement.innerHTML = '<div class="text-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg><span class="text-[10px] text-gray-500 font-medium leading-tight block">Document<br/>Click to view</span></div>'; 
                              }} 
                            />
                          </div>
                          <button onClick={() => {
                            const token = localStorage.getItem('adminToken');
                            window.open(`${getParentDocumentUrl(parentDetailsData._id, key)}?token=${token}`, '_blank');
                          }} className="w-full py-1.5 bg-[#4F8CCF] text-white rounded hover:bg-blue-600 transition-colors text-[11px] font-bold tracking-wide uppercase">Open</button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Not uploaded</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button onClick={() => { setShowParentDetailsModal(false); handleParentEdit(parentDetailsData); }} className="px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] font-semibold text-[15px] cursor-pointer">Edit Parent</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Parent Edit Modal ── */}
        {showParentEditModal && editingParent && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}>
              <button onClick={() => { setShowParentEditModal(false); setEditingParent(null); resetParentForm(); }} className="absolute top-4 right-4 text-black hover:text-gray-700 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-xl font-bold text-black mb-6" style={{ fontFamily: "Inter" }}>Edit Parent Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full px-2">
                  <label className="block mb-1 text-black ml-2" style={labelStyle}>First Name</label>
                  <input type="text" name="firstName" value={parentFormData.firstName} onChange={handleParentInputChange} className="w-full px-4 text-black font-semibold text-[12px]" style={inputStyle} />
                </div>
                <div className="w-full px-2">
                  <label className="block mb-1 text-black ml-2" style={labelStyle}>Last Name</label>
                  <input type="text" name="lastName" value={parentFormData.lastName} onChange={handleParentInputChange} className="w-full px-4 text-black font-semibold text-[12px]" style={inputStyle} />
                </div>
                <div className="w-full px-2">
                  <label className="block mb-1 text-black ml-2" style={labelStyle}>E-Mail</label>
                  <input type="email" name="email" value={parentFormData.email} onChange={handleParentInputChange} placeholder="Enter E-Mail" className="w-full h-[40px] px-4 bg-white rounded-[10px] border-0 outline-none text-black font-semibold text-[12px] font-[Poppins]" style={inputStyle} />
                  {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email}</p>}
                </div>
                <div className="w-full px-2">
                  <label className="block mb-1 text-black ml-2" style={labelStyle}>Contact Number</label>
                  <input type="text" name="contactNumber" value={parentFormData.contactNumber} onChange={handleParentInputChange} className="w-full px-4 text-black font-semibold text-[12px]" style={inputStyle} />
                </div>
                <div className="w-full px-2">
                  <label className="block mb-1 text-black ml-2" style={labelStyle}>Relation</label>
                  <input type="text" name="relation" value={parentFormData.relation} onChange={handleParentInputChange} className="w-full px-4 text-black font-semibold text-[12px]" style={inputStyle} />
                </div>
                <div className="w-full md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="w-full px-2">
                    <label className="block mb-1 text-black ml-2" style={labelStyle}>Aadhar Card</label>
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" onChange={(e) => handleDocumentUpload(e, 'aadhar', 'parent')} className="w-full px-4 text-black font-semibold text-[12px]" style={inputStyle} />
                    <DocumentPreviewBox fileData={parentDocuments.aadharCard} docKey="aadharCard" label="Aadhar Card" isParent={true} />
                  </div>
                  <div className="w-full px-2">
                    <label className="block mb-1 text-black ml-2" style={labelStyle}>Pan Card</label>
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" onChange={(e) => handleDocumentUpload(e, 'pan', 'parent')} className="w-full px-4 text-black font-semibold text-[12px]" style={inputStyle} />
                    <DocumentPreviewBox fileData={parentDocuments.panCard} docKey="panCard" label="Pan Card" isParent={true} />
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button onClick={handleParentUpdate} disabled={loading} className="px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] font-semibold text-[15px] cursor-pointer">
                  {loading ? "Updating..." : "Update Details"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Student List ── */}
        <div id="student-list-section" className="w-full">
          <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 px-4 sm:px-0" style={{ boxShadow: "0px 4px 4px 0px #00000040 inset" }}>
            {activeTab === "parent" ? (
              parentTable()
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-4 sm:px-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black" style={{ fontFamily: "Inter" }}>
                    {activeTab === "worker" ? "Worker List" : "Student List"}
                    {activeFilter !== "All" && <span className="text-[#4F8CCF] text-lg ml-2 font-semibold">— {activeFilter}</span>}
                  </h2>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <div className="border border-black rounded-[19.6px] overflow-hidden">
                    <div className="bg-white text-black grid grid-cols-11 text-center">
                      {["Student ID", "Name", "Room/Bed", "Type", "Fee", "Contact", "Fees Status", "Dues", "Biometric", "Status", "Action"].map((h, i) => (
                        <div key={h} className="px-2 py-3 relative flex justify-center items-center" style={{ fontFamily: "Poppins", fontWeight: "600", fontSize: "13px" }}>
                          <span className="w-full break-words">{h}</span>
                          {i < 10 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-5 border border-black" />}
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#BEC5AD] text-center text-sm flex flex-col gap-y-2 p-2 font-[Poppins] font-medium">
                      {currentStudents.length === 0 && (
                        <div className="py-8 text-center text-gray-600 font-medium">No {activeTab === "worker" ? "workers" : "students"} found for this filter.</div>
                      )}
                      {currentStudents.map((s, i) => (
                        <div key={s.id} className="text-black grid grid-cols-11 items-center border-b border-black/10 last:border-0 pb-2">
                          <div className="px-2 py-2 break-words text-xs">{s.isPendingApproval ? "Pending" : s.id}</div>
                          <div className="px-2 py-2 break-words text-xs font-bold">{s.name}</div>
                          <div className="px-2 py-2 break-words leading-tight text-[10px]">{s.room}</div>
                          <div className="px-2 py-2 text-[10px] break-words">{s.roomType ? `${s.roomType} Bed` : "-"}</div>
                          <div className="px-2 py-2 text-[10px] font-bold text-blue-700">{s.monthlyFee}</div>
                          <div className="px-2 py-2 text-[10px] break-words">{s.contact}</div>
                          <div className="px-2 py-2 flex justify-center"><span style={getFeeStatusStyle(s.feeStatus)}>{s.feeStatus}</span></div>
                          <div className="px-2 py-2">{s.dues}</div>
                          <div className="px-2 py-2 flex justify-center">
                            {s.isAddedToBiometric ? (
                              <span className="text-green-600 font-bold" title="Added to Biometric">✅</span>
                            ) : (
                              <span className="text-red-500 font-bold" title="Not added to Biometric">❌</span>
                            )}
                          </div>
                          <div className="px-2 py-2 flex justify-center">
                            {s.isPendingApproval ? (
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md text-center w-full ${s.reqStatus === 'rejected' ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'}`}>
                                {s.reqStatus === 'rejected' ? 'Rejected' : 'Pending'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md text-center w-full">Approved</span>
                            )}
                          </div>
                          <div className="px-2 py-2 flex justify-center items-center gap-2">
                            {s.isPendingApproval ? (
                              <>
                                <button onClick={() => handleViewDetails(s.id)} title="View Details" className="hover:scale-110 transition-transform"><Eye size={18} strokeWidth={2.5} /></button>
                                {s.reqStatus === 'rejected' && s.rejectionReason && (
                                  <>
                                    <div className="w-px h-4 bg-gray-400 self-center" />
                                    <button onClick={() => handleViewReason(s.rejectionReason)} title="View Reason" className="hover:scale-110 transition-transform text-red-500"><Info size={18} strokeWidth={2.5} /></button>
                                  </>
                                )}
                                {s.reqStatus !== 'rejected' && (
                                  <>
                                    <div className="w-px h-4 bg-gray-400 self-center" />
                                    <button onClick={() => handleApproveReq(s.requisitionId)} className="hover:scale-110 transition-transform text-green-600" title="Approve"><Check size={18} strokeWidth={3} /></button>
                                    <div className="w-px h-4 bg-gray-400 self-center" />
                                    <button onClick={() => handleRejectReq(s.requisitionId)} className="hover:scale-110 transition-transform text-red-600" title="Reject"><X size={18} strokeWidth={3} /></button>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleViewDetails(s.id)} className="hover:scale-110 transition-transform" title="View Details"><Eye size={22} strokeWidth={2.5} /></button>
                                <div className="w-px h-5 bg-black self-center" />
                                <button onClick={() => handleEdit(s.id)} className="hover:scale-110 transition-transform" title="Edit Student">
                                  <svg width="22" height="22" viewBox="0 0 27 26" fill="none"><mask id={`m${i}`} style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="27" height="26"><rect x=".678" y=".025" width="25.736" height="25.736" fill="#D9D9D9" /></mask><g mask={`url(#m${i})`}><path d="M2.824 25.761V21.472h21.446v4.289H2.824ZM7.113 17.182h1.501l8.364-8.337-1.528-1.528-8.337 8.365v1.5ZM4.968 19.327V14.77l12.01-11.983c.197-.197.425-.348.683-.462.26-.113.532-.17.818-.17.286 0 .563.057.831.17.268.107.51.268.725.482l1.474 1.501c.215.197.371.429.469.697.098.268.147.545.147.831 0 .268-.049.504-.147.763-.098.26-.254.497-.469.712L9.526 19.327H4.968Z" fill="#1C1B1F" /></g></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3">
                  {currentStudents.length === 0 && <p className="text-center text-gray-600 py-8">No {activeTab === "worker" ? "workers" : "students"} found.</p>}
                  {currentStudents.map((s, i) => (
                    <div key={s.id} className="bg-white rounded-xl p-4 border border-black/10 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-base text-black">{s.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">ID: {s.isPendingApproval ? "Pending" : s.id}</p>
                        </div>
                        <div className="flex gap-2">
                          {s.isPendingApproval ? (
                            <>
                              <button onClick={() => handleViewDetails(s.id)} className="p-2 bg-[#BEC5AD] rounded-lg hover:bg-[#A4B494] transition-colors" title="View Details"><Eye size={16} /></button>
                              {s.reqStatus === 'rejected' && s.rejectionReason && (
                                <button onClick={() => handleViewReason(s.rejectionReason)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title="View Reason"><Info size={16} strokeWidth={3} /></button>
                              )}
                              {s.reqStatus !== 'rejected' && (
                                <>
                                  <button onClick={() => handleApproveReq(s.requisitionId)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" title="Approve"><Check size={16} strokeWidth={3} /></button>
                                  <button onClick={() => handleRejectReq(s.requisitionId)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title="Reject"><X size={16} strokeWidth={3} /></button>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleViewDetails(s.id)} className="p-2 bg-[#BEC5AD] rounded-lg hover:bg-[#A4B494] transition-colors"><Eye size={16} /></button>
                              <button onClick={() => handleEdit(s.id)} className="p-2 bg-[#BEC5AD] rounded-lg hover:bg-[#A4B494] transition-colors">
                                <svg width="16" height="16" viewBox="0 0 27 26" fill="none"><mask id={`mm${i}`} style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="27" height="26"><rect x=".678" y=".025" width="25.736" height="25.736" fill="#D9D9D9" /></mask><g mask={`url(#mm${i})`}><path d="M2.824 25.761V21.472h21.446v4.289H2.824ZM7.113 17.182h1.501l8.364-8.337-1.528-1.528-8.337 8.365v1.5ZM4.968 19.327V14.77l12.01-11.983c.197-.197.425-.348.683-.462.26-.113.532-.17.818-.17.286 0 .563.057.831.17.268.107.51.268.725.482l1.474 1.501c.215.197.371.429.469.697.098.268.147.545.147.831 0 .268-.049.504-.147.763-.098.26-.254.497-.469.712L9.526 19.327H4.968Z" fill="#1C1B1F" /></g></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Room / Bed</span>
                          <p className="text-black font-semibold text-xs mt-0.5">{s.room}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Contact</span>
                            <p className="text-black text-xs font-medium">{s.contact}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Dues</span>
                            <p className="text-black font-bold text-sm">{s.dues}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Fee Status</span>
                          <span style={getFeeStatusStyle(s.feeStatus)} className="text-[10px]">{s.feeStatus}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Biometric</span>
                          <span className="text-[10px]">
                            {s.isAddedToBiometric ? "✅ Added" : "❌ Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {filteredStudents.length > itemsPerPage && (
                  <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 rounded-lg border border-black font-semibold text-sm transition-colors ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white"}`}>← Prev</button>
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button key={i + 1} onClick={() => paginate(i + 1)} className={`w-9 h-9 rounded-lg border border-black font-semibold text-sm transition-colors ${currentPage === i + 1 ? "bg-white shadow-md" : "hover:bg-white/50"}`}>{i + 1}</button>
                      ))}
                    </div>
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-lg border border-black font-semibold text-sm transition-colors ${currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-white"}`}>Next →</button>
                    <span className="text-sm text-black font-medium ml-2">{currentPage}/{totalPages || 1} · {filteredStudents.length} students</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Reject Modal ── */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Request</h3>
                <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this student's request. This reason will be visible to the Warden.</p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none text-sm text-black"
                  rows={4}
                  autoFocus
                />
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <X size={16} strokeWidth={3} /> Reject Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Reason Modal ── */}
      {showReasonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Info size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-black mb-2 text-center" style={{ fontFamily: "Inter" }}>Rejection Reason</h3>
            <p className="text-sm font-medium text-gray-700 text-center mb-6 px-2 break-words">
              {reasonText}
            </p>
            <button
              onClick={() => setShowReasonModal(false)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default StudentManagement;