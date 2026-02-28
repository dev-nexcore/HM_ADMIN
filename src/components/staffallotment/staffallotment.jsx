"use client";
import { useState } from "react";
import { Edit2, Trash2, Clock, X } from "lucide-react";

const StaffAllotment = () => {
  const [formData, setFormData] = useState({
    wardenName: "",
    contactNumber: "",
    emailId: "",
    designation: "",
    shiftStart: "",
    shiftEnd: "",
  });

  const [wardens, setWardens] = useState([
    {
      id: 1,
      name: "Chinmay Gawade",
      email: "skyy@gmail.com",
      designation: "Warden",
      currentShift: "Morning (08AM - 12PM)",
    },
    {
      id: 2,
      name: "Chinmay Gawade",
      email: "skyy@gmail.com",
      designation: "Asst. Warden",
      currentShift: "Evening (04PM - 12AM)",
    },
  ]);

  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWardenId, setSelectedWardenId] = useState(null);

  // ✅ Form Validation
  const validateForm = () => {
    const errors = {};
    const {
      wardenName,
      contactNumber,
      emailId,
      designation,
      shiftStart,
      shiftEnd,
    } = formData;

    if (!wardenName) errors.wardenName = "Warden name is required.";

    if (!contactNumber) errors.contactNumber = "Contact number is required.";
    else if (!/^\d{10}$/.test(contactNumber))
      errors.contactNumber = "Enter valid 10-digit number.";

    if (!emailId) errors.emailId = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(emailId))
      errors.emailId = "Enter a valid email address.";

    if (!designation) errors.designation = "Please select a designation.";


    if (!shiftStart) errors.shiftStart = "Please enter shift time.";
    if (!shiftEnd) errors.shiftEnd = "Please enter shift time.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Blur clear error
  const handleBlur = (fieldName) => {
    if (formData[fieldName]?.trim()) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // ✅ Convert time 24hr -> 12hr (08:00 -> 08AM)
  const convertTime = (timeStr) => {
    const [hour] = timeStr.split(":");
    const hr = parseInt(hour);
    const period = hr >= 12 ? "PM" : "AM";
    const formattedHour = hr % 12 === 0 ? 12 : hr % 12;
    return `${formattedHour.toString().padStart(2, "0")}${period}`;
  };

  // ✅ Register
  const handleRegisterWarden = () => {
    if (!validateForm()) return;

    const newWarden = {
      id: Date.now(),
      name: formData.wardenName,
      email: formData.emailId,
      designation: formData.designation,
      currentShift: `${
        formData.shiftStart < "12:00" ? "Morning" : "Evening"
      } (${convertTime(formData.shiftStart)} - ${convertTime(
        formData.shiftEnd
      )})`,
    };

    setWardens((prev) => [...prev, newWarden]);

    setFormData({
      wardenName: "",
      contactNumber: "",
      emailId: "",
      designation: "",
      shiftStart: "",
      shiftEnd: "",
    });

    setFormErrors({});
    setSuccessMsg("Warden registered successfully ✅");

    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ✅ Edit
  const handleEditWarden = (id) => {
    const selected = wardens.find((w) => w.id === id);
    if (!selected) return;

    const [shiftStartRaw, shiftEndRaw] = selected.currentShift
      .match(/\((.*?)\)/)[1]
      .split(" - ");

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

    setFormData({
      wardenName: selected.name,
      contactNumber: "",
      emailId: selected.email,
      designation: selected.designation,
      shiftStart: parseTo24(shiftStartRaw),
      shiftEnd: parseTo24(shiftEndRaw),
    });

    setSelectedWardenId(id);
    setShowEditModal(true);
  };

  // ✅ Update
  const handleUpdateWarden = () => {
    setWardens((prev) =>
      prev.map((warden) =>
        warden.id === selectedWardenId
          ? {
              ...warden,
              name: formData.wardenName,
              email: formData.emailId,
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

    setShowEditModal(false);
    setSelectedWardenId(null);

    setFormData({
      wardenName: "",
      contactNumber: "",
      emailId: "",
      designation: "",
      shiftStart: "",
      shiftEnd: "",
    });
  };

  // ✅ Delete modal open
  const handleDeleteWarden = (id) => {
    setSelectedWardenId(id);
    setShowDeleteModal(true);
  };

  // ✅ Delete confirm
  const confirmDeleteWarden = () => {
    setWardens((prev) =>
      prev.filter((warden) => warden.id !== selectedWardenId)
    );

    setShowDeleteModal(false);
    setSelectedWardenId(null);
  };

  // ✅ Helper for Mobile view dynamic shift
  const getShiftLabel = (shift) => shift.split(" (")[0];
  const getShiftTime = (shift) => shift.match(/\((.*?)\)/)?.[1];

  return (
    <div className="flex-1 bg-white p-4 sm:p-6 mt-5">
      {/* ✅ Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Edit Warden Details
              </h2>

              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWardenId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-base sm:text-lg text-black font-bold mb-1">
                  Warden Name
                </label>
                <input
                  type="text"
                  name="wardenName"
                  value={formData.wardenName}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
              </div>

              <div>
                <label className="block text-base sm:text-lg text-black font-bold mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
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
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-200 cursor-pointer text-gray-800 py-2 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateWarden}
                className="bg-green-600 cursor-pointer text-white py-2 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-[4px] h-6 bg-[#4F8CCF] mr-3" />
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Staff Allotment
          </h1>
        </div>
      </div>

      {/* Register */}
      <div
        className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6 mb-6"
        style={{ boxShadow: "0px 4px 4px 0px #00000040 inset" }}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-black mb-6">
          Register New Warden
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:ml-10">
          {/* Name */}
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Warden Name
            </label>
            <input
              type="text"
              name="wardenName"
              onBlur={() => handleBlur("wardenName")}
              value={formData.wardenName}
              onChange={handleInputChange}
              placeholder="Enter warden's Full name"
              className="w-full max-w-[440px] p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            />
            {formErrors.wardenName && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.wardenName}
              </p>
            )}
          </div>

          {/* Contact */}
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              onBlur={() => handleBlur("contactNumber")}
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="Enter Contact No."
              className="w-full max-w-[440px] p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            />
            {formErrors.contactNumber && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.contactNumber}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Email ID
            </label>
            <input
              type="email"
              name="emailId"
              onBlur={() => handleBlur("emailId")}
              value={formData.emailId}
              onChange={handleInputChange}
              placeholder="Enter Email Address"
              className="w-full max-w-[440px] p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            />
            {formErrors.emailId && (
              <p className="text-sm text-red-600 mt-1">{formErrors.emailId}</p>
            )}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Designation
            </label>
            <select
              name="designation"
              onBlur={() => handleBlur("designation")}
              value={formData.designation}
              onChange={handleInputChange}
              className="w-full max-w-[440px] p-3 rounded-md border text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            >
              <option value="">Select Designation</option>
              <option value="Warden">Warden</option>
              <option value="Asst. Warden">Assistant Warden</option>
              <option value="Senior Warden">Senior Warden</option>
            </select>
            {formErrors.designation && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.designation}
              </p>
            )}
          </div>

          {/* Password */}
          {/* <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              onBlur={() => handleBlur("password")}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter Password"
              className="w-full max-w-[440px] p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            />
            {formErrors.password && (
              <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
            )}
          </div> */}

          {/* Shift */}
          <div>
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Shift Timing
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
                  onBlur={() => handleBlur("shiftEnd")}
                  onChange={handleInputChange}
                  className="w-[110px] p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
                />
                <Clock className="w-4 h-4 text-gray-800" />
              </div>
            </div>

            {formErrors.shiftEnd && (
              <p className="text-sm text-red-600 mt-2">{formErrors.shiftEnd}</p>
            )}
          </div>

          {/* Confirm */}
          {/* <div className="md:col-start-1">
            <label className="block text-base sm:text-lg text-black font-bold mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              onBlur={() => handleBlur("confirmPassword")}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              className="w-full max-w-[440px] p-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8a9079]"
            />
            {formErrors.confirmPassword && (
              <p className="text-sm text-red-600 mt-2">
                {formErrors.confirmPassword}
              </p>
            )}
          </div> */}
        </div>

        <div className="mt-7 text-center">
          <button
            onClick={handleRegisterWarden}
            className="bg-white border border-gray-300 py-3 px-8 sm:px-12 cursor-pointer rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-2xl text-sm sm:text-base"
          >
            Register Warden
          </button>
        </div>
      </div>

      {/* Success Msg */}
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50 w-fit max-w-[90vw] animate-fadeInDown">
          {successMsg}
        </div>
      )}

      {/* Manage */}
      <div
        className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6"
        style={{ boxShadow: "inset 0px 4px 20px 0px #00000040" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-6">
          Manage Warden Shifts
        </h2>

        {/* Mobile */}
        <div className="block xl:hidden">
          {wardens.length === 0 ? (
            <p className="text-center py-6 text-gray-600">No wardens found.</p>
          ) : (
            <div className="space-y-4">
              {wardens.map((warden) => (
                <div
                  key={warden.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">
                        {warden.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {warden.designation}
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditWarden(warden.id)}
                        className="text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <Edit2 size={20} />
                      </button>

                      <button
                        onClick={() => handleDeleteWarden(warden.id)}
                        className="text-gray-700 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Email:</span> {warden.email}
                    </p>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Current Shift:</span>
                    </p>

                    <div className="mt-1">
                      <p className="text-base font-medium">
                        {getShiftLabel(warden.currentShift)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ({getShiftTime(warden.currentShift)})
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden xl:block">
          <div className="w-full overflow-x-auto text-[15px] font-medium">
            <div className="grid min-w-[650px] grid-cols-5 bg-white rounded-t-md text-black text-left px-5 py-3">
              <div className="pl-2 border-r text-lg font-bold border-black flex items-center">
                Warden Name
              </div>
              <div className="pl-6 border-r text-lg font-bold border-black flex items-center justify-start">
                Email
              </div>
              <div className="pl-4 border-r text-lg font-bold border-black flex items-center justify-start">
                Designation
              </div>
              <div className="pl-4 border-r text-lg font-bold border-black flex items-center justify-start">
                Current Shift
              </div>
              <div className="text-lg font-bold text-center">Actions</div>
            </div>

            {wardens.map((warden, index) => (
              <div
                key={warden.id}
                className={`grid min-w-[650px] grid-cols-5 items-center px-5 py-4 text-[16px] text-black ${
                  index !== wardens.length - 1 ? "border-b border-black" : ""
                }`}
              >
                <div className="pl-2">{warden.name}</div>
                <div className="pl-4">{warden.email}</div>
                <div className="pl-4">{warden.designation}</div>

                <div className="pl-10 leading-tight">
                  <div className="pl-5 text-lg">
                    {getShiftLabel(warden.currentShift)}
                  </div>
                  <div className="text-md text-gray-900">
                    ({getShiftTime(warden.currentShift)})
                  </div>
                </div>

                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={() => handleEditWarden(warden.id)}
                    className="text-black hover:text-gray-800"
                  >
                    <Edit2 size={20} />
                  </button>

                  <div className="h-6 w-[1px] bg-black" />

                  <button
                    onClick={() => handleDeleteWarden(warden.id)}
                    className="text-black hover:text-gray-700"
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={2.7} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
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
                className="px-4 py-2 rounded-lg border cursor-pointer border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteWarden}
                className="px-4 py-2 rounded-lg bg-red-600 cursor-pointer text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAllotment;
