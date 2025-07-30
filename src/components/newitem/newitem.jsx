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

  const labelStyle = {
    fontFamily: "Poppins",
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "clamp(18px, 2.5vw, 25px)",
    lineHeight: "1.5",
    textAlign: "left",
    color: "#000000",
    display: "block",
    marginBottom: "8px",
  };

  const inputStyle = {
    width: "100%",
    height: "40px",
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
    borderRadius: "10px",
    color: "#000000",
    outline: "none",
    border: "none",
    padding: "0 16px",
    fontSize: "14px",
    fontFamily: "Poppins",
    fontWeight: "400",
    lineHeight: "1.2",
    letterSpacing: "normal",
  };

  return (
    <div
      className="min-h-screen bg-white p-3 sm:p-4 md:p-6 lg:p-8"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="w-full max-w-7xl mx-auto">
        <h1
          className="mt-6 sm:mb-8 md:mb-10 text-2xl sm:text-3xl md:text-2xl font-bold text-black flex items-center ml-4"
          style={{
            fontFamily: "Inter",
            fontWeight: 700,
            fontStyle: "normal",
            lineHeight: "100%",
            letterSpacing: "0%",
            color: "#000000",
          }}
        >
          <span className="w-1 h-8 sm:h-10 md:h-5 bg-red-500 mr-2 sm:mr-3"></span>
          <span>Add new Item</span>
        </h1>

        <div
          className="rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 w-full"
          style={{
            backgroundColor: "#BEC5AD",
            boxShadow: "0px 4px 20px 0px #00000040 inset",
            borderRadius: "20px",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Item Name */}
            <div className="w-full">
              <label
                htmlFor="itemName"
                className="block font-medium text-black mb-2 text-[18px] sm:text-[18px] md:text-[18px] lg:text-[18px] ml-4"
                style={{
                  fontFamily: "Poppins",
                  lineHeight: "1.5",
                }}
              >
                Item Name
              </label>

              <input
                id="itemName"
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                style={inputStyle}
              />
            </div>

            {/* Location */}
            <div className="w-full">
              <label
                htmlFor="location"
                className="block font-medium text-black mb-2 text-[18px] sm:text-[18px] md:text-[18px] lg:text-[18px] ml-4"
                style={{
                  fontFamily: "Poppins",
                  lineHeight: "1.5",
                }}
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                style={inputStyle}
              />
            </div>

            {/* Barcode ID */}
            <div className="w-full">
              <label
                htmlFor="barcodeId"
                className="block font-medium text-black mb-2 text-[18px] sm:text-[18px] md:text-[18px] lg:text-[18px] ml-4"
                style={{
                  fontFamily: "Poppins",
                  lineHeight: "1.5",
                }}
              >
                Barcode ID
              </label>
              <input
                id="barcodeId"
                type="text"
                name="barcodeId"
                value={formData.barcodeId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                style={inputStyle}
              />
            </div>

            {/* Status */}
            <div className="relative w-full">
              <label
                htmlFor="status"
                className="block font-medium text-black mb-2 text-[18px] sm:text-[18px] md:text-[18px] lg:text-[18px] ml-4"
                style={{
                  fontFamily: "Poppins",
                  lineHeight: "1.5",
                }}
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="appearance-none w-full px-12 py-3 rounded-xl text-gray-800 bg-white font-medium text-[12px] shadow-[0px_4px_10px_rgba(0,0,0,0.25)] outline-none leading-[1.1]"
                style={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  border: "none",
                  height: "40px",
                  paddingLeft: "20px",
                  paddingRight: "16px",
                  color: formData.status ? "#000000" : "#6B7280",
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <option value="" disabled style={{ color: "#9CA3AF" }}>
                  Select Status
                </option>
                <option value="active" style={{ color: "#6B7280" }}>
                  Active
                </option>
                <option value="inactive" style={{ color: "#6B7280" }}>
                  Inactive
                </option>
                <option value="maintenance" style={{ color: "#6B7280" }}>
                  Maintenance
                </option>
                <option value="disposed" style={{ color: "#6B7280" }}>
                  Disposed
                </option>
              </select>
              {/* Right-positioned Arrow */}
              <svg
                className="w-4 h-4 text-gray-600 absolute right-10 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{
                  top: "calc(60% + 12px)",
                  transform: "translateY(-50%)",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Category */}
            <div className="relative w-full">
              <label
                htmlFor="category"
                className="block font-medium text-black mb-2 text-[18px] sm:text-[18px] md:text-[18px] lg:text-[18px] ml-4"
                style={{
                  fontFamily: "Poppins",
                  lineHeight: "1.5",
                }}
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="appearance-none w-full px-12 py-3 rounded-xl text-gray-800 bg-white font-medium text-[12px] shadow-[0px_4px_10px_rgba(0,0,0,0.25)] outline-none leading-[1.1]"
                style={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  border: "none",
                  height: "42px",
                  paddingLeft: "20px",
                  paddingRight: "16px",
                  color: formData.status ? "#000000" : "#6B7280",
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <option value="" disabled style={{ color: "#9CA3AF" }}>
                  Select Category
                </option>
                <option value="electronics" style={{ color: "#6B7280" }}>
                  Electronics
                </option>
                <option value="furniture" style={{ color: "#6B7280" }}>
                  Furniture
                </option>
                <option value="office-supplies" style={{ color: "#6B7280" }}>
                  Office Supplies
                </option>
                <option value="equipment" style={{ color: "#6B7280" }}>
                  Equipment
                </option>
                <option value="vehicles" style={{ color: "#6B7280" }}>
                  Vehicles
                </option>
              </select>
              {/* Right-positioned Arrow */}
              <svg
                className="w-4 h-4 text-gray-600 absolute right-15 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{
                  top: "calc(60% + 12px)",
                  transform: "translateY(-50%)",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 sm:mt-8 w-full">
            <label
              htmlFor="description"
              className="block font-medium text-black mb-2 text-[18px] sm:text-[18px] md:text-[18px] lg:text-[18px] ml-4"
              style={{
                fontFamily: "Poppins",
                lineHeight: "1.5",
              }}
            >
              Description (Optional)
            </label>
            <>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter description here..."
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none"
                style={{
                  width: "100%",
                  height: "90px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
                  borderRadius: "10px",
                  color: "#000000",
                  border: "none",
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  resize: "none",
                }}
              />

              <style>
                {`
      textarea::placeholder {
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        font-size: 12px;
        color: #6B7280;
      }
                 `}
              </style>
            </>
          </div>

          {/* Purchase Date and Cost Section */}
          <div className="mt-6 sm:mt-8">
            {/* Purchase Date */}
            <div
              className="w-full mb-4 sm:mb-6"
              style={{ position: "relative", zIndex: 1000 }}
            >
              <label
                htmlFor="purchaseDate"
                className="block font-medium text-black mb-2 text-[18px] sm:text-[18px] md:text-[18px] lg:text-[18px] ml-4"
                style={{
                  fontFamily: "Poppins",
                  lineHeight: "1.5",
                }}
              >
                Purchase Date
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <input
                  id="purchaseDate"
                  type="text"
                  name="purchaseDate"
                  value={formatDateForDisplay(formData.purchaseDate)}
                  onChange={handleInputChange}
                  placeholder="dd - mm - yyyy"
                  readOnly
                  className="w-full max-w-[290px] h-[40px] px-3 py-2 border border-gray-300 text-center text-[15px] font-medium font-[Poppins] text-gray-800 bg-white rounded-[10px] shadow-[0_4px_10px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder:text-gray-500 placeholder:font-medium placeholder:font-[Poppins] cursor-pointer"
                  style={{
                    backgroundColor: "#FFFFFF",
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "15px",
                    lineHeight: "100%",
                    letterSpacing: "0.7em",
                    textAlign: "center",
                    color: formData.purchaseDate ? "#000000" : "#6B7280",
                    width: "100%",
                    maxWidth: "290px",
                    height: "40px",
                    borderRadius: "10px",
                    position: "relative",
                    zIndex: 1001,
                    outline: "none",
                    boxShadow: "0px 4px 10px 0px #00000040",
                    cursor: "pointer",
                  }}
                />
                <input
                  type="date"
                  ref={dateInputRef}
                  value={formData.purchaseDate}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "0",
                    zIndex: 1002,
                    width: "290px",
                    height: "40px",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      purchaseDate: e.target.value,
                    }));
                  }}
                />
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => {
                    if (dateInputRef.current) {
                      dateInputRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });

                      setTimeout(() => {
                        dateInputRef.current.focus();
                        if (dateInputRef.current.showPicker) {
                          dateInputRef.current.showPicker();
                        }
                      }, 3);
                    }
                  }}
                  className="flex-shrink-0 self-start sm:self-center cursor-pointer ml-4"
                >
                  <mask
                    id="mask0_219_909"
                    style={{ maskType: "alpha" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="30"
                    height="30"
                  >
                    <rect width="30" height="30" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_219_909)">
                    <path
                      d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 15.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 16.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 16.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 21.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 21.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z"
                      fill="#1C1B1F"
                    />
                  </g>
                </svg>
              </div>
            </div>

            {/* Purchase Cost */}
            <div className="w-full">
              <label
                htmlFor="purchaseCost"
                className="block font-medium text-black mb-2 text-[18px] sm:text-[18px] md:text-[18px] lg:text-[18px] ml-4"
                style={{
                  fontFamily: "Poppins",
                  lineHeight: "1.5",
                }}
              >
                Purchase Cost (INR)
              </label>
              <input
                id="purchaseCost"
                type="number"
                name="purchaseCost"
                value={formData.purchaseCost}
                onChange={handleInputChange}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  width: "100%",
                  maxWidth: "290px",
                  height: "40px",
                  borderRadius: "10px",
                  outline: "none",
                  boxShadow: "0px 4px 10px 0px #00000040",
                  fontFamily: "Poppins",
                  fontSize: "14px",
                  padding: "0 16px",
                }}
              />
            </div>
          </div>

          {/* Upload Receipt */}
          <div className="mt-6 sm:mt-8 w-full">
            <label
              htmlFor="receipt"
              className="block font-medium text-black mb-2 text-[18px] sm:text-[18px] md:text-[18px] lg:text-[18px] ml-4"
              style={{
                fontFamily: "Poppins",
                lineHeight: "1.5",
              }}
            >
              Upload Receipt
            </label>
            <input
              id="receipt"
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="w-full sm:w-auto py-2 px-3 border focus:outline-none text-black file:mr-3 file:py-1 file:px-3 file:rounded file:border file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-gray-100"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#000000",
                width: "100%",
                maxWidth: "290px",
                height: "45px",
                borderRadius: "10px",
                borderColor: "#877575",
                outline: "none",
                boxShadow: "0px 4px 10px 0px #00000040",
                fontFamily: "Poppins",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "clamp(14px, 2vw, 20px)",
                lineHeight: "100%",
                letterSpacing: "0%",
                textAlign: "center",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8 sm:mt-10 sm:justify-end">
            <button
              onClick={handleCancel}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 text-black bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              style={{
                outline: "none",
                fontFamily: "Poppins",
                fontWeight: 600,
                fontStyle: "normal",
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "0%",
                textAlign: "center",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateQR}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              style={{
                outline: "none",
                fontFamily: "Poppins",
                fontWeight: 600,
                fontStyle: "normal",
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "0%",
                textAlign: "center",
              }}
            >
              Generate QR Code
            </button>
            <button
              onClick={handleSaveItem}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              style={{
                outline: "none",
                fontFamily: "Poppins",
                fontWeight: 600,
                fontStyle: "normal",
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "0%",
                textAlign: "center",
              }}
            >
              Save Item
            </button>
          </div>

          {/* Global CSS to remove all outlines and set white background */}
          <style jsx global>{`
            * {
              outline: none !important;
            }

            html,
            body {
              background-color: #ffffff !important;
              margin: 0;
              padding: 0;
            }

            input:focus,
            select:focus,
            textarea:focus,
            button:focus {
              outline: none !important;
              box-shadow: none !important;
            }

            input[type="text"]:focus,
            input[type="number"]:focus,
            input[type="date"]:focus,
            select:focus,
            textarea:focus {
              outline: none !important;
              border: 2px solid #6b7280 !important;
            }

            input[type="file"]:focus {
              outline: none !important;
              border: 2px solid #877575 !important;
            }

            input[type="date"]::-webkit-calendar-picker-indicator {
              display: none;
              -webkit-appearance: none;
            }

            input[type="date"]::-webkit-inner-spin-button,
            input[type="date"]::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }

            /* Fix cursor/caret consistency - Force thin cursor */
            input[type="text"],
            input[type="number"],
            textarea {
              caret-color: #000000 !important;
              font-size: 14px !important;
              line-height: normal !important;
              font-weight: normal !important;
            }

            /* Force consistent font rendering */
            input[type="text"]#location,
            input[type="text"]#itemName,
            input[type="text"]#barcodeId {
              font-family: "Poppins", sans-serif !important;
              font-size: 14px !important;
              font-weight: 400 !important;
              line-height: 1.2 !important;
              letter-spacing: normal !important;
            }

            /* Remove any webkit text size adjust */
            input[type="text"],
            input[type="number"],
            textarea {
              -webkit-text-size-adjust: 100% !important;
              -moz-text-size-adjust: 100% !important;
              text-size-adjust: 100% !important;
            }

            /* Responsive adjustments */
            @media (max-width: 640px) {
              .grid {
                gap: 1rem !important;
              }
            }

            @media (max-width: 480px) {
              input,
              select,
              textarea {
                font-size: 16px !important; /* Prevents zoom on iOS */
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

export default AddNewItem;
