
// export default StudentManagement;
"use client";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import api from "@/lib/api";
import Tesseract from "tesseract.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const getDocumentUrl = (studentId, docType) =>
  `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/student-document/${studentId}/${docType}`;

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
      className={`
        group relative flex flex-col gap-3 rounded-2xl p-5 text-left
        border-2 transition-all duration-200 cursor-pointer
        ${isActive
          ? "border-[#4F8CCF] bg-white shadow-lg scale-[1.02]"
          : "border-transparent bg-[#D6DAC8] hover:bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]"}
      `}
      style={{ fontFamily: "Poppins" }}
    >
      {/* Top row: icon + count */}
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <span
          className="text-3xl font-extrabold leading-none"
          style={{ color: accent }}
        >
          {value}
        </span>
      </div>

      {/* Label */}
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider leading-snug">
        {label}
      </p>

      {/* Mini progress bar (only when not "Total") */}
      {label !== "Total Students" && (
        <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: accent }}
          />
        </div>
      )}

      {/* Active indicator dot */}
      {isActive && (
        <span
          className="absolute top-3 right-3 w-2 h-2 rounded-full"
          style={{ background: accent }}
        />
      )}
    </button>
  );
};

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Icons = {
  total: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  paid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  pending: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  assigned: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  unassigned: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
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
  });

  const [editingStudent, setEditingStudent] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableRoomNumbers, setAvailableRoomNumbers] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsWithoutParents, setStudentsWithoutParents] = useState([]);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [studentDetailsData, setStudentDetailsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("student");
  const [parentFormData, setParentFormData] = useState({
    firstName: "", lastName: "", email: "", relation: "", contactNumber: "", studentId: "",
  });
  const [studentDocuments, setStudentDocuments] = useState({ aadharCard: null, panCard: null, studentIdCard: null, feesReceipt: null });
  const [parentDocuments, setParentDocuments] = useState({ aadharCard: null, panCard: null });
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [parentErrors, setParentErrors] = useState({});
  const [parentLoading, setParentLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: students.length,
    paid: students.filter((s) => s.feeStatus === "Paid").length,
    pending: students.filter((s) => ["Pending", "Unpaid", "Partial"].includes(s.feeStatus)).length,
    assigned: students.filter((s) => s.room && s.room !== "Not Assigned").length,
    unassigned: students.filter((s) => !s.room || s.room === "Not Assigned").length,
  };

  const STAT_CARDS = [
    { key: "All",           label: "Total Students", value: stats.total,      accent: "#4F8CCF", icon: Icons.total },
    { key: "Paid Fees",     label: "Paid Fees",       value: stats.paid,       accent: "#22C55E", icon: Icons.paid },
    { key: "Pending Fees",  label: "Pending Fees",    value: stats.pending,    accent: "#FF9D00", icon: Icons.pending },
    { key: "Room Assigned", label: "Room Assigned",   value: stats.assigned,   accent: "#8B5CF6", icon: Icons.assigned },
    { key: "Not Assigned",  label: "Not Assigned",    value: stats.unassigned, accent: "#EF4444", icon: Icons.unassigned },
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
      ["firstName","lastName","contactNumber","roomBedNumber","email","admissionDate","feeStatus","emergencyContactName","emergencyContactNumber"].forEach(k => fd.append(k, studentData[k] || ""));
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

  const updateStudentAPI = async (studentId, data) => {
    try {
      const res = await api.put(`/api/adminauth/update-student/${studentId}`, data);
      return res.data;
    } catch (e) { throw e.response?.data || { message: "Failed to update student" }; }
  };

  const fetchStudentsAPI = async () => { try { return (await api.get(`/api/adminauth/students`)).data; } catch(e) { throw e.response?.data || {message:"Failed to fetch students"}; } };
  const fetchStudentsWithoutParentsAPI = async () => { try { return (await api.get(`/api/adminauth/students-without-parents`)).data; } catch(e) { throw e.response?.data; } };
  const fetchAvailableRoomsAPI = async () => { try { return (await api.get(`/api/adminauth/inventory/available-beds`)).data; } catch(e) { throw e.response?.data; } };
  const fetchAvailableRoomsNumbersAPI = async () => { try { return (await api.get(`/api/adminauth/inventory/available-rooms`)).data; } catch(e) { throw e.response?.data; } };
  const fetchRoomDetailsAPI = async (id) => { try { return (await api.get(`/api/adminauth/inventory/${id}`)).data; } catch(e) { return null; } };

  const loadStudents = async () => {
    try {
      const { students: raw = [] } = await fetchStudentsAPI();
      const transformed = await Promise.all(raw.map(async (s) => {
        let roomDisplay = "Not Assigned", roomDetails = null;
        if (s.roomBedNumber && typeof s.roomBedNumber === "string" && s.roomBedNumber.length === 24) {
          roomDetails = await fetchRoomDetailsAPI(s.roomBedNumber);
          if (roomDetails?.inventory) roomDisplay = `${roomDetails.inventory.barcodeId} - Floor ${roomDetails.inventory.floor}, Room ${roomDetails.inventory.roomNo}`;
        } else if (s.roomBedNumber && typeof s.roomBedNumber === "object") {
          roomDisplay = `${s.roomBedNumber.barcodeId} - Floor ${s.roomBedNumber.floor}, Room ${s.roomBedNumber.roomNo}`;
          roomDetails = s.roomBedNumber;
        } else if (s.roomBedNumber) {
          roomDisplay = s.roomBedNumber;
        }
        return { id: s.studentId, firstName: s.firstName, lastName: s.lastName, name: `${s.firstName} ${s.lastName}`, room: roomDisplay, contact: s.contactNumber, email: s.email, emergencyContactNumber: s.emergencyContactNumber, admissionDate: s.admissionDate, emergencyContactName: s.emergencyContactName, feeStatus: s.feeStatus, dues: "₹ 0/-", roomDetails, roomObjectId: (s.roomBedNumber && typeof s.roomBedNumber === 'object') ? s.roomBedNumber._id : s.roomBedNumber, documents: s.documents || {} };
      }));
      setStudents(transformed);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    (async () => {
      try {
        await loadStudents();
        setAvailableRooms((await fetchAvailableRoomsAPI()).availableBeds || []);
        setAvailableRoomNumbers((await fetchAvailableRoomsNumbersAPI()).availableRooms || []);
        setStudentsWithoutParents((await fetchStudentsWithoutParentsAPI()).students || []);
      } catch (e) { console.error(e); }
    })();
  }, [refreshTrigger]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
  };

  const validateForm = (data, isEdit = false) => {
    const e = {};
    if (!data.firstName.trim()) e.firstName = "First Name is required.";
    if (!data.lastName.trim()) e.lastName = "Last Name is required.";
    if (!data.contactNumber.trim()) e.contactNumber = "Contact Number is required.";
    if (!isEdit && !data.email.trim()) e.email = "Email is required.";
    else if (data.email.trim() && !/\S+@\S+\.\S+/.test(data.email)) e.email = "Email is invalid.";
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
        if (ll.includes("government")||ll.includes("india")||ll.includes("mobile")||/\d{4}\s*\d{4}\s*\d{4}/.test(l)||l.length<4||l.length>50) continue;
        const words = l.split(/\s+/).filter(w => w.length > 1);
        if (words.length >= 2 && words.length <= 4) {
          const ar = (l.match(/[a-zA-Z]/g)||[]).length / l.replace(/\s/g,"").length;
          const pc = words.every(w => /^[A-Z][a-z]*$/.test(w)||/^[A-Z]+$/.test(w));
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
      else setParentFormData(p => ({ ...p, firstName: info.firstName || p.firstName, lastName: info.lastName || p.lastName, contactNumber: info.mobileNumber || p.contactNumber }));
      if (info.firstName || info.lastName) toast.success(`Extracted: ${info.firstName} ${info.lastName}\nDOB: ${info.dob || "—"}\nMobile: ${info.mobileNumber || "—"}`);
      else toast.error("Could not extract name. Please fill manually.");
    } catch (e) { toast.error("OCR failed. Please try again."); }
    finally { setOcrLoading(false); setOcrProgress(0); }
  };

  const handleDocumentUpload = async (e, documentType, formType) => {
    const file = e.target.files[0]; if (!file) return;
    const validTypes = ["image/jpeg","image/jpg","image/png","image/webp","application/pdf"];
    if (!validTypes.includes(file.type)) { toast.warning("Please upload a valid file"); return; }
    const fieldMap = { aadhar: "aadharCard", pan: "panCard", studentId: "studentIdCard", feesReceipt: "feesReceipt" };
    const fieldName = fieldMap[documentType] || documentType;
    if (formType === "student") setStudentDocuments(p => ({ ...p, [fieldName]: file }));
    else setParentDocuments(p => ({ ...p, [fieldName]: file }));
    if (file.type.includes("image") && (documentType === "aadhar" || documentType === "pan")) await processDocument(file, documentType, formType);
  };

  const resetForm = () => {
    setFormData({ firstName:"",lastName:"",contactNumber:"",email:"",roomNumber:"",bedNumber:"",emergencyContactNumber:"",admissionDate:getTodaysDate(),emergencyContactName:"",feeStatus:"",hasCollegeId:true });
    setStudentDocuments({ aadharCard:null,panCard:null,studentIdCard:null,feesReceipt:null });
    setEditingStudent(null); setErrors({}); setShowEditModal(false);
  };

  const handleSubmit = async () => {
    const errs = validateForm(formData); if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await registerStudentAPI({ ...formData, roomBedNumber: formData.bedNumber || "Not Assigned", aadharCard: studentDocuments.aadharCard, panCard: studentDocuments.panCard, studentIdCard: studentDocuments.studentIdCard, feesReceipt: studentDocuments.feesReceipt });
      setRefreshTrigger(p => p + 1); resetForm();
      toast.success(`Student registered! Password: ${res.student?.password}`, { autoClose: 6000 });
    } catch (e) { toast.error(e.message || "Error registering student."); }
    finally { setLoading(false); }
  };

  const handleEdit = (studentId) => {
    const s = students.find(s => s.id === studentId); if (!s) return;
    setFormData({ firstName:s.firstName||"", lastName:s.lastName||"", contactNumber:s.contact, email:s.email||"", roomNumber:s.roomDetails?.roomNo||"", bedNumber:s.roomObjectId||"", emergencyContactNumber:s.emergencyContactNumber||"", admissionDate:s.admissionDate?new Date(s.admissionDate).toISOString().split("T")[0]:"", emergencyContactName:s.emergencyContactName||"", feeStatus:s.feeStatus, hasCollegeId:s.hasCollegeId??true, isWorking:s.isWorking??false });
    setStudentDocuments({ aadharCard:s.documents?.aadharCard||null, panCard:s.documents?.panCard||null, studentIdCard:s.documents?.studentIdCard||null, feesReceipt:s.documents?.feesReceipt||null });
    setEditingStudent(studentId); setErrors({}); setShowEditModal(true);
  };

  const handleUpdate = async () => {
    const errs = validateForm(formData, true); if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      ["firstName","lastName","contactNumber","email","emergencyContactNumber","admissionDate","emergencyContactName","feeStatus"].forEach(k => fd.append(k, formData[k]));
      fd.append("roomBedNumber", formData.bedNumber);
      fd.append("hasCollegeId", formData.hasCollegeId);
      fd.append("isWorking", formData.isWorking);
      ["aadharCard","panCard","studentIdCard","feesReceipt"].forEach(k => { if (studentDocuments[k] instanceof File) fd.append(k, studentDocuments[k]); });
      await updateStudentAPI(editingStudent, fd);
      setRefreshTrigger(p => p + 1); resetForm(); toast.success("Student updated successfully!");
    } catch (e) { toast.error(e.message || "Error updating student."); }
    finally { setLoading(false); }
  };

  const handleParentInputChange = (e) => {
    const { name, value } = e.target;
    setParentFormData(p => ({ ...p, [name]: value }));
    if (parentErrors[name]) setParentErrors(p => { const n={...p}; delete n[name]; return n; });
  };

  const validateParentForm = (data) => {
    const e = {};
    if (!data.firstName.trim()) e.firstName = "First Name is required.";
    if (!data.lastName.trim()) e.lastName = "Last Name is required.";
    if (!data.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = "Email is invalid.";
    if (!data.contactNumber.trim()) e.contactNumber = "Contact Number is required.";
    if (!data.relation.trim()) e.relation = "Relation is required";
    if (!data.studentId.trim()) e.studentId = "Student ID is required.";
    return e;
  };

  const resetParentForm = () => {
    setParentFormData({ firstName:"",lastName:"",email:"",relation:"",contactNumber:"",studentId:"" });
    setParentDocuments({ aadharCard:null,panCard:null }); setParentErrors({});
  };

  const handleParentSubmit = async () => {
    const errs = validateParentForm(parentFormData); if (Object.keys(errs).length) { setParentErrors(errs); return; }
    setParentLoading(true);
    try {
      await registerParentAPI(parentFormData);
      setRefreshTrigger(p => p + 1); resetParentForm();
      toast.success(`Parent registered! Instructions sent to ${parentFormData.email}`);
    } catch (e) { toast.error(e.message || "Error registering parent."); }
    finally { setParentLoading(false); }
  };

  const handleViewDetails = (studentId) => {
    const s = students.find(s => s.id === studentId);
    if (s) { setStudentDetailsData(s); setShowDetailsModal(true); }
  };

  const getBedsForRoom = (roomNumber) =>
    roomNumber ? availableRooms.filter(b => b.roomNo === roomNumber) : availableRooms;

  const getFeeStatusStyle = (status) => ({
    width:"120px", height:"26px", display:"inline-flex", alignItems:"center", justifyContent:"center",
    borderRadius:"8px", fontFamily:"Poppins", fontWeight:"600", textAlign:"center", fontSize:"12px",
    background: status==="Paid"?"#22C55E":status==="Unpaid"?"#FF9D00":status==="Partial"?"#F59E0B":"#e5e7eb",
    color: ["Paid","Unpaid","Partial"].includes(status)?"#FFFFFF":"#000000",
  });

  const inputStyle = { height:"40px", background:"#FFFFFF", boxShadow:"0px 4px 10px rgba(0,0,0,0.25)", borderRadius:"10px", color:"#000", border:"none", outline:"none" };
  const labelStyle = { fontFamily:"Poppins", fontWeight:"500", fontSize:"18px", lineHeight:"100%", textAlign:"left" };

  // ── Filtered + Paginated ───────────────────────────────────────────────────
  const filteredStudents = students.filter(s => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Paid Fees") return s.feeStatus === "Paid";
    if (activeFilter === "Pending Fees") return ["Pending","Unpaid","Partial"].includes(s.feeStatus);
    if (activeFilter === "Room Assigned") return s.room && s.room !== "Not Assigned";
    if (activeFilter === "Not Assigned") return !s.room || s.room === "Not Assigned";
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (n) => {
    setCurrentPage(n);
    document.getElementById("student-list-section")?.scrollIntoView({ behavior:"smooth" });
  };

  // ── Form JSX ──────────────────────────────────────────────────────────────
  const ChevronDown = () => (
    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
    </svg>
  );

  const formContent = (isEditMode) => (
    <>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6" style={{ fontFamily:"Inter", fontWeight:"700" }}>
        {isEditMode ? "Edit Student & Allot Bed" : "Register New Student & Allot Bed"}
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
              {studentDocuments.aadharCard && !(studentDocuments.aadharCard instanceof File) && hasDocument(studentDocuments.aadharCard) && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-green-700 font-medium">✓ {getDocumentName(studentDocuments.aadharCard)}</span>
                  <button type="button" onClick={() => window.open(getDocumentUrl(editingStudent,"aadharCard"),"_blank")} className="text-xs text-blue-600 underline">View Uploaded</button>
                </div>
              )}
              <input type="file" accept="image/*" onChange={e => handleDocumentUpload(e,"aadhar","student")} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" disabled={ocrLoading} />
              {studentDocuments.aadharCard instanceof File && <p className="text-xs text-green-600 mt-1">✓ {studentDocuments.aadharCard.name}</p>}
            </div>

            {/* College ID checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" checked={!formData.hasCollegeId} onChange={e => setFormData(p=>({...p,hasCollegeId:!e.target.checked}))} className="w-4 h-4" />
              <label className="text-sm font-medium text-black">College ID Card Not Received Yet</label>
            </div>

            {formData.hasCollegeId && (
              <div>
                <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>Student ID Card</label>
                {studentDocuments.studentIdCard && !(studentDocuments.studentIdCard instanceof File) && hasDocument(studentDocuments.studentIdCard) && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-green-700 font-medium">✓ {getDocumentName(studentDocuments.studentIdCard)}</span>
                    <button type="button" onClick={() => window.open(getDocumentUrl(editingStudent,"studentIdCard"),"_blank")} className="text-xs text-blue-600 underline">View Uploaded</button>
                  </div>
                )}
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setStudentDocuments(p=>({...p,studentIdCard:e.target.files[0]}))} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" />
                {studentDocuments.studentIdCard instanceof File && <p className="text-xs text-green-600 mt-1">✓ {studentDocuments.studentIdCard.name}</p>}
              </div>
            )}

            {!formData.hasCollegeId && (
              <div>
                <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>Fees Receipt</label>
                {studentDocuments.feesReceipt && !(studentDocuments.feesReceipt instanceof File) && hasDocument(studentDocuments.feesReceipt) && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-green-700 font-medium">✓ {getDocumentName(studentDocuments.feesReceipt)}</span>
                    <button type="button" onClick={() => window.open(getDocumentUrl(editingStudent,"feesReceipt"),"_blank")} className="text-xs text-blue-600 underline">View Uploaded</button>
                  </div>
                )}
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setStudentDocuments(p=>({...p,feesReceipt:e.target.files[0]}))} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" />
                {studentDocuments.feesReceipt instanceof File && <p className="text-xs text-green-600 mt-1">✓ {studentDocuments.feesReceipt.name}</p>}
                <p className="text-xs text-gray-600 mt-1">Temporary document until student gets college ID card</p>
              </div>
            )}

            {ocrLoading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width:`${ocrProgress}%` }} />
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

        {/* Is Working */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Is Working</label>
          <div className="flex items-center gap-4 h-[40px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="isWorking" checked={formData.isWorking === true} onChange={() => setFormData(p => ({ ...p, isWorking: true }))} className="w-4 h-4 cursor-pointer" />
              <span className="text-black font-semibold text-[14px]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="isWorking" checked={formData.isWorking === false} onChange={() => setFormData(p => ({ ...p, isWorking: false }))} className="w-4 h-4 cursor-pointer" />
              <span className="text-black font-semibold text-[14px]">No</span>
            </label>
          </div>
        </div>

        {/* Room Number */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px]">Room Number</label>
          <div className="relative h-[40px]">
            <select name="roomNumber" value={formData.roomNumber} onChange={e => { handleInputChange(e); setFormData(p=>({...p,bedNumber:""})); }} className="w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins]" style={{ WebkitAppearance:"none", boxShadow:"0px 4px 10px 0px #00000040", color: formData.roomNumber===""?"#0000008A":"#000" }}>
              <option value="" disabled hidden>Select Room</option>
              {availableRoomNumbers.map(r => <option key={r._id} value={r._id}>Room {r._id} - Floor {r.floor}</option>)}
            </select>
            <ChevronDown />
          </div>
        </div>

        {/* Bed Number */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px]">Bed Number</label>
          <div className="relative h-[40px]">
            <select name="bedNumber" value={formData.bedNumber} onChange={handleInputChange} disabled={!formData.roomNumber} className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins] ${!formData.roomNumber?"cursor-not-allowed opacity-60":""}`} style={{ WebkitAppearance:"none", boxShadow:"0px 4px 10px 0px #00000040", color: formData.bedNumber===""?"#0000008A":"#000" }}>
              <option value="" disabled hidden>{!formData.roomNumber?"Select Room First":"Select Bed"}</option>
              {getBedsForRoom(formData.roomNumber).map(b => <option key={b._id} value={b._id}>{b.itemName}</option>)}
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

        {/* Fee Status */}
        <div className="w-full px-2">
          <label className="block mb-2 text-black ml-2" style={labelStyle}>Fee Status</label>
          <div className="relative w-[300px] max-w-full h-[40px]">
            <select name="feeStatus" value={formData.feeStatus} onChange={handleInputChange} className="w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins]" style={{ WebkitAppearance:"none", boxShadow:"0px 4px 10px 0px #00000040", color: formData.feeStatus===""?"#0000008A":"#000" }}>
              <option value="" disabled hidden>Select Fee Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
            <ChevronDown />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={isEditMode ? handleUpdate : handleSubmit} disabled={loading} className={`mt-6 px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] font-semibold text-[15px] cursor-pointer ${loading?"opacity-50 cursor-not-allowed":""}`}>
          {loading ? (isEditMode?"Updating...":"Registering...") : (isEditMode?"Update Student":"Register Student")}
        </button>
        {isEditMode && <button type="button" onClick={resetForm} disabled={loading} className="mt-6 px-6 py-2 bg-gray-400 text-white rounded-[10px] shadow font-medium hover:bg-gray-500 transition-colors cursor-pointer">Cancel</button>}
      </div>
    </>
  );

  const parentFormContent = () => (
    <>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6" style={{ fontFamily:"Inter", fontWeight:"700" }}>Register Parent Account</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {[
          { name:"firstName", label:"First Name", type:"text", placeholder:"Enter First Name", error: parentErrors.firstName },
          { name:"lastName",  label:"Last Name",  type:"text", placeholder:"Enter Last Name",  error: parentErrors.lastName },
          { name:"email",     label:"E-Mail",     type:"email",placeholder:"Enter E-Mail",     error: parentErrors.email },
          { name:"contactNumber", label:"Contact Number", type:"tel", placeholder:"Enter Phone Number", error: parentErrors.contactNumber },
          { name:"relation",  label:"Relation",   type:"text", placeholder:"Enter relation to the student", error: parentErrors.relation },
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
            {["aadhar","pan"].map(type => (
              <div key={type}>
                <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>{type === "aadhar" ? "Aadhar Card" : "PAN Card"}</label>
                <input type="file" accept="image/*" onChange={e => handleDocumentUpload(e,type,"parent")} className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300" disabled={ocrLoading} />
                {parentDocuments[type==="aadhar"?"aadharCard":"panCard"] && <p className="text-xs text-green-600 mt-1">✓ {parentDocuments[type==="aadhar"?"aadharCard":"panCard"].name}</p>}
              </div>
            ))}
            {ocrLoading && (
              <div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{width:`${ocrProgress}%`}}/></div><p className="text-xs text-center mt-1">Processing... {ocrProgress}%</p></div>
            )}
          </div>
        </div>

        {/* Student ID */}
        <div className="w-full px-2 md:col-span-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>Student ID</label>
          <div className="relative h-[40px]">
            <select name="studentId" value={parentFormData.studentId} onChange={handleParentInputChange} className="w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] font-semibold font-[Poppins]" style={{ WebkitAppearance:"none", boxShadow:"0px 4px 10px 0px #00000040", color:parentFormData.studentId===""?"#0000008A":"#000" }}>
              <option value="" disabled hidden>Select Student ID</option>
              {studentsWithoutParents.map(s => <option key={s.studentId} value={s.studentId}>{s.studentId} - {s.firstName} {s.lastName}</option>)}
            </select>
            <ChevronDown />
          </div>
          {parentErrors.studentId && <p className="text-red-500 text-xs mt-1 ml-2">{parentErrors.studentId}</p>}
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handleParentSubmit} disabled={parentLoading} className={`mt-6 px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] font-semibold text-[15px] cursor-pointer ${parentLoading?"opacity-50 cursor-not-allowed":""}`}>
          {parentLoading ? "Registering..." : "Register Parent"}
        </button>
      </div>
    </>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white min-h-screen" style={{ fontFamily:"Poppins", fontWeight:"500" }}>
      <div className="p-4 sm:p-6 lg:p-10">

        {/* ── Header ── */}
        <div className="w-full max-w-7xl mx-auto mb-6 px-4">
          <h1 className="text-[25px] leading-[25px] font-extrabold text-black text-left" style={{ fontFamily:"Inter" }}>
            <span className="border-l-4 border-[#4F8CCF] pl-2 inline-flex items-center h-[25px]">Student Management</span>
          </h1>
        </div>

        {/* ── STATS CARDS (TOP) ── */}
        <div className="w-full max-w-7xl mx-auto mb-8 px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STAT_CARDS.map(card => (
              <StatCard
                key={card.key}
                icon={card.icon}
                label={card.label}
                value={card.value}
                accent={card.accent}
                isActive={activeFilter === card.key}
                onClick={() => setActiveFilter(prev => prev === card.key ? "All" : card.key)}
                total={stats.total}
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
          <div className="w-full max-w-7xl mx-auto mb-10">
            <div className="flex mb-4 gap-3">
              {["student","parent"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-[12px] font-semibold transition-colors text-sm ${activeTab===tab?"bg-[#BEC5AD] text-black shadow-md border border-[#4F8CCF]/50":"bg-gray-200 text-gray-600 hover:bg-gray-300"}`} style={{ fontFamily:"Poppins" }}>
                  {tab === "student" ? "Register Student" : "Register Parent"}
                </button>
              ))}
            </div>
            <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8" style={{ boxShadow:"0px 4px 20px 0px #00000040 inset" }}>
              {activeTab === "student" ? formContent(false) : parentFormContent()}
            </div>
          </div>
        )}

        {/* ── Edit Modal ── */}
        {showEditModal && editingStudent && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto" style={{ boxShadow:"0px 4px 20px 0px #00000040 inset" }}>
              <button onClick={resetForm} className="absolute top-4 right-4 text-black hover:text-gray-700 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              {formContent(true)}
            </div>
          </div>
        )}

        {/* ── Details Modal ── */}
        {showDetailsModal && studentDetailsData && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto" style={{ boxShadow:"0px 4px 20px 0px #00000040 inset" }}>
              <button onClick={() => { setShowDetailsModal(false); setStudentDetailsData(null); }} className="absolute top-4 right-4 text-black hover:text-gray-700 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <h2 className="text-xl font-bold text-black mb-6" style={{ fontFamily:"Inter" }}>Student Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                {[
                  ["Student ID", studentDetailsData.id],
                  ["Student Name", studentDetailsData.name],
                  ["Contact Number", studentDetailsData.contact],
                  ["Email", studentDetailsData.email || "N/A"],
                  ["Room/Bed", studentDetailsData.room],
                  ["Emergency Contact", studentDetailsData.emergencyContactNumber || "N/A"],
                  ["Admission Date", studentDetailsData.admissionDate || "N/A"],
                  ["Emergency Contact Name", studentDetailsData.emergencyContactName || "N/A"],
                ].map(([k,v]) => (
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
                <h3 className="text-base font-bold text-black mb-3" style={{ fontFamily:"Inter" }}>Uploaded Documents</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[["Aadhar Card","aadharCard"],["PAN Card","panCard"],["Student ID Card","studentIdCard"],["Fees Receipt","feesReceipt"]].map(([label,key]) => (
                    <div key={key} className="bg-white/50 rounded-lg p-3">
                      <p className="font-semibold text-black text-sm mb-2">{label}</p>
                      {hasDocument(studentDetailsData.documents?.[key]) ? (
                        <button onClick={() => window.open(getDocumentUrl(studentDetailsData.id,key),"_blank")} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-semibold">View Document</button>
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

        {/* ── Student List ── */}
        <div id="student-list-section" className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-4 sm:px-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black" style={{ fontFamily:"Inter" }}>
              Student List
              {activeFilter !== "All" && <span className="text-[#4F8CCF] text-lg ml-2 font-semibold">— {activeFilter}</span>}
            </h2>
          </div>

          <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 px-4 sm:px-0" style={{ boxShadow:"0px 4px 4px 0px #00000040 inset" }}>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="border border-black rounded-[19.6px] overflow-hidden">
                <div className="bg-white text-black grid grid-cols-7 text-center">
                  {["Student ID","Name","Room/Bed","Contact","Fees Status","Dues","Action"].map((h,i) => (
                    <div key={h} className="px-2 py-3 relative flex justify-center items-center" style={{ fontFamily:"Poppins", fontWeight:"600", fontSize:"14px" }}>
                      <span className="w-full break-words">{h}</span>
                      {i < 6 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-5 border border-black"/>}
                    </div>
                  ))}
                </div>
                <div className="bg-[#BEC5AD] text-center text-sm flex flex-col gap-y-2 p-2 font-[Poppins] font-medium">
                  {currentStudents.length === 0 && (
                    <div className="py-8 text-center text-gray-600 font-medium">No students found for this filter.</div>
                  )}
                  {currentStudents.map((s, i) => (
                    <div key={s.id} className="text-black grid grid-cols-7 items-center border-b border-black/10 last:border-0 pb-2">
                      <div className="px-2 py-2 break-words text-xs">{s.id}</div>
                      <div className="px-2 py-2 break-words">{s.name}</div>
                      <div className="px-2 py-2 break-words leading-tight text-xs">{s.room}</div>
                      <div className="px-2 py-2 text-xs break-words">{s.contact}</div>
                      <div className="px-2 py-2 flex justify-center"><span style={getFeeStatusStyle(s.feeStatus)}>{s.feeStatus}</span></div>
                      <div className="px-2 py-2">{s.dues}</div>
                      <div className="px-2 py-2 flex justify-center gap-3">
                        <button onClick={() => handleViewDetails(s.id)} className="hover:scale-110 transition-transform" title="View Details"><Eye size={22} strokeWidth={2.5}/></button>
                        <div className="w-px h-5 bg-black self-center"/>
                        <button onClick={() => handleEdit(s.id)} className="hover:scale-110 transition-transform" title="Edit Student">
                          <svg width="22" height="22" viewBox="0 0 27 26" fill="none"><mask id={`m${i}`} style={{maskType:"alpha"}} maskUnits="userSpaceOnUse" x="0" y="0" width="27" height="26"><rect x=".678" y=".025" width="25.736" height="25.736" fill="#D9D9D9"/></mask><g mask={`url(#m${i})`}><path d="M2.824 25.761V21.472h21.446v4.289H2.824ZM7.113 17.182h1.501l8.364-8.337-1.528-1.528-8.337 8.365v1.5ZM4.968 19.327V14.77l12.01-11.983c.197-.197.425-.348.683-.462.26-.113.532-.17.818-.17.286 0 .563.057.831.17.268.107.51.268.725.482l1.474 1.501c.215.197.371.429.469.697.098.268.147.545.147.831 0 .268-.049.504-.147.763-.098.26-.254.497-.469.712L9.526 19.327H4.968Z" fill="#1C1B1F"/></g></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {currentStudents.length === 0 && <p className="text-center text-gray-600 py-8">No students found for this filter.</p>}
              {currentStudents.map((s, i) => (
                <div key={s.id} className="bg-white rounded-xl p-4 border border-black/10 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-base text-black">{s.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">ID: {s.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewDetails(s.id)} className="p-2 bg-[#BEC5AD] rounded-lg hover:bg-[#A4B494] transition-colors"><Eye size={16}/></button>
                      <button onClick={() => handleEdit(s.id)} className="p-2 bg-[#BEC5AD] rounded-lg hover:bg-[#A4B494] transition-colors">
                        <svg width="16" height="16" viewBox="0 0 27 26" fill="none"><mask id={`mm${i}`} style={{maskType:"alpha"}} maskUnits="userSpaceOnUse" x="0" y="0" width="27" height="26"><rect x=".678" y=".025" width="25.736" height="25.736" fill="#D9D9D9"/></mask><g mask={`url(#mm${i})`}><path d="M2.824 25.761V21.472h21.446v4.289H2.824ZM7.113 17.182h1.501l8.364-8.337-1.528-1.528-8.337 8.365v1.5ZM4.968 19.327V14.77l12.01-11.983c.197-.197.425-.348.683-.462.26-.113.532-.17.818-.17.286 0 .563.057.831.17.268.107.51.268.725.482l1.474 1.501c.215.197.371.429.469.697.098.268.147.545.147.831 0 .268-.049.504-.147.763-.098.26-.254.497-.469.712L9.526 19.327H4.968Z" fill="#1C1B1F"/></g></svg>
                      </button>
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
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredStudents.length > itemsPerPage && (
              <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
                <button onClick={() => paginate(currentPage-1)} disabled={currentPage===1} className={`px-4 py-2 rounded-lg border border-black font-semibold text-sm transition-colors ${currentPage===1?"opacity-30 cursor-not-allowed":"hover:bg-white"}`}>← Prev</button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_,i) => (
                    <button key={i+1} onClick={() => paginate(i+1)} className={`w-9 h-9 rounded-lg border border-black font-semibold text-sm transition-colors ${currentPage===i+1?"bg-white shadow-md":"hover:bg-white/50"}`}>{i+1}</button>
                  ))}
                </div>
                <button onClick={() => paginate(currentPage+1)} disabled={currentPage===totalPages} className={`px-4 py-2 rounded-lg border border-black font-semibold text-sm transition-colors ${currentPage===totalPages?"opacity-30 cursor-not-allowed":"hover:bg-white"}`}>Next →</button>
                <span className="text-sm text-black font-medium ml-2">{currentPage}/{totalPages || 1} · {filteredStudents.length} students</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default StudentManagement;