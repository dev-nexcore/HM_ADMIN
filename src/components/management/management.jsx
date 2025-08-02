"use client";
import React, { useState, useRef } from "react";

const StudentManagement = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    contactNumber: "",
    email: "",
    roomBed: "",
    emergencyContact: "",
    admissionDate: "",
    emergencyContactName: "",
    feeStatus: "",
  });

  const dateInputRef = useRef(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const [students, setStudents] = useState([
    {
      id: "STU-001",
      name: "Shahid Ansari",
      room: "Room-A-101",
      contact: "+91 8888888888",
      feeStatus: "In Use",
      dues: "₹ 2,000/-",
    },
    {
      id: "STU-002",
      name: "Ayesha Khan",
      room: "Room-A-101",
      contact: "+91 8888888888",
      feeStatus: "Available",
      dues: "₹ 2,000/-",
    },
    {
      id: "STU-003",
      name: "Awab Fakih",
      room: "Room-A-101",
      contact: "+91 8888888888",
      feeStatus: "In maintenance",
      dues: "₹ 2,000/-",
    },
    {
      id: "STU-004",
      name: "Fatima Zahira",
      room: "Room-A-101",
      contact: "+91 8888888888",
      feeStatus: "In Use",
      dues: "₹ 2,000/-",
    },
    {
      id: "STU-005",
      name: "Fatima Zahira",
      room: "Room-A-101",
      contact: "+91 8888888888",
      feeStatus: "In Use",
      dues: "₹ 2,000/-",
    },
  ]);

  // Simple input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      studentName: "",
      studentId: "",
      contactNumber: "",
      email: "",
      roomBed: "",
      emergencyContact: "",
      admissionDate: "",
      emergencyContactName: "",
      feeStatus: "",
    });
    setEditingStudent(null);
  };

  // Submit handler
  const handleSubmit = () => {
    if (
      !formData.studentName ||
      !formData.studentId ||
      !formData.contactNumber ||
      !formData.email
    ) {
      alert("Please fill all required fields");
      return;
    }

    const newStudent = {
      id: formData.studentId,
      name: formData.studentName,
      room: formData.roomBed || "Not Assigned",
      contact: formData.contactNumber,
      feeStatus: formData.feeStatus === "Paid" ? "Available" : "In Use",
      dues: "₹ 0/-",
    };

    setStudents((prev) => [...prev, newStudent]);
    resetForm();
    alert("Student registered successfully!");
  };

  // Edit handler
  const handleEdit = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setFormData({
        studentName: student.name,
        studentId: student.id,
        contactNumber: student.contact,
        email: "",
        roomBed: student.room,
        emergencyContact: "",
        admissionDate: "",
        emergencyContactName: "",
        feeStatus: student.feeStatus === "Available" ? "Paid" : "Unpaid",
      });
      setEditingStudent(studentId);
    }
  };

  // Update handler
  const handleUpdate = () => {
    if (
      !formData.studentName ||
      !formData.studentId ||
      !formData.contactNumber
    ) {
      alert("Please fill all required fields");
      return;
    }

    setStudents((prev) =>
      prev.map((student) =>
        student.id === editingStudent
          ? {
              ...student,
              name: formData.studentName,
              contact: formData.contactNumber,
              room: formData.roomBed || student.room,
              feeStatus: formData.feeStatus === "Paid" ? "Available" : "In Use",
            }
          : student
      )
    );

    resetForm();
    alert("Student updated successfully!");
  };

  // View handler
  const handleView = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      alert(
        `Student Details:\nID: ${student.id}\nName: ${student.name}\nRoom: ${student.room}\nContact: ${student.contact}\nFee Status: ${student.feeStatus}\nDues: ${student.dues}`
      );
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

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 bg-white min-h-screen"
      style={{ fontFamily: "Poppins", fontWeight: "500" }}
    >
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mb-8 px-4">
        <h1
          className="text-[25px] leading-[25px] font-extrabold text-[#000000] text-left"
          style={{
            fontFamily: "Inter",
          }}
        >
          <span className="border-l-4 border-[#4F8CCF] pl-2 inline-flex items-center h-[25px]">
            Student Management
          </span>
        </h1>
      </div>

      {/* Registration Form */}
      <div
        className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto"
        style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}
      >
        <h2
          className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6"
          style={{ fontFamily: "Inter", fontWeight: "700" }}
        >
          Register New Student & Allot Bed
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Student Name */}
          <div className="w-full px-2">
            <label className="block mb-1 text-black ml-2" style={labelStyle}>
              Student Name
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleInputChange}
              placeholder="Enter your Name"
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
             font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
              style={inputStyle}
              required
            />
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
              placeholder="Enter your ID"
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
             font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
              style={inputStyle}
              disabled={editingStudent}
              required
            />
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
              placeholder="Enter your Phone Number"
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
             font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
              style={inputStyle}
              required
            />
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
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
             font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
              style={inputStyle}
              required
            />
          </div>

          {/* Room/Bed Number */}
          <div className="w-full px-2">
            <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px] text-left">
              Room/Bed Number
            </label>

            <div className="relative w-full sm:max-w-[530px] h-[40px]">
              <select
                name="roomBed"
                value={formData.roomBed}
                onChange={handleInputChange}
                className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none
      text-[12px] leading-[22px] font-semibold font-[Poppins]
      ${formData.roomBed === "" ? "text-[#0000008A]" : "text-black"}`}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  boxShadow: "0px 4px 10px 0px #00000040",
                }}
              >
                <option value="" disabled hidden>
                  Select Category
                </option>
                <option value="Room-A-101">Room-A-101</option>
                <option value="Room-A-102">Room-A-102</option>
                <option value="Room-A-103">Room-A-103</option>
                <option value="Room-B-101">Room-B-101</option>
                <option value="Room-B-102">Room-B-102</option>
                <option value="Room-B-103">Room-B-103</option>
              </select>

              {/* Custom arrow */}
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
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              placeholder="Enter Contact Number"
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
             font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
              style={inputStyle}
            />
          </div>

          {/* Admission Date */}
          <div className="w-full px-2">
            <label className="block mb-1 text-black ml-2" style={labelStyle}>
              Admission Date
            </label>
            <div className="relative flex items-center">
              <div className="relative w-[300px] max-w-full">
                <div className="relative w-[300px]">
                  {/* Hidden native date input */}
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
                    className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                    style={{ colorScheme: "light" }}
                  />

                  {/* Styled fake input that displays the selected date */}
                  <div
                    className="bg-white rounded-[10px]  px-4 
            h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] 
            tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040]"
                  >
                    {formData.admissionDate || ""}
                  </div>

                  {/* Placeholder spacing */}
                  {!formData.admissionDate && (
                    <div
                      className="absolute top-1/2 left-4 -translate-y-1/2 z-0
              text-gray-500 font-[Poppins] font-semibold text-[15px]
              tracking-[0.3em] pointer-events-none select-none"
                    >
                      d&nbsp;d&nbsp;-&nbsp;m&nbsp;m&nbsp;-&nbsp;y&nbsp;y&nbsp;y&nbsp;y
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCalendarClick}
                className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
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
                      d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 15.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 16.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 21.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 21.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 21.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z"
                      fill="#1C1B1F"
                    />
                  </g>
                </svg>
              </button>
            </div>
          </div>

          {/* Emergency Contact Name */}
          <div className="w-full px-2">
            <label
              className="block mb-2 text-black font-[500] text-[10px]  ml-2"
              style={labelStyle}
            >
              Emergency Contact Name
            </label>
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleInputChange}
              placeholder="Enter Name"
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
             font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
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

            <input
              type="text"
              name="feeStatus"
              value={formData.feeStatus}
              onChange={handleInputChange}
              placeholder="Paid"
              className="px-4 bg-white rounded-[10px] border-0 outline-none 
      text-black text-[12px] font-[Poppins] font-semibold 
      placeholder:font-[600] placeholder:font-[Poppins] placeholder-gray-500"
              style={{
                ...inputStyle,
                width: "300px",
                maxWidth: "100%",
                paddingLeft: "1rem",
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={editingStudent ? handleUpdate : handleSubmit}
            className="mt-6 px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins]"
            style={{
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            {editingStudent ? "Update Student" : "Register Student"}
          </button>

          {editingStudent && (
            <button
              type="button"
              onClick={resetForm}
              className="mt-6 px-6 py-2 bg-gray-400 text-white rounded-[10px] shadow font-medium hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

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
      <div className="w-full max-w-7xl mx-auto mt-4 ">
        <div
          className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 "
          style={{ boxShadow: "0px 4px 4px 0px #00000040 inset" }}
        >
          <div className="overflow-x-auto">
            <div
              className="border border-black rounded-[19.6px] overflow-hidden"
              style={{
                borderWidth: "0.98px",
                width: "100%",
                minWidth: "900px",
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
                    className="px-0.5 py-2 relative flex-1"
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
                    <div className="px-0.5 py-1 flex-1">{student.id}</div>
                    <div className="px-0.5 py-1 flex-1">{student.name}</div>
                    <div className="px-0.5 py-1 flex-1">{student.room}</div>
                    <div className="px-0.5 py-1 text-xs flex-1">
                      {student.contact}
                    </div>
                    <div className="px-0.5 py-1 flex-1">
                      <span
                        className="font-semibold"
                        style={getFeeStatusStyle(student.feeStatus)}
                      >
                        {student.feeStatus}
                      </span>
                    </div>
                    <div className="px-0.5 py-1 flex-1">{student.dues}</div>
                    <div className="px-0.5 py-1 flex items-center justify-center flex-1">
                      <div className="flex items-center justify-center gap-4 relative">
                        {/* View Button */}
                        <button
                          onClick={() => handleView(student.id)}
                          className="text-gray-800 hover:text-black flex items-center justify-center transition-colors"
                          title="View Student"
                        >
                          <svg
                            width="27"
                            height="27"
                            viewBox="0 0 27 27"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <mask
                              id={`mask0_221_256_${i}`}
                              style={{ maskType: "alpha" }}
                              maskUnits="userSpaceOnUse"
                              x="0"
                              y="0"
                              width="27"
                              height="27"
                            >
                              <rect
                                x="0.554199"
                                y="0.6875"
                                width="25.7356"
                                height="25.7356"
                                fill="#D9D9D9"
                              />
                            </mask>
                            <g mask={`url(#mask0_221_256_${i})`}>
                              <path
                                d="M13.4215 17.8444C14.7619 17.8444 15.9012 17.3752 16.8395 16.437C17.7778 15.4987 18.2469 14.3594 18.2469 13.019C18.2469 11.6786 17.7778 10.5392 16.8395 9.60094C15.9012 8.66266 14.7619 8.19352 13.4215 8.19352C12.0811 8.19352 10.9417 8.66266 10.0035 9.60094C9.06519 10.5392 8.59605 11.6786 8.59605 13.019C8.59605 14.3594 9.06519 15.4987 10.0035 16.437C10.9417 17.3752 12.0811 17.8444 13.4215 17.8444ZM13.4215 15.9142C12.6172 15.9142 11.9336 15.6327 11.3707 15.0698C10.8077 14.5068 10.5262 13.8232 10.5262 13.019C10.5262 12.2147 10.8077 11.5311 11.3707 10.9681C11.9336 10.4052 12.6172 10.1237 13.4215 10.1237C14.2257 10.1237 14.9093 10.4052 15.4723 10.9681C16.0353 11.5311 16.3167 12.2147 16.3167 13.019C16.3167 13.8232 16.0353 14.5068 15.4723 15.0698C14.9093 15.6327 14.2257 15.9142 13.4215 15.9142ZM13.4215 21.0613C10.8122 21.0613 8.4352 20.3331 6.29056 18.8765C4.14593 17.4199 2.59106 15.4674 1.62598 13.019C2.59106 10.5705 4.14593 8.61798 6.29056 7.16141C8.4352 5.70485 10.8122 4.97656 13.4215 4.97656C16.0308 4.97656 18.4078 5.70485 20.5524 7.16141C22.697 8.61798 24.2519 10.5705 25.217 13.019C24.2519 15.4674 22.697 17.4199 20.5524 18.8765C18.4078 20.3331 16.0308 21.0613 13.4215 21.0613ZM13.4215 18.9167C15.441 18.9167 17.2952 18.385 18.9841 17.3216C20.673 16.2582 21.9643 14.824 22.8579 13.019C21.9643 11.2139 20.673 9.77966 18.9841 8.71627C17.2952 7.65289 15.441 7.1212 13.4215 7.1212C11.4019 7.1212 9.54773 7.65289 7.85883 8.71627C6.16993 9.77966 4.87868 11.2139 3.98508 13.019C4.87868 14.824 6.16993 16.2582 7.85883 17.3216C9.54773 18.385 11.4019 18.9167 13.4215 18.9167Z"
                                fill="#1C1B1F"
                              />
                            </g>
                          </svg>
                        </button>

                        <div
                          style={{
                            width: "1px",
                            height: "20px",
                            backgroundColor: "#000000",
                            margin: "0 8px",
                          }}
                        />

                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(student.id)}
                          className="text-gray-800 hover:text-black flex items-center justify-center transition-colors"
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
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
