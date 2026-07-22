"use client";

import { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  Eye,
  X,
  Users,
  Shield,
  Sparkles,
  MoreHorizontal,
  Sun,
  Moon,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  CreditCard,
  PlusCircle,
  RefreshCw,
  Clock
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = process.env.NEXT_PUBLIC_PROD_API_URL;

const StaffAllotment = () => {
  const [activeTab, setActiveTab] = useState("warden");
  const [refresh, setRefresh] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [wardenLoading, setWardenLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", wardenId: "", contactNumber: "",
    emailId: "", designation: "", otherDesignation: "", shiftStart: "", shiftEnd: "", salary: "",
    aadharCard: null, panCard: null,
  });

  const [editFormData, setEditFormData] = useState({
    firstName: "", lastName: "", wardenId: "", contactNumber: "",
    emailId: "", designation: "", otherDesignation: "", shiftStart: "", shiftEnd: "", salary: "",
    aadharCard: null, panCard: null,
  });

  const [wardens, setWardens] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedWarden, setSelectedWarden] = useState(null);

  const fetchWardens = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/wardenauth/all`);
      const formattedData = response.data.wardens.map((warden) => ({
        id: warden._id,
        firstName: warden.firstName, lastName: warden.lastName,
        name: `${warden.firstName} ${warden.lastName}`,
        email: warden.email, contactNumber: warden.contactNumber,
        wardenId: warden.wardenId, salary: warden.salary || 0,
        isAddedToBiometric: warden.isAddedToBiometric,
        aadharCard: warden.aadharCard, panCard: warden.panCard,
      }));
      setWardens(formattedData);
    } catch (error) { console.error(error); }
  };

  const fetchStaffs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/staffauth/all`);
      const formattedData = response.data.staffs.map((staff) => ({
        id: staff._id,
        firstName: staff.firstName, lastName: staff.lastName,
        name: `${staff.firstName} ${staff.lastName}`,
        email: staff.email, contactNumber: staff.contactNumber,
        designation: staff.designation, shiftStart: staff.shiftStart, shiftEnd: staff.shiftEnd,
        salary: staff.salary || 0, status: staff.status || 'Approved',
        isAddedToBiometric: staff.isAddedToBiometric,
        aadharCard: staff.aadharCard, panCard: staff.panCard,
      }));
      setStaffs(formattedData);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true);
      await Promise.all([fetchWardens(), fetchStaffs()]);
      setIsFetching(false);
    };
    loadData();
  }, [refresh]);

  const handleUpdateStaffStatus = async (staffId, status) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/adminauth/staff-status/${staffId}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
      });
      toast.success(response.data.message);
      setRefresh(prev => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || `Error updating staff status`);
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (["firstName", "lastName"].includes(name)) value = value.replace(/[^A-Za-z\s]/g, "");
    if (name === "contactNumber") value = value.replace(/\D/g, "").slice(0, 10);
    if (name === "salary") value = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    let { name, value } = e.target;
    if (["firstName", "lastName"].includes(name)) value = value.replace(/[^A-Za-z\s]/g, "");
    if (name === "contactNumber") value = value.replace(/\D/g, "").slice(0, 10);
    if (name === "salary") value = value.replace(/\D/g, "");
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStaffForm = (data) => {
    if (!data.firstName.trim() || !/^[A-Za-z\s]+$/.test(data.firstName)) return "First Name must contain only letters and is required.";
    if (!data.lastName.trim() || !/^[A-Za-z\s]+$/.test(data.lastName)) return "Last Name must contain only letters and is required.";
    if (!data.emailId.trim() || !/\S+@\S+\.\S+/.test(data.emailId)) return "Valid Email is required.";
    if (data.salary === "" || Number(data.salary) < 0) return "Salary Amount cannot be negative.";
    return null;
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleEditFileChange = (e) => {
    const { name, files } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setFormData({
      firstName: "", lastName: "", wardenId: "", contactNumber: "",
      emailId: "", designation: "", otherDesignation: "", shiftStart: "", shiftEnd: "", salary: "",
      aadharCard: null, panCard: null,
    });
  };

  const getShiftType = (shiftStart) => {
    if (!shiftStart) return null;
    const h = parseInt(shiftStart.split(":")[0]);
    return h >= 6 && h < 18 ? "morning" : "night";
  };

  const handleRegisterWarden = async () => {
    const errorMsg = validateStaffForm(formData);
    if (errorMsg) return toast.error(errorMsg);
    setWardenLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(k => {
        if (formData[k]) {
          if (k === 'emailId') {
            payload.append('email', formData[k]);
          } else {
            payload.append(k, formData[k]);
          }
        }
      });
      const response = await axios.post(`${BASE_URL}/api/adminauth/register-warden`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(response.data.message);
      setRefresh((prev) => prev + 1);
      handleTabSwitch("warden");
    } catch (error) { toast.error(error.response?.data?.message || "Error registering warden"); } finally { setWardenLoading(false); }
  };

  const handleRegisterStaff = async () => {
    const errorMsg = validateStaffForm(formData);
    if (errorMsg) return toast.error(errorMsg);
    setStaffLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(k => {
        if (k === 'designation' && formData.designation === 'Other') payload.append(k, formData.otherDesignation);
        else if (formData[k]) {
          if (k === 'emailId') {
            payload.append('email', formData[k]);
          } else {
            payload.append(k, formData[k]);
          }
        }
      });
      const response = await axios.post(`${BASE_URL}/api/adminauth/register-staff`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(response.data.message);
      setRefresh((prev) => prev + 1);
      handleTabSwitch("staff");
    } catch (error) { toast.error(error.response?.data?.message || "Error registering staff"); } finally { setStaffLoading(false); }
  };

  const handleUpdateWarden = async () => {
    const errorMsg = validateStaffForm(editFormData);
    if (errorMsg) return toast.error(errorMsg);
    try {
      const payload = new FormData();
      Object.keys(editFormData).forEach(k => { if (editFormData[k]) payload.append(k, editFormData[k]); });
      await axios.put(`${BASE_URL}/api/wardenauth/update/${selectedId}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Warden updated successfully");
      setRefresh((prev) => prev + 1);
      setShowEditModal(false);
    } catch (error) { toast.error("Error updating warden"); }
  };

  const handleUpdateStaff = async () => {
    const errorMsg = validateStaffForm(editFormData);
    if (errorMsg) return toast.error(errorMsg);
    try {
      const payload = new FormData();
      Object.keys(editFormData).forEach(k => {
        if (k === 'designation' && editFormData.designation === 'Other') payload.append(k, editFormData.otherDesignation);
        else if (editFormData[k]) payload.append(k, editFormData[k]);
      });
      await axios.put(`${BASE_URL}/api/staffauth/update/${selectedId}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Staff updated successfully");
      setRefresh((prev) => prev + 1);
      setShowEditModal(false);
    } catch (error) { toast.error("Error updating staff"); }
  };

  const confirmDelete = async () => {
    try {
      if (activeTab === "warden") {
        await axios.delete(`${BASE_URL}/api/wardenauth/delete/${selectedId}`);
        toast.success("Warden deleted successfully");
      } else {
        await axios.delete(`${BASE_URL}/api/staffauth/delete/${selectedId}`);
        toast.success("Staff deleted successfully");
      }
      setRefresh((prev) => prev + 1);
    } catch (error) { toast.error("Error deleting record"); }
    setShowDeleteModal(false);
  };

  const wardenStats = [
    { label: "Total Wardens", value: wardens.length },
    { label: "Active", value: wardens.length },
    { label: "Total Staff Managed", value: staffs.length },
  ];

  const staffStats = [
    { label: "Total Staff", value: staffs.length },
    { label: "Watchmen", value: staffs.filter((s) => s.designation === "Watchman").length },
    { label: "Cleaners", value: staffs.filter((s) => s.designation === "Cleaner").length },
    { label: "Others", value: staffs.filter((s) => s.designation === "Other" || !["Watchman", "Cleaner"].includes(s.designation)).length },
  ];

  const statsToRender = activeTab === "warden" ? wardenStats : staffStats;

  const renderEditPreview = (fileData) => {
    if (!fileData) return null;
    let url = '';
    let isPdf = false;
    if (typeof fileData === 'string') {
      url = `${BASE_URL}/${fileData}`;
      isPdf = fileData.toLowerCase().endsWith('.pdf');
    } else if (fileData instanceof File) {
      url = URL.createObjectURL(fileData);
      isPdf = fileData.type === 'application/pdf';
    }
    
    if (!url) return null;

    return (
      <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-white shadow-sm relative">
        {isPdf ? (
          <iframe src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-[150%] pointer-events-none transform origin-top" title="Preview" />
        ) : (
          <img src={url} className="w-full h-full object-cover" alt="Preview" />
        )}
      </div>
    );
  };

  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-4 font-sans">
      <div className="w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
              <h1 className="text-[25px] leading-[25px] font-extrabold text-black flex items-center" style={{ fontFamily: 'Inter' }}>
                Staff Allotment
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 text-sm ml-3" style={{ fontFamily: 'Poppins' }}>
              Manage wardens and staff members seamlessly
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 ml-3">
          <button
            onClick={() => handleTabSwitch("warden")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
              activeTab === "warden" ? "bg-[#ADCE8C] text-black" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Manage Wardens
          </button>
          <button
            onClick={() => handleTabSwitch("staff")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
              activeTab === "staff" ? "bg-[#ADCE8C] text-black" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Manage Staff
          </button>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8`}>
          {statsToRender.map((stat, i) => {
            const styles = [
              { bg: 'bg-white', border: 'border-gray-200', label: 'text-gray-500', val: 'text-gray-800' },
              { bg: 'bg-amber-50', border: 'border-amber-200', label: 'text-amber-600', val: 'text-amber-700' },
              { bg: 'bg-blue-50', border: 'border-blue-200', label: 'text-blue-600', val: 'text-blue-700' },
              { bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'text-emerald-600', val: 'text-emerald-700' },
            ];
            const s = styles[i % styles.length];
            return (
              <div key={i} className={`${s.bg} p-4 rounded-xl shadow-sm border ${s.border}`}>
                <p className={`${s.label} text-sm font-medium`}>{stat.label}</p>
                <p className={`${s.val} text-2xl font-bold mt-1`}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Registration Form */}
        <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-8 border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter' }}>
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Register New {activeTab === "warden" ? "Warden" : "Staff"}
              </h2>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] focus:ring-1 focus:ring-[#4F8CCF] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] focus:ring-1 focus:ring-[#4F8CCF] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Contact Number</label>
              <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="9876543210" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] focus:ring-1 focus:ring-[#4F8CCF] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Address</label>
              <input type="email" name="emailId" value={formData.emailId} onChange={handleInputChange} placeholder="john@example.com" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] focus:ring-1 focus:ring-[#4F8CCF] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Salary Amount (₹)</label>
              <input type="text" name="salary" value={formData.salary} onChange={handleInputChange} placeholder="15000" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] focus:ring-1 focus:ring-[#4F8CCF] text-sm" />
            </div>

            {activeTab === "staff" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Designation</label>
                  <select name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] focus:ring-1 focus:ring-[#4F8CCF] text-sm">
                    <option value="">Select Designation</option>
                    <option value="Watchman">Watchman</option>
                    <option value="Cleaner">Cleaner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {formData.designation === "Other" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Specify Designation</label>
                    <input type="text" name="otherDesignation" value={formData.otherDesignation} onChange={handleInputChange} placeholder="e.g. Cook" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] focus:ring-1 focus:ring-[#4F8CCF] text-sm" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Shift Timings</label>
                  <div className="flex gap-2">
                    <input type="time" name="shiftStart" value={formData.shiftStart} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] text-sm" />
                    <span className="self-center font-bold text-gray-400">to</span>
                    <input type="time" name="shiftEnd" value={formData.shiftEnd} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#4F8CCF] text-sm" />
                  </div>
                </div>
              </>
            )}

            <div className="sm:col-span-2 mt-2">
              <h3 className="text-sm font-bold text-gray-800 mb-3 block">Upload Documents (Required: Aadhar & PAN)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Aadhar Card</label>
                  <input type="file" name="aadharCard" onChange={handleFileChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#BEC5AD] file:text-black hover:file:bg-[#a8b096] cursor-pointer transition-colors" accept="image/*,.pdf" />
                  {renderEditPreview(formData.aadharCard)}
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">PAN Card</label>
                  <input type="file" name="panCard" onChange={handleFileChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#BEC5AD] file:text-black hover:file:bg-[#a8b096] cursor-pointer transition-colors" accept="image/*,.pdf" />
                  {renderEditPreview(formData.panCard)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/50 px-6 py-4 flex justify-end border-t border-[#BEC5AD]/30">
            <button
              onClick={activeTab === "warden" ? handleRegisterWarden : handleRegisterStaff}
              disabled={wardenLoading || staffLoading}
              className="px-6 py-2.5 bg-black text-white font-bold rounded-xl shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {(wardenLoading || staffLoading) ? "Registering..." : `Register ${activeTab === "warden" ? "Warden" : "Staff"}`}
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-[#f4f6f0] rounded-2xl shadow-lg overflow-hidden mb-6 border border-[#BEC5AD]/30" style={{ fontFamily: 'Inter' }}>
          <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Manage {activeTab === "warden" ? "Wardens" : "Staff"}
              </h2>
              <p className="text-sm text-gray-700 mt-1">Total: {(activeTab === "warden" ? wardens : staffs).length} records</p>
            </div>
            <button 
              onClick={() => setRefresh(r => r + 1)} 
              disabled={isFetching}
              className={`p-2 bg-white shadow-sm border border-gray-200 rounded-xl text-black transition-all flex-shrink-0 mt-4 sm:mt-0 ${isFetching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`} 
              title="Refresh"
            >
              <RefreshCw size={18} className={isFetching ? "animate-spin text-gray-400" : ""} />
            </button>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left bg-white rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Name & ID</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Contact Details</th>
                  {activeTab === "staff" && <th className="px-4 py-3 text-sm font-semibold text-gray-700">Role & Shift</th>}
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Salary & Bio</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === "warden" ? wardens : staffs).map((person) => (
                  <tr key={person.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase">
                          {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{person.name}</p>
                          {activeTab === "warden" && <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {person.wardenId}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-600">{person.email}</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{person.contactNumber}</p>
                    </td>
                    {activeTab === "staff" && (
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider border rounded-full mb-1">{person.designation}</span>
                        <div className="text-xs font-semibold text-gray-600 flex items-center gap-1 mt-1">
                          {getShiftType(person.shiftStart) === 'morning' ? <Sun size={12}/> : <Moon size={12}/>}
                          {person.shiftStart || '-'} to {person.shiftEnd || '-'}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-emerald-600 mb-1">₹{Number(person.salary).toLocaleString('en-IN')}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${person.isAddedToBiometric ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                        {person.isAddedToBiometric ? <><CheckCircle size={10}/> Biometric Linked</> : <><AlertCircle size={10}/> Pending Bio</>}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => { setSelectedWarden(person); setShowViewModal(true); }} className="text-gray-400 hover:text-blue-500 transition-colors"><Eye size={18} /></button>
                        <button onClick={() => { 
                          activeTab === "warden" ? setEditFormData(person) : setEditFormData(person); 
                          setSelectedId(person.id); setShowEditModal(true); 
                        }} className="text-gray-400 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => { setSelectedId(person.id); setShowDeleteModal(true); }} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(activeTab === "warden" ? wardens : staffs).length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500 font-medium">
                      No {activeTab === "warden" ? "wardens" : "staff"} registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        {showViewModal && selectedWarden && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden font-sans">
              <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <Shield size={20} />
                  {activeTab === "warden" ? "Warden Details" : "Staff Details"}
                </h2>
                <button onClick={() => setShowViewModal(false)} className="text-black/70 hover:text-black transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold uppercase">
                    {selectedWarden.firstName.charAt(0)}{selectedWarden.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedWarden.name}</h3>
                    <p className="text-sm font-semibold text-gray-500 mt-1">{activeTab === "warden" ? `ID: ${selectedWarden.wardenId}` : selectedWarden.designation}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Email Address</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedWarden.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Contact Number</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedWarden.contactNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Salary</span>
                    <span className="text-sm font-bold text-green-600">₹{Number(selectedWarden.salary).toLocaleString('en-IN')}</span>
                  </div>
                  {activeTab === "staff" && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase">Shift Timing</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedWarden.shiftStart} - {selectedWarden.shiftEnd}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Biometric Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedWarden.isAddedToBiometric ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedWarden.isAddedToBiometric ? "Linked" : "Pending"}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div 
                      className={`p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col transition-colors ${selectedWarden.aadharCard ? 'cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 group' : ''}`}
                      onClick={() => selectedWarden.aadharCard && window.open(`${BASE_URL}/${selectedWarden.aadharCard}`, '_blank')}
                    >
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Aadhar Card</p>
                      {selectedWarden.aadharCard ? (
                        <>
                          <div className="w-full h-28 rounded-lg border border-gray-200 overflow-hidden bg-white mb-2 relative">
                            {selectedWarden.aadharCard.toLowerCase().endsWith('.pdf') ? (
                              <iframe src={`${BASE_URL}/${selectedWarden.aadharCard}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-[150%] pointer-events-none transform origin-top" title="Aadhar Preview" />
                            ) : (
                              <img src={`${BASE_URL}/${selectedWarden.aadharCard}`} className="w-full h-full object-cover" alt="Aadhar Card Preview" />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-blue-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm transition-opacity">Click to View</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600">View Full Document</span>
                        </>
                      ) : (
                        <div className="h-28 flex flex-col justify-center items-center opacity-50">
                          <span className="text-sm font-semibold text-gray-400">Not Uploaded</span>
                        </div>
                      )}
                    </div>
                    <div 
                      className={`p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col transition-colors ${selectedWarden.panCard ? 'cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 group' : ''}`}
                      onClick={() => selectedWarden.panCard && window.open(`${BASE_URL}/${selectedWarden.panCard}`, '_blank')}
                    >
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">PAN Card</p>
                      {selectedWarden.panCard ? (
                        <>
                          <div className="w-full h-28 rounded-lg border border-gray-200 overflow-hidden bg-white mb-2 relative">
                            {selectedWarden.panCard.toLowerCase().endsWith('.pdf') ? (
                              <iframe src={`${BASE_URL}/${selectedWarden.panCard}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-[150%] pointer-events-none transform origin-top" title="PAN Preview" />
                            ) : (
                              <img src={`${BASE_URL}/${selectedWarden.panCard}`} className="w-full h-full object-cover" alt="PAN Card Preview" />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-blue-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm transition-opacity">Click to View</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600">View Full Document</span>
                        </>
                      ) : (
                        <div className="h-28 flex flex-col justify-center items-center opacity-50">
                          <span className="text-sm font-semibold text-gray-400">Not Uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-2xl font-sans">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Delete {activeTab === "warden" ? "Warden" : "Staff"}</h3>
                <p className="text-sm text-gray-500 mb-6 font-medium">Are you sure you want to permanently delete this record? This action cannot be undone.</p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-sm">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal (Simulated basic structure) */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden font-sans max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <Edit2 size={20} /> Edit {activeTab === "warden" ? "Warden" : "Staff"}
                </h2>
                <button onClick={() => setShowEditModal(false)} className="text-black/70 hover:text-black transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">First Name</label>
                  <input type="text" name="firstName" value={editFormData.firstName} onChange={handleEditInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4F8CCF] text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Last Name</label>
                  <input type="text" name="lastName" value={editFormData.lastName} onChange={handleEditInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4F8CCF] text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Contact Number</label>
                  <input type="text" name="contactNumber" value={editFormData.contactNumber} onChange={handleEditInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4F8CCF] text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                  <input type="email" name="emailId" value={editFormData.emailId} onChange={handleEditInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4F8CCF] text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Salary</label>
                  <input type="text" name="salary" value={editFormData.salary} onChange={handleEditInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4F8CCF] text-sm font-semibold" />
                </div>
                
                {activeTab === "staff" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Designation</label>
                      <select name="designation" value={editFormData.designation} onChange={handleEditInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4F8CCF] text-sm font-semibold">
                        <option value="Watchman">Watchman</option>
                        <option value="Cleaner">Cleaner</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Shift Timings</label>
                      <div className="flex gap-2">
                        <input type="time" name="shiftStart" value={editFormData.shiftStart} onChange={handleEditInputChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                        <input type="time" name="shiftEnd" value={editFormData.shiftEnd} onChange={handleEditInputChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Update Aadhar</label>
                  <div className="flex items-center gap-3">
                    {renderEditPreview(editFormData.aadharCard)}
                    <input type="file" name="aadharCard" onChange={handleEditFileChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 cursor-pointer flex-1" accept="image/*,.pdf" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Update PAN</label>
                  <div className="flex items-center gap-3">
                    {renderEditPreview(editFormData.panCard)}
                    <input type="file" name="panCard" onChange={handleEditFileChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 cursor-pointer flex-1" accept="image/*,.pdf" />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
                <button onClick={activeTab === "warden" ? handleUpdateWarden : handleUpdateStaff} className="px-6 py-2.5 bg-black text-white font-bold rounded-xl shadow-sm hover:bg-gray-800">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable theme="colored"/>
    </div>
  );
};

export default StaffAllotment;