"use client";
import { useState, useRef } from "react";
import { Eye } from "lucide-react";
import axios from "axios";

// Configure axios base URL - adjust this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5224/api/adminauth';

const StudentManagement = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    contactNumber: "",
    email: "",
    roomBedNumber: "",
    emergencyContactNumber: "",
    admissionDate: "",
    emergencyContactName: "",
    feeStatus: "",
  });
  const dateInputRef = useRef(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [students, setStudents] = useState([
    {
      id: "STU-001",
      firstName: "Shahid",
      lastName: "Ansari",
      name: "Shahid Ansari",
      room: "Room-A-101",
      contact: "+91 8888888888",
      email: "shahid.ansari@example.com",
      emergencyContactNumber: "+91 9999999999",
      admissionDate: "15-08-2023",
      emergencyContactName: "Parent A",
      feeStatus: "In Use",
      dues: "₹ 2,000/-",
    },
    {
      id: "STU-002",
      firstName: "Ayesha",
      lastName: "Khan",
      name: "Ayesha Khan",
      room: "Room-A-101",
      contact: "+91 8888888888",
      email: "ayesha.khan@example.com",
      emergencyContactNumber: "+91 9999999998",
      admissionDate: "20-09-2023",
      emergencyContactName: "Parent B",
      feeStatus: "Available",
      dues: "₹ 2,000/-",
    },
  ]);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [studentDetailsData, setStudentDetailsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // API Functions
  const registerStudentAPI = async (studentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register-student`, studentData, {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if you have auth tokens
          // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to register student' };
    }
  };

  const updateStudentAPI = async (studentId, studentData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/update-student/${studentId}`, studentData, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update student' };
    }
  };

const fetchStudentsAPI = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/students?populate=roomBedNumber`, {
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch students' };
  }
};

const fetchAvailableRoomsAPI = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory/available-beds`, {
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch available rooms' };
  }
};

  const deleteStudentAPI = async (studentId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete-student/${studentId}`, {
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete student' };
    }
  };

  // Simple input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for the field being typed into
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation function
  const validateForm = (data, isEdit = false) => {
    const newErrors = {};
    if (!data.firstName.trim()) {
      newErrors.firstName = "First Name is required.";
    }
    if (!data.lastName.trim()) {
      newErrors.lastName = "Last Name is required.";
    }
    if (!data.studentId.trim()) {
      newErrors.studentId = "Student ID is required.";
    }
    if (!data.contactNumber.trim()) {
      newErrors.contactNumber = "Contact Number is required.";
    }
    // Email is required only for new registration, but validation for format applies to both if present
    if (!isEdit && !data.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (data.email.trim() && !/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Email is invalid.";
    }
    return newErrors;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      studentId: "",
      contactNumber: "",
      email: "",
      roomBedNumber: "",
      emergencyContactNumber: "",
      admissionDate: "",
      emergencyContactName: "",
      feeStatus: "",
    });
    setEditingStudent(null);
    setErrors({});
    setShowEditModal(false);
  };

  // Submit handler for new student registration
  const handleSubmit = async () => {
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Prepare data for backend (matching your backend structure)
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentId: formData.studentId,
        contactNumber: formData.contactNumber,
        roomBedNumber: formData.roomBedNumber || "Not Assigned",
        email: formData.email,
        admissionDate: formData.admissionDate,
        feeStatus: formData.feeStatus,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNumber: formData.emergencyContactNumber,
      };

      const response = await registerStudentAPI(studentData);
      
      // Add new student to local state
      const newStudent = {
        id: formData.studentId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        room: formData.roomBedNumber || "Not Assigned",
        contact: formData.contactNumber,
        email: formData.email,
        emergencyContactNumber: formData.emergencyContactNumber,
        admissionDate: formData.admissionDate,
        emergencyContactName: formData.emergencyContactName,
        feeStatus: formData.feeStatus === "Paid" ? "Available" : "In Use",
        dues: "₹ 0/-",
      };
      
      setStudents((prev) => [...prev, newStudent]);
      resetForm();
      alert(`Student registered successfully! Password: ${response.student?.password || 'Check email for credentials'}`);
    } catch (error) {
      console.error('Error registering student:', error);
      alert(error.message || 'Error registering student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Edit handler: pre-fills form and sets editing state
  const handleEdit = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setFormData({
        firstName: student.firstName || student.name?.split(' ')[0] || '',
        lastName: student.lastName || student.name?.split(' ').slice(1).join(' ') || '',
        studentId: student.id,
        contactNumber: student.contact,
        email: student.email || "",
        roomBedNumber: student.room,
        emergencyContactNumber: student.emergencyContactNumber || "",
        admissionDate: student.admissionDate || "",
        emergencyContactName: student.emergencyContactName || "",
        feeStatus: student.feeStatus === "Available" ? "Paid" : "Unpaid",
      });
      setEditingStudent(studentId);
      setErrors({});
      setShowEditModal(true);
    }
  };

  // Update handler for editing student
  const handleUpdate = async () => {
    const newErrors = validateForm(formData, true);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        roomBedNumber: formData.roomBedNumber,
        emergencyContactNumber: formData.emergencyContactNumber,
        admissionDate: formData.admissionDate,
        emergencyContactName: formData.emergencyContactName,
        feeStatus: formData.feeStatus,
      };

      await updateStudentAPI(editingStudent, studentData);

      // Update local state
      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingStudent
            ? {
                ...student,
                firstName: formData.firstName,
                lastName: formData.lastName,
                name: `${formData.firstName} ${formData.lastName}`,
                contact: formData.contactNumber,
                email: formData.email,
                room: formData.roomBedNumber || student.room,
                emergencyContactNumber: formData.emergencyContactNumber,
                admissionDate: formData.admissionDate,
                emergencyContactName: formData.emergencyContactName,
                feeStatus: formData.feeStatus === "Paid" ? "Available" : "In Use",
              }
            : student
        )
      );
      resetForm();
      alert("Student updated successfully!");
    } catch (error) {
      console.error('Error updating student:', error);
      alert(error.message || 'Error updating student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load students on component mount
  useState(() => {
  const loadData = async () => {
    try {
      // Load students
      const studentsData = await fetchStudentsAPI();
      const transformedStudents = studentsData.students?.map(student => ({
        id: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        name: `${student.firstName} ${student.lastName}`,
        room: student.roomBedNumber?.barcodeId || student.roomBedNumber?.roomNo || student.roomBedNumber || "Not Assigned",
        contact: student.contactNumber,
        email: student.email,
        emergencyContactNumber: student.emergencyContactNumber,
        admissionDate: student.admissionDate,
        emergencyContactName: student.emergencyContactName,
        feeStatus: student.feeStatus,
        dues: "₹ 0/-",
        roomDetails: student.roomBedNumber
      })) || [];
      setStudents(transformedStudents);

      // Load available rooms
      const roomsData = await fetchAvailableRoomsAPI();
      setAvailableRooms(roomsData.availableBeds || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Keep default students if API fails
    }
  };
  
  loadData();
}, []);

  // New handler for viewing student details
  const handleViewDetails = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setStudentDetailsData(student);
      setShowDetailsModal(true);
    }
  };

  // Calendar click handler
  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  // Fee status style
  const getFeeStatusStyle = (status) => ({
    width: "120px",
    height: "26px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    fontFamily: "Poppins",
    fontWeight: "600",
    textAlign: "center",
    background:
      status === "In Use"
        ? "#FF9D00"
        : status === "Available"
        ? "#22C55E"
        : "#FFFFFF",
    color:
      status === "In Use"
        ? "#FFFFFF"
        : status === "Available"
        ? "#FFFFFF"
        : "#000000",
    fontSize: "12px",
    lineHeight: "16px",
  });

  // Input field style
  const inputStyle = {
    height: "40px",
    background: "#FFFFFF",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
    borderRadius: "10px",
    color: "#000000",
    border: "none",
    outline: "none",
  };

  // Label style
  const labelStyle = {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: "18px",
    lineHeight: "100%",
    textAlign: "left",   
  };

  // Common form content for both registration and edit modal
  const formContent = (isEditMode) => (
    <>
      <h2
        className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6"
        style={{ fontFamily: "Inter", fontWeight: "700" }}
      >
        {isEditMode
          ? "Edit Student & Allot Bed"
          : "Register New Student & Allot Bed"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* First Name */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Enter First Name"
            className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
              errors.firstName ? "border-red-500" : ""
            }`}
            style={inputStyle}
            required
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1 ml-2">
              {errors.firstName}
            </p>
          )}
        </div>
        
        {/* Last Name */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Enter Last Name"
            className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
              errors.lastName ? "border-red-500" : ""
            }`}
            style={inputStyle}
            required
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1 ml-2">
              {errors.lastName}
            </p>
          )}
        </div>
        
        {/* Student ID */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>
            Student ID
          </label>
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleInputChange}
            placeholder="Enter Student ID"
            className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
              errors.studentId ? "border-red-500" : ""
            }`}
            style={inputStyle}
            disabled={isEditMode}
            required
          />
          {errors.studentId && (
            <p className="text-red-500 text-xs mt-1 ml-2">{errors.studentId}</p>
          )}
        </div>
        
        {/* Contact Number */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>
            Contact Number
          </label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            placeholder="Enter Phone Number"
            className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
              errors.contactNumber ? "border-red-500" : ""
            }`}
            style={inputStyle}
            required
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-xs mt-1 ml-2">
              {errors.contactNumber}
            </p>
          )}
        </div>
        
        {/* Email */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>
            E-Mail
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter E-Mail"
            className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
              errors.email ? "border-red-500" : ""
            }`}
            style={inputStyle}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 ml-2">{errors.email}</p>
          )}
        </div>
        
        {/* Room/Bed Number */}
        <div className="w-full px-2">
          <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px] text-left">
            Room/Bed Number
          </label>
          <div className="relative w-full sm:max-w-[530px] h-[40px]">
         <select
  name="roomBedNumber"
  value={formData.roomBedNumber}
  onChange={handleInputChange}
  className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${
    formData.roomBedNumber === "" ? "text-[#0000008A]" : "text-black"
  }`}
  style={{
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none", 
    boxShadow: "0px 4px 10px 0px #00000040",
  }}
>
  <option value="" disabled hidden>
    Select Room/Bed
  </option>
  {availableRooms.map((room) => (
    <option key={room._id} value={room._id}>
      {room.barcodeId} - Floor {room.floor}, Room {room.roomNo}
    </option>
  ))}
</select>
            <svg
              className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        
        {/* Emergency Contact Number */}
        <div className="w-full px-2">
          <label className="block mb-2 text-black ml-2" style={labelStyle}>
            Emergency Contact Number
          </label>
          <input
            type="tel"
            name="emergencyContactNumber"
            value={formData.emergencyContactNumber}
            onChange={handleInputChange}
            placeholder="Enter Contact Number"
            className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
            style={inputStyle}
          />
        </div>
        
        {/* Admission Date */}
        <div className="w-full px-2">
          <label className="block mb-2 text-black ml-2" style={labelStyle}>
            Admission Date
          </label>
          <div className="relative flex items-center">
            <div className="relative w-[300px] max-w-full">
              <div className="relative w-full">
                <input
                  ref={dateInputRef}
                  type="date"
                  name="admissionDate"
                  value={
                    formData.admissionDate
                      ? formData.admissionDate.split("-").reverse().join("-")
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
                      setFormData((prev) => ({
                        ...prev,
                        admissionDate: formattedDate,
                      }));
                    } else {
                      setFormData((prev) => ({ ...prev, admissionDate: "" }));
                    }
                  }}
                  className="absolute top-0 left-0 w-full h-full opacity-0 z-20"
                  style={{ colorScheme: "light" }}
                />
                <div className="bg-white rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040]">
                  {formData.admissionDate || ""}
                </div>
                {!formData.admissionDate && (
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 z-0 text-gray-500 font-[Poppins] font-semibold text-[15px] tracking-[0.3em] pointer-events-none select-none">
                    {"d\u00A0d\u00A0-\u00A0m\u00A0m\u00A0-\u00A0y\u00A0y\u00A0y\u00A0y"}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCalendarClick}
              className="ml-3 p-2 rounded-lg flex items-center justify-center cursor-pointer relative z-30 hover:scale-110 transition-transform"
              title="Open Calendar"
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_370_4"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="30"
                  height="30"
                >
                  <rect width="30" height="30" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_370_4)">
                  <path
                    d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 21.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 15.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 16.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 21.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 21.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 21.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z"
                    fill="#1C1B1F"
                  />
                </g>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Emergency Contact Name */}
        <div className="w-full px-2">
          <label className="block mb-2 text-black ml-2" style={labelStyle}>
            Emergency Contact Name
          </label>
          <input
            type="text"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={handleInputChange}
            placeholder="Enter Name"
            className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
            style={inputStyle}
          />
        </div>
        
        {/* Fee Status */}
        <div className="w-full px-2">
          <label
            className="block mb-2 text-black font-[500] text-[10px] ml-2"
            style={labelStyle}
          >
            Fee Status
          </label>
          <select
            name="feeStatus"
            value={formData.feeStatus}
            onChange={handleInputChange}
            className={`px-4 bg-white rounded-[10px] border-0 outline-none text-black text-[12px] font-[Poppins] font-semibold cursor-pointer appearance-none ${
              formData.feeStatus === "" ? "text-[#0000008A]" : "text-black"
            }`}
            style={{
              ...inputStyle,
              width: "300px",
              maxWidth: "100%",
              paddingLeft: "1rem",
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
            }}
          >
            <option value="" disabled hidden>
              Select Fee Status
            </option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
          </select>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={isEditMode ? handleUpdate : handleSubmit}
          disabled={loading}
          className={`mt-6 px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] cursor-pointer ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          {loading ? (isEditMode ? "Updating..." : "Registering...") : (isEditMode ? "Update Student" : "Register Student")}
        </button>
        {isEditMode && (
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="mt-6 px-6 py-2 bg-gray-400 text-white rounded-[10px] shadow font-medium hover:bg-gray-500 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </>
  );

  return (
    <div
      className="bg-white min-h-screen"
      style={{ fontFamily: "Poppins", fontWeight: "500" }}
    >
      {/* Content Container */}
      <div className="p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="w-full max-w-7xl mx-auto mb-8 px-4">
          <h1
            className="text-[25px] leading-[25px] font-extrabold text-[#000000] text-left"
            style={{
              fontFamily: "Inter",
            }}
          >
            <span className="border-l-4 border-[#4F8CCF] pl-2  inline-flex items-center h-[25px]">
              Student Management
            </span>
          </h1>
        </div>
        
        {/* Registration Form (conditionally rendered when not editing) */}
        {!editingStudent && (
          <div
            className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto"
            style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}
          >
            {formContent(false)}
          </div>
        )}
        
        {/* Edit Student Modal (conditionally rendered when editing) */}
        {showEditModal && editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto relative max-h-[90vh] overflow-y-auto"
              style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}
            >
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 text-black hover:text-gray-700 cursor-pointer"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {formContent(true)}
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {showDetailsModal && studentDetailsData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto relative max-h-[90vh] overflow-y-auto"
              style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}
            >
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setStudentDetailsData(null);
                }}
                className="absolute top-4 right-4 text-black hover:text-gray-700 cursor-pointer"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"   
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2
                className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6"
                style={{ fontFamily: "Inter", fontWeight: "700" }}
              >
                Student Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-black">
                <div>
                  <p className="font-semibold" style={labelStyle}>
                    Student ID:
                  </p>
                  <p>{studentDetailsData.id}</p>
                </div>
                <div>
                  <p className="font-semibold" style={labelStyle}>
                    Student Name:
                  </p>
                  <p>{studentDetailsData.name}</p>
                </div>
                <div>
                  <p className="font-semibold" style={labelStyle}>
                    Contact Number:
                  </p>
                  <p>{studentDetailsData.contact}</p>
                </div>
                <div>
                  <p className="font-semibold" style={labelStyle}>
                    Email:
                  </p>
                  <p>{studentDetailsData.email || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold" style={labelStyle}>
                    Room/Bed:
                  </p>
                  <p>{studentDetailsData.room}</p>
                </div>
                <div>
                  <p className="font-semibold" style={labelStyle}>
                    Emergency Contact:
                  </p>
                  <p>{studentDetailsData.emergencyContactNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold" style={labelStyle}>
                    Admission Date:
                  </p>
                  <p>{studentDetailsData.admissionDate || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold" style={labelStyle}>
                    Emergency Contact Name:
                  </p>
                  <p>{studentDetailsData.emergencyContactName || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold" style={labelStyle}>
                    Fee Status:
                  </p>
                  <span
                    className="font-semibold"
                    style={getFeeStatusStyle(studentDetailsData.feeStatus)}
                  >
                    {studentDetailsData.feeStatus}
                  </span>
                </div>
                <div>
                  <p className="font-semibold" style={labelStyle}>
                    Dues:
                  </p>
                  <p>{studentDetailsData.dues}</p>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(studentDetailsData.id);
                  }}
                  className="px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] cursor-pointer"
                  style={{
                    fontWeight: "600",
                    fontSize: "15px",
                  }}
                >
                  Edit Student
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student List Header */}
      <div className="w-full max-w-7xl mx-auto mt-8 sm:mt-12">
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-4 px-4 sm:px-0"
            style={{
              fontFamily: "Inter",
              fontWeight: "700",
              lineHeight: "100%",
              letterSpacing: "0%",
              color: "#000000",
              opacity: 1,
            }}
          >
            Student List & Fee status
          </h2>
        </div>
        
        {/* Student List Table */}
        <div className="w-full max-w-7xl mx-auto mt-4 px-4 sm:px-0">
          <div
            className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8"
            style={{ boxShadow: "0px 4px 4px 0px #00000040 inset" }}
          >
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div
                className="border border-black rounded-[19.6px] overflow-hidden"
                style={{
                  borderWidth: "0.98px",
                  width: "100%",
                }}
              >
                {/* Table Header */}
                <div className="bg-white text-black flex text-center">
                  {[
                    "Student ID",
                    "Name", 
                    "Room/Bed",
                    "Contact",
                    "Fees Status",
                    "Dues",
                    "Action",
                  ].map((header, index) => (
                    <div
                      key={header}
                      className="px-2 py-3 relative flex-1"
                      style={{
                        fontFamily: "Poppins",
                        fontWeight: "600",
                        fontSize: "14px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        textAlign: "center",
                      }}
                    >
                      {header}
                      {index < 6 && (
                        <div
                          className="absolute right-0 top-1/2 transform -translate-y-1/2"
                          style={{
                            width: "0px",
                            height: "20px",
                            border: "0.981623px solid #000000",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Table Body */}
                <div className="bg-[#BEC5AD] text-center text-sm flex flex-col gap-y-2 p-2 font-[Poppins] font-medium">
                  {students.map((student, i) => (
                    <div key={student.id} className="text-black flex">
                      <div className="px-2 py-2 flex-1">{student.id}</div>
                      <div className="px-2 py-2 flex-1">{student.name}</div>
                      <div className="px-2 py-2 flex-1">{student.room}</div>
                      <div className="px-2 py-2 text-xs flex-1">
                        {student.contact}
                      </div>
                      <div className="px-2 py-2 flex-1">
                        <span
                          className="font-semibold"
                          style={getFeeStatusStyle(student.feeStatus)}
                        >
                          {student.feeStatus}
                        </span>
                      </div>
                      <div className="px-2 py-2 flex-1">{student.dues}</div>
                      <div className="px-2 py-2 flex items-center justify-center flex-1">
                        <div className="flex items-center justify-center gap-4 relative">
                          <button
                            onClick={() => handleViewDetails(student.id)}
                            className="text-black hover:text-gray-700 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                            title="View Student Details"
                          >
                            <Eye size={24} strokeWidth={2.5} color="#000000" />
                          </button>
                          <div
                            style={{
                              width: "1px",
                              height: "20px",
                              backgroundColor: "#000000",
                              margin: "0 8px",
                            }}
                          />
                          <button
                            onClick={() => handleEdit(student.id)}
                            className="text-gray-800 hover:text-black flex items-center justify-center transition-colors cursor-pointer hover:scale-110 transition-transform"
                            title="Edit Student"
                          >
                            <svg
                              width="27"
                              height="26"
                              viewBox="0 0 27 26"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <mask
                                id={`mask0_221_285_${i}`}
                                style={{ maskType: "alpha" }}
                                maskUnits="userSpaceOnUse"
                                x="0"
                                y="0"
                                width="27"
                                height="26"
                              >
                                <rect
                                  x="0.678223"
                                  y="0.0253906"
                                  width="25.7356"
                                  height="25.7356"
                                  fill="#D9D9D9"
                                />
                              </mask>
                              <g mask={`url(#mask0_221_285_${i})`}>
                                <path
                                  d="M2.82373 25.7609V21.4717H24.2701V25.7609H2.82373ZM7.113 17.1824H8.61425L16.9783 8.8451L15.4503 7.31705L7.113 15.6811V17.1824ZM4.96837 19.327V14.7697L16.9783 2.78651C17.1749 2.58991 17.4028 2.438 17.6619 2.33077C17.9211 2.22354 18.1936 2.16992 18.4796 2.16992C18.7655 2.16992 19.0425 2.22354 19.3106 2.33077C19.5787 2.438 19.82 2.59885 20.0344 2.81331L21.5089 4.31456C21.7233 4.51115 21.8797 4.74349 21.978 5.01157C22.0763 5.27965 22.1255 5.55666 22.1255 5.84261C22.1255 6.11069 22.0763 6.3743 21.978 6.63345C21.8797 6.89259 21.7233 7.1294 21.5089 7.34386L9.52572 19.327H4.96837Z"
                                  fill="#1C1B1F"
                                />
                              </g>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {students.map((student, i) => (
                <div
                  key={student.id}
                  className="bg-white rounded-xl p-4 border border-black/20 shadow-sm"
                >
                  {/* Student Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-black">{student.name}</h3>
                      <p className="text-sm text-gray-600">ID: {student.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(student.id)}
                        className="p-2 bg-[#BEC5AD] rounded-lg hover:bg-[#A4B494] transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} color="#000000" />
                      </button>
                      <button
                        onClick={() => handleEdit(student.id)}
                        className="p-2 bg-[#BEC5AD] rounded-lg hover:bg-[#A4B494] transition-colors"
                        title="Edit Student"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 27 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id={`mask0_mobile_${i}`}
                            style={{ maskType: "alpha" }}
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="27"
                            height="26"
                          >
                            <rect
                              x="0.678223"
                              y="0.0253906"
                              width="25.7356"
                              height="25.7356"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask={`url(#mask0_mobile_${i})`}>
                            <path
                              d="M2.82373 25.7609V21.4717H24.2701V25.7609H2.82373ZM7.113 17.1824H8.61425L16.9783 8.8451L15.4503 7.31705L7.113 15.6811V17.1824ZM4.96837 19.327V14.7697L16.9783 2.78651C17.1749 2.58991 17.4028 2.438 17.6619 2.33077C17.9211 2.22354 18.1936 2.16992 18.4796 2.16992C18.7655 2.16992 19.0425 2.22354 19.3106 2.33077C19.5787 2.438 19.82 2.59885 20.0344 2.81331L21.5089 4.31456C21.7233 4.51115 21.8797 4.74349 21.978 5.01157C22.0763 5.27965 22.1255 5.55666 22.1255 5.84261C22.1255 6.11069 22.0763 6.3743 21.978 6.63345C21.8797 6.89259 21.7233 7.1294 21.5089 7.34386L9.52572 19.327H4.96837Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Room/Bed:</span>
                      <p className="text-black">{student.room}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Contact:</span>
                      <p className="text-black text-xs">{student.contact}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Fee Status:</span>
                      <p 
                        className="font-semibold"
                        style={getFeeStatusStyle(student.feeStatus)}
                      >
                        {student.feeStatus}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Dues:</span>
                      <p className="text-black font-semibold">{student.dues}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;