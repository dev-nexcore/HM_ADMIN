'use client';
import React, { useState } from 'react';
import { FaEye, FaPen } from 'react-icons/fa';
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
  const [editRows, setEditRows] = useState({});
  const [editData, setEditData] = useState({});
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', barcode: '', category: '', location: '', status: 'Available' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEditClick = (item) => {
    setEditRows((prev) => ({ ...prev, [item.barcode]: true }));
    setEditData((prev) => ({ ...prev, [item.barcode]: { ...item } }));
  };

  const handleEditChange = (barcode, field, value) => {
    setEditData((prev) => ({
      ...prev,
      [barcode]: { ...prev[barcode], [field]: value },
    }));
  };

  const handleEditSave = (barcode) => {
    setInventory((prev) =>
      prev.map((item) => (item.barcode === barcode ? editData[barcode] : item))
    );
    setEditRows((prev) => ({ ...prev, [barcode]: false }));
  };

  const handleEditCancel = (barcode) => {
    setEditRows((prev) => ({ ...prev, [barcode]: false }));
  };

  const handleAddItem = () => {
    setInventory((prev) => [...prev, newItem]);
    setNewItem({ name: '', barcode: '', category: '', location: '', status: 'Available' });
    setShowAddModal(false);
  };

  const handleUploadReceipt = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen py-4 w-full">
      <div className="w-full bg-white shadow-md p-4 sm:p-6">
        {/* Header */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-black border-l-4 border-red-500 pl-2 flex-1">Inventory List</h2>
          <div className="flex flex-wrap gap-2 flex-1 justify-end">
            <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
              <FiUpload /> Upload Receipt
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-300 text-black px-4 py-2 rounded shadow">
              <FiFileText /> Generate Monthly Stock Report
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
              <FiPlus /> Add New Item
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
          <input type="text" className="border px-4 py-2 text-sm rounded-md" placeholder="Search..." />
          <select className="border px-4 py-2 text-sm rounded-md" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>In Use</option>
            <option>Available</option>
            <option>In maintenance</option>
            <option>Damaged</option>
          </select>
          <select className="border px-4 py-2 text-sm rounded-md" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option>All Categories</option>
            <option>Bedding</option>
            <option>Furniture</option>
            <option>Electronics</option>
            <option>Applications</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="bg-[#A4B494] text-black text-sm">
                <th className="px-4 py-2 border-r border-black rounded-tl-lg">Item Name</th>
                <th className="px-4 py-2 border-r border-black">Barcode ID</th>
                <th className="px-4 py-2 border-r border-black">Category</th>
                <th className="px-4 py-2 border-r border-black">Location</th>
                <th className="px-4 py-2 border-r border-black">Status</th>
                <th className="px-4 py-2 text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm">
              {inventory
                .filter(
                  (item) =>
                    (statusFilter === 'All Status' || item.status === statusFilter) &&
                    (categoryFilter === 'All Categories' || item.category === categoryFilter)
                )
                .map((item) => (
                  <tr key={item.barcode} className="hover:bg-gray-100">
                    {editRows[item.barcode] ? (
                      <>
                        <td><input className="border px-2 py-1 w-full" value={editData[item.barcode].name} onChange={(e) => handleEditChange(item.barcode, 'name', e.target.value)} /></td>
                        <td><input className="border px-2 py-1 w-full" value={editData[item.barcode].barcode} onChange={(e) => handleEditChange(item.barcode, 'barcode', e.target.value)} /></td>
                        <td><input className="border px-2 py-1 w-full" value={editData[item.barcode].category} onChange={(e) => handleEditChange(item.barcode, 'category', e.target.value)} /></td>
                        <td><input className="border px-2 py-1 w-full" value={editData[item.barcode].location} onChange={(e) => handleEditChange(item.barcode, 'location', e.target.value)} /></td>
                        <td>
                          <select className={`w-[100px] text-xs py-[6px] rounded-lg text-center font-semibold shadow-sm ${statusColor[editData[item.barcode].status]}`} value={editData[item.barcode].status} onChange={(e) => handleEditChange(item.barcode, 'status', e.target.value)}>
                            <option>Available</option>
                            <option>In Use</option>
                            <option>In maintenance</option>
                            <option>Damaged</option>
                          </select>
                        </td>
                        <td className="text-center">
                          <button onClick={() => handleEditSave(item.barcode)} className="text-green-600 font-semibold mr-2">Save</button>
                          <button onClick={() => handleEditCancel(item.barcode)} className="text-red-600 font-semibold">Cancel</button>
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
                        <td className="px-4 py-2 text-center flex justify-center items-center gap-2">
                          <FaEye className="cursor-pointer text-gray-600 hover:text-blue-600" onClick={() => { setSelectedItem(item); setShowViewModal(true); }} />
                          <div className="w-[1px] h-5 bg-gray-400" />
                          <FaPen className="cursor-pointer text-gray-600 hover:text-green-600" onClick={() => handleEditClick(item)} />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals (unchanged) */}
      {/* ...Upload Receipt and Add Item Modal Code remains the same... */}
    </div>
  );
};

export default InventoryList;
