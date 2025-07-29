'use client';
import React, { useState } from 'react';
import { FaEye, FaPen, FaSearch } from 'react-icons/fa';
import { FiUpload, FiFileText, FiPlus } from 'react-icons/fi';

const inventoryData = [
  { name: 'Single bed', barcode: 'INV-BED-A101-1', category: 'Bedding', location: 'Room-A-101', status: 'In Use' },
  { name: 'Study Chair', barcode: 'INV-CHR-A101-1', category: 'Furniture', location: 'Room-A-101', status: 'Available' },
  { name: 'Ceiling Fan', barcode: 'INV-FAN-A101-1', category: 'Electronics', location: 'Room-A-101', status: 'In maintenance' },
  { name: 'Wardrobe', barcode: 'INV-WAR-A101-1', category: 'Furniture', location: 'Room-A-101', status: 'In Use' },
  { name: 'Water Heater', barcode: 'INV-WHT-A101-1', category: 'Applications', location: 'Room-A-101', status: 'Damaged' },
  { name: 'Wardrobe', barcode: 'INV-WAR-A101-2', category: 'Furniture', location: 'Room-A-101', status: 'In Use' },
  { name: 'Water Heater', barcode: 'INV-WHT-A101-2', category: 'Applications', location: 'Room-A-101', status: 'Damaged' },
];

const statusColor = {
  'In Use': 'bg-[#f5a623] text-white',
  'Available': 'bg-[#25d366] text-white',
  'In maintenance': 'bg-[#d6d6c2] text-black',
  'Damaged': 'bg-[#ff3b30] text-white',
};

const InventoryList = () => {
  const [visibleRows, setVisibleRows] = useState({});
  const [editRows, setEditRows] = useState({});
  const [editData, setEditData] = useState({});
  const [statusFilter, setStatusFilter] = useState('All Status');

  const handleToggleVisible = (barcode) => {
    setVisibleRows((prev) => ({ ...prev, [barcode]: !prev[barcode] }));
  };

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
    const idx = inventoryData.findIndex((item) => item.barcode === barcode);
    if (idx !== -1) inventoryData[idx] = { ...editData[barcode] };
    setEditRows((prev) => ({ ...prev, [barcode]: false }));
  };

  const handleEditCancel = (barcode) => {
    setEditRows((prev) => ({ ...prev, [barcode]: false }));
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen py-6 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-4 sm:p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-black border-l-4 border-red-500 pl-2">
            Inventory List
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <button className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-4 py-2 rounded-md shadow">
              <FiUpload /> Upload Receipt
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-300 text-black text-sm font-medium px-4 py-2 rounded-md shadow">
              <FiFileText /> Monthly Report
            </button>
            <button className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-4 py-2 rounded-md shadow">
              <FiPlus /> Add Item
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              className="w-full border border-gray-300 bg-[#f5f5f5] rounded-md pl-10 pr-4 py-2 text-sm"
              placeholder="Search by Item Name or Barcode ID"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black">
              <FaSearch />
            </span>
          </div>
          <select
            className="border border-gray-300 bg-[#f5f5f5] rounded-md px-4 py-2 text-sm shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>In Use</option>
            <option>Available</option>
            <option>In maintenance</option>
            <option>Damaged</option>
          </select>
          <select className="border border-gray-300 bg-[#f5f5f5] rounded-md px-4 py-2 text-sm shadow-sm">
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
            <tbody className="text-gray-800 text-sm bg-white">
              {inventoryData
                .filter((item) => statusFilter === 'All Status' || item.status === statusFilter)
                .map((item) => (
                  <React.Fragment key={item.barcode}>
                    <tr className="hover:bg-gray-50">
                      {editRows[item.barcode] ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full text-sm"
                              value={editData[item.barcode].name}
                              onChange={(e) =>
                                handleEditChange(item.barcode, 'name', e.target.value)
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full text-sm"
                              value={editData[item.barcode].barcode}
                              onChange={(e) =>
                                handleEditChange(item.barcode, 'barcode', e.target.value)
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full text-sm"
                              value={editData[item.barcode].category}
                              onChange={(e) =>
                                handleEditChange(item.barcode, 'category', e.target.value)
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full text-sm"
                              value={editData[item.barcode].location}
                              onChange={(e) =>
                                handleEditChange(item.barcode, 'location', e.target.value)
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              className={`w-[100px] py-[6px] text-center text-xs font-semibold rounded-lg shadow-sm ${statusColor[editData[item.barcode].status]}`}
                              value={editData[item.barcode].status}
                              onChange={(e) =>
                                handleEditChange(item.barcode, 'status', e.target.value)
                              }
                            >
                              <option value="In Use">In Use</option>
                              <option value="Available">Available</option>
                              <option value="In maintenance">In maintenance</option>
                              <option value="Damaged">Damaged</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 flex justify-center gap-3">
                            <button
                              className="text-green-600 hover:text-green-800 font-semibold"
                              onClick={() => handleEditSave(item.barcode)}
                            >
                              Save
                            </button>
                            <button
                              className="text-gray-600 hover:text-red-600 font-semibold"
                              onClick={() => handleEditCancel(item.barcode)}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.barcode}</td>
                          <td className="px-4 py-3">{item.category}</td>
                          <td className="px-4 py-3">{item.location}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block w-[100px] py-[6px] text-center text-xs font-semibold rounded-lg shadow-sm ${statusColor[item.status]}`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex justify-center items-center gap-3">
                            <button
                              title="View"
                              className={`text-gray-600 hover:text-blue-600 ${
                                visibleRows[item.barcode] ? 'text-blue-600' : ''
                              }`}
                              onClick={() => handleToggleVisible(item.barcode)}
                            >
                              <FaEye />
                            </button>
                            <div className="w-[1px] h-5 bg-black" />
                            <button
                              title="Edit"
                              className="text-gray-600 hover:text-green-600"
                              onClick={() => handleEditClick(item)}
                            >
                              <FaPen />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
