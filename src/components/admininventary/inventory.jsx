'use client';
import React, { useState } from 'react';
import { FaEye, FaPen, FaSearch } from 'react-icons/fa';
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
  const [visibleRows, setVisibleRows] = useState({});
  const [editRows, setEditRows] = useState({});
  const [editData, setEditData] = useState({});
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-black border-l-4 border-red-500 pl-2">Inventory List</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
              <FiUpload /> Upload Receipt
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-300 text-black px-4 py-2 rounded shadow">
              <FiFileText /> Monthly Report
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
              <FiPlus /> Add Item
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
                        <td className="px-4 py-2 text-center flex gap-2 justify-center items-center">
                          <FaEye className="cursor-pointer text-gray-600 hover:text-blue-600" onClick={() => {
                            setSelectedItem(item);
                            setShowViewModal(true);
                          }} />
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

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Item Details</h3>
            <div className="space-y-2 text-sm text-gray-800">
              <p><strong>Item Name:</strong> {selectedItem.name}</p>
              <p><strong>Barcode:</strong> {selectedItem.barcode}</p>
              <p><strong>Category:</strong> {selectedItem.category}</p>
              <p><strong>Location:</strong> {selectedItem.location}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColor[selectedItem.status]}`}>
                  {selectedItem.status}
                </span>
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Upload Receipt</h3>
            <input type="file" onChange={handleUploadReceipt} className="mb-4" />
            {receiptFile && <p className="text-sm text-green-700">Selected: {receiptFile.name}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Item</h3>
            <input type="text" placeholder="Name" className="w-full border p-2 mb-2" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <input type="text" placeholder="Barcode" className="w-full border p-2 mb-2" value={newItem.barcode} onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })} />
            <input type="text" placeholder="Category" className="w-full border p-2 mb-2" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
            <input type="text" placeholder="Location" className="w-full border p-2 mb-2" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} />
            <select className="w-full border p-2 mb-4" value={newItem.status} onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}>
              <option>Available</option>
              <option>In Use</option>
              <option>In maintenance</option>
              <option>Damaged</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={handleAddItem} className="px-4 py-2 rounded bg-green-600 text-white">Add</button>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
