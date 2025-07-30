"use client";
import { useState, useRef } from "react";

function AddNewItem() {
  const dateInputRef = useRef(null);
  const [formData, setFormData] = useState({
    itemName: "",
    location: "",
    barcodeId: "",
    status: "",
    category: "",
    description: "",
    purchaseDate: "",
    purchaseCost: "",
    receipt: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to format date from yyyy-mm-dd to dd-mm-yyyy
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      receipt: e.target.files[0],
    }));
  };

  const handleCancel = () => {
    setFormData({
      itemName: "",
      location: "",
      barcodeId: "",
      status: "",
      category: "",
      description: "",
      purchaseDate: "",
      purchaseCost: "",
      receipt: null,
    });
  };

  const handleGenerateQR = () => {
    console.log("Generate QR Code for:", formData.itemName);
    // QR code generation logic here
  };

  const handleSaveItem = () => {
    console.log("Saving item:", formData);
    // Save item logic here
  };

  // Calendar click handler
  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const labelStyle = {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: "18px",
    lineHeight: "100%",
    textAlign: "left",
  };

  const inputStyle = {
    height: "40px",
    background: "#FFFFFF",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
    borderRadius: "10px",
    color: "#000000",
    border: "none",
    outline: "none",
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 bg-white min-h-screen"
      style={{ fontFamily: "Poppins", fontWeight: "500" }}
    >
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mt-6 mb-10 px-4">
        <h1
          className="text-[25px] leading-[25px] font-extrabold text-[#000000] text-left"
          style={{
            fontFamily: "Inter",
          }}
        >
          <span className="border-l-4 border-red-500 pl-2 inline-flex items-center h-[25px]">
            Add new Item
          </span>
        </h1>
      </div>

      {/* Main Form Container */}
      <div
        className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto"
        style={{ boxShadow: "0px 4px 20px 0px #00000040 inset" }}
      >
        <h2
          className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6"
          style={{ fontFamily: "Inter", fontWeight: "700" }}
        >
          Item Registration Form
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Item Name */}
          <div className="w-full px-2">
            <label className="block mb-1 text-black ml-2" style={labelStyle}>
              Item Name
            </label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleInputChange}
              placeholder="Enter Item Name"
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
             font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
              style={inputStyle}
              required
            />
          </div>

          {/* Location */}
          <div className="w-full px-2">
            <label className="block mb-1 text-black ml-2" style={labelStyle}>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter Location"
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
             font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
              style={inputStyle}
              required
            />
          </div>

          {/* Barcode ID */}
          <div className="w-full px-2">
            <label className="block mb-1 text-black ml-2" style={labelStyle}>
              Barcode ID
            </label>
            <input
              type="text"
              name="barcodeId"
              value={formData.barcodeId}
              onChange={handleInputChange}
              placeholder="Enter Barcode ID"
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
             font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
              style={inputStyle}
              required
            />
          </div>

          {/* Status */}
          <div className="w-full px-2">
            <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px] text-left">
              Status
            </label>

            <div className="relative w-full sm:max-w-[530px] h-[40px]">
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none
      text-[12px] leading-[22px] font-semibold font-[Poppins]
      ${formData.status === "" ? "text-[#0000008A]" : "text-black"}`}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  boxShadow: "0px 4px 10px 0px #00000040",
                }}
              >
                <option value="" disabled hidden>
                  Select Status
                </option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="disposed">Disposed</option>
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

          {/* Category */}
          <div className="w-full px-2">
            <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px] text-left">
              Category
            </label>

            <div className="relative w-full sm:max-w-[530px] h-[40px]">
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none
      text-[12px] leading-[22px] font-semibold font-[Poppins]
      ${formData.category === "" ? "text-[#0000008A]" : "text-black"}`}
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
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="office-supplies">Office Supplies</option>
                <option value="equipment">Equipment</option>
                <option value="vehicles">Vehicles</option>
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

          {/* Purchase Cost */}
          <div className="w-full px-2">
            <label className="block mb-1 text-black ml-2" style={labelStyle}>
              Purchase Cost (INR)
            </label>
            <input
              type="number"
              name="purchaseCost"
              value={formData.purchaseCost}
              onChange={handleInputChange}
              placeholder="Enter Cost"
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
             font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 sm:mt-8 w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter description here..."
            className="w-full px-4 py-3 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black 
           font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] resize-none"
            style={{
              ...inputStyle,
              height: "90px",
              padding: "12px 16px",
            }}
          />
        </div>

        {/* Purchase Date */}
        <div className="mt-6 sm:mt-8 w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>
            Purchase Date
          </label>
          <div className="relative flex items-center">
            <div className="relative w-[300px] max-w-full">
              <div className="relative w-[300px]">
                {/* Hidden native date input */}
                <input
                  ref={dateInputRef}
                  type="date"
                  name="purchaseDate"
                  value={
                    formData.purchaseDate
                      ? formData.purchaseDate.split("-").reverse().join("-")
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
                        purchaseDate: formattedDate,
                      }));
                    } else {
                      setFormData((prev) => ({ ...prev, purchaseDate: "" }));
                    }
                  }}
                  className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                  style={{ colorScheme: "light" }}
                />

                {/* Styled fake input that displays the selected date */}
                <div
                  className="bg-white rounded-[10px] px-4 
          h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] 
          tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040]"
                >
                  {formData.purchaseDate || ""}
                </div>

                {/* Placeholder spacing */}
                {!formData.purchaseDate && (
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

        {/* Upload Receipt */}
        <div className="mt-6 sm:mt-8 w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>
            Upload Receipt
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="w-full max-w-[290px] py-2 px-3 border focus:outline-none text-black file:mr-3 file:py-1 file:px-3 file:rounded file:border file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-gray-100"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#000000",
              height: "45px",
              borderRadius: "10px",
              borderColor: "#877575",
              outline: "none",
              boxShadow: "0px 4px 10px 0px #00000040",
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "14px",
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins]"
            style={{
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleGenerateQR}
            className="px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins]"
            style={{
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Generate QR Code
          </button>

          <button
            onClick={handleSaveItem}
            className="px-6 py-2 bg-white text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins]"
            style={{
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Save Item
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddNewItem;