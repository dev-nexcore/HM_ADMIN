"use client";
import { useState } from "react";
import { Clock } from "lucide-react";
import axios from "axios";

const StaffAllotment = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    wardenId: "",
    shiftStart: "",
    shiftEnd: "",
    profilePhoto: null,
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [profilePreview, setProfilePreview] = useState(null);

  const validateForm = () => {
    const errors = {};
    const { firstName, lastName, contactNumber, email, wardenId, shiftStart, shiftEnd } = formData;

    if (!firstName.trim()) errors.firstName = "First name is required.";
    else if (firstName.trim().length < 2) errors.firstName = "First name must be at least 2 characters.";
    
    if (!lastName.trim()) errors.lastName = "Last name is required.";
    else if (lastName.trim().length < 2) errors.lastName = "Last name must be at least 2 characters.";
    
    if (!contactNumber) errors.contactNumber = "Contact number is required.";
    else if (!/^\d{10}$/.test(contactNumber))
      errors.contactNumber = "Enter valid 10-digit number.";

    if (!email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "Enter a valid email address.";

    if (!wardenId) errors.wardenId = "Warden ID is required.";
    else if (wardenId.trim().length < 3) errors.wardenId = "Warden ID must be at least 3 characters.";

    if (!shiftStart) errors.shiftStart = "Please enter shift start time.";
    if (!shiftEnd) errors.shiftEnd = "Please enter shift end time.";
    
    // Validate shift times
    if (shiftStart && shiftEnd) {
      const start = new Date(`2000/01/01 ${shiftStart}`);
      const end = new Date(`2000/01/01 ${shiftEnd}`);
      if (end <= start) {
        errors.shiftEnd = "Shift end time must be after start time.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setErrorMsg("Please upload a valid image file (JPEG, PNG, JPG, WebP)");
        e.target.value = ""; // Reset file input
        return;
      }
      
      if (file.size > maxSize) {
        setErrorMsg("Image size should be less than 5MB");
        e.target.value = ""; // Reset file input
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        profilePhoto: file,
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterWarden = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName.trim());
      formDataToSend.append("lastName", formData.lastName.trim());
      formDataToSend.append("email", formData.email.trim());
      formDataToSend.append("wardenId", formData.wardenId.trim());
      formDataToSend.append("contactNumber", formData.contactNumber.trim());
      if (formData.profilePhoto) {
        formDataToSend.append("profilePhoto", formData.profilePhoto);
      }

      // Use environment variable for API URL
      const API_URL = process.env.NEXT_PUBLIC_PROD_API_URL;
      
      // Use axios to send the request
      const response = await axios.post(`${API_URL}/api/wardenauth/register-warden`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMsg(response.data.message || "Warden registered successfully ✅");
        
        // Reset form completely
        setFormData({
          firstName: "",
          lastName: "",
          contactNumber: "",
          email: "",
          wardenId: "",
          shiftStart: "",
          shiftEnd: "",
          profilePhoto: null,
        });
        setProfilePreview(null);
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";

        setFormErrors({});
      }
    } catch (err) {
      console.error("Error registering warden:", err);
      if (err.response) {
        // Server responded with an error
        setErrorMsg(err.response.data?.message || "Failed to register warden. Please try again.");
      } else if (err.request) {
        // Request was made but no response
        setErrorMsg("Network error. Please check your connection and ensure the server is running.");
      } else {
        // Something else happened
        setErrorMsg("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 5000);
    }
  };

  const removeProfilePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: null }));
    setProfilePreview(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="flex-1 bg-white p-4 sm:p-6 mt-5">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-[4px] h-6 bg-[#4F8CCF] mr-3" />
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Staff Allotment
          </h1>
        </div>
      </div>

      {/* Error and Success Messages */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg z-50 w-fit max-w-[90vw] animate-fadeInDown">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50 w-fit max-w-[90vw] animate-fadeInDown">
          {successMsg}
        </div>
      )}

      {/* Register New Warden Section */}
      <div
        className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6 mb-6"
        style={{ boxShadow: "0px 4px 4px 0px #00000040 inset" }}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-black mb-6">
          Register New Warden
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:ml-10">
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
              className="w-full max-w-[440px] p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            />
            {formErrors.firstName && (
              <p className="text-sm text-red-600 mt-1">{formErrors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
              className="w-full max-w-[440px] p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            />
            {formErrors.lastName && (
              <p className="text-sm text-red-600 mt-1">{formErrors.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Warden ID *
            </label>
            <input
              type="text"
              name="wardenId"
              value={formData.wardenId}
              onChange={handleInputChange}
              placeholder="Enter warden ID"
              className="w-full max-w-[440px] p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            />
            {formErrors.wardenId && (
              <p className="text-sm text-red-600 mt-1">{formErrors.wardenId}</p>
            )}
          </div>
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Email ID *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full max-w-[440px] p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            />
            {formErrors.email && (
              <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Contact Number *
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="Enter 10-digit number"
              className="w-full max-w-[440px] p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            />
            {formErrors.contactNumber && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.contactNumber}
              </p>
            )}
          </div>
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Profile Photo
            </label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-4">
                {profilePreview && (
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                      <img 
                        src={profilePreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeProfilePhoto}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
              </div>
              <p className="text-sm text-gray-500">
                JPEG, PNG, JPG, WebP (Max 5MB)
              </p>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Shift Timing *
            </label>
            <div className="w-full max-w-[440px] flex flex-wrap sm:flex-nowrap items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-1">
                <input
                  type="time"
                  name="shiftStart"
                  value={formData.shiftStart}
                  onChange={handleInputChange}
                  className="w-[110px] p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
                <Clock className="w-4 h-4 text-gray-800" />
              </div>
              <span className="text-sm text-black font-bold">TO</span>
              <div className="flex items-center space-x-1">
                <input
                  type="time"
                  name="shiftEnd"
                  value={formData.shiftEnd}
                  onChange={handleInputChange}
                  className="w-[110px] p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
                <Clock className="w-4 h-4 text-gray-800" />
              </div>
            </div>
            {(formErrors.shiftStart || formErrors.shiftEnd) && (
              <p className="text-sm text-red-600 mt-2">
                {formErrors.shiftStart || formErrors.shiftEnd}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 italic">
              * Password will be auto-generated and sent to the provided email address
            </p>
          </div>
        </div>
        <div className="mt-7 text-center">
          <button
            onClick={handleRegisterWarden}
            disabled={loading}
            className="bg-white border border-gray-300 py-3 px-8 sm:px-12 cursor-pointer rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-2xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register Warden"}
          </button>
        </div>
      </div>

      {/* Empty state for Manage Warden Shifts Section */}
      <div
        className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6"
        style={{ boxShadow: "inset 0px 4px 20px 0px #00000040" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-6">
          Manage Warden Shifts
        </h2>
        
        <div className="text-center py-10">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Wardens Registered</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Register a new warden using the form above. Once registered, their information will appear here for management.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffAllotment;