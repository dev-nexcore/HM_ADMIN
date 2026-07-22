
"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { QrCode, Camera, Download, Check, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import ItemDetailsModal from "../ItemDetailsModal/ItemDetailsModal";
import toast, { Toaster } from 'react-hot-toast';
import { Trash2, X } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_PROD_API_URL;

const statusColor = {
  "In Use": "bg-blue-100 text-blue-700 border-blue-200",
  "Available": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "In maintenance": "bg-amber-100 text-amber-700 border-amber-200",
  "Damaged": "bg-rose-100 text-rose-700 border-rose-200",
};

const PREDEFINED_LOCATIONS = [
  "Room No 101", "Room No 102", "Room No 103", "Room No 104", "Room No 105",
  "Room No 106", "Room No 107", "Room No 108", "Room No 109", "Room No 110",
  "Room No 201", "Room No 202", "Room No 203", "Room No 204", "Room No 205",
  "Room No 206", "Room No 207", "Room No 208", "Room No 209", "Room No 210",
  "Gym", "Prayer Room", "Kitchen Room", "Dining Room", "Study Room",
  "Conference Room", "Store Room", "Washing Machine Room",
  "Corridor- 1st Floor", "Corridor- 2nd Floor", "Corridor- 3rd Floor",
  "Wash Rooms", "Staircase", "Ground Floor", "Terrace"
];

const PREDEFINED_CATEGORIES = [
  "BEDS", "MATTRESSES", "MATTRESSES COVERS", "CUPBOARDS", "FANS",
  "TUBE LIGHTS", "Bulb", "CURTAINS( Set)", "SHOE RACKS", "Panels",
  "Carpets", "Dust Bin", "Steel Table", "Microwave", "Hot Plate",
  "Fridge", "Washing Machine", "Inverter", "Batteries", "Stabilizers",
  "Exhaust Fan", "Chairs", "Routers", "CCTV Camera", "TV", "Computer", "Mobile"
];

const PREDEFINED_STATUSES = [
  "Available", "In Use", "In maintenance", "Damaged"
];

const InventoryList = ({ onAddNewItem, inventory, setInventory, fetchInventory, availableRoomsForInventory = [], availableFloors = [] }) => {
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
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const [bulkUploadStatus, setBulkUploadStatus] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkQRModal, setShowBulkQRModal] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editReceiptFile, setEditReceiptFile] = useState(null);
  const [scannedItem, setScannedItem] = useState(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [otherEditLocation, setOtherEditLocation] = useState('');
  const [otherEditCategory, setOtherEditCategory] = useState('');
  const [otherEditStatus, setOtherEditStatus] = useState('');
  const [otherEditRoomNo, setOtherEditRoomNo] = useState('');
  const [otherEditFloor, setOtherEditFloor] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fileInputRef = useRef(null);

  // ── Pagination Logic ──────────────────────────────────────────────────
  const filteredInventory = inventory.filter(
    (item) =>
      (statusFilter === "All Status" || item.status === statusFilter) &&
      (categoryFilter === "All Categories" || item.category === categoryFilter) &&
      (item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcodeId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, searchQuery, inventory]);

  // ── Stats for filter cards ──────────────────────────────────────────────
  const stats = [
    {
      key: "All Status",
      label: "Total Items",
      count: inventory.length,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
      activeBg: "bg-gray-100",
      activeBorder: "border-gray-400",
      activeText: "text-gray-700",
      activeBar: "bg-gray-400",
      pillBg: "bg-gray-200",
      pillText: "text-gray-700",
      pillLabel: "All",
    },
    {
      key: "Available",
      label: "Available",
      count: inventory.filter((i) => i.status === "Available").length,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      activeBg: "bg-green-50",
      activeBorder: "border-green-500",
      activeText: "text-green-700",
      activeBar: "bg-green-500",
      pillBg: "bg-green-100",
      pillText: "text-green-700",
      pillLabel: "Ready",
    },
    {
      key: "In Use",
      label: "In Use",
      count: inventory.filter((i) => i.status === "In Use").length,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      activeBg: "bg-orange-50",
      activeBorder: "border-orange-400",
      activeText: "text-orange-700",
      activeBar: "bg-orange-400",
      pillBg: "bg-orange-100",
      pillText: "text-orange-700",
      pillLabel: "Active",
    },
    {
      key: "In maintenance",
      label: "Maintenance",
      count: inventory.filter((i) => i.status === "In maintenance").length,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      activeBg: "bg-yellow-50",
      activeBorder: "border-yellow-500",
      activeText: "text-yellow-700",
      activeBar: "bg-yellow-500",
      pillBg: "bg-yellow-100",
      pillText: "text-yellow-800",
      pillLabel: "Under repair",
    },
    {
      key: "Damaged",
      label: "Damaged",
      count: inventory.filter((i) => i.status === "Damaged").length,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      activeBg: "bg-red-50",
      activeBorder: "border-red-500",
      activeText: "text-red-700",
      activeBar: "bg-red-500",
      pillBg: "bg-red-100",
      pillText: "text-red-700",
      pillLabel: "Needs attention",
    },
  ];

  const [uniqueStatuses, setUniqueStatuses] = useState(["All Status", ...PREDEFINED_STATUSES]);
  const [uniqueCategories, setUniqueCategories] = useState(["All Categories", ...PREDEFINED_CATEGORIES]);

  useEffect(() => {
    // Load custom options from localStorage after mount
    const customStatuses = JSON.parse(localStorage.getItem('customInventoryStatuses') || '[]');
    const customCategories = JSON.parse(localStorage.getItem('customInventoryCategories') || '[]');

    setUniqueStatuses([...new Set(["All Status", ...PREDEFINED_STATUSES, ...inventory.map(item => item.status), ...customStatuses])].filter(Boolean));
    setUniqueCategories([...new Set(["All Categories", ...PREDEFINED_CATEGORIES, ...inventory.map(item => item.category), ...customCategories])].filter(Boolean));
  }, [inventory]);

  const toggleVisibility = (barcode) => {
    setHiddenRows((prev) => ({
      ...prev,
      [barcode]: !prev[barcode],
    }));
  };

  const handleDeleteItem = async (id) => {
    try {
      const deletePromise = api.delete(`/api/adminauth/inventory/${id}`);

      toast.promise(deletePromise, {
        loading: 'Deleting item...',
        success: 'Item deleted successfully!',
        error: 'Failed to delete item.',
      });

      await deletePromise;

      setInventory((prev) => prev.filter((item) => item._id !== id));
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete inventory item:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      const deletePromise = api.post('/api/adminauth/inventory/bulk-delete', {
        itemIds: selectedItems
      });

      toast.promise(deletePromise, {
        loading: `Deleting ${selectedItems.length} items...`,
        success: 'Items deleted successfully!',
        error: 'Failed to delete items.',
      });

      await deletePromise;

      setInventory((prev) => prev.filter((item) => !selectedItems.includes(item._id)));
      setSelectedItems([]);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to bulk delete inventory:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const deletePromise = api.delete('/api/adminauth/inventory/delete-all');
      toast.promise(deletePromise, {
        loading: 'Deleting all inventory...',
        success: 'All inventory deleted successfully!',
        error: 'Failed to delete all inventory.',
      });
      await deletePromise;
      setInventory([]);
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error('Failed to delete all inventory:', error);
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

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", bulkFile);

    try {
      setBulkUploadStatus("Uploading...");
      const { data } = await api.post(
        "/api/adminauth/inventory/bulk-upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setBulkUploadProgress(progress);
          },
        }
      );

      if (data.success) {
        setBulkUploadStatus(`Successfully added ${data.addedCount} items!`);
        setInventory((prev) => [...prev, ...data.items]);
        setTimeout(() => {
          setShowBulkUploadModal(false);
          setBulkFile(null);
          setBulkUploadProgress(0);
          setBulkUploadStatus("");
        }, 2000);
      }
    } catch (error) {
      console.error("Bulk upload failed:", error);
      setBulkUploadStatus(
        `Error: ${error.response?.data?.message || "Upload failed"}`
      );
    }
  };

  const downloadBulkTemplate = () => {
    const template = [
      [
        "Item Name",
        "Category",
        "Location",
        "Status",
        "Room No",
        "Floor",
        "Description",
        "Purchase Date",
        "Purchase Cost",
      ],
      [
        "Example Item 1",
        "Electronics",
        "Main Building",
        "Available",
        "101",
        "1",
        "Sample description",
        "10-11-2025",
        "5000",
      ],
      [
        "Example Item 2",
        "Furniture",
        "Kitchen",
        "In Use",
        "102",
        "1",
        "Another description",
        "09-11-2025",
        "3000",
      ],
    ];

    const csvContent = template.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory_bulk_upload_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generateMonthlyStockReport = async () => {
    try {
      setLoading(true);

      // Construct query parameters based on current filters
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "All Status") params.append("status", statusFilter);
      if (categoryFilter && categoryFilter !== "All Categories") params.append("category", categoryFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await api.get(`/api/adminauth/inventory/stock-report?${params.toString()}`, {
        headers: { "Content-Type": "application/json" },
        responseType: "blob",
      });

      if (response.status === 200) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
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

    // Check if current values are "others" (not in predefined lists)
    if (item.location && !PREDEFINED_LOCATIONS.includes(item.location)) {
      setEditData(prev => ({ ...prev, location: '__others__' }));
      setOtherEditLocation(item.location);
    } else {
      setOtherEditLocation('');
    }

    if (item.category && !PREDEFINED_CATEGORIES.includes(item.category)) {
      setEditData(prev => ({ ...prev, category: '__others__' }));
      setOtherEditCategory(item.category);
    } else {
      setOtherEditCategory('');
    }

    if (item.status && !PREDEFINED_STATUSES.map(s => s).includes(item.status)) {
      // Note: status filter uses PREDEFINED_STATUSES
      if (!PREDEFINED_STATUSES.includes(item.status)) {
        setEditData(prev => ({ ...prev, status: '__others__' }));
        setOtherEditStatus(item.status);
      } else {
        setOtherEditStatus('');
      }
    } else {
      setOtherEditStatus('');
    }

    if (item.roomNo && !availableRoomsForInventory.map(r => r.toString()).includes(item.roomNo.toString())) {
      setEditData(prev => ({ ...prev, roomNo: '__others__' }));
      setOtherEditRoomNo(item.roomNo);
    } else {
      setOtherEditRoomNo('');
    }

    if (item.floor && !availableFloors.map(f => f.toString()).includes(item.floor.toString())) {
      setEditData(prev => ({ ...prev, floor: '__others__' }));
      setOtherEditFloor(item.floor);
    } else {
      setOtherEditFloor('');
    }

    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      const toastId = toast.loading("Saving changes...");

      const formDataToSend = new FormData();

      // Basic info
      formDataToSend.append("itemName", editData.itemName);
      formDataToSend.append("barcodeId", editData.barcodeId);
      formDataToSend.append("description", editData.description || "");
      formDataToSend.append("purchaseDate", editData.purchaseDate || "");
      formDataToSend.append("purchaseCost", editData.purchaseCost || "");

      // Resolve "others" fields
      formDataToSend.append("location", editData.location === '__others__' ? otherEditLocation : editData.location);
      formDataToSend.append("category", editData.category === '__others__' ? otherEditCategory : editData.category);
      formDataToSend.append("status", editData.status === '__others__' ? otherEditStatus : editData.status);
      formDataToSend.append("roomNo", editData.roomNo === '__others__' ? otherEditRoomNo : editData.roomNo);
      formDataToSend.append("floor", editData.floor === '__others__' ? otherEditFloor : editData.floor);

      // Receipt file
      if (editReceiptFile) {
        formDataToSend.append("receipt", editReceiptFile);
      }

      const { data } = await api.put(
        `/api/adminauth/inventory/${editData._id}`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setInventory((prev) =>
        prev.map((item) => (item._id === data.item._id ? data.item : item))
      );

      toast.success("Item updated successfully!", { id: toastId });
      setShowEditModal(false);
      setEditReceiptFile(null);
    } catch (error) {
      console.error("Failed to update inventory:", error);
      toast.error("Failed to update item. Please try again.");
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
        { responseType: "blob" }
      );

      if (response.data) {
        const blob = new Blob([response.data], { type: "image/png" });
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

  const handleBulkQRGeneration = async () => {
    try {
      setLoading(true);
      const { data } = await api.post(
        "/api/adminauth/inventory/bulk-qr-generate",
        { itemIds: selectedItems }
      );

      if (data.success) {
        setInventory((prev) =>
          prev.map((item) => {
            const updated = data.items.find((i) => i._id === item._id);
            return updated || item;
          })
        );
        setSelectedItems([]);
        setShowBulkQRModal(false);
        alert(`Successfully generated ${data.count} QR codes!`);
      }
    } catch (error) {
      console.error("Bulk QR generation failed:", error);
      alert("Failed to generate QR codes");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const resolveQRUrl = (qrCodeUrl) => {
    if (!qrCodeUrl) return "";
    if (qrCodeUrl.startsWith("http")) return qrCodeUrl;
    let path = qrCodeUrl;
    if (path.startsWith("/")) path = path.substring(1);
    if (path.startsWith("public/")) path = path.substring(7);
    if (!path.startsWith("qrcodes/")) path = `qrcodes/${path}`;
    return `${BASE_URL}/${path}`;
  };

  return (
    <div className="pl-1 pr-2 sm:pl-2 sm:pr-4 bg-white min-h-screen mt-4 font-sans">
      <div className="w-full">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="h-6 w-1 bg-[#4F8CCF] mr-2"></div>
              <h1 className="text-[25px] leading-[25px] font-extrabold text-black flex items-center" style={{ fontFamily: "Inter" }}>
                Inventory Management
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 text-sm ml-3" style={{ fontFamily: "Poppins" }}>Manage all foundation properties and assets</p>
          </div>

          <div className="flex gap-3 flex-wrap justify-end sm:ml-auto w-full sm:w-auto">
            {selectedItems.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkQRModal(true)}
                  className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-md text-sm font-bold transition-colors"
                >
                  <QrCode size={16} />
                  QR ({selectedItems.length})
                </button>
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="flex items-center gap-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl shadow-md text-sm font-bold transition-colors"
                >
                  <Trash2 size={16} />
                  Delete ({selectedItems.length})
                </button>
              </div>
            )}

            <button
              onClick={generateMonthlyStockReport}
              className="flex items-center gap-2 bg-white border border-gray-300 cursor-pointer text-gray-700 px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 text-sm font-bold transition-colors w-full sm:w-auto"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 18.925L8.25 14.675L9.65 13.275L12.5 16.125L18.15 10.475L19.55 11.875L12.5 18.925ZM18 9H16V4H14V7H4V4H2V18H8V20H2C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H6.175C6.35833 1.41667 6.71667 0.9375 7.25 0.5625C7.78333 0.1875 8.36667 0 9 0C9.66667 0 10.2625 0.1875 10.7875 0.5625C11.3125 0.9375 11.6667 1.41667 11.85 2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V9ZM9 4C9.28333 4 9.52083 3.90417 9.7125 3.7125C9.90417 3.52083 10 3.28333 10 3C10 2.71667 9.90417 2.47917 9.7125 2.2875C9.52083 2.09583 9.28333 2 9 2C8.71667 2 8.47917 2.09583 8.2875 2.2875C8.09583 2.47917 8 2.71667 8 3C8 3.28333 8.09583 3.52083 8.2875 3.7125C8.47917 3.90417 8.71667 4 9 4Z" fill="currentColor" />
              </svg>
              Generate Report
            </button>

            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="flex items-center gap-2 cursor-pointer bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-md text-sm font-bold transition-colors w-full sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11z" />
              </svg>
              Bulk Upload
            </button>

            <button
              onClick={onAddNewItem}
              className="flex items-center gap-2 cursor-pointer bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl shadow-md text-sm font-bold transition-colors w-full sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 11V5h-2v6H5v2h6v6h2v-6h6v-2z" />
              </svg>
              Add Item
            </button>

            {inventory.length > 0 && (
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="flex items-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl shadow-md text-sm font-bold transition-colors w-full sm:w-auto"
              >
                <Trash2 size={16} />
                Delete All
              </button>
            )}
          </div>
        </div>

        {/* ── Stats Filter Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <button onClick={() => setStatusFilter("All Status")} className={`text-left bg-white p-4 rounded-xl shadow-sm border ${statusFilter === "All Status" ? "border-gray-800 ring-1 ring-gray-800" : "border-gray-200"}`}>
            <p className="text-gray-500 text-sm font-medium">Total Items</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{inventory.length}</p>
          </button>

          <button onClick={() => setStatusFilter("Available")} className={`text-left bg-emerald-50 p-4 rounded-xl shadow-sm border ${statusFilter === "Available" ? "border-emerald-500 ring-1 ring-emerald-500" : "border-emerald-200"}`}>
            <p className="text-emerald-600 text-sm font-medium">Available</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{inventory.filter(i => i.status === "Available").length}</p>
          </button>

          <button onClick={() => setStatusFilter("In Use")} className={`text-left bg-blue-50 p-4 rounded-xl shadow-sm border ${statusFilter === "In Use" ? "border-blue-500 ring-1 ring-blue-500" : "border-blue-200"}`}>
            <p className="text-blue-600 text-sm font-medium">In Use</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{inventory.filter(i => i.status === "In Use").length}</p>
          </button>

          <button onClick={() => setStatusFilter("In maintenance")} className={`text-left bg-amber-50 p-4 rounded-xl shadow-sm border ${statusFilter === "In maintenance" ? "border-amber-500 ring-1 ring-amber-500" : "border-amber-200"}`}>
            <p className="text-amber-600 text-sm font-medium">Maintenance</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{inventory.filter(i => i.status === "In maintenance").length}</p>
          </button>

          <button onClick={() => setStatusFilter("Damaged")} className={`text-left bg-rose-50 p-4 rounded-xl shadow-sm border ${statusFilter === "Damaged" ? "border-rose-500 ring-1 ring-rose-500" : "border-rose-200"}`}>
            <p className="text-rose-600 text-sm font-medium">Damaged</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{inventory.filter(i => i.status === "Damaged").length}</p>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FaSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, barcode..."
            className="pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 outline-none text-sm font-semibold text-black shadow-sm w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="flex-1 sm:flex-none px-4 py-2 bg-white rounded-xl outline-none text-sm font-semibold text-black shadow-sm border border-gray-200"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="flex-1 sm:flex-none px-4 py-2 bg-white rounded-xl outline-none text-sm font-semibold text-black shadow-sm border border-gray-200"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="w-full">
        {/* Desktop Table View */}
        <div className="hidden sm:block bg-[#f4f6f0] rounded-2xl shadow-lg border border-[#BEC5AD]/30 overflow-hidden mb-6" style={{ fontFamily: 'Inter' }}>

          <div className="bg-[#A4AD95] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Inventory List
              </h2>
              <p className="text-sm text-gray-700 mt-1">Total: {filteredInventory.length} records</p>
            </div>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-2 py-3 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredInventory.map((item) => item._id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      checked={
                        selectedItems.length > 0 &&
                        filteredInventory.length > 0 &&
                        filteredInventory.every(item => selectedItems.includes(item._id))
                      }
                    />
                  </th>
                  {[
                    "Sr No",
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
                      className="px-4 py-3 text-sm font-semibold text-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedInventory.map((item, index) => (
                  <tr key={item.barcodeId} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems((prev) => [...prev, item._id]);
                          } else {
                            setSelectedItems((prev) =>
                              prev.filter((id) => id !== item._id)
                            );
                          }
                        }}
                      />
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-800 font-bold whitespace-nowrap">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-bold whitespace-nowrap">{item.itemName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-medium whitespace-nowrap">{item.barcodeId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.location}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor[item.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <div className="flex justify-start gap-2">
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

                      <div className="w-[1px] h-5 bg-gray-400" />

                      {/* Delete Icon */}
                      <div
                        className="cursor-pointer text-gray-600 hover:text-red-600"
                        onClick={() => {
                          setItemToDelete(item);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
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
          {paginatedInventory.map((item) => (
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
                  className={`inline-block px-2 py-1 text-xs rounded-lg shadow-sm ${statusColor[item.status]}`}
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
                  <button
                    onClick={() => {
                      setItemToDelete(item);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-red-600 text-xs hover:underline"
                  >
                    Delete
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-600 font-medium">
              Showing <span className="text-black font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="text-black font-bold">{Math.min(currentPage * itemsPerPage, filteredInventory.length)}</span> of{" "}
              <span className="text-black font-bold">{filteredInventory.length}</span> items
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-semibold"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all shadow-sm ${currentPage === pageNum
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

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

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Bulk Upload Items</h3>

            <div className="mb-4">
              <button
                onClick={downloadBulkTemplate}
                className="text-blue-600 hover:underline text-sm mb-2"
              >
                Download Template (CSV)
              </button>
              <p className="text-xs text-gray-600 mb-3">
                Upload a CSV file with columns: Item Name, Category, Location,
                Status, Room No, Floor, Description, Purchase Date, Purchase
                Cost
              </p>

              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setBulkFile(e.target.files[0])}
                className="mb-4 w-full"
              />

              {bulkFile && (
                <p className="text-sm text-gray-700 mb-2">
                  Selected: <strong>{bulkFile.name}</strong>
                </p>
              )}

              {bulkUploadProgress > 0 && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${bulkUploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {bulkUploadProgress}%
                  </p>
                </div>
              )}

              {bulkUploadStatus && (
                <p
                  className={`text-sm mb-2 ${bulkUploadStatus.includes("Error") ? "text-red-600" : "text-green-600"}`}
                >
                  {bulkUploadStatus}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setBulkFile(null);
                  setBulkUploadProgress(0);
                  setBulkUploadStatus("");
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={!bulkFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Receipt Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Upload Receipt</h3>
            <input
              type="file"
              ref={fileInputRef}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4 font-sans">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <div className="sticky top-0 bg-white px-8 py-6 border-b flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-black" style={{ fontFamily: "Inter" }}>Edit Inventory Item</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Item Name */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Item Name</label>
                  <input
                    className="w-full border-gray-300 border px-4 py-2.5 rounded-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm"
                    value={editData.itemName}
                    onChange={(e) => setEditData({ ...editData, itemName: e.target.value })}
                    placeholder="Item Name"
                  />
                </div>

                {/* Barcode ID */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Barcode ID</label>
                  <input
                    className="w-full border-gray-300 border px-4 py-2.5 rounded-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm"
                    value={editData.barcodeId}
                    onChange={(e) => setEditData({ ...editData, barcodeId: e.target.value })}
                    placeholder="Barcode ID"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                  <select
                    value={editData.category}
                    onChange={(e) => {
                      setEditData({ ...editData, category: e.target.value });
                      if (e.target.value !== '__others__') setOtherEditCategory('');
                    }}
                    className="w-full border-gray-300 border px-4 py-2.5 rounded-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm bg-white"
                  >
                    <option value="">Select Category</option>
                    {PREDEFINED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    <option value="__others__">Others</option>
                  </select>
                  {editData.category === '__others__' && (
                    <input
                      type="text"
                      value={otherEditCategory}
                      onChange={(e) => setOtherEditCategory(e.target.value)}
                      placeholder="Type custom category..."
                      className="mt-2 w-full border-gray-300 border px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                  )}
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Location</label>
                  <select
                    value={editData.location}
                    onChange={(e) => {
                      setEditData({ ...editData, location: e.target.value });
                      if (e.target.value !== '__others__') setOtherEditLocation('');
                    }}
                    className="w-full border-gray-300 border px-4 py-2.5 rounded-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm bg-white"
                  >
                    <option value="">Select Location</option>
                    {PREDEFINED_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    <option value="__others__">Others</option>
                  </select>
                  {editData.location === '__others__' && (
                    <input
                      type="text"
                      value={otherEditLocation}
                      onChange={(e) => setOtherEditLocation(e.target.value)}
                      placeholder="Type custom location..."
                      className="mt-2 w-full border-gray-300 border px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                  )}
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => {
                      setEditData({ ...editData, status: e.target.value });
                      if (e.target.value !== '__others__') setOtherEditStatus('');
                    }}
                    className="w-full border-gray-300 border px-4 py-2.5 rounded-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm bg-white"
                  >
                    <option value="">Select Status</option>
                    {PREDEFINED_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="__others__">Others</option>
                  </select>
                  {editData.status === '__others__' && (
                    <input
                      type="text"
                      value={otherEditStatus}
                      onChange={(e) => setOtherEditStatus(e.target.value)}
                      placeholder="Type custom status..."
                      className="mt-2 w-full border-gray-300 border px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                  )}
                </div>

                {/* Room No */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Room No</label>
                  <select
                    value={editData.roomNo}
                    onChange={(e) => {
                      setEditData({ ...editData, roomNo: e.target.value });
                      if (e.target.value !== '__others__') setOtherEditRoomNo('');
                    }}
                    className="w-full border-gray-300 border px-4 py-2.5 rounded-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm bg-white"
                  >
                    <option value="">Select Room No</option>
                    {availableRoomsForInventory.map(room => <option key={room} value={room}>Room {room}</option>)}
                    <option value="__others__">Others</option>
                  </select>
                  {editData.roomNo === '__others__' && (
                    <input
                      type="text"
                      value={otherEditRoomNo}
                      onChange={(e) => setOtherEditRoomNo(e.target.value)}
                      placeholder="Type custom room..."
                      className="mt-2 w-full border-gray-300 border px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                  )}
                </div>

                {/* Floor */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Floor</label>
                  <select
                    value={editData.floor}
                    onChange={(e) => {
                      setEditData({ ...editData, floor: e.target.value });
                      if (e.target.value !== '__others__') setOtherEditFloor('');
                    }}
                    className="w-full border-gray-300 border px-4 py-2.5 rounded-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm bg-white"
                  >
                    <option value="">Select Floor</option>
                    {availableFloors.map(floor => <option key={floor} value={floor}>Floor {floor}</option>)}
                    <option value="__others__">Others</option>
                  </select>
                  {editData.floor === '__others__' && (
                    <input
                      type="text"
                      value={otherEditFloor}
                      onChange={(e) => setOtherEditFloor(e.target.value)}
                      placeholder="Type custom floor..."
                      className="mt-2 w-full border-gray-300 border px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                  )}
                </div>

                {/* Purchase Cost */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Purchase Cost (INR)</label>
                  <input
                    type="number"
                    className="w-full border-gray-300 border px-4 py-2.5 rounded-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm"
                    value={editData.purchaseCost || ""}
                    onChange={(e) => setEditData({ ...editData, purchaseCost: e.target.value })}
                    placeholder="Enter Cost"
                  />
                </div>

                {/* Purchase Date */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Purchase Date</label>
                  <input
                    type="date"
                    className="w-full border-gray-300 border px-4 py-2.5 rounded-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm bg-white"
                    value={editData.purchaseDate ? editData.purchaseDate.split('-').reverse().join('-') : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        const date = new Date(e.target.value);
                        const formatted = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
                        setEditData({ ...editData, purchaseDate: formatted });
                      } else {
                        setEditData({ ...editData, purchaseDate: "" });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
                <textarea
                  className="w-full border-gray-300 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm resize-none"
                  rows={3}
                  value={editData.description || ""}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Enter description here..."
                />
              </div>

              {/* Receipt Upload */}
              <div className="mt-6 space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">Update Receipt</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 w-full border border-gray-300 p-3 rounded-xl bg-gray-50 flex items-center justify-between">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setEditReceiptFile(e.target.files[0])}
                      className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {(editReceiptFile || editData.receiptUrl) && (
                    <div className="relative group w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm bg-white self-start sm:self-center">
                      {((editReceiptFile && editReceiptFile.type === 'application/pdf') || (!editReceiptFile && editData.receiptUrl?.toLowerCase().endsWith('.pdf'))) ? (
                        <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center">
                          <svg className="w-6 h-6 text-red-500 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5v1zm5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9H13c.8 0 1.5.7 1.5 1.5v3zm4-3h-2v1.5h1.5v1.5H16.5V15H15V9h3.5v1.5zM7 10.5h1v1H7v-1zm6 0h1v2h-1v-2z"/></svg>
                          <span className="text-[9px] font-bold text-red-500 uppercase">PDF</span>
                        </div>
                      ) : (
                        <img 
                          src={editReceiptFile ? URL.createObjectURL(editReceiptFile) : (editData.receiptUrl.startsWith('http') ? editData.receiptUrl : `${BASE_URL}${editData.receiptUrl.startsWith('/') ? '' : '/'}${editData.receiptUrl}`)} 
                          alt="Receipt" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                      <a 
                        href={editReceiptFile ? URL.createObjectURL(editReceiptFile) : (editData.receiptUrl.startsWith('http') ? editData.receiptUrl : `${BASE_URL}${editData.receiptUrl.startsWith('/') ? '' : '/'}${editData.receiptUrl}`)}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer"
                      >
                        <span className="text-white text-[10px] font-bold px-2 py-1 border border-white/50 rounded-lg shadow-sm">View</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  className="px-8 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors shadow-sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-xl"
                  onClick={handleEditSave}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk QR Modal */}
      {showBulkQRModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Generate QR Codes</h3>
            <p className="mb-4">
              Generate QR codes for {selectedItemsForQR.length} selected items?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowBulkQRModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkQRGeneration}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate"}
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
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Confirm Delete</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">"{itemToDelete?.itemName}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteItem(itemToDelete._id)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
            <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
                <Trash2 className="text-white" size={22} />
              </div>
              <h3 className="text-xl font-bold text-white">Delete All Inventory</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-center mb-2">
                You are about to permanently delete{" "}
                <span className="font-bold text-red-600 text-lg">{inventory.length}</span>{" "}
                inventory items.
              </p>
              <p className="text-gray-500 text-sm text-center mb-6">
                This action <span className="font-semibold text-red-500">cannot be undone</span>. All item data, QR codes and receipts will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                >
                  <Trash2 size={18} />
                  Delete All {inventory.length} Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

// ── AddNewItem ──────────────────────────────────────────────────────────────

function AddNewItem({ onBackToInventory, onItemAdded, availableRoomsForInventory, availableFloors }) {
  const [origin, setOrigin] = useState("");
  const [availableLocations] = useState([
    "Main Building",
    "Kitchen",
    "Mess Hall",
    "Recreation Room",
    "Study Hall",
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const dateInputRef = useRef(null);
  const [formData, setFormData] = useState({
    itemName: "",
    location: "",
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

  const [otherLocation, setOtherLocation] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [otherStatus, setOtherStatus] = useState('');
  const [otherRoomNo, setOtherRoomNo] = useState('');
  const [otherFloor, setOtherFloor] = useState('');

  // ── "Others" custom options (persisted per-field in localStorage) ──────────
  const [customLocations, setCustomLocations] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('customInventoryLocations') || '[]');
    }
    return [];
  });
  const [customCategories, setCustomCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('customInventoryCategories') || '[]');
    }
    return [];
  });
  const [customStatuses, setCustomStatuses] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('customInventoryStatuses') || '[]');
    }
    return [];
  });
  const [customRoomNos, setCustomRoomNos] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('customInventoryRoomNos') || '[]');
    }
    return [];
  });
  const [customFloors, setCustomFloors] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('customInventoryFloors') || '[]');
    }
    return [];
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.itemName.trim()) newErrors.itemName = "Item Name is required.";
    // location
    if (formData.location === '__others__') {
      if (!otherLocation.trim()) newErrors.location = "Please type a custom location.";
    } else if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
    }
    // status
    if (formData.status === '__others__') {
      if (!otherStatus.trim()) newErrors.status = "Please type a custom status.";
    } else if (!formData.status) {
      newErrors.status = "Status is required.";
    }
    // category
    if (formData.category === '__others__') {
      if (!otherCategory.trim()) newErrors.category = "Please type a custom category.";
    } else if (!formData.category) {
      newErrors.category = "Category is required.";
    }
    // roomNo
    if (formData.roomNo === '__others__') {
      if (!otherRoomNo.trim()) newErrors.roomNo = "Please type a custom room number.";
    } else if (!formData.roomNo.trim()) {
      newErrors.roomNo = "Room No is required.";
    }
    // floor
    if (formData.floor === '__others__') {
      if (!otherFloor.trim()) newErrors.floor = "Please type a custom floor.";
    } else if (!formData.floor.trim()) {
      newErrors.floor = "Floor is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, receipt: e.target.files[0] }));
  };

  const handleCancel = () => {
    setFormData({
      itemName: "",
      location: "",
      roomNo: "",
      floor: "",
      status: "",
      category: "",
      description: "",
      purchaseDate: "",
      purchaseCost: "",
      receipt: null,
    });
    setErrors({});
    setOtherLocation('');
    setOtherCategory('');
    setOtherStatus('');
    setOtherRoomNo('');
    setOtherFloor('');
    onBackToInventory();
  };

  // Helper: save a custom value to localStorage for a field
  const saveCustomOption = (field, value, currentList, setter) => {
    if (value && !currentList.includes(value)) {
      const updated = [...currentList, value];
      setter(updated);
      localStorage.setItem(field, JSON.stringify(updated));
    }
  };

  const handleGenerateQR = async () => {
    if (!validateForm()) return;

    // Resolve "Others" values and persist them to localStorage
    let finalLocation = formData.location;
    let finalCategory = formData.category;
    let finalStatus = formData.status;

    if (formData.location === '__others__') {
      finalLocation = otherLocation.trim();
      saveCustomOption('customInventoryLocations', finalLocation, customLocations, setCustomLocations);
    }
    if (formData.category === '__others__') {
      finalCategory = otherCategory.trim();
      saveCustomOption('customInventoryCategories', finalCategory, customCategories, setCustomCategories);
    }
    if (formData.status === '__others__') {
      finalStatus = otherStatus.trim();
      saveCustomOption('customInventoryStatuses', finalStatus, customStatuses, setCustomStatuses);
    }

    let finalRoomNo = formData.roomNo;
    let finalFloor = formData.floor;

    if (formData.roomNo === '__others__') {
      finalRoomNo = otherRoomNo.trim();
      saveCustomOption('customInventoryRoomNos', finalRoomNo, customRoomNos, setCustomRoomNos);
    }
    if (formData.floor === '__others__') {
      finalFloor = otherFloor.trim();
      saveCustomOption('customInventoryFloors', finalFloor, customFloors, setCustomFloors);
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("itemName", formData.itemName);
      formDataToSend.append("category", finalCategory);
      formDataToSend.append("location", finalLocation);
      formDataToSend.append("status", finalStatus);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("purchaseDate", formData.purchaseDate);
      formDataToSend.append("purchaseCost", formData.purchaseCost);
      if (formData.receipt) {
        formDataToSend.append("receipt", formData.receipt);
      }
      formDataToSend.append("roomNo", finalRoomNo);
      formDataToSend.append("floor", finalFloor);

      const { data } = await api.post(
        `/api/adminauth/inventory/add`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
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

  const handleDownloadQR = async () => {
    if (!generatedItem) return;

    try {
      const response = await api.get(
        `/api/adminauth/inventory/${generatedItem._id}/qr-code/download`,
        { responseType: "blob" }
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
          style={{ fontFamily: "Inter" }}
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
              className={`w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] ${errors.itemName ? "border-2 border-red-500" : ""}`}
              style={inputStyle}
              required
            />
            {errors.itemName && (
              <p className="text-red-500 text-xs mt-1 ml-2">{errors.itemName}</p>
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
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value !== '__others__') setOtherLocation('');
                }}
                className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${formData.location === "" ? "text-[#0000008A]" : "text-black"
                  } ${errors.location ? "border-2 border-red-500" : ""}`}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  boxShadow: "0px 4px 10px 0px #00000040",
                }}
              >
                <option value="" disabled hidden>
                  Select Location
                </option>

                {PREDEFINED_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}

                {customLocations.map((loc) => (
                  <option key={`cloc-${loc}`} value={loc}>
                    {loc}
                  </option>
                ))}

                <option value="__others__">Others</option>
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
            {formData.location === '__others__' && (
              <input
                type="text"
                value={otherLocation}
                onChange={(e) => setOtherLocation(e.target.value)}
                placeholder="Type custom location..."
                className="mt-2 w-full sm:max-w-[530px] px-4 bg-white rounded-[10px] border-0 outline-none text-black font-semibold text-[12px] font-[Poppins]"
                style={{ height: '40px', boxShadow: '0px 4px 10px 0px #00000040' }}
              />
            )}
            {errors.location && (
              <p className="text-red-500 text-xs mt-1 ml-2">{errors.location}</p>
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
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value !== '__others__') setOtherStatus('');
                }}
                className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${formData.status === "" ? "text-[#0000008A]" : "text-black"} ${errors.status ? "border-2 border-red-500" : ""}`}
                style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", boxShadow: "0px 4px 10px 0px #00000040" }}
              >
                <option value="" disabled hidden>Select Status</option>
                {PREDEFINED_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
                {customStatuses.map((st) => (
                  <option key={`cst-${st}`} value={st}>{st}</option>
                ))}
                <option value="__others__">Others</option>
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
            {formData.status === '__others__' && (
              <input
                type="text"
                value={otherStatus}
                onChange={(e) => setOtherStatus(e.target.value)}
                placeholder="Type custom status..."
                className="mt-2 w-full sm:max-w-[530px] px-4 bg-white rounded-[10px] border-0 outline-none text-black font-semibold text-[12px] font-[Poppins]"
                style={{ height: '40px', boxShadow: '0px 4px 10px 0px #00000040' }}
              />
            )}
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
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value !== '__others__') setOtherCategory('');
                }}
                className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${formData.category === "" ? "text-[#0000008A]" : "text-black"
                  } ${errors.category ? "border-2 border-red-500" : ""}`}
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

                {PREDEFINED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}

                {customCategories.map((cat) => (
                  <option key={`ccat-${cat}`} value={cat}>
                    {cat}
                  </option>
                ))}

                <option value="__others__">Others</option>
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
            {formData.category === '__others__' && (
              <input
                type="text"
                value={otherCategory}
                onChange={(e) => setOtherCategory(e.target.value)}
                placeholder="Type custom category..."
                className="mt-2 w-full sm:max-w-[530px] px-4 bg-white rounded-[10px] border-0 outline-none text-black font-semibold text-[12px] font-[Poppins]"
                style={{ height: '40px', boxShadow: '0px 4px 10px 0px #00000040' }}
              />
            )}
            {errors.category && (
              <p className="text-red-500 text-xs mt-1 ml-2">{errors.category}</p>
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
              className="w-full px-4 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins]"
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
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value !== '__others__') setOtherRoomNo('');
                }}
                className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${formData.roomNo === "" ? "text-[#0000008A]" : "text-black"} ${errors.roomNo ? "border-2 border-red-500" : ""}`}
                style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", boxShadow: "0px 4px 10px 0px #00000040" }}
              >
                <option value="" disabled hidden>Select Room Number</option>
                {availableRoomsForInventory.map((room) => (
                  <option key={room} value={room}>Room {room}</option>
                ))}
                {customRoomNos.map((room) => (
                  <option key={`croom-${room}`} value={room}>Room {room}</option>
                ))}
                <option value="__others__">Others</option>
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
            {formData.roomNo === '__others__' && (
              <input
                type="text"
                value={otherRoomNo}
                onChange={(e) => setOtherRoomNo(e.target.value)}
                placeholder="Type custom room number..."
                className="mt-2 w-full sm:max-w-[530px] px-4 bg-white rounded-[10px] border-0 outline-none text-black font-semibold text-[12px] font-[Poppins]"
                style={{ height: '40px', boxShadow: '0px 4px 10px 0px #00000040' }}
              />
            )}
            {errors.roomNo && (
              <p className="text-red-500 text-xs mt-1 ml-2">{errors.roomNo}</p>
            )}
          </div>

          {/* Floor */}
          <div className="w-full px-2">
            <label className="block mb-1 text-black font-[500] text-[18px] leading-[22px] text-left">
              Floor
            </label>
            <div className="relative w-full sm:max-w-[530px] h-[40px]">
              <select
                name="floor"
                value={formData.floor}
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value !== '__others__') setOtherFloor('');
                }}
                className={`w-full h-full px-4 bg-white rounded-[10px] border-0 outline-none cursor-pointer appearance-none text-[12px] leading-[22px] font-semibold font-[Poppins] ${formData.floor === "" ? "text-[#0000008A]" : "text-black"} ${errors.floor ? "border-2 border-red-500" : ""}`}
                style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", boxShadow: "0px 4px 10px 0px #00000040" }}
              >
                <option value="" disabled hidden>Select Floor</option>
                {availableFloors.map((floor) => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
                {customFloors.map((floor) => (
                  <option key={`cfloor-${floor}`} value={floor}>Floor {floor}</option>
                ))}
                <option value="__others__">Others</option>
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
            {formData.floor === '__others__' && (
              <input
                type="text"
                value={otherFloor}
                onChange={(e) => setOtherFloor(e.target.value)}
                placeholder="Type custom floor..."
                className="mt-2 w-full sm:max-w-[530px] px-4 bg-white rounded-[10px] border-0 outline-none text-black font-semibold text-[12px] font-[Poppins]"
                style={{ height: '40px', boxShadow: '0px 4px 10px 0px #00000040' }}
              />
            )}
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
            className="w-full px-4 py-3 bg-white rounded-[10px] border-0 outline-none placeholder-gray-500 text-black font-semibold text-[12px] leading-[100%] tracking-normal text-left font-[Poppins] resize-none"
            style={{ ...inputStyle, height: "90px", padding: "12px 16px" }}
          />
        </div>

        {/* Purchase Date */}
        <div className="mt-6 sm:mt-8 w-full px-2">
          <label className="block mb-1 text-black ml-2" style={labelStyle}>
            Purchase Date
          </label>
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1">
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
                    const formattedDate = `${selectedDate.getDate().toString().padStart(2, "0")}-${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}-${selectedDate.getFullYear()}`;
                    setFormData((prev) => ({ ...prev, purchaseDate: formattedDate }));
                  } else {
                    setFormData((prev) => ({ ...prev, purchaseDate: "" }));
                  }
                }}
                className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                style={{ colorScheme: "light" }}
              />
              <div className="bg-white rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040] w-full">
                {formData.purchaseDate || ""}
              </div>
              {!formData.purchaseDate && (
                <div className="absolute top-1/2 left-4 -translate-y-1/2 z-0 text-gray-500 font-[Poppins] font-semibold text-[15px] tracking-[0.1em] md:tracking-[0.3em] pointer-events-none select-none overflow-hidden text-ellipsis whitespace-nowrap pr-4">
                  {"d\u00A0d\u00A0-\u00A0m\u00A0m\u00A0-\u00A0y\u00A0y\u00A0y\u00A0y"}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleCalendarClick}
              className="p-2 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
              title="Open Calendar"
            >
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_370_4" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
                  <rect width="30" height="30" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_370_4)">
                  <path d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 20.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 16.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 16.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 16.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 16.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z" fill="#1C1B1F" />
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
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 bg-white text-black cursor-pointer rounded-[10px] shadow hover:bg-gray-200 transition-colors font-[Poppins] disabled:opacity-50"
            style={{ fontWeight: "600", fontSize: "15px" }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerateQR}
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 cursor-pointer text-white rounded-[10px] shadow hover:bg-green-700 transition-colors font-[Poppins] flex items-center gap-2 justify-center disabled:opacity-50"
            style={{ fontWeight: "600", fontSize: "15px" }}
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

              {generatedItem && (generatedItem.publicUrl || generatedItem.qrCodeUrl) && (
                <div className="mb-4 flex flex-col items-center">
                  {generatedItem.publicUrl ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedItem.publicUrl)}`}
                      alt="Generated QR Code"
                      className="mx-auto w-32 h-32 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <img
                      src={
                        generatedItem.qrCodeUrl.startsWith("http")
                          ? generatedItem.qrCodeUrl.replace("/public/qrcodes", "/qrcodes")
                          : `${BASE_URL}${generatedItem.qrCodeUrl.replace("/public/qrcodes", "/qrcodes")}`
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

// ── InventoryManagement (root) ─────────────────────────────────────────────
export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [currentView, setCurrentView] = useState("inventory");
  const [availableRoomsForInventory, setAvailableRoomsForInventory] = useState([]);
  const [availableFloors, setAvailableFloors] = useState([]);

  const fetchInventory = async () => {
    try {
      // Request a high limit to fetch all items for client-side pagination/filtering
      const { data } = await api.get(`/api/adminauth/inventory?limit=10000`);
      setInventory(data.items);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  };

  const fetchAvailableRoomsForInventoryData = async () => {
    try {
      const response = await api.get(
        "/api/adminauth/inventory/available-rooms-floors"
      );
      setAvailableRoomsForInventory(response.data.rooms || []);
      setAvailableFloors(response.data.floors || []);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchAvailableRoomsForInventoryData();
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
      availableRoomsForInventory={availableRoomsForInventory}
      availableFloors={availableFloors}
    />
  ) : (
    <AddNewItem
      onBackToInventory={handleBackToInventory}
      onItemAdded={handleItemAdded}
      availableRoomsForInventory={availableRoomsForInventory}
      availableFloors={availableFloors}
    />
  );
}