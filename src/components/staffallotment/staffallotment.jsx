"use client";
import { useState } from "react";
import { Edit2, Trash2, Clock, X } from "lucide-react";

const StaffAllotment = () => {
  const [formData, setFormData] = useState({
    wardenName: "",
    contactNumber: "",
    emailId: "",
    designation: "",
    password: "",
    confirmPassword: "",
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
      currentShift: "Evening (04AM - 12PM)",
    },
  ]);

  const [formErrors, setFormErrors] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWardenId, setSelectedWardenId] = useState(null);

  const validateForm = () => {
    const errors = {};
    const {
      wardenName,
      contactNumber,
      emailId,
      designation,
      password,
      confirmPassword,
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

    if (!password) errors.password = "Password is required.";
    if (!confirmPassword) errors.confirmPassword = "Please confirm password.";
    else if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match.";

    if (!shiftStart) errors.shiftStart = "Please enter shift time.";
    if (!shiftEnd) errors.shiftEnd = "Please enter shift time.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (fieldName) => {
    if (formData[fieldName]?.trim()) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const convertTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const hr = parseInt(hour);
    const period = hr >= 12 ? "PM" : "AM";
    const formattedHour = hr % 12 === 0 ? 12 : hr % 12;
    return `${formattedHour.toString().padStart(2, "0")}${period}`;
  };

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
      password: "",
      confirmPassword: "",
      shiftStart: "",
      shiftEnd: "",
    });

    setFormErrors({});
    setSuccessMsg("Warden registered successfully ✅");

    setTimeout(() => setSuccessMsg(""), 3000);
  };

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
      password: "",
      confirmPassword: "",
      shiftStart: parseTo24(shiftStartRaw),
      shiftEnd: parseTo24(shiftEndRaw),
    });

    setSelectedWardenId(id);
    setShowEditModal(true);
  };

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
      password: "",
      confirmPassword: "",
      shiftStart: "",
      shiftEnd: "",
    });
  };

  const handleDeleteWarden = (id) => {
    setSelectedWardenId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteWarden = () => {
    setWardens((prev) =>
      prev.filter((warden) => warden.id !== selectedWardenId)
    );
    setShowDeleteModal(false);
    setSelectedWardenId(null);
  };

  return (
    <div className="flex-1 bg-white p-4 sm:p-6 mt-5">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Edit Warden Details</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-lg text-black font-bold mb-1">
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
                <label className="block text-lg text-black font-bold mb-1">
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
                <label className="block text-lg text-black font-bold mb-1">
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
                <label className="block text-lg text-black font-bold mb-1">
                  Shift Timing
                </label>
                <div className="w-full flex items-center justify-between space-x-2">
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

            <div className="mt-6 flex justify-end space-x-4">
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

      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-[4px] h-6 bg-[#4F8CCF] mr-3" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Staff Allotment
          </h1>
        </div>
      </div>

      {/* Register New Warden Section */}
      <div
        className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6 mb-6"
        style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}
      >
        <h2 className="text-2xl font-semibold text-black mb-6">
          Register New Warden
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:ml-10">
          <div>
            <label className="block text-lg text-black font-bold mb-1">
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
          <div>
            <label className="block text-lg text-black font-bold mb-1">
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
          <div>
            <label className="block text-lg text-black font-bold mb-1">
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
          <div>
            <label className="block text-lg text-black font-bold mb-1">
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
          <div>
            <label className="block text-lg text-black font-bold mb-1">
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
          </div>
          <div>
            <label className="block text-lg text-black font-bold mb-1">
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
          <div className="md:col-start-1">
            <label className="block text-lg text-black font-bold mb-1">
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
          </div>
        </div>
        <div className="mt-7 text-center">
          <button
            onClick={handleRegisterWarden}
            className="bg-white border border-gray-300 py-3 px-12 cursor-pointer rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-2xl"
          >
            Register Warden
          </button>
        </div>
      </div>
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50 w-fit max-w-[90vw] animate-fadeInDown">
          {successMsg}
        </div>
      )}

      {/* Manage Warden Shifts Section */}
      <div
        className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6"
        style={{ boxShadow: "inset 0px 4px 20px 0px #00000040" }}
      >
        <h2 className="text-2xl font-bold text-black mb-6">
          Manage Warden Shifts
        </h2>

        <div className="w-full overflow-x-auto text-[15px] font-medium">
          {/* Table Header */}
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

          {/* Table Rows */}
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
                  {warden.currentShift.includes("Morning")
                    ? "Morning"
                    : "Evening"}
                </div>
                <div className="text-md text-gray-900">
                  {warden.currentShift.includes("Morning")
                    ? "(08AM - 12PM)"
                    : "(04AM - 12PM)"}
                </div>
              </div>
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => handleEditWarden(warden.id)}
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
                      id={`mask0_221_285_${warden.id}`} // unique per row
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
                    <g mask={`url(#mask0_221_285_${warden.id})`}>
                      <path
                        d="M2.82373 25.7609V21.4717H24.2701V25.7609H2.82373ZM7.113 17.1824H8.61425L16.9783 8.8451L15.4503 7.31705L7.113 15.6811V17.1824ZM4.96837 19.327V14.7697L16.9783 2.78651C17.1749 2.58991 17.4028 2.438 17.6619 2.33077C17.9211 2.22354 18.1936 2.16992 18.4796 2.16992C18.7655 2.16992 19.0425 2.22354 19.3106 2.33077C19.5787 2.438 19.82 2.59885 20.0344 2.81331L21.5089 4.31456C21.7233 4.51115 21.8797 4.74349 21.978 5.01157C22.0763 5.27965 22.1255 5.55666 22.1255 5.84261C22.1255 6.11069 22.0763 6.3743 21.978 6.63345C21.8797 6.89259 21.7233 7.1294 21.5089 7.34386L9.52572 19.327H4.96837Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </button>

                <div className="h-6 w-[1px] bg-black" />

                <button
                  onClick={() => handleDeleteWarden(warden.id)}
                  className="text-black hover:text-gray-700 cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" strokeWidth={2.7} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Delete Warden?
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this warden? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-4">
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
