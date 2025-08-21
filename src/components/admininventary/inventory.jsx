"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { QrCode, Camera, Download, Check, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import QRScanner from "../QRScanner/QRScanner";
import ItemDetailsModal from "../ItemDetailsModal/ItemDetailsModal";

// Import the new components (you'll need to create these files)
// import QRScanner from "./QRScanner";
// import ItemDetailsModal from "./ItemDetailsModal";

const statusColor = {
  "In Use": "bg-[#FF9D00] text-white",
  Available: "bg-[#28C404] text-white",
  "In maintenance": "bg-[#d6d6c2] text-black",
  Damaged: "bg-[#FF0000] text-white",
};

const InventoryList = ({ onAddNewItem, inventory, setInventory }) => {
  const [editData, setEditData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [hiddenRows, setHiddenRows] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);

  const fileInputRef = useRef(null);

  const toggleVisibility = (barcode) => {
    setHiddenRows((prev) => ({
      ...prev,
      [barcode]: !prev[barcode],
    }));
  };

  const handleDeleteItem = async (barcodeId) => {
    try {
      await api.delete(`/api/adminauth/inventory/${barcodeId}`);
      setInventory((prev) =>
        prev.filter((item) => item.barcodeId !== barcodeId)
      );
    } catch (error) {
      console.error("Failed to delete inventory item:", error);
    }
  };

  const handleUploadReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedItem) return;

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const { data } = await api.put(
        `/api/adminauth/inventory/${selectedItem._id}/receipt`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setInventory((prev) =>
        prev.map((item) => (item._id === data.item._id ? data.item : item))
      );
      alert(`Receipt uploaded for ${data.item.itemName}`);
    } catch (error) {
      console.error("Failed to upload receipt:", error);
    }
  };

  const generateMonthlyStockReport = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/adminauth/inventory/stock-report", {
        headers: {
          "Content-Type": "application/json",
          // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        responseType: "blob", // This is important for file downloads with axios
      });

      // For axios, check response.status instead of response.ok
      if (response.status === 200) {
        const blob = response.data; // axios already gives you the blob in response.data
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Generate filename with current month and year
        const now = new Date();
        const monthYear = now.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
        link.download = `Monthly_Stock_Report_${monthYear}.xlsx`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert("Stock report downloaded successfully!");
      } else {
        alert("Failed to generate stock report");
      }
    } catch (error) {
      console.error("Error generating stock report:", error);
      alert("Error generating stock report");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditData({ ...item });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      const { data } = await api.put(
        `/api/adminauth/inventory/${editData._id}`,
        editData
      );
      setInventory((prev) =>
        prev.map((item) => (item._id === data.item._id ? data.item : item))
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to update inventory:", error);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleGenerateQR = async (item) => {
    try {
      const response = await api.post(
        `/api/adminauth/inventory/${item._id}/qr-code`
      );
      if (response.data.success) {
        alert("QR code generated successfully!");
        // Update the item in the inventory list
        setInventory((prev) =>
          prev.map((inv) =>
            inv._id === item._id
              ? { ...inv, qrCodeUrl: response.data.qrCodeUrl }
              : inv
          )
        );
      }
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      alert("Failed to generate QR code");
    }
  };

 const handleDownloadQR = async (item) => {
  try {
    const response = await api.get(
      `/api/adminauth/inventory/${item._id}/qr-code/download`,
      { 
        responseType: 'blob' // This is crucial for downloading files
      }
    );
    
    if (response.data) {
      const blob = new Blob([response.data], { type: 'image/png' }); // Explicitly create blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${item.itemName}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      alert("Failed to download QR code");
    }
  } catch (error) {
    console.error("Error downloading QR code:", error);
    alert("Error downloading QR code");
  }
};

  const handleQRScanResult = (item) => {
    setScannedItem(item);
    setShowDetailModal(true);
    setSelectedItem(item);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-white min-h-screen py-4 w-full mt-6">
      <div className="px-4 sm:px-6 mb-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#4F8CCF]"></div>
            <h2 className="text-2xl font-bold text-black">Inventory List</h2>
          </div>

          <div className="flex gap-4 flex-wrap justify-end sm:ml-auto w-full sm:w-auto">
            {/* QR Scanner Button */}
            <button
              onClick={() => setShowQRScanner(true)}
              className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white px-5 py-1.5 rounded shadow-md w-full sm:w-auto"
            >
              <Camera size={17} />
              Scan QR Code
            </button>

            {/* Generate Monthly Stock Report */}
            <button
              onClick={generateMonthlyStockReport}
              className="flex items-center gap-2 bg-white border border-gray-300 cursor-pointer text-black px-4 py-1.5 rounded shadow-md font-base w-full sm:w-auto"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 18.925L8.25 14.675L9.65 13.275L12.5 16.125L18.15 10.475L19.55 11.875L12.5 18.925ZM18 9H16V4H14V7H4V4H2V18H8V20H2C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H6.175C6.35833 1.41667 6.71667 0.9375 7.25 0.5625C7.78333 0.1875 8.36667 0 9 0C9.66667 0 10.2625 0.1875 10.7875 0.5625C11.3125 0.9375 11.6667 1.41667 11.85 2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V9ZM9 4C9.28333 4 9.52083 3.90417 9.7125 3.7125C9.90417 3.52083 10 3.28333 10 3C10 2.71667 9.90417 2.47917 9.7125 2.2875C9.52083 2.09583 9.28333 2 9 2C8.71667 2 8.47917 2.09583 8.2875 2.2875C8.09583 2.47917 8 2.71667 8 3C8 3.28333 8.09583 3.52083 8.2875 3.7125C8.47917 3.90417 8.71667 4 9 4Z"
                  fill="black"
                />
              </svg>
              Generate Monthly Stock Report
            </button>

            {/* Add New Item */}
            <button
              onClick={onAddNewItem} // Use the prop function instead
              className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded shadow-md w-full sm:w-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="white"
                viewBox="0 0 24 24"
              >
                <path d="M13 11V5h-2v6H5v2h6v6h2v-6h6v-2z" />
              </svg>
              Add New Item
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8 px-4 sm:px-6">
        {/* Search Box */}
        <div className="relative flex-1 min-w-[250px] shadow-[0px_2px_4px_0px_#00000040] rounded-md">
          <FaSearch className="absolute top-3 left-3 text-black" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 text-m rounded-md bg-[#e8e8e8] text-black placeholder-black w-full outline-none"
            placeholder="Search by Item Name or Barcode ID"
          />
        </div>

        {/* Status Dropdown */}
        <select
          className="px-4 py-2 text-m rounded-md bg-[#e8e8e8] w-full sm:w-64 outline-none shadow-[0px_2px_4px_0px_#00000040]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>In Use</option>
          <option>Available</option>
          <option>In maintenance</option>
          <option>Damaged</option>
        </select>

        {/* Category Dropdown */}
        <select
          className="px-4 py-2 text-m rounded-md bg-[#e8e8e8] w-full sm:w-64 outline-none shadow-[0px_2px_4px_0px_#00000040]"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option>All Categories</option>
          <option>Bedding</option>
          <option>Furniture</option>
          <option>Electronics</option>
          <option>Applications</option>
        </select>
      </div>

      {/* Table */}
      <div className="px-4 sm:px-6">
        {/* Desktop Table View */}
        <div className="hidden sm:block rounded-2xl bg-[#BEC5AD] p-4 shadow-xl">
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[700px] text-center border-collapse">
              <thead>
                <tr className="bg-white text-black text-sm">
                  {[
                    "Item Name",
                    "Barcode ID",
                    "Category",
                    "Location",
                    "Status",
                    "QR Code",
                    "Action",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className={`px-0 py-2 ${
                        idx === 0 ? "rounded-tl-lg" : ""
                      } ${idx === 6 ? "rounded-tr-lg" : ""}`}
                    >
                      <div className="flex items-center pl-4 pr-4">
                        <span className="flex-1">{header}</span>
                        {idx < 6 && (
                          <div className="h-6 w-px bg-black ml-4"></div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white text-sm">
                {inventory
                  .filter(
                    (item) =>
                      (statusFilter === "All Status" ||
                        item.status === statusFilter) &&
                      (categoryFilter === "All Categories" ||
                        item.category === categoryFilter) &&
                      (item.itemName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                        item.barcodeId
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()))
                  )
                  .map((item) => (
                    <tr key={item.barcodeId} className="hover:bg-gray-100">
                      <td className="px-4 py-2">{item.itemName}</td>
                      <td className="px-4 py-2">{item.barcodeId}</td>
                      <td className="px-4 py-2">{item.category}</td>
                      <td className="px-4 py-2">{item.location}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block w-[100px] text-xs font-semibold text-center py-[6px] rounded-lg shadow-sm ${
                            statusColor[item.status]
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center gap-2">
                          {item.qrCodeUrl ? (
                            <button
                              onClick={() => handleDownloadQR(item)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Download QR Code"
                            >
                              <Download size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerateQR(item)}
                              className="text-green-600 hover:text-green-800"
                              title="Generate QR Code"
                            >
                              <QrCode size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 flex justify-center gap-3">
                        {/* View Icon */}
                        <div
                          className="cursor-pointer text-gray-600 hover:text-blue-600"
                          onClick={() => handleViewDetails(item)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </div>

                        <div className="w-[1px] h-5 bg-gray-400" />

                        {/* Edit Icon */}
                        <div
                          className="cursor-pointer text-gray-600 hover:text-green-600"
                          onClick={() => handleEditClick(item)}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 26 28"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0.5 28V23H25.5V28H0.5ZM5.5 18H7.25L17 8.28125L15.2188 6.5L5.5 16.25V18ZM3 20.5V15.1875L17 1.21875C17.2292 0.989583 17.4948 0.8125 17.7969 0.6875C18.099 0.5625 18.4167 0.5 18.75 0.5C19.0833 0.5 19.4062 0.5625 19.7188 0.6875C20.0312 0.8125 20.3125 1 20.5625 1.25L22.2813 3C22.5313 3.22917 22.7135 3.5 22.8281 3.8125C22.9427 4.125 23 4.44792 23 4.78125C23 5.09375 22.9427 5.40104 22.8281 5.70312C22.7135 6.00521 22.5313 6.28125 22.2813 6.53125L8.3125 20.5H3Z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden rounded-2xl bg-[#BEC5AD] p-4 shadow-xl space-y-4">
          {inventory
            .filter(
              (item) =>
                (statusFilter === "All Status" ||
                  item.status === statusFilter) &&
                (categoryFilter === "All Categories" ||
                  item.category === categoryFilter) &&
                (item.itemName
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                  item.barcodeId
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()))
            )
            .map((item) => (
              <div
                key={item.barcodeId}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <div className="mb-2">
                  <strong>Item Name:</strong> {item.itemName}
                </div>
                <div className="mb-2">
                  <strong>Barcode ID:</strong> {item.barcodeId}
                </div>
                <div className="mb-2">
                  <strong>Category:</strong> {item.category}
                </div>
                <div className="mb-2">
                  <strong>Location:</strong> {item.location}
                </div>
                <div className="mb-2">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-lg shadow-sm ${
                      statusColor[item.status]
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-green-600 text-xs hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {item.qrCodeUrl ? (
                      <button
                        onClick={() => handleDownloadQR(item)}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                        title="Download QR Code"
                      >
                        <Download size={14} />
                        QR
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateQR(item)}
                        className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1"
                        title="Generate QR Code"
                      >
                        <QrCode size={14} />
                        Generate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* QR Scanner Modal - Uncomment when you create the QRScanner component */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanResult={handleQRScanResult}
      />

      {/* Item Details Modal - Uncomment when you create the ItemDetailsModal component */}
      <ItemDetailsModal
        item={selectedItem}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedItem(null);
          setScannedItem(null);
        }}
        onEdit={handleEditClick}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Upload Receipt</h3>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleUploadReceipt}
              className="mb-4 w-full"
            />
            {receiptFile && (
              <p className="text-sm text-gray-700 mb-2">
                Selected: <strong>{receiptFile.name}</strong>
              </p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setReceiptFile(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (receiptFile) {
                    alert(`Uploaded: ${receiptFile.name}`);
                    setShowUploadModal(false);
                    setReceiptFile(null);
                  } else {
                    alert("Please select a file to upload.");
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Item</h3>
            {["itemName", "barcodeId", "category", "location"].map((field) => (
              <input
                key={field}
                className="border px-3 py-2 w-full mb-3 rounded"
                value={editData[field]}
                onChange={(e) =>
                  setEditData({ ...editData, [field]: e.target.value })
                }
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}
            <select
              value={editData.status}
              onChange={(e) =>
                setEditData({ ...editData, status: e.target.value })
              }
              className="w-full border px-3 py-2 mb-4 rounded"
            >
              <option>Available</option>
              <option>In Use</option>
              <option>In maintenance</option>
              <option>Damaged</option>
            </select>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded cursor-pointer"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
                onClick={handleEditSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Detail Modal with QR Code Support */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-4xl w-full h-[80%] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Item Details</h3>
              <button
                className="text-gray-600 cursor-pointer hover:text-red-600 text-xl"
                onClick={() => setShowDetailModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-lg mb-2">Basic Information</h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Item Name:</span>{" "}
                    {selectedItem.itemName}
                  </p>
                  <p>
                    <span className="font-semibold">Barcode ID:</span>{" "}
                    {selectedItem.barcodeId}
                  </p>
                  <p>
                    <span className="font-semibold">Category:</span>{" "}
                    {selectedItem.category}
                  </p>
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {selectedItem.location}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>
                    <span
                      className={`inline-block ml-2 px-2 py-1 text-xs rounded ${
                        statusColor[selectedItem.status] || "bg-gray-200"
                      }`}
                    >
                      {selectedItem.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-2">
                  Additional Information
                </h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Description:</span>{" "}
                    {selectedItem.description || "No description available"}
                  </p>
                  <p>
                    <span className="font-semibold">Purchase Date:</span>{" "}
                    {selectedItem.purchaseDate || "Not specified"}
                  </p>
                  <p>
                    <span className="font-semibold">Purchase Cost:</span>{" "}
                    {selectedItem.purchaseCost
                      ? `₹${selectedItem.purchaseCost}`
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
           {/* QR Code Section - FIXED */}
<div className="mt-6">
  <h4 className="font-bold text-lg mb-2">QR Code</h4>
  <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
    {selectedItem.qrCodeUrl ? (
      <div className="flex flex-col items-center">
        <img
          src={(() => {
            // Construct the correct URL for QR code
            const baseUrl = process.env.NEXT_PUBLIC_PROD_API_URL || 'http://localhost:5224';
            let qrPath = selectedItem.qrCodeUrl;
            
            // If it's already a complete URL, use it
            if (qrPath.startsWith('http')) {
              return qrPath;
            }
            
            // Clean up the path and construct proper URL
            if (qrPath.startsWith('/')) qrPath = qrPath.substring(1);
            if (qrPath.startsWith('public/')) qrPath = qrPath.substring(7);
            if (!qrPath.startsWith('qrcodes/')) qrPath = `qrcodes/${qrPath}`;
            
            return `${baseUrl}/${qrPath}`;
          })()}
          alt="QR Code"
          className="w-32 h-32 border border-gray-300 rounded-lg mb-2"
          onError={(e) => {
            console.error('QR code failed to load. Trying alternative URLs...');
            const filename = selectedItem.qrCodeUrl.split('/').pop();
            const baseUrl = process.env.NEXT_PUBLIC_PROD_API_URL || 'http://localhost:5224';
            const alternatives = [
              `${baseUrl}/qrcodes/${filename}`,
              `${baseUrl}/public/qrcodes/${filename}`,
              `${baseUrl}${selectedItem.qrCodeUrl}`,
            ];
            
            // Try alternative URLs
            const currentSrc = e.target.src;
            const nextAlt = alternatives.find(alt => alt !== currentSrc);
            
            if (nextAlt) {
              console.log('Trying alternative URL:', nextAlt);
              e.target.src = nextAlt;
            } else {
              // All alternatives failed, show error
              console.error('All QR code URL attempts failed');
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }
          }}
          onLoad={() => {
            console.log('QR code loaded successfully');
          }}
        />
        <div style={{ display: 'none' }} className="w-32 h-32 border border-red-300 rounded-lg mb-2 flex items-center justify-center bg-red-50">
          <span className="text-red-500 text-xs text-center">QR Code<br/>Load Failed</span>
        </div>
        <p className="mb-2">QR Code generated</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          onClick={() => handleDownloadQR(selectedItem)}
        >
          <Download size={16} />
          Download QR Code
        </button>
      </div>
    ) : (
      <div className="flex flex-col items-center">
        <QrCode size={48} className="text-gray-400 mb-2" />
        <p className="mb-2">No QR code generated</p>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          onClick={() => handleGenerateQR(selectedItem)}
        >
          <QrCode size={16} />
          Generate QR Code
        </button>
      </div>
    )}
  </div>
</div>

            {/* Receipt Section */}
            <div className="mt-6">
              <h4 className="font-bold text-lg mb-2">Receipt</h4>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                {selectedItem.receiptUrl ? (
                  <div className="flex flex-col items-center">
                    <p>Receipt uploaded</p>
                    <button
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => {
                        window.open(selectedItem.receiptUrl, "_blank");
                      }}
                    >
                      View Receipt
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="mb-2">No receipt uploaded</p>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedItem(selectedItem);
                        triggerFileInput();
                      }}
                    >
                      Upload Receipt
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-4xl w-full h-[80%] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Monthly Stock Report</h3>
              <button
                className="text-gray-600 cursor-pointer hover:text-red-600 text-xl"
                onClick={() => setShowReportModal(false)}
              >
                &times;
              </button>
            </div>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-[#A4B494] text-black text-sm">
                  <th className="py-2 px-4 border-b">Item Name</th>
                  <th className="py-2 px-4 border-b">Barcode ID</th>
                  <th className="py-2 px-4 border-b">Category</th>
                  <th className="py-2 px-4 border-b">Location</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">QR Code</th>
                </tr>
              </thead>
              <tbody>
                {inventory
                  .filter(
                    (item) =>
                      (statusFilter === "All Status" ||
                        item.status === statusFilter) &&
                      (categoryFilter === "All Categories" ||
                        item.category === categoryFilter) &&
                      (item.itemName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                        item.barcodeId
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()))
                  )
                  .map((item) => (
                    <tr key={item.barcodeId} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">{item.itemName}</td>
                      <td className="py-2 px-4 border-b">{item.barcodeId}</td>
                      <td className="py-2 px-4 border-b">{item.category}</td>
                      <td className="py-2 px-4 border-b">{item.location}</td>
                      <td className="py-2 px-4 border-b">{item.status}</td>
                      <td className="py-2 px-4 border-b">
                        {item.qrCodeUrl ? (
                          <span className="text-green-600">✓ Generated</span>
                        ) : (
                          <span className="text-gray-500">Not Generated</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// AddNewItem component integrated within the same file
function AddNewItem({ onBackToInventory, onItemAdded }) {
  // Track the current origin for QR code generation (avoids SSR/undefined issues)
  const [origin, setOrigin] = useState("");
  const [availableLocations] = useState([
    "Main Building",
    "Kitchen",
    "Mess Hall",
    "Recreation Room",
    "Study Hall",
  ]);
  const [availableRoomsForInventory, setAvailableRoomsForInventory] = useState([]);
  const [availableFloors, setAvailableFloors] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

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
    roomNo: "",
    floor: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedItem, setGeneratedItem] = useState(null);

  const fetchAvailableRoomsForInventory = async () => {
    try {
      const response = await api.get(
        "/api/adminauth/inventory/available-rooms-floors",
        {
          headers: {
            // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
        }
      );
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      return { rooms: [], floors: [] };
    }
  };

  // Fixed barcode generation function
  const generateBarcodeId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const itemPrefix = formData.itemName
      ? formData.itemName.toUpperCase().replace(/\s+/g, "").substring(0, 3)
      : "ITM";
    return `${itemPrefix}${timestamp}${random}`;
  };

  // Auto-generate barcode when item name changes
  useEffect(() => {
    if (formData.itemName) {
      const newBarcodeId = generateBarcodeId();
      setFormData(prev => ({
        ...prev,
        barcodeId: newBarcodeId
      }));
    }
  }, [formData.itemName]);

  useEffect(() => {
    const loadAvailableRoomsFloors = async () => {
      const data = await fetchAvailableRoomsForInventory();
      setAvailableRoomsForInventory(data.rooms || []);
      setAvailableFloors(data.floors || []);
    };

    loadAvailableRoomsFloors();
  }, []);

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

  // Fixed validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = "Item Name is required.";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
    }

    if (!formData.barcodeId.trim()) {
      newErrors.barcodeId = "Barcode ID is required.";
    }

    if (!formData.status) {
      newErrors.status = "Status is required.";
    }

    if (!formData.category) {
      newErrors.category = "Category is required.";
    }

    if (!formData.roomNo.trim()) {
      newErrors.roomNo = "Room No is required.";
    }

    if (!formData.floor.trim()) {
      newErrors.floor = "Floor is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      roomNo: "",
      floor: "",
      barcodeId: "",
      status: "",
      category: "",
      description: "",
      purchaseDate: "",
      purchaseCost: "",
      receipt: null,
    });
    setErrors({});
    onBackToInventory();
  };

  // Fixed handleGenerateQR function
const handleGenerateQR = async () => {
  console.log("Generate QR & Save button clicked"); // Debug log
  
  if (!validateForm()) {
    console.log("Form validation failed", errors); // Debug log
    return;
  }

  setIsSubmitting(true);
  try {
    const formDataToSend = new FormData();
    formDataToSend.append("itemName", formData.itemName);
    formDataToSend.append("barcodeId", formData.barcodeId);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("purchaseDate", formData.purchaseDate);
    formDataToSend.append("purchaseCost", formData.purchaseCost);
    if (formData.receipt) {
      formDataToSend.append("receipt", formData.receipt);
    }
    formDataToSend.append("roomNo", formData.roomNo);
    formDataToSend.append("floor", formData.floor);

    console.log("Sending data to API"); // Debug log
    const { data } = await api.post(
      `/api/adminauth/inventory/add`,
      formDataToSend,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (data.success) {
      console.log("Item added successfully", data.item); // Debug log
      setGeneratedItem(data.item);
      setShowSuccessModal(true);
      if (onItemAdded) {
        onItemAdded(data.item);
      }
    }
  } catch (error) {
    console.error("Failed to add inventory item:", error);
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert("Failed to add item. Please try again.");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // Fixed handleSaveItem function
  // const handleSaveItem = async () => {
  //   console.log("Save Item button clicked"); // Debug log
    
  //   if (!validateForm()) {
  //     console.log("Form validation failed", errors); // Debug log
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   try {
  //     const formDataToSend = new FormData();
  //     formDataToSend.append("itemName", formData.itemName);
  //     formDataToSend.append("barcodeId", formData.barcodeId);
  //     formDataToSend.append("category", formData.category);
  //     formDataToSend.append("location", formData.location);
  //     formDataToSend.append("status", formData.status);
  //     formDataToSend.append("description", formData.description);
  //     formDataToSend.append("purchaseDate", formData.purchaseDate);
  //     formDataToSend.append("purchaseCost", formData.purchaseCost);
  //     if (formData.receipt) {
  //       formDataToSend.append("receipt", formData.receipt);
  //     }
  //     formDataToSend.append("roomNo", formData.roomNo);
  //     formDataToSend.append("floor", formData.floor);

  //     console.log("Sending data to API"); // Debug log
  //     const { data } = await api.post(
  //       `/api/adminauth/inventory/add`,
  //       formDataToSend,
  //       { headers: { "Content-Type": "multipart/form-data" } }
  //     );

  //     if (data.success) {
  //       console.log("Item saved successfully", data.item); // Debug log
  //       if (onItemAdded) {
  //         onItemAdded(data.item);
  //       }
  //       alert("Item saved successfully!");
  //       onBackToInventory();
  //     }
  //   } catch (error) {
  //     console.error("Failed to add inventory item:", error);
  //     if (error.response?.data?.message) {
  //       alert(error.response.data.message);
  //     } else {
  //       alert("Failed to add item. Please try again.");
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleDownloadQR = async () => {
    if (!generatedItem) return;

    try {
      const response = await api.get(
        `/api/adminauth/inventory/${generatedItem._id}/qr-code/download`
      );
      if (response.data) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${generatedItem.itemName}-QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download QR code");
      }
    } catch (error) {
      console.error("Error downloading QR code:", error);
      alert("Error downloading QR code");
    }
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
          <span className="border-l-4 border-blue-500 pl-2 inline-flex items-center h-[25px]">
            Add new Item
          </span>
        </h1>
      </div>

      <div className="mb-4">
        <button
          onClick={onBackToInventory}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Inventory List
        </button>
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
              className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black
              font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
                errors.itemName ? "border-2 border-red-500" : ""
              }`}
              style={inputStyle}
              required
            />
            {errors.itemName && (
              <p className="text-red-500 text-xs mt-1 ml-2">
                {errors.itemName}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="w-full px-2">
  <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px] text-left">
    Location
  </label>
  <div className="relative w-full sm:max-w-[530px] h-[40px]">
    <select
      name="location"
      value={formData.location}
      onChange={handleInputChange}
      className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${
        formData.location === "" ? "text-[#0000008A]" : "text-black"
      } ${errors.location ? "border-2 border-red-500" : ""}`}
      style={{
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        boxShadow: "0px 4px 10px 0px #00000040",
      }}
      required
    >
      <option value="" disabled hidden>
        Select Location
      </option>
      {availableLocations.map((location) => (
        <option key={location} value={location}>
          {location}
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
  {errors.location && (
    <p className="text-red-500 text-xs mt-1 ml-2">{errors.location}</p>
  )}
</div>

{/* Barcode ID - Updated to match input style */}
<div className="w-full px-2">
  <label className="block mb-1 text-black ml-2" style={labelStyle}>
    Barcode ID
  </label>
  <input
    type="text"
    name="barcodeId"
    value={formData.barcodeId || generateBarcodeId()}
    readOnly
    className="w-full px-4 bg-gray-100 rounded-[10px] border-0 outline-none text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] cursor-not-allowed"
    style={inputStyle}
    placeholder="Auto-generated"
  />
  <p className="text-xs text-gray-600 mt-1 ml-2">
    Barcode ID is automatically generated
  </p>
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
      ${formData.status === "" ? "text-[#0000008A]" : "text-black"} ${
                  errors.status ? "border-2 border-red-500" : ""
                }`}
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
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="In maintenance">In maintenance</option>
                <option value="Damaged">Damaged</option>
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
            {errors.status && (
              <p className="text-red-500 text-xs mt-1 ml-2">{errors.status}</p>
            )}
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
      ${formData.category === "" ? "text-[#0000008A]" : "text-black"} ${
                  errors.category ? "border-2 border-red-500" : ""
                }`}
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
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Bedding">Bedding</option>
                <option value="Applications">Applications</option>
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
            {errors.category && (
              <p className="text-red-500 text-xs mt-1 ml-2">
                {errors.category}
              </p>
            )}
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

          {/* Room No */}
          <div className="w-full px-2">
  <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px] text-left">
    Room No
  </label>
  <div className="relative w-full sm:max-w-[530px] h-[40px]">
    <select
      name="roomNo"
      value={formData.roomNo}
      onChange={handleInputChange}
      className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${
        formData.roomNo === "" ? "text-[#0000008A]" : "text-black"
      } ${errors.roomNo ? "border-2 border-red-500" : ""}`}
      style={{
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        boxShadow: "0px 4px 10px 0px #00000040",
      }}
    >
      <option value="" disabled hidden>
        Select Room Number
      </option>
      {availableRoomsForInventory.map((room) => (
        <option key={room} value={room}>
          Room {room}
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
  {errors.roomNo && (
    <p className="text-red-500 text-xs mt-1 ml-2">{errors.roomNo}</p>
  )}
</div>

{/* Floor - Updated to match other dropdowns */}
<div className="w-full px-2">
  <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px] text-left">
    Floor
  </label>
  <div className="relative w-full sm:max-w-[530px] h-[40px]">
    <select
      name="floor"
      value={formData.floor}
      onChange={handleInputChange}
      className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${
        formData.floor === "" ? "text-[#0000008A]" : "text-black"
      } ${errors.floor ? "border-2 border-red-500" : ""}`}
      style={{
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        boxShadow: "0px 4px 10px 0px #00000040",
      }}
    >
      <option value="" disabled hidden>
        Select Floor
      </option>
      {availableFloors.map((floor) => (
        <option key={floor} value={floor}>
          Floor {floor}
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
  {errors.floor && (
    <p className="text-red-500 text-xs mt-1 ml-2">{errors.floor}</p>
  )}
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
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1">
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
              <div className="bg-white rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040] w-full">
                {formData.purchaseDate || ""}
              </div>
              {/* Placeholder spacing */}
              {!formData.purchaseDate && (
                <div className="absolute top-1/2 left-4 -translate-y-1/2 z-0 text-gray-500 font-[Poppins] font-semibold text-[15px] tracking-[0.1em] md:tracking-[0.3em] pointer-events-none select-none overflow-hidden text-ellipsis whitespace-nowrap pr-4">
                  {
                    "d\u00A0d\u00A0-\u00A0m\u00A0m\u00A0-\u00A0y\u00A0y\u00A0y\u00A0y"
                  }
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleCalendarClick}
              className="p-2 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
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
            className="cursor-pointer w-full max-w-[290px] py-2 px-3 border focus:outline-none text-black file:mr-3 file:py-1 file:px-3 file:rounded file:border file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-gray-100"
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
        {/* Buttons */}
<div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
  <button
    type="button"
    onClick={handleCancel}
    disabled={isSubmitting}
    className="px-6 py-2 bg-white text-black cursor-pointer rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] disabled:opacity-50"
    style={{
      fontWeight: "600",
      fontSize: "15px",
    }}
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={handleGenerateQR}
    disabled={isSubmitting}
    className="px-6 py-2 bg-green-600 cursor-pointer text-white rounded-[10px] shadow hover:bg-green-700 transition-colors font-[Poppins] flex items-center gap-2 justify-center disabled:opacity-50"
    style={{
      fontWeight: "600",
      fontSize: "15px",
    }}
  >
    {isSubmitting ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        Processing...
      </>
    ) : (
      <>
        <QrCode size={16} />
        Generate QR & Save Item
      </>
    )}
  </button>
</div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && generatedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Item Added Successfully!
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                QR code has been generated for {generatedItem.itemName}
              </p>

              {/* QR Code Preview */}
              {generatedItem &&
                (generatedItem.publicUrl || generatedItem.qrCodeUrl) && (
                  <div className="mb-4 flex flex-col items-center">
                    {generatedItem.publicUrl ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          generatedItem.publicUrl
                        )}`}
                        alt="Generated QR Code"
                        className="mx-auto w-32 h-32 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <img
                        src={
                          generatedItem.qrCodeUrl.startsWith("http")
                            ? generatedItem.qrCodeUrl.replace(
                                "/public/qrcodes",
                                "/qrcodes"
                              )
                            : `${
                                process.env.NEXT_PUBLIC_PROD_API_URL ||
                                "http://localhost:5224"
                              }${generatedItem.qrCodeUrl.replace(
                                "/public/qrcodes",
                                "/qrcodes"
                              )}`
                        }
                        alt="Generated QR Code"
                        className="mx-auto w-32 h-32 border border-gray-300 rounded-lg"
                      />
                    )}
                    <div className="mt-2 text-xs break-all text-gray-500">
                      {generatedItem.publicUrl || generatedItem.qrCodeUrl}
                    </div>
                  </div>
                )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleDownloadQR}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
                >
                  <QrCode size={16} />
                  Download QR Code
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onBackToInventory();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back to Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component that manages the view state and central inventory data
export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [currentView, setCurrentView] = useState("inventory");

  const fetchInventory = async () => {
    try {
      const { data } = await api.get(`/api/adminauth/inventory`);
      setInventory(data.items);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddNewItem = () => setCurrentView("addItem");
  const handleBackToInventory = () => setCurrentView("inventory");
  const handleItemAdded = (newItem) =>
    setInventory((prev) => [...prev, newItem]);

  return currentView === "inventory" ? (
    <InventoryList
      onAddNewItem={handleAddNewItem}
      inventory={inventory}
      setInventory={setInventory}
      fetchInventory={fetchInventory}
    />
  ) : (
    <AddNewItem
      onBackToInventory={handleBackToInventory}
      onItemAdded={handleItemAdded}
    />
  );
}
