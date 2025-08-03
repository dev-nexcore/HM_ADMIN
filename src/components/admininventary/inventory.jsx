"use client";
import { useState, useRef } from "react";
import { FaSearch } from "react-icons/fa";

const initialData = [
  {
    name: "Single bed",
    barcode: "INV-BED-A101-1",
    category: "Bedding",
    location: "Room-A-101",
    status: "In Use",
    description: "Standard single bed with mattress",
    purchaseDate: "12-05-2022",
    purchaseCost: "12000",
    receipt:null
  },
  {
    name: "Study Chair",
    barcode: "INV-CHR-A101-1",
    category: "Furniture",
    location: "Room-A-101",
    status: "Available",
    description: "Ergonomic study chair with adjustable height",
    purchaseDate: "15-06-2022",
    purchaseCost: "4500",
    receipt:null
  },
  {
    name: "Ceiling Fan",
    barcode: "INV-FAN-A101-1",
    category: "Electronics",
    location: "Room-A-101",
    status: "In maintenance",
    description: "3-blade ceiling fan with remote control",
    purchaseDate: "20-04-2022",
    purchaseCost: "3200",
    receipt:null
  },
  {
    name: "Wardrobe",
    barcode: "INV-WAR-A101-1",
    category: "Furniture",
    location: "Room-A-101",
    status: "In Use",
    description: "Wooden wardrobe with mirror",
    purchaseDate: "05-03-2022",
    purchaseCost: "18000",
    receipt:null
  },
  {
    name: "Water Heater",
    barcode: "INV-WHT-A101-1",
    category: "Applications",
    location: "Room-A-101",
    status: "Damaged",
    description: "15L instant water heater",
    purchaseDate: "10-01-2022",
    purchaseCost: "7500",
    receipt:null
  },
];

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
  const fileInputRef = useRef(null);

  const toggleVisibility = (barcode) => {
    setHiddenRows((prev) => ({
      ...prev,
      [barcode]: !prev[barcode],
    }));
  };

  const handleUploadReceipt = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert("Only JPEG, PNG, or PDF files are allowed");
      return;
    }

    if (selectedItem) {
      // Update the specific item with the receipt
      setInventory(prev => prev.map(item => 
        item.barcode === selectedItem.barcode 
          ? { ...item, receipt: file } 
          : item
      ));
      alert(`Receipt uploaded for ${selectedItem.name}`);
    } else {
      // For new items
      setReceiptFile(file);
    }
  }
};
  const handleEditClick = (item) => {
    setEditData({ ...item });
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    setInventory((prev) =>
      prev.map((item) => (item.barcode === editData.barcode ? editData : item))
    );
    setShowEditModal(false);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
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
            {/* Upload Receipt */}
            <button
              onClick={triggerFileInput}
              className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded shadow-md w-full sm:w-auto"
            >
             <svg width="17" height="16" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.05147 14.783V4.82777L5.87557 8.00367L4.16547 6.23249L10.273 0.125L16.3805 6.23249L14.6704 8.00367L11.4945 4.82777V14.783H9.05147ZM2.94397 19.669C2.27215 19.669 1.69703 19.4298 1.21861 18.9513C0.740187 18.4729 0.500977 17.8978 0.500977 17.226V13.5615H2.94397V17.226H17.602V13.5615H20.045V17.226C20.045 17.8978 19.8057 18.4729 19.3273 18.9513C18.8489 19.4298 18.2738 19.669 17.602 19.669H2.94397Z" fill="white"/>
</svg>

              Upload Receipt
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadReceipt}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />

            {/* Generate Monthly Stock Report */}
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 bg-white border border-gray-300 cursor-pointer text-black px-4 py-1.5 rounded shadow-md font-base w-full sm:w-auto"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 18.925L8.25 14.675L9.65 13.275L12.5 16.125L18.15 10.475L19.55 11.875L12.5 18.925ZM18 9H16V4H14V7H4V4H2V18H8V20H2C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H6.175C6.35833 1.41667 6.71667 0.9375 7.25 0.5625C7.78333 0.1875 8.36667 0 9 0C9.66667 0 10.2625 0.1875 10.7875 0.5625C11.3125 0.9375 11.6667 1.41667 11.85 2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V9ZM9 4C9.28333 4 9.52083 3.90417 9.7125 3.7125C9.90417 3.52083 10 3.28333 10 3C10 2.71667 9.90417 2.47917 9.7125 2.2875C9.52083 2.09583 9.28333 2 9 2C8.71667 2 8.47917 2.09583 8.2875 2.2875C8.09583 2.47917 8 2.71667 8 3C8 3.28333 8.09583 3.52083 8.2875 3.7125C8.47917 3.90417 8.71667 4 9 4Z" fill="black"/>
              </svg>
              Generate Monthly Stock Report
            </button>

            {/* Add New Item */}
            <button
              onClick={onAddNewItem}
              className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py- rounded shadow-md w-full sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24">
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
        <div className="overflow-x-auto bg-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-xl">
          <table className="w-full min-w-[700px] text-center border-collapse">
            <thead>
              <tr className="bg-[#A4B494] text-black text-sm">
                <th className="px-0 py-2 rounded-tl-lg">
                  <div className="flex items-center pl-4 pr-4">
                    <span className="flex-1">Item Name</span>
                    <div className="h-6 w-px bg-black ml-4"></div>
                  </div>
                </th>
                <th className="px-0 py-4">
                  <div className="flex items-center pl-4 pr-4">
                    <span className="flex-1">Barcode ID</span>
                    <div className="h-6 w-px bg-black ml-4"></div>
                  </div>
                </th>
                <th className="px-0 py-4">
                  <div className="flex items-center pl-4 pr-4">
                    <span className="flex-1">Category</span>
                    <div className="h-6 w-px bg-black ml-4"></div>
                  </div>
                </th>
                <th className="px-0 py-4">
                  <div className="flex items-center pl-4 pr-4">
                    <span className="flex-1">Location</span>
                    <div className="h-6 w-px bg-black ml-4"></div>
                  </div>
                </th>
                <th className="px-0 py-4">
                  <div className="flex items-center pl-4 pr-4">
                    <span className="flex-1">Status</span>
                    <div className="h-6 w-px bg-black ml-4"></div>
                  </div>
                </th>
                <th className="px-4 py-4 text-center rounded-tr-lg">Action</th>
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
                    (item.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                      item.barcode
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()))
                )
                .map((item) => (
                  <tr key={item.barcode} className="hover:bg-gray-100">
                    {hiddenRows[item.barcode] ? (
                      <>
                        <td colSpan={5} className="italic text-gray-400 py-4">
                          Hidden
                        </td>
                        <td className="px-4 py-2 flex justify-center gap-2">
                          {/* Eye Slash (Hide) Icon */}
                          <div
                            className="cursor-pointer text-gray-600 hover:text-red-600"
                            onClick={() => toggleVisibility(item.barcode)}
                          >
                            <svg width="28" height="19" viewBox="0 0 28 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 15C15.5625 15 16.8906 14.4531 17.9844 13.3594C19.0781 12.2656 19.625 10.9375 19.625 9.375C19.625 7.8125 19.0781 6.48438 17.9844 5.39062C16.8906 4.29688 15.5625 3.75 14 3.75C12.4375 3.75 11.1094 4.29688 10.0156 5.39062C8.92188 6.48438 8.375 7.8125 8.375 9.375C8.375 10.9375 8.92188 12.2656 10.0156 13.3594C11.1094 14.4531 12.4375 15 14 15ZM14 12.75C13.0625 12.75 12.2656 12.4219 11.6094 11.7656C10.9531 11.1094 10.625 10.3125 10.625 9.375C10.625 8.4375 10.9531 7.64062 11.6094 6.98438C12.2656 6.32812 13.0625 6 14 6C14.9375 6 15.7344 6.32812 16.3906 6.98438C17.0469 7.64062 17.375 8.4375 17.375 9.375C17.375 10.3125 17.0469 11.1094 16.3906 11.7656C15.7344 12.4219 14.9375 12.75 14 12.75ZM14 18.75C10.9583 18.75 8.1875 17.901 5.6875 16.2031C3.1875 14.5052 1.375 12.2292 0.25 9.375C1.375 6.52083 3.1875 4.24479 5.6875 2.54688C8.1875 0.848958 10.9583 0 14 0C17.0417 0 19.8125 0.848958 22.3125 2.54688C24.8125 4.24479 26.625 6.52083 27.75 9.375C26.625 12.2292 24.8125 14.5052 22.3125 16.2031C19.8125 17.901 17.0417 18.75 14 18.75ZM14 16.25C16.3542 16.25 18.5156 15.6302 20.4844 14.3906C22.4531 13.151 23.9583 11.4792 25 9.375C23.9583 7.27083 22.4531 5.59896 20.4844 4.35938C18.5156 3.11979 16.3542 2.5 14 2.5C11.6458 2.5 9.48438 3.11979 7.51562 4.35938C5.54688 5.59896 4.04167 7.27083 3 9.375C4.04167 11.4792 5.54688 13.151 7.51562 14.3906C9.48438 15.6302 11.6458 16.25 14 16.25Z" fill="#1C1B1F"/>
                            </svg>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">{item.barcode}</td>
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
                        <td className="px-4 py-2 flex justify-center gap-3">
                          {/* Eye Icon (Show) */}
                          <div
                            className="cursor-pointer text-gray-600 hover:text-blue-600"
                            onClick={() => handleViewDetails(item)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C1B1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </div>

                          <div className="w-[1px] h-5 bg-gray-400" />

                          {/* Edit Icon */}
                          <div
                            className="cursor-pointer text-gray-600 hover:text-green-600"
                            onClick={() => handleEditClick(item)}
                          >
                            <svg width="18" height="18" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0.5 28V23H25.5V28H0.5ZM5.5 18H7.25L17 8.28125L15.2188 6.5L5.5 16.25V18ZM3 20.5V15.1875L17 1.21875C17.2292 0.989583 17.4948 0.8125 17.7969 0.6875C18.099 0.5625 18.4167 0.5 18.75 0.5C19.0833 0.5 19.4062 0.5625 19.7188 0.6875C20.0312 0.8125 20.3125 1 20.5625 1.25L22.2813 3C22.5313 3.22917 22.7135 3.5 22.8281 3.8125C22.9427 4.125 23 4.44792 23 4.78125C23 5.09375 22.9427 5.40104 22.8281 5.70312C22.7135 6.00521 22.5313 6.28125 22.2813 6.53125L8.3125 20.5H3Z" fill="#1C1B1F"/>
                            </svg>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

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
            {["name", "barcode", "category", "location"].map((field) => (
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

      {/* Detail Modal */}
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
            <p><span className="font-semibold">Item Name:</span> {selectedItem.name}</p>
            <p><span className="font-semibold">Barcode ID:</span> {selectedItem.barcode}</p>
            <p><span className="font-semibold">Category:</span> {selectedItem.category}</p>
            <p><span className="font-semibold">Location:</span> {selectedItem.location}</p>
            <p>
              <span className="font-semibold">Status:</span> 
              <span className={`inline-block ml-2 px-2 py-1 text-xs rounded ${statusColor[selectedItem.status] || 'bg-gray-200'}`}>
                {selectedItem.status}
              </span>
            </p>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-lg mb-2">Additional Information</h4>
          <div className="space-y-2">
            <p><span className="font-semibold">Description:</span> {selectedItem.description || "No description available"}</p>
            <p><span className="font-semibold">Purchase Date:</span> {selectedItem.purchaseDate || "Not specified"}</p>
            <p><span className="font-semibold">Purchase Cost:</span> {selectedItem.purchaseCost ? `₹${selectedItem.purchaseCost}` : "Not specified"}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-bold text-lg mb-2">Receipt</h4>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
          {selectedItem.receipt ? (
            <div className="flex flex-col items-center">
              <p>Receipt: {selectedItem.receipt.name}</p>
              <button 
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  // Implement receipt viewing logic here
                  alert(`Viewing receipt: ${selectedItem.receipt.name}`);
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
                      (item.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                        item.barcode
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()))
                  )
                  .map((item) => (
                    <tr key={item.barcode} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">{item.name}</td>
                      <td className="py-2 px-4 border-b">{item.barcode}</td>
                      <td className="py-2 px-4 border-b">{item.category}</td>
                      <td className="py-2 px-4 border-b">{item.location}</td>
                      <td className="py-2 px-4 border-b">{item.status}</td>
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

function AddNewItem({ onBackToInventory, onItemAdded }) {
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
  const [errors, setErrors] = useState({});

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
    
    return newErrors;
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
    setErrors({});
    onBackToInventory();
  };

  const handleGenerateQR = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log("Generate QR Code for:", formData.itemName);
    // QR code generation logic here
  };

  const handleSaveItem = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    console.log("Saving item:", formData);
    // Save item logic here
    if (onItemAdded) {
      onItemAdded({
        name: formData.itemName,
        barcode: formData.barcodeId,
        category: formData.category,
        location: formData.location,
        status: formData.status === "active" ? "Available" : "In Use", // Map to existing statuses
      });
    }
    
    // Reset form after successful save
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
    setErrors({});
    onBackToInventory();
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
            <label className="block mb-1 text-black ml-2" style={labelStyle}>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter Location"
              className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black
              font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
                errors.location ? "border-2 border-red-500" : ""
              }`}
              style={inputStyle}
              required
            />
            {errors.location && (
              <p className="text-red-500 text-xs mt-1 ml-2">
                {errors.location}
              </p>
            )}
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
              className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black
              font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${
                errors.barcodeId ? "border-2 border-red-500" : ""
              }`}
              style={inputStyle}
              required
            />
            {errors.barcodeId && (
              <p className="text-red-500 text-xs mt-1 ml-2">
                {errors.barcodeId}
              </p>
            )}
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
                    {
                      "d\u00A0d\u00A0-\u00A0m\u00A0m\u00A0-\u00A0y\u00A0y\u00A0y\u00A0y"
                    }
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCalendarClick}
              className="ml-3 p-2 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
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
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-white text-black cursor-pointer rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins]"
            style={{
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateQR}
            className="px-6 py-2 bg-white cursor-pointer text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins]"
            style={{
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Generate QR Code
          </button>
          <button
            onClick={handleSaveItem}
            className="px-6 py-2 bg-white cursor-pointer text-black rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins]"
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

// Main component that manages the view state and central inventory data
export default function InventoryManagement() {
  const [currentView, setCurrentView] = useState("inventory"); // 'inventory' or 'addItem'
  const [inventory, setInventory] = useState(initialData); // Central inventory state

  const handleAddNewItem = () => {
    setCurrentView("addItem");
  };  

  const handleBackToInventory = () => {
    setCurrentView("inventory");
  };
 
  const handleItemAdded = (newItem) => {
    setInventory((prev) => [...prev, newItem]);
  };

  return (
    <div>
      {currentView === "inventory" ? (
        <InventoryList
          onAddNewItem={handleAddNewItem}
          inventory={inventory}
          setInventory={setInventory}   
        />
      ) : (
        <AddNewItem
          onBackToInventory={handleBackToInventory}
          onItemAdded={handleItemAdded}
        />
      )}
    </div>
  );
}
