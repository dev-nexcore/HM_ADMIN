"use client";
import { useState, useRef, useEffect, use } from "react";
import { Eye } from "lucide-react";
import api from "@/lib/api";
import Tesseract from "tesseract.js";
import { ToastContainer  ,toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const StudentManagement = () => {
const getTodaysDate = () => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  return `${year}-${month}-${day}`;   // ✅ YYYY-MM-DD
};


  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    roomNumber: "",
    bedNumber: "",
    emergencyContactNumber: "",
    admissionDate: getTodaysDate(),
    emergencyContactName: "",
    feeStatus: "",
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
const [availableRoomNumbers, setAvailableRoomNumbers] = useState([]); // Add this new one
  const [students, setStudents] = useState([]);
// Add this state variable after the existing ones
const [studentsWithoutParents, setStudentsWithoutParents] = useState([]);
  const [errors, setErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [studentDetailsData, setStudentDetailsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add these new state variables after the existing ones
const [activeTab, setActiveTab] = useState("student"); // "student" or "parent"
const [parentFormData, setParentFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  relation:"",
  contactNumber: "",
  studentId: "",
});

const [studentDocuments, setStudentDocuments] = useState({
  aadharCard: null,
  panCard: null
});
const [parentDocuments, setParentDocuments] = useState({
  aadharCard: null,
  panCard: null
});
const [ocrLoading, setOcrLoading] = useState(false);
const [ocrProgress, setOcrProgress] = useState(0);
const [parentErrors, setParentErrors] = useState({});
const [parentLoading, setParentLoading] = useState(false);


  // API Functions
 const registerStudentAPI = async (studentData) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add text fields
    Object.keys(studentData).forEach(key => {
      if (key !== 'aadharCard' && key !== 'panCard') {
        formData.append(key, studentData[key]);
      }
    });
    
    // Add files if they exist
    if (studentData.aadharCard) {
      formData.append('aadharCard', studentData.aadharCard);
    }
    if (studentData.panCard) {
      formData.append('panCard', studentData.panCard);
    }
    
    const response = await api.post(`/api/adminauth/register-student`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to register student' };
  }
};

 const registerParentAPI = async (parentData) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add text fields
    Object.keys(parentData).forEach(key => {
      if (key !== 'aadharCard' && key !== 'panCard') {
        formData.append(key, parentData[key]);
      }
    });
    
    // Add files if they exist
    if (parentData.aadharCard) {
      formData.append('aadharCard', parentData.aadharCard);
    }
    if (parentData.panCard) {
      formData.append('panCard', parentData.panCard);
    }
    
    const response = await api.post(`/api/adminauth/register-parent`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to register parent' };
  }
};

  const updateStudentAPI = async (studentId, studentData) => {
    try {
      const response = await api.put(`/api/adminauth/update-student/${studentId}`, studentData, {
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
    const response = await api.get(`/api/adminauth/students`, {
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch students' };
  }
};

const fetchStudentsWithoutParentsAPI = async () => {
  try {
    const response = await api.get(`/api/adminauth/students-without-parents`, {
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch students without parents' };
  }
};

const fetchAvailableRoomsAPI = async () => {
  try {
    const response = await api.get(`/api/adminauth/inventory/available-beds`, {
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch available rooms' };
  }
};
const fetchAvailableRoomsNumbersAPI = async () => {
  try {
    const response = await api.get(`/api/adminauth/inventory/available-rooms`, {
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
      const response = await api.delete(`/api/adminauth/delete-student/${studentId}`, {
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

  // Add these functions after your existing handlers

// Extract information from Aadhar card
const extractAadharInfo = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  let firstName = '';
  let lastName = '';
  let dob = '';
  let aadharNumber = '';
  let mobileNumber = '';
  
  // Extract DOB
  const dobRegex = /DOB[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i;
  for (const line of lines) {
    const match = line.match(dobRegex);
    if (match) {
      dob = match[1].replace(/\//g, '-');
      break;
    }
  }
  
  // Extract Aadhar number (12 digits)
  const aadharRegex = /(\d{4}\s*\d{4}\s*\d{4})/;
  for (const line of lines) {
    const match = line.match(aadharRegex);
    if (match) {
      const number = match[1].replace(/\s/g, '');
      if (number.length === 12) {
        aadharNumber = number;
        break;
      }
    }
  }
  
  // Extract Mobile Number (10 digits, not part of 12-digit Aadhar)
  // Look for patterns like "Mobile No.: 7208692520" or just "7208692520"
  const mobileRegex = /(?:Mobile\s*No\.?[:\s]*)?([6-9]\d{9})(?!\d)/i;
  for (const line of lines) {
    // Skip if this line contains the 12-digit Aadhar number
    if (/\d{4}\s*\d{4}\s*\d{4}/.test(line)) {
      continue;
    }
    
    const match = line.match(mobileRegex);
    if (match) {
      const number = match[1];
      // Verify it's exactly 10 digits and starts with 6-9 (valid Indian mobile)
      if (number.length === 10 && /^[6-9]/.test(number)) {
        mobileNumber = number;
        break;
      }
    }
  }
  
  // Extract Name - Position-based (line before DOB)
  let dobLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/DOB/i.test(lines[i])) {
      dobLineIndex = i;
      break;
    }
  }
  
  if (dobLineIndex > 0) {
    // Check 1-3 lines before DOB
    for (let i = dobLineIndex - 1; i >= Math.max(0, dobLineIndex - 3); i--) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      // Skip unwanted lines
      if (
        lowerLine.includes('government') ||
        lowerLine.includes('india') ||
        lowerLine.includes('भारत') ||
        lowerLine.includes('सरकार') ||
        lowerLine.includes('tetet') ||
        /\d{4}\s*\d{4}\s*\d{4}/.test(line) ||
        /mobile/i.test(line) ||
        line.length < 4 ||
        line.length > 50
      ) {
        continue;
      }
      
      const words = line.split(/\s+/).filter(w => w.length > 1);
      
      // Name validation
      if (words.length >= 2 && words.length <= 4) {
        const alphaRatio = (line.match(/[a-zA-Z]/g) || []).length / line.replace(/\s/g, '').length;
        const hasProperCase = words.every(w => /^[A-Z][a-z]*$/.test(w) || /^[A-Z]+$/.test(w));
        const noSpecialChars = !/[:\-_@#$%^&*()+=\[\]{}|\\;'"<>?/]/.test(line);
        
        // Check if not repetitive garbage
        const isRepetitive = words.some(w => {
          if (w.length >= 4) {
            const half = w.substring(0, Math.floor(w.length / 2));
            return w.toLowerCase().startsWith(half.toLowerCase()) && 
                   w.toLowerCase().endsWith(half.toLowerCase());
          }
          return false;
        });
        
        if (alphaRatio > 0.85 && hasProperCase && noSpecialChars && !isRepetitive) {
          // Handle name splitting:
          // 2 words: "Akshat Gupta" -> First: Akshat, Last: Gupta
          // 3 words: "Rajesh Kumar Singh" -> First: Rajesh, Last: Singh (skip middle)
          // 4 words: "Ram Prakash Kumar Singh" -> First: Ram, Last: Singh (skip middle)
          
          firstName = words[0];
          
          if (words.length === 2) {
            lastName = words[1];
          } else if (words.length === 3) {
            // Skip middle name (index 1), take last name (index 2)
            lastName = words[2];
          } else if (words.length === 4) {
            // Skip middle names, take last word
            lastName = words[3];
          }
          
          console.log('Found name:', firstName, lastName, '(from:', line, ')');
          break;
        }
      }
    }
  }
  
  // Fallback method if position-based fails
  if (!firstName) {
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (
        lowerLine.includes('government') ||
        lowerLine.includes('india') ||
        lowerLine.includes('dob') ||
        lowerLine.includes('male') ||
        lowerLine.includes('female') ||
        lowerLine.includes('scanned') ||
        lowerLine.includes('mobile') ||
        /\d{4}\s*\d{4}\s*\d{4}/.test(line) ||
        line.length < 4
      ) {
        continue;
      }
      
      const words = line.split(/\s+/).filter(w => w.length > 1);
      
      if (words.length >= 2 && words.length <= 4 && line.length <= 50) {
        const alphaRatio = (line.match(/[a-zA-Z]/g) || []).length / line.replace(/\s/g, '').length;
        const hasProperCase = words.every(w => /^[A-Z]/.test(w));
        const noSpecialChars = !/[:\-_]/.test(line);
        
        if (alphaRatio > 0.85 && hasProperCase && noSpecialChars) {
          firstName = words[0];
          
          if (words.length === 2) {
            lastName = words[1];
          } else if (words.length === 3) {
            lastName = words[2]; // Skip middle
          } else if (words.length === 4) {
            lastName = words[3]; // Skip middle names
          }
          
          console.log('Found name (fallback):', firstName, lastName);
          break;
        }
      }
    }
  }
  
  console.log('Extracted info:', { firstName, lastName, dob, aadharNumber, mobileNumber });
  return { firstName, lastName, dob, aadharNumber, mobileNumber };
};

// Extract information from PAN card
const extractPanInfo = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Extract name
  let name = '';
  const nameIndex = lines.findIndex(line => line.toLowerCase().includes('name'));
  if (nameIndex !== -1 && lines[nameIndex + 1]) {
    name = lines[nameIndex + 1];
  }
  
  // Extract PAN number (format: ABCDE1234F)
  let panNumber = '';
  const panRegex = /([A-Z]{5}\d{4}[A-Z])/;
  for (const line of lines) {
    const match = line.match(panRegex);
    if (match) {
      panNumber = match[1];
      break;
    }
  }
  
  // Extract DOB
  let dob = '';
  const dobRegex = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/;
  for (const line of lines) {
    const match = line.match(dobRegex);
    if (match) {
      dob = match[1].replace(/\//g, '-');
      break;
    }
  }
  
  return { name, dob, panNumber };
};

// Process document with OCR
const processDocument = async (file, documentType, formType) => {
  setOcrLoading(true);
  setOcrProgress(0);
  
  try {
    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      }
    );
    
    const extractedText = result.data.text;
    console.log('Extracted text:', extractedText);
    
    let extractedInfo = {};
    if (documentType === 'aadhar') {
      extractedInfo = extractAadharInfo(extractedText);
    } else if (documentType === 'pan') {
      extractedInfo = extractPanInfo(extractedText);
    }
    
    console.log('Parsed info:', extractedInfo); // Debug log
    
   // Auto-fill form based on extracted info
if (formType === 'student') {
  setFormData(prev => ({
    ...prev,
    firstName: extractedInfo.firstName || prev.firstName,
    lastName: extractedInfo.lastName || prev.lastName,
    contactNumber: extractedInfo.mobileNumber || prev.contactNumber, // Add mobile
  }));
  console.log('Updated student form'); 
} else if (formType === 'parent') {
  setParentFormData(prev => ({
    ...prev,
    firstName: extractedInfo.firstName || prev.firstName,
    lastName: extractedInfo.lastName || prev.lastName,
    contactNumber: extractedInfo.mobileNumber || prev.contactNumber, // Add mobile
  }));
  console.log('Updated parent form');
}
    
   // Show what was extracted
if (extractedInfo.firstName || extractedInfo.lastName) {
  toast.success(`Document processed successfully!
Name: ${extractedInfo.firstName} ${extractedInfo.lastName}
DOB: ${extractedInfo.dob || 'Not found'}
Mobile: ${extractedInfo.mobileNumber || 'Not found'}
Aadhar: ${extractedInfo.aadharNumber || 'Not found'}

Please verify the auto-filled information.`);
} else {
  toast.error('Document processed but name could not be extracted. Please enter details manually.');
}
    
  } catch (error) {
    console.error('OCR Error:', error);
    toast.error('Failed to process document. Please try again or enter details manually.');
  } finally {
    setOcrLoading(false);
    setOcrProgress(0);
  }
};

// Handle document upload
const handleDocumentUpload = async (e, documentType, formType) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    toast.warning('Please upload a valid image file (JPEG, PNG, or WebP)');
    return;
  }
  
  // Store the file
  if (formType === 'student') {
    setStudentDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  } else if (formType === 'parent') {
    setParentDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  }
  
  // Process with OCR
  await processDocument(file, documentType, formType);
};

  // Reset form
const resetForm = () => {
  setFormData({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    roomNumber: "",
    bedNumber: "",
    emergencyContactNumber: "",
    admissionDate: getTodaysDate(),
    emergencyContactName: "",
    feeStatus: "",
  });
  setStudentDocuments({ aadharCard: null, panCard: null }); // Add this line
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
    const studentData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      contactNumber: formData.contactNumber,
      roomBedNumber: formData.bedNumber || "Not Assigned",
      email: formData.email,
      admissionDate: formData.admissionDate,
      feeStatus: formData.feeStatus,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactNumber: formData.emergencyContactNumber,
      // Add document files
      aadharCard: studentDocuments.aadharCard,
      panCard: studentDocuments.panCard
    };

    const response = await registerStudentAPI(studentData);
    
    // Find the selected room details for display
    const selectedRoom = availableRooms.find(room => room._id === formData.bedNumber);
    const roomDisplay = selectedRoom 
      ? `${selectedRoom.barcodeId} - Floor ${selectedRoom.floor}, Room ${selectedRoom.roomNo}`
      : formData.bedNumber || "Not Assigned";
    
    // Add new student to local state
    const newStudent = {
      id: response.student.studentId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      room: roomDisplay,
      contact: formData.contactNumber,
      email: formData.email,
      emergencyContactNumber: formData.emergencyContactNumber,
      admissionDate: formData.admissionDate,
      emergencyContactName: formData.emergencyContactName,
      feeStatus: formData.feeStatus,
      dues: "₹ 0/-",
      roomDetails: selectedRoom,
      roomObjectId: formData.bedNumber
    };
    
    setStudents((prev) => [...prev, newStudent]);
    // Refresh students without parents list
const studentsWithoutParentsData = await fetchStudentsWithoutParentsAPI();
setStudentsWithoutParents(studentsWithoutParentsData.students || []);
    resetForm();


    // alert(`Student registered successfully! Password: ${response.student?.password || 'Check email for credentials'}`);
    toast.success(
  `Student registered successfully! Password: ${response.student?.password}`,
  { autoClose: 6000 }
);
  } catch (error) {
    console.error('Error registering student:', error);
    toast.error(error.message || 'Error registering student. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // Edit handler: pre-fills form and sets editing state
 // Edit handler: pre-fills form and sets editing state
const handleEdit = (studentId) => {
  const student = students.find((s) => s.id === studentId);
  if (student) {
    // Extract room number from room details if available
    const roomNumber = student.roomDetails?.roomNo || "";
    
    setFormData({
      firstName: student.firstName || student.name?.split(' ')[0] || '',
      lastName: student.lastName || student.name?.split(' ').slice(1).join(' ') || '',
      contactNumber: student.contact,
      email: student.email || "",
      roomNumber: roomNumber, // Set room number
      bedNumber: student.roomObjectId || "", // Set bed ID
      emergencyContactNumber: student.emergencyContactNumber || "",
      // admissionDate: student.admissionDate || "",
      admissionDate: student.admissionDate
  ? new Date(student.admissionDate).toISOString().split("T")[0]
  : "",
      emergencyContactName: student.emergencyContactName || "",
      feeStatus: student.feeStatus,
    });
    setEditingStudent(studentId);
    setErrors({});
    setShowEditModal(true);
  }
};

  // Update handler for editing student
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
      roomBedNumber: formData.bedNumber, // Use bed number
      emergencyContactNumber: formData.emergencyContactNumber,
      admissionDate: formData.admissionDate,
      emergencyContactName: formData.emergencyContactName,
      feeStatus: formData.feeStatus,
    };

    await updateStudentAPI(editingStudent, studentData);

    // Find the selected room details for display
    const selectedRoom = availableRooms.find(room => room._id === formData.bedNumber);
    const roomDisplay = selectedRoom 
      ? `${selectedRoom.barcodeId} - Floor ${selectedRoom.floor}, Room ${selectedRoom.roomNo}`
      : formData.bedNumber || "Not Assigned";

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
              room: roomDisplay,
              emergencyContactNumber: formData.emergencyContactNumber,
              admissionDate: formData.admissionDate,
              emergencyContactName: formData.emergencyContactName,
              feeStatus: formData.feeStatus,
              roomDetails: selectedRoom,
              roomObjectId: formData.bedNumber
            }
          : student
      )
    );
    resetForm();
    toast.success("Student updated successfully!");
  } catch (error) {
    console.error('Error updating student:', error);
    toast.error(error.message || 'Error updating student. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Add these handlers after the existing ones
const handleParentInputChange = (e) => {
  const { name, value } = e.target;
  setParentFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
  // Clear error for the field being typed into
  if (parentErrors[name]) {
    setParentErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
};

const validateParentForm = (data) => {
  const newErrors = {};
  if (!data.firstName.trim()) {
    newErrors.firstName = "First Name is required.";
  }
  if (!data.lastName.trim()) {
    newErrors.lastName = "Last Name is required.";
  }
  if (!data.email.trim()) {
    newErrors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    newErrors.email = "Email is invalid.";
  }
  if (!data.contactNumber.trim()) {
    newErrors.contactNumber = "Contact Number is required.";
  }
   if (!data.relation.trim()) {
    newErrors.relation = "Relation is required";
  }
  if (!data.studentId.trim()) {
    newErrors.studentId = "Student ID is required.";
  }
  return newErrors;
};

const resetParentForm = () => {
  setParentFormData({
    firstName: "",
    lastName: "",
    email: "",
    relation:"",
    contactNumber: "",
    studentId: "",
  });
  setParentDocuments({ aadharCard: null, panCard: null }); // Add this line
  setParentErrors({});
};

const handleParentSubmit = async () => {
  const newErrors = validateParentForm(parentFormData);
  if (Object.keys(newErrors).length > 0) {
    setParentErrors(newErrors);
    return;
  }

  setParentLoading(true);
  try {
    const response = await registerParentAPI(parentFormData);
    
    // ADD THIS: Refresh the students without parents list
    const studentsWithoutParentsData = await fetchStudentsWithoutParentsAPI();
    setStudentsWithoutParents(studentsWithoutParentsData.students || []);
    
    resetParentForm();
    toast.success(`Parent registered successfully! Login instructions sent to ${parentFormData.email}`);
  } catch (error) {
    console.error('Error registering parent:', error);
    toast.error(error.message || 'Error registering parent. Please try again.');
  } finally {
    setParentLoading(false);
  }
};

  const fetchRoomDetailsAPI = async (roomObjectId) => {
  try {
    const response = await api.get(`/api/adminauth/inventory/${roomObjectId}`, {
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching room details for ${roomObjectId}:`, error);
    return null;
  }
};



  // Load students on component mount
const loadStudents = async () => {
  try {
    const studentsData = await fetchStudentsAPI();
    
    const transformedStudents = await Promise.all(
      studentsData.students?.map(async (student) => {
        let roomDisplay = "Not Assigned";
        let roomDetails = null;
        
        if (student.roomBedNumber && typeof student.roomBedNumber === 'string' && student.roomBedNumber.length === 24) {
          roomDetails = await fetchRoomDetailsAPI(student.roomBedNumber);
          if (roomDetails && roomDetails.inventory) {
            roomDisplay = `${roomDetails.inventory.barcodeId} - Floor ${roomDetails.inventory.floor}, Room ${roomDetails.inventory.roomNo}`;
          }
        } else if (student.roomBedNumber && typeof student.roomBedNumber === 'object') {
          roomDisplay = `${student.roomBedNumber.barcodeId} - Floor ${student.roomBedNumber.floor}, Room ${student.roomBedNumber.roomNo}`;
          roomDetails = student.roomBedNumber;
        } else if (student.roomBedNumber) {
          roomDisplay = student.roomBedNumber;
        }

        return {
          id: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          name: `${student.firstName} ${student.lastName}`,
          room: roomDisplay,
          contact: student.contactNumber,
          email: student.email,
          emergencyContactNumber: student.emergencyContactNumber,
          admissionDate: student.admissionDate,
          emergencyContactName: student.emergencyContactName,
          feeStatus: student.feeStatus,
          dues: "₹ 0/-",
          roomDetails: roomDetails,
          roomObjectId: student.roomBedNumber,
          documents: student.documents || {} // ADD THIS LINE
        };
      }) || []
    );
    
    setStudents(transformedStudents);
  } catch (error) {
    console.error('Error loading students:', error);
  }
};


useEffect(() => {
  const loadData = async () => {
    try {
      // Load students
      await loadStudents();
      
      // Load available beds
      const bedsData = await fetchAvailableRoomsAPI();
      setAvailableRooms(bedsData.availableBeds || []);

      // Load available room numbers
      const roomsData = await fetchAvailableRoomsNumbersAPI();
      setAvailableRoomNumbers(roomsData.availableRooms || []);

      // ADD THIS: Load students without parents
      const studentsWithoutParentsData = await fetchStudentsWithoutParentsAPI();
      setStudentsWithoutParents(studentsWithoutParentsData.students || []);
    } catch (error) {
      console.error('Error loading data:', error);
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

  // Add this function after your existing handlers
const getBedsForRoom = (roomNumber) => {
  if (!roomNumber) return availableRooms;
  return availableRooms.filter(bed => bed.roomNo === roomNumber);
};


 

  // Fee status style
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
    status === "Paid"
      ? "#22C55E"  // Green for Paid
      : status === "Unpaid"
      ? "#FF9D00"  // Orange for Unpaid
      : status === "Partial"
      ? "#F59E0B"  // Yellow for Partial
      : "#FFFFFF",
  color:
    status === "Paid" || status === "Unpaid" || status === "Partial"
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

        {/* Document Upload Section - Add after Last Name field */}
<div className="w-full px-2 md:col-span-2">
  <div className="bg-white/50 rounded-lg p-4 space-y-4">
    <h3 className="font-semibold text-black mb-2">Upload Documents (Optional - Auto-fill with OCR)</h3>
    
    {/* Aadhar Card Upload */}
    <div>
      <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>
        Aadhar Card
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleDocumentUpload(e, 'aadhar', 'student')}
        className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300"
        disabled={ocrLoading}
      />
      {studentDocuments.aadharCard && (
        <p className="text-xs text-green-600 mt-1">✓ {studentDocuments.aadharCard.name}</p>
      )}
    </div>
    
    {/* PAN Card Upload */}
    <div>
      <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>
        PAN Card
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleDocumentUpload(e, 'pan', 'student')}
        className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300"
        disabled={ocrLoading}
      />
      {studentDocuments.panCard && (
        <p className="text-xs text-green-600 mt-1">✓ {studentDocuments.panCard.name}</p>
      )}
    </div>
    
    {/* OCR Progress */}
    {ocrLoading && (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${ocrProgress}%` }}
          ></div>
        </div>
        <p className="text-xs text-center mt-1">Processing document... {ocrProgress}%</p>
      </div>
    )}
  </div>
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
        
      
{/* Room Number */}
<div className="w-full px-2">
  <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px] text-left">
    Room Number
  </label>
  <div className="relative w-full sm:max-w-[530px] h-[40px]">
    <select
      name="roomNumber"
      value={formData.roomNumber}
      onChange={(e) => {
        handleInputChange(e);
        // Clear bed selection when room changes
        setFormData(prev => ({ ...prev, bedNumber: "" }));
      }}
      className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${
        formData.roomNumber === "" ? "text-[#0000008A]" : "text-black"
      }`}
      style={{
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none", 
        boxShadow: "0px 4px 10px 0px #00000040",
      }}
    >
      <option value="" disabled hidden>
        Select Room
      </option>
      {availableRoomNumbers.map((room) => (
        <option key={room._id} value={room._id}>
          Room {room._id} - Floor {room.floor}
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

{/* Bed Number */}
<div className="w-full px-2">
  <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px] text-left">
    Bed Number
  </label>
  <div className="relative w-full sm:max-w-[530px] h-[40px]">
    <select
      name="bedNumber"
      value={formData.bedNumber}
      onChange={handleInputChange}
      disabled={!formData.roomNumber}
      className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${
        !formData.roomNumber ? "bg-gray-100 cursor-not-allowed" : ""
      } ${
        formData.bedNumber === "" ? "text-[#0000008A]" : "text-black"
      }`}
      style={{
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none", 
        boxShadow: "0px 4px 10px 0px #00000040",
      }}
    >
      <option value="" disabled hidden>
        {!formData.roomNumber ? "Select Room First" : "Select Bed"}
      </option>
      {getBedsForRoom(formData.roomNumber).map((bed) => (
        <option key={bed._id} value={bed._id}>
          {bed.barcodeId}
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
        <div className="bg-gray-100 rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040] cursor-not-allowed">
          {formData.admissionDate}
        </div>
      </div>
    </div>
    <div className="ml-3 p-2 rounded-lg flex items-center justify-center relative z-30">
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.5 }}
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
    </div>
  </div>
  <p className="text-xs text-gray-600 mt-1 ml-2">
    Admission date is automatically set to today's date
  </p>
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

  // Add this function after the formContent function
const parentFormContent = () => (
  <>
    <h2
      className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6"
      style={{ fontFamily: "Inter", fontWeight: "700" }}
    >
      Register Parent Account
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
          value={parentFormData.firstName}
          onChange={handleParentInputChange}
          placeholder="Enter First Name"
          className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
            parentErrors.firstName ? "border-red-500" : ""
          }`}
          style={inputStyle}
          required
        />
        {parentErrors.firstName && (
          <p className="text-red-500 text-xs mt-1 ml-2">
            {parentErrors.firstName}
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
          value={parentFormData.lastName}
          onChange={handleParentInputChange}
          placeholder="Enter Last Name"
          className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
            parentErrors.lastName ? "border-red-500" : ""
          }`}
          style={inputStyle}
          required
        />
        {parentErrors.lastName && (
          <p className="text-red-500 text-xs mt-1 ml-2">
            {parentErrors.lastName}
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
          value={parentFormData.email}
          onChange={handleParentInputChange}
          placeholder="Enter E-Mail"
          className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
            parentErrors.email ? "border-red-500" : ""
          }`}
          style={inputStyle}
          required
        />
        {parentErrors.email && (
          <p className="text-red-500 text-xs mt-1 ml-2">{parentErrors.email}</p>
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
          value={parentFormData.contactNumber}
          onChange={handleParentInputChange}
          placeholder="Enter Phone Number"
          className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
            parentErrors.contactNumber ? "border-red-500" : ""
          }`}
          style={inputStyle}
          required
        />
        {parentErrors.contactNumber && (
          <p className="text-red-500 text-xs mt-1 ml-2">
            {parentErrors.contactNumber}
          </p>
        )}
      </div>

       <div className="w-full px-2">
        <label className="block mb-1 text-black ml-2" style={labelStyle}>
          Relation
        </label>
        <input
          type="tel"
          name="relation"
          value={parentFormData.relation}
          onChange={handleParentInputChange}
          placeholder="Enter the realtion to the student"
          className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
            parentErrors.relation ? "border-red-500" : ""
          }`}
          style={inputStyle}
          required
        />
        {parentErrors.relation && (
          <p className="text-red-500 text-xs mt-1 ml-2">
            {parentErrors.relation}
          </p>
        )}
      </div>

      {/* Document Upload Section for Parent - Add after Contact Number */}
<div className="w-full px-2 md:col-span-2">
  <div className="bg-white/50 rounded-lg p-4 space-y-4">
    <h3 className="font-semibold text-black mb-2">Upload Documents (Optional - Auto-fill with OCR)</h3>
    
    {/* Aadhar Card Upload */}
    <div>
      <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>
        Aadhar Card
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleDocumentUpload(e, 'aadhar', 'parent')}
        className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300"
        disabled={ocrLoading}
      />
      {parentDocuments.aadharCard && (
        <p className="text-xs text-green-600 mt-1">✓ {parentDocuments.aadharCard.name}</p>
      )}
    </div>
    
    {/* PAN Card Upload */}
    <div>
      <label className="block mb-1 text-black ml-2 text-sm" style={labelStyle}>
        PAN Card
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleDocumentUpload(e, 'pan', 'parent')}
        className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300"
        disabled={ocrLoading}
      />
      {parentDocuments.panCard && (
        <p className="text-xs text-green-600 mt-1">✓ {parentDocuments.panCard.name}</p>
      )}
    </div>
    
    {/* OCR Progress */}
    {ocrLoading && (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${ocrProgress}%` }}
          ></div>
        </div>
        <p className="text-xs text-center mt-1">Processing document... {ocrProgress}%</p>
      </div>
    )}
  </div>
</div>  
      
    {/* Student ID */}
<div className="w-full px-2 md:col-span-2">
  <label className="block mb-1 text-black ml-2" style={labelStyle}>
    Student ID
  </label>
  <div className="relative w-full h-[40px]">
    <select
      name="studentId"
      value={parentFormData.studentId}
      onChange={handleParentInputChange}
      className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${
        parentFormData.studentId === "" ? "text-[#0000008A]" : "text-black"
      } ${parentErrors.studentId ? "border-red-500" : ""}`}
      style={{
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none", 
        boxShadow: "0px 4px 10px 0px #00000040",
      }}
      required
    >
      <option value="" disabled hidden>
        Select Student ID
      </option>
      {studentsWithoutParents.map((student) => (
        <option key={student.studentId} value={student.studentId}>
          {student.studentId} - {student.firstName} {student.lastName}
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
  {parentErrors.studentId && (
    <p className="text-red-500 text-xs mt-1 ml-2">{parentErrors.studentId}</p>
  )}
</div>
    </div>
    
    {/* Submit Button */}
    <div className="flex justify-center">
      <button
        onClick={handleParentSubmit}
        disabled={parentLoading}
        className={`mt-6 px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] cursor-pointer ${
          parentLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          fontWeight: "600",
          fontSize: "15px",
        }}
      >
        {parentLoading ? "Registering..." : "Register Parent"}
      </button>
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
        
     {/* Tabbed Registration Forms (conditionally rendered when not editing) */}
{!editingStudent && (
  <div className="w-full max-w-7xl mx-auto">
    {/* Tab Navigation */}
    <div className="flex mb-4">
      <button
        onClick={() => setActiveTab("student")}
        className={`px-6 py-3 rounded-t-[20px] font-semibold transition-colors ${
          activeTab === "student"
            ? "bg-[#BEC5AD] text-black border-b-2 border-[#4F8CCF]"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`}
        style={{ fontFamily: "Poppins", fontWeight: "600" }}
      >
        Register Student
      </button>
      <button
        onClick={() => setActiveTab("parent")}
        className={`px-6 py-3 rounded-t-[20px] font-semibold transition-colors ${
          activeTab === "parent"
            ? "bg-[#BEC5AD] text-black border-b-2 border-[#4F8CCF]"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`}
        style={{ fontFamily: "Poppins", fontWeight: "600" }}
      >
        Register Parent
      </button>
    </div>
    
    {/* Tab Content */}
    <div
      className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8"
      style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}
    >
      {activeTab === "student" ? formContent(false) : parentFormContent()}
    </div>
  </div>
)}
        
        {/* Edit Student Modal (conditionally rendered when editing) */}
        {showEditModal && editingStudent && (
          <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            {/* <div
              className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto relative max-h-[90vh] "
              style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}
            > */}

            <div
  className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto relative max-h-[90vh] overflow-y-auto custom-scrollbar"
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
          <p className="font-semibold" style={labelStyle}>Student ID:</p>
          <p>{studentDetailsData.id}</p>
        </div>
        <div>
          <p className="font-semibold" style={labelStyle}>Student Name:</p>
          <p>{studentDetailsData.name}</p>
        </div>
        <div>
          <p className="font-semibold" style={labelStyle}>Contact Number:</p>
          <p>{studentDetailsData.contact}</p>
        </div>
        <div>
          <p className="font-semibold" style={labelStyle}>Email:</p>
          <p>{studentDetailsData.email || "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold" style={labelStyle}>Room/Bed:</p>
          <p>{studentDetailsData.room}</p>
        </div>
        <div>
          <p className="font-semibold" style={labelStyle}>Emergency Contact:</p>
          <p>{studentDetailsData.emergencyContactNumber || "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold" style={labelStyle}>Admission Date:</p>
          <p>{studentDetailsData.admissionDate || "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold" style={labelStyle}>Emergency Contact Name:</p>
          <p>{studentDetailsData.emergencyContactName || "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold" style={labelStyle}>Fee Status:</p>
          <span
            className="font-semibold"
            style={getFeeStatusStyle(studentDetailsData.feeStatus)}
          >
            {studentDetailsData.feeStatus}
          </span>
        </div>
        <div>
          <p className="font-semibold" style={labelStyle}>Dues:</p>
          <p>{studentDetailsData.dues}</p>
        </div>
      </div>

      {/* ADD THIS DOCUMENTS SECTION */}
      <div className="mt-6 border-t border-black/20 pt-6">
        <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "Inter" }}>
          Uploaded Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Aadhar Card */}
          <div className="bg-white/50 rounded-lg p-4">
            <p className="font-semibold text-black mb-2">Aadhar Card</p>
            {studentDetailsData.documents?.aadharCard?.filename ? (
              <button
                onClick={() => window.open(
                  `/api/adminauth/student-document/${studentDetailsData.id}/aadharCard`,
                  '_blank'
                )}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                View Document
              </button>
            ) : (
              <p className="text-sm text-gray-600">Not uploaded</p>
            )}
          </div>

          {/* PAN Card */}
          <div className="bg-white/50 rounded-lg p-4">
            <p className="font-semibold text-black mb-2">PAN Card</p>
            {studentDetailsData.documents?.panCard?.filename ? (
              <button
                onClick={() => window.open(
                  `/api/adminauth/student-document/${studentDetailsData.id}/panCard`,
                  '_blank'
                )}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                View Document
              </button>
            ) : (
              <p className="text-sm text-gray-600">Not uploaded</p>
            )}
          </div>
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
      <ToastContainer/>
    </div>
  );
};

export default StudentManagement;