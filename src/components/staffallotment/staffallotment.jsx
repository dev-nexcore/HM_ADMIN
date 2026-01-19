"use client";
import { useState } from "react";
import { Edit2, Trash2, Clock, X } from "lucide-react";

const StaffAllotment = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    wardenId: "",
    designation: "Warden",
    shiftStart: "",
    shiftEnd: "",
  });

  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWardenId, setSelectedWardenId] = useState(null);

  // Fetch wardens from backend
  const fetchWardens = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wardenauth/wardens");
      if (response.ok) {
        const data = await response.json();
        setWardens(data);
      }
    } catch (error) {
      console.error("Error fetching wardens:", error);
      setErrorMsg("Failed to load wardens");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useState(() => {
    fetchWardens();
  }, []);

  const validateForm = () => {
    const errors = {};
    const { firstName, lastName, contactNumber, email, wardenId, shiftStart, shiftEnd } = formData;

    if (!firstName.trim()) errors.firstName = "First name is required.";
    if (!lastName.trim()) errors.lastName = "Last name is required.";
    
    if (!contactNumber) errors.contactNumber = "Contact number is required.";
    else if (!/^\d{10}$/.test(contactNumber))
      errors.contactNumber = "Enter valid 10-digit number.";

    if (!email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "Enter a valid email address.";

    if (!wardenId) errors.wardenId = "Warden ID is required.";

    if (!shiftStart) errors.shiftStart = "Please enter shift start time.";
    if (!shiftEnd) errors.shiftEnd = "Please enter shift end time.";

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

  const convertTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const hr = parseInt(hour);
    const period = hr >= 12 ? "PM" : "AM";
    const formattedHour = hr % 12 === 0 ? 12 : hr % 12;
    return `${formattedHour.toString().padStart(2, "0")}${period}`;
  };

  const handleRegisterWarden = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/wardenauth/register-warden", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          wardenId: formData.wardenId,
          contactNumber: formData.contactNumber,
          // Note: Password is auto-generated in backend
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(data.message || "Warden registered successfully ✅");
        
        // Add new warden to the list
        const newWarden = {
          _id: data.warden?._id || Date.now().toString(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          wardenId: formData.wardenId,
          contactNumber: formData.contactNumber,
          designation: formData.designation,
          currentShift: `${
            formData.shiftStart < "12:00" ? "Morning" : "Evening"
          } (${convertTime(formData.shiftStart)} - ${convertTime(
            formData.shiftEnd
          )})`,
        };

        setWardens((prev) => [...prev, newWarden]);

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          contactNumber: "",
          email: "",
          wardenId: "",
          designation: "Warden",
          shiftStart: "",
          shiftEnd: "",
        });

        setFormErrors({});
      } else {
        setErrorMsg(data.message || "Failed to register warden");
      }
    } catch (err) {
      console.error("Error registering warden:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 5000);
    }
  };

  const handleEditWarden = (id) => {
    const selected = wardens.find((w) => w._id === id || w.id === id);
    if (!selected) return;

    // Parse shift time from existing format
    const shiftMatch = selected.currentShift?.match(/\((.*?)\)/);
    if (shiftMatch) {
      const [shiftStartRaw, shiftEndRaw] = shiftMatch[1].split(" - ");
      const parseTo24 = (t) => {
        const hour = parseInt(t.slice(0, -2));
        const isPM = t.includes("PM");
        const result = isPM
          ? hour === 12
            ? 12
            : hour + 12
          : hour === 12
          ? 0
          : hour;
        return `${result.toString().padStart(2, "0")}:00`;
      };

      // Split name into first and last
      const nameParts = selected.name ? selected.name.split(" ") : ["", ""];
      
      setFormData({
        firstName: selected.firstName || nameParts[0] || "",
        lastName: selected.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "") || "",
        contactNumber: selected.contactNumber || "",
        email: selected.email || "",
        wardenId: selected.wardenId || "",
        designation: selected.designation || "Warden",
        shiftStart: parseTo24(shiftStartRaw),
        shiftEnd: parseTo24(shiftEndRaw),
      });
    } else {
      // Default if no shift time
      const nameParts = selected.name ? selected.name.split(" ") : ["", ""];
      
      setFormData({
        firstName: selected.firstName || nameParts[0] || "",
        lastName: selected.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "") || "",
        contactNumber: selected.contactNumber || "",
        email: selected.email || "",
        wardenId: selected.wardenId || "",
        designation: selected.designation || "Warden",
        shiftStart: "08:00",
        shiftEnd: "12:00",
      });
    }

    setSelectedWardenId(id);
    setShowEditModal(true);
  };

  const handleUpdateWarden = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Note: You'll need to create an update endpoint in backend
      // For now, we'll update locally
      setWardens((prev) =>
        prev.map((warden) =>
          (warden._id === selectedWardenId || warden.id === selectedWardenId)
            ? {
                ...warden,
                firstName: formData.firstName,
                lastName: formData.lastName,
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                wardenId: formData.wardenId,
                contactNumber: formData.contactNumber,
                designation: formData.designation,
                currentShift: `${
                  formData.shiftStart < "12:00" ? "Morning" : "Evening"
                } (${convertTime(formData.shiftStart)} - ${convertTime(
                  formData.shiftEnd
                )})`,
              }
            : warden
        )
      );
      
      setSuccessMsg("Warden updated successfully ✅");
    } catch (error) {
      setErrorMsg("Failed to update warden");
    } finally {
      setLoading(false);
      setShowEditModal(false);
      setSelectedWardenId(null);
      setFormData({
        firstName: "",
        lastName: "",
        contactNumber: "",
        email: "",
        wardenId: "",
        designation: "Warden",
        shiftStart: "",
        shiftEnd: "",
      });
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleDeleteWarden = (id) => {
    setSelectedWardenId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteWarden = async () => {
    setLoading(true);
    try {
      // Note: You'll need to create a delete endpoint in backend
      // For now, we'll delete locally
      setWardens((prev) =>
        prev.filter((warden) => 
          !(warden._id === selectedWardenId || warden.id === selectedWardenId)
        )
      );
      
      setSuccessMsg("Warden deleted successfully ✅");
    } catch (error) {
      setErrorMsg("Failed to delete warden");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedWardenId(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="flex-1 bg-white p-4 sm:p-6 mt-5">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Edit Warden Details</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-base sm:text-lg text-black font-bold mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
                {formErrors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-base sm:text-lg text-black font-bold mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
                {formErrors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-base sm:text-lg text-black font-bold mb-1">
                  Warden ID
                </label>
                <input
                  type="text"
                  name="wardenId"
                  value={formData.wardenId}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
                {formErrors.wardenId && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.wardenId}</p>
                )}
              </div>
              <div>
                <label className="block text-base sm:text-lg text-black font-bold mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-base sm:text-lg text-black font-bold mb-1">
                  Designation
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                >
                  <option value="Warden">Warden</option>
                  <option value="Asst. Warden">Assistant Warden</option>
                  <option value="Senior Warden">Senior Warden</option>
                </select>
              </div>
              <div>
                <label className="block text-base sm:text-lg text-black font-bold mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
                {formErrors.contactNumber && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.contactNumber}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-base sm:text-lg text-black font-bold mb-1">
                  Shift Timing
                </label>
                <div className="w-full flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
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
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={loading}
                className="bg-gray-200 cursor-pointer text-gray-800 py-2 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWarden}
                disabled={loading}
                className="bg-green-600 cursor-pointer text-white py-2 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              Designation
            </label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              className="w-full max-w-[440px] p-3 rounded-md border text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            >
              <option value="Warden">Warden</option>
              <option value="Asst. Warden">Assistant Warden</option>
              <option value="Senior Warden">Senior Warden</option>
            </select>
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

      {/* Manage Warden Shifts Section - Now Responsive */}
      <div
        className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6"
        style={{ boxShadow: "inset 0px 4px 20px 0px #00000040" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-6">
          Manage Warden Shifts
        </h2>

        {loading && wardens.length === 0 ? (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading wardens...</p>
          </div>
        ) : wardens.length === 0 ? (
          <p className="text-center py-6 text-gray-600">No wardens found.</p>
        ) : (
          <>
            {/* Mobile Card View (lg and below) */}
            <div className="block xl:hidden">
              <div className="space-y-4">
                {wardens.map((warden) => (
                  <div key={warden._id || warden.id} className="bg-white rounded-lg p-4 shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-base sm:text-lg">{warden.name || `${warden.firstName} ${warden.lastName}`}</h3>
                        <p className="text-sm text-gray-600">{warden.designation || "Warden"}</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditWarden(warden._id || warden.id)}
                          className="text-gray-700 hover:text-gray-900 transition-colors"
                          title="Edit Warden"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteWarden(warden._id || warden.id)}
                          className="text-gray-700 hover:text-red-600 transition-colors"
                          title="Delete Warden"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Email and Warden ID */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Email:</span> {warden.email}
                      </p>
                      {warden.wardenId && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Warden ID:</span> {warden.wardenId}
                        </p>
                      )}
                      {warden.contactNumber && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Contact:</span> {warden.contactNumber}
                        </p>
                      )}
                    </div>

                    {/* Current Shift */}
                    <div className="mb-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Current Shift:</span>
                      </p>
                      <div className="mt-1">
                        <p className="text-base font-medium">
                          {warden.currentShift?.includes("Morning") ? "Morning" : "Evening"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {warden.currentShift?.match(/\((.*?)\)/)?.[1] || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View (xl and above) */}
            <div className="hidden xl:block">
              <div className="w-full overflow-x-auto text-[15px] font-medium">
                {/* Table Header */}
                <div className="grid min-w-[650px] grid-cols-6 bg-white rounded-t-md text-black text-left px-5 py-3">
                  <div className="pl-2 border-r text-lg font-bold border-black flex items-center">
                    Warden Name
                  </div>
                  <div className="pl-4 border-r text-lg font-bold border-black flex items-center justify-start">
                    Email
                  </div>
                  <div className="pl-4 border-r text-lg font-bold border-black flex items-center justify-start">
                    Warden ID
                  </div>
                  <div className="pl-4 border-r text-lg font-bold border-black flex items-center justify-start">
                    Designation
                  </div>
                  <div className="pl-4 border-r text-lg font-bold border-black flex items-center justify-start">
                    Current Shift
                  </div>
                  <div className="text-lg font-bold text-center">Actions</div>
                </div>

                {/* Table Rows */}
                {wardens.map((warden, index) => (
                  <div
                    key={warden._id || warden.id}
                    className={`grid min-w-[650px] grid-cols-6 items-center px-5 py-4 text-[16px] text-black ${
                      index !== wardens.length - 1 ? "border-b border-black" : ""
                    }`}
                  >
                    <div className="pl-2">{warden.name || `${warden.firstName} ${warden.lastName}`}</div>
                    <div className="pl-4">{warden.email}</div>
                    <div className="pl-4">{warden.wardenId}</div>
                    <div className="pl-4">{warden.designation || "Warden"}</div>
                    <div className="pl-10 leading-tight">
                      <div className="pl-5 text-lg">
                        {warden.currentShift?.includes("Morning")
                          ? "Morning"
                          : "Evening"}
                      </div>
                      <div className="text-md text-gray-900">
                        {warden.currentShift?.match(/\((.*?)\)/)?.[1] || "Not set"}
                      </div>
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                      <button
                        onClick={() => handleEditWarden(warden._id || warden.id)}
                        className="text-black hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit Warden"
                      >
                        <svg
                          width="27"
                          height="26"
                          viewBox="0 0 27 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id={`mask0_${warden._id || warden.id}`}
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
                          <g mask={`url(#mask0_${warden._id || warden.id})`}>
                            <path
                              d="M2.82373 25.7609V21.4717H24.2701V25.7609H2.82373ZM7.113 17.1824H8.61425L16.9783 8.8451L15.4503 7.31705L7.113 15.6811V17.1824ZM4.96837 19.327V14.7697L16.9783 2.78651C17.1749 2.58991 17.4028 2.438 17.6619 2.33077C17.9211 2.22354 18.1936 2.16992 18.4796 2.16992C18.7655 2.16992 19.0425 2.22354 19.3106 2.33077C19.5787 2.438 19.82 2.59885 20.0344 2.81331L21.5089 4.31456C21.7233 4.51115 21.8797 4.74349 21.978 5.01157C22.0763 5.27965 22.1255 5.55666 22.1255 5.84261C22.1255 6.11069 22.0763 6.3743 21.978 6.63345C21.8797 6.89259 21.7233 7.1294 21.5089 7.34386L9.52572 19.327H4.96837Z"
                              fill="currentColor"
                            />
                          </g>
                        </svg>
                      </button>

                      <div className="h-6 w-[1px] bg-black" />

                      <button
                        onClick={() => handleDeleteWarden(warden._id || warden.id)}
                        className="text-black hover:text-gray-700 cursor-pointer"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={2.7} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Delete Warden?
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this warden? This action cannot be
              undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                className="px-4 py-2 rounded-lg border cursor-pointer border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteWarden}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 cursor-pointer text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAllotment;