import React, { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const PREDEFINED_LOCATIONS = [
  "Room No 101", "Room No 102", "Room No 103", "Room No 104", "Room No 105",
  "Room No 106", "Room No 107", "Room No 108", "Room No 109", "Room No 110",
  "Room No 201", "Room No 202", "Room No 203", "Room No 204", "Room No 205",
  "Room No 206", "Room No 207", "Room No 208", "Room No 209", "Room No 210",
  "Gym", "Prayer Room", "Kitchen Room", "Dining Room", "Study Room",
  "Conference Room", "Store Room", "Washing Machine Room",
  "Corridor- 1st Floor", "Corridor- 2nd Floor", "Corridor- 3rd Floor",
  "Wash Rooms", "Staircase", "Ground Floor", "Terrace", "Others"
];

const PREDEFINED_CATEGORIES = [
  "BEDS", "MATTRESSES", "MATTRESSES COVERS", "CUPBOARDS", "FANS",
  "TUBE LIGHTS", "Bulb", "CURTAINS( Set)", "SHOE RACKS", "Panels",
  "Carpets", "Dust Bin", "Steel Table", "Microwave", "Hot Plate",
  "Fridge", "Washing Machine", "Inverter", "Batteries", "Stabilizers",
  "Exhaust Fan", "Chairs", "Routers", "CCTV Camera", "TV", "Computer", "Mobile",
  "Others"
];

const PREDEFINED_STATUSES = ["Available", "Occupied", "Damaged", "Maintenance"];

export default function ReplaceItemModal({ isOpen, onClose, oldItem, fetchInventory, availableRoomsForInventory = [], availableFloors = [] }) {
  const [formData, setFormData] = useState({
    reason: "",
    itemName: "",
    category: "",
    location: "",
    roomNo: "",
    floor: "",
    status: "Available",
    description: "",
    purchaseDate: "",
    purchaseCost: "",
  });
  
  const [otherCategory, setOtherCategory] = useState("");
  const [otherLocation, setOtherLocation] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (oldItem) {
      setFormData({
        reason: "",
        itemName: "",
        category: oldItem.category || "",
        location: oldItem.locationCategory || oldItem.location || "",
        roomNo: oldItem.roomNo || "",
        floor: oldItem.floor || "",
        status: "Available",
        description: "",
        purchaseDate: "",
        purchaseCost: "",
      });
      setReceiptFile(null);
    }
  }, [oldItem]);

  if (!isOpen || !oldItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.reason) {
      toast.error("Item Name and Reason are required!");
      return;
    }
    
    setLoading(true);
    try {
      const data = new FormData();
      
      const finalCategory = formData.category === "Others" ? otherCategory : formData.category;
      const finalLocation = formData.location === "Others" ? otherLocation : formData.location;
      
      data.append("reason", formData.reason);
      data.append("itemName", formData.itemName);
      data.append("category", finalCategory);
      data.append("location", finalLocation);
      data.append("roomNo", formData.roomNo);
      data.append("floor", formData.floor);
      data.append("status", formData.status);
      data.append("description", formData.description);
      data.append("purchaseCost", formData.purchaseCost);
      if (formData.purchaseDate) {
        data.append("purchaseDate", formData.purchaseDate);
      }
      
      if (receiptFile) {
        data.append("receipt", receiptFile);
      }
      
      const response = await api.post(`/api/adminauth/inventory/${oldItem._id}/replace`, data);
      
      if (response.data.success) {
        toast.success("Item replaced successfully!");
        fetchInventory();
        onClose();
      } else {
        toast.error(response.data.message || "Failed to replace item");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error replacing item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Replace Item</h2>
            <p className="text-sm text-gray-500">Replacing: {oldItem.itemName} ({oldItem.barcodeId})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <label className="block text-sm font-semibold text-red-800 mb-1">Reason for Replacement *</label>
            <textarea
              required
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
              placeholder="e.g. Broken leg, water damage, beyond repair..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Item Name *</label>
              <input
                type="text"
                required
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none"
                placeholder="Enter new item name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
              >
                <option value="">Select Category</option>
                {PREDEFINED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {formData.category === "Others" && (
                <input
                  type="text"
                  placeholder="Specify Category"
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
              >
                <option value="">Select Location</option>
                {PREDEFINED_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              {formData.location === "Others" && (
                <input
                  type="text"
                  placeholder="Specify Location"
                  value={otherLocation}
                  onChange={(e) => setOtherLocation(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                />
              )}
            </div>

            {formData.location === "Residential Room" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                  >
                    <option value="">Select Floor</option>
                    {availableFloors.map(floor => <option key={floor} value={floor}>{floor}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room No</label>
                  <select
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                  >
                    <option value="">Select Room</option>
                    {availableRoomsForInventory.map(room => <option key={room} value={room}>{room}</option>)}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost (₹)</label>
              <input
                type="number"
                value={formData.purchaseCost}
                onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Image</label>
             <input
               type="file"
               ref={fileInputRef}
               className="hidden"
               accept="image/*"
               onChange={(e) => setReceiptFile(e.target.files[0])}
             />
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
             >
               <Upload className="text-gray-400 mb-2" size={24} />
               <p className="text-sm font-medium text-gray-700">
                 {receiptFile ? receiptFile.name : "Click to upload receipt"}
               </p>
               <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
              placeholder="Any other details..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Replacing...
                </>
              ) : (
                "Confirm Replacement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
