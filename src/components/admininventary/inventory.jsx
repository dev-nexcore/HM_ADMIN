'use client';
import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaPen, FaSearch } from 'react-icons/fa';
import { FiUpload, FiFileText, FiPlus } from 'react-icons/fi';

const initialData = [
  { name: 'Single bed', barcode: 'INV-BED-A101-1', category: 'Bedding', location: 'Room-A-101', status: 'In Use' },
  { name: 'Study Chair', barcode: 'INV-CHR-A101-1', category: 'Furniture', location: 'Room-A-101', status: 'Available' },
  { name: 'Ceiling Fan', barcode: 'INV-FAN-A101-1', category: 'Electronics', location: 'Room-A-101', status: 'In maintenance' },
  { name: 'Wardrobe', barcode: 'INV-WAR-A101-1', category: 'Furniture', location: 'Room-A-101', status: 'In Use' },
  { name: 'Water Heater', barcode: 'INV-WHT-A101-1', category: 'Applications', location: 'Room-A-101', status: 'Damaged' },
];

const statusColor = {
  'In Use': 'bg-[#f5a623] text-white',
  'Available': 'bg-[#25d366] text-white',
  'In maintenance': 'bg-[#d6d6c2] text-black',
  'Damaged': 'bg-[#ff3b30] text-white',
};

const InventoryList = () => {
  const [inventory, setInventory] = useState(initialData);
  const [editData, setEditData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [hiddenRows, setHiddenRows] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false); // NEW

  const toggleVisibility = (barcode) => {
    setHiddenRows((prev) => ({
      ...prev,
      [barcode]: !prev[barcode],
    }));
  };

  const handleUploadReceipt = (e) => {
    setReceiptFile(e.target.files[0]);
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

  return (
    <div className="bg-white min-h-screen py-4 w-full mt-6">
      {/* Header */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-black border-l-4 border-blue-600 pl-2">
            Inventory List
          </h2>
          <div className="flex gap-4 flex-wrap justify-end sm:ml-auto w-full sm:w-auto">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
            >
              <FiUpload /> Upload Receipt
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 bg-white border border-gray-300 text-black px-4 py-2 rounded shadow w-full sm:w-auto font-bold"
            >
              <FiFileText /> Generate Monthly Stock Report
            </button>
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
            >
              <FiPlus /> Add New Item
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 px-4 sm:px-6">
        <div className="relative flex-1 min-w-[250px]">
          <FaSearch className="absolute top-3 left-3 text-black" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 text-m rounded-md bg-[#e8e8e8] text-black placeholder-black w-full outline-none"
            placeholder="Search by Name or Barcode"
          />
        </div>
        <select
          className="px-4 py-2 text-m rounded-md bg-[#e8e8e8] w-full sm:w-64 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>In Use</option>
          <option>Available</option>
          <option>In maintenance</option>
          <option>Damaged</option>
        </select>
        <select
          className="px-4 py-2 text-m rounded-md bg-[#e8e8e8] w-full sm:w-64 outline-none"
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
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full min-w-[700px] text-center border-collapse">
            <thead>
              <tr className="bg-[#A4B494] text-black text-sm">
                <th className="px-0 py-4 rounded-tl-lg">
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
                    (statusFilter === 'All Status' || item.status === statusFilter) &&
                    (categoryFilter === 'All Categories' || item.category === categoryFilter) &&
                    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((item) => (
                  <tr key={item.barcode} className="hover:bg-gray-100">
                    {hiddenRows[item.barcode] ? (
                      <>
                        <td colSpan={5} className="italic text-gray-400 py-4">Hidden</td>
                        <td className="px-4 py-2 flex justify-center gap-2">
                          <FaEyeSlash
                            className="cursor-pointer text-gray-600 hover:text-red-600"
                            onClick={() => toggleVisibility(item.barcode)}
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">{item.barcode}</td>
                        <td className="px-4 py-2">{item.category}</td>
                        <td className="px-4 py-2">{item.location}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-block w-[100px] text-xs font-semibold text-center py-[6px] rounded-lg shadow-sm ${statusColor[item.status]}`}>{item.status}</span>
                        </td>
                        <td className="px-4 py-2 flex justify-center gap-2">
                          <FaEye
                            className="cursor-pointer text-gray-600 hover:text-blue-600"
                            onClick={() => toggleVisibility(item.barcode)}
                          />
                          <div className="w-[1px] h-5 bg-gray-400" />
                          <FaPen
                            className="cursor-pointer text-gray-600 hover:text-green-600"
                            onClick={() => handleEditClick(item)}
                          />
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
            {['name', 'barcode', 'category', 'location'].map((field) => (
              <input
                key={field}
                className="border px-3 py-2 w-full mb-3 rounded"
                value={editData[field]}
                onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}
            <select
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              className="w-full border px-3 py-2 mb-4 rounded"
            >
              <option>Available</option>
              <option>In Use</option>
              <option>In maintenance</option>
              <option>Damaged</option>
            </select>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={handleEditSave}
              >
                Save
              </button>
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
                className="text-gray-600 hover:text-red-600 text-xl"
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
                      (statusFilter === 'All Status' || item.status === statusFilter) &&
                      (categoryFilter === 'All Categories' || item.category === categoryFilter) &&
                      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
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

export default InventoryList;
