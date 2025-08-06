"use client";

import { useState, useEffect } from "react";
import { Eye, Download } from "lucide-react";
import Image from "next/image";
import InspectionModal from "./InspectionModal";
import axios from "axios";

// Configure axios base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_PROD_API_URL || 'http://localhost:5224/api/adminauth';

const statusStyles = {
  Scheduled: "bg-[#FF9D00] text-white",
  Completed: "bg-[#28C404] text-white",
  Cancelled: "bg-gray-300 text-black",
};

export default function InspectionPage() {
  const [formData, setFormData] = useState({
    title: "",
    target: "",
    area: "",
    date: "",
    time: "",
    instructions: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [upcomingInspections, setUpcomingInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // API Functions
  const createInspectionAPI = async (inspectionData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/adminauth/inspections`, inspectionData, {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if you have auth tokens
          // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create inspection' };
    }
  };

  const fetchInspectionsAPI = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/adminauth/inspections`, {
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch inspections' };
    }
  };

  const updateInspectionStatusAPI = async (inspectionId, status) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/adminauth/inspections/${inspectionId}/status`, 
        { status }, 
        {
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update inspection status' };
    }
  };

  const deleteInspectionAPI = async (inspectionId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/adminauth/inspections/${inspectionId}`, {
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete inspection' };
    }
  };

  // Load inspections on component mount
  useEffect(() => {
    const loadInspections = async () => {
      try {
        setFetchLoading(true);
        const response = await fetchInspectionsAPI();
        setUpcomingInspections(response.inspections || []);
      } catch (error) {
        console.error('Error loading inspections:', error);
        alert(error.message || 'Failed to load inspections');
      } finally {
        setFetchLoading(false);
      }
    };

    loadInspections();
  }, []);

  const tableHeaders = [
    { label: "Inspection ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Target", key: "target" },
    { label: "Date", key: "date" },
    { label: "Time", key: "time" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required.";
    if (!formData.target) newErrors.target = "Target is required.";
    if (!formData.area) newErrors.area = "Area is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.time) newErrors.time = "Time is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Combine date and time into datetime
      const datetime = new Date(`${formData.date}T${formData.time}`);
      
      const inspectionData = {
        title: formData.title,
        target: formData.target,
        area: formData.area,
        datetime: datetime.toISOString(),
        instructions: formData.instructions || ''
      };

      const response = await createInspectionAPI(inspectionData);
      
      // Transform the response data to match frontend format
      const newInspection = {
        id: response.inspection.id,
        title: response.inspection.title,
        target: response.inspection.target,
        area: response.inspection.area,
        date: new Date(response.inspection.datetime).toLocaleDateString('en-GB'),
        time: new Date(response.inspection.datetime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        datetime: response.inspection.datetime,
        instructions: response.inspection.instructions,
        status: response.inspection.status === 'pending' ? 'Scheduled' : 'Completed',
        createdAt: response.inspection.createdAt
      };
      
      // Add new inspection to local state
      setUpcomingInspections(prev => [newInspection, ...prev]);
      
      // Reset form
      setFormData({
        title: "",
        target: "",
        area: "",
        date: "",
        time: "",
        instructions: "",
      });
      
      setSubmitted(true);
      alert("Inspection Scheduled Successfully");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error creating inspection:', error);
      alert(error.message || 'Error scheduling inspection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (inspection) => {
    // Generate report data
    const reportData = {
      inspectionId: inspection.id,
      title: inspection.title,
      target: inspection.target,
      date: inspection.date,
      time: inspection.time,
      status: inspection.status,
      area: inspection.area || 'N/A',
      instructions: inspection.instructions || 'No specific instructions'
    };
    
    // Create downloadable content
    const reportContent = `
INSPECTION REPORT
================

Inspection ID: ${reportData.inspectionId}
Title: ${reportData.title}
Target: ${reportData.target}
Area: ${reportData.area}
Date: ${reportData.date}
Time: ${reportData.time}
Status: ${reportData.status}

Instructions:
${reportData.instructions}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection_report_${inspection.id.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (inspection) => {
    setSelectedInspection(inspection);
  };

  const handleStatusUpdate = async (inspectionId, newStatus) => {
    try {
      const backendStatus = newStatus === 'Completed' ? 'completed' : 'pending';
      await updateInspectionStatusAPI(inspectionId, backendStatus);
      
      // Update local state
      setUpcomingInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId 
            ? { ...inspection, status: newStatus }
            : inspection
        )
      );
      
      alert(`Inspection status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update inspection status');
    }
  };

  const handleDeleteInspection = async (inspectionId) => {
    if (!confirm('Are you sure you want to delete this inspection?')) {
      return;
    }

    try {
      await deleteInspectionAPI(inspectionId);
      
      // Remove from local state
      setUpcomingInspections(prev => 
        prev.filter(inspection => inspection.id !== inspectionId)
      );
      
      alert('Inspection deleted successfully');
    } catch (error) {
      console.error('Error deleting inspection:', error);
      alert(error.message || 'Failed to delete inspection');
    }
  };

  return (
    <div className="bg-white text-black w-full max-w-7xl mx-auto p-6 space-y-10 min-h-screen my-10">
      <h2 className="text-2xl font-bold mb-4 text-black">
        <span className="border-l-4 border-[#4F8CCF] pl-2 ml-2">
          Hostel Inspections
        </span>
      </h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 bg-[#BEC5AD] shadow-md space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block font-semibold mb-1">
              Inspection Title
            </label>
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 bg-white rounded-lg shadow-xl"
              disabled={loading}
            >
              <option value="">Select</option>
              <option value="Monthly Room Check">Monthly Room Check</option>
              <option value="Sanitation Check">Sanitation Check</option>
              <option value="Safety Inspection">Safety Inspection</option>
              <option value="Maintenance Check">Maintenance Check</option>
            </select>
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="target" className="block font-semibold mb-1">
              Target Warden/Area
            </label>
            <input
              name="target"
              type="text"
              value={formData.target}
              onChange={handleChange}
              placeholder="Enter Target"
              className="w-full p-2 bg-white rounded-lg shadow-xl"
              disabled={loading}
            />
            {errors.target && (
              <p className="text-red-600 text-xs mt-1">{errors.target}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="area" className="block font-semibold mb-1">
              Area
            </label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full p-2 bg-white rounded-lg shadow-xl"
              disabled={loading}
            >
              <option value="">Select Area</option>
              <option value="Dormitory">Dormitory</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
              <option value="Common Areas">Common Areas</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Bathrooms">Bathrooms</option>
            </select>
            {errors.area && (
              <p className="text-red-600 text-xs mt-1">{errors.area}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block font-semibold mb-1">
              Date
            </label>
            <div className="flex items-center gap-2 md:max-w-[400px] w-full">
              <input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                id="dateInput"
                className="w-full p-2 text-gray-800 bg-white rounded-lg shadow-xl appearance-none"
                disabled={loading}
              />
              <Image
                src="/photos/calendar.svg"
                alt="Calendar Icon"
                width={24}
                height={24}
                className={`hover:scale-110 transition-transform ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !loading && (
                  document.getElementById("dateInput")?.showPicker?.() ||
                  document.getElementById("dateInput")?.focus()
                )}
              />
            </div>
            {errors.date && (
              <p className="text-red-600 text-xs mt-1">{errors.date}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="time" className="block font-semibold mb-1">
              Time
            </label>
            <div className="flex items-center gap-2 md:max-w-[400px] w-full">
              <input
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                id="timeInput"
                className="w-full p-2 text-gray-800 bg-white rounded-lg shadow-xl appearance-none"
                disabled={loading}
              />
              <Image
                src="/photos/clock.svg"
                alt="Clock Icon"
                width={24}
                height={24}
                className={`hover:scale-110 transition-transform ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !loading && (
                  document.getElementById("timeInput")?.showPicker?.() ||
                  document.getElementById("timeInput")?.focus()
                )}
              />
            </div>
            {errors.time && (
              <p className="text-red-600 text-xs mt-1">{errors.time}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="instructions" className="block font-semibold mb-1">
            Instructions (optional)
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 bg-white rounded-lg shadow-xl"
            disabled={loading}
            placeholder="Enter specific instructions for the inspection..."
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: "",
                target: "",
                area: "",
                date: "",
                time: "",
                instructions: "",
              });
              setErrors({});
            }}
            disabled={loading}
            className={`bg-white text-black font-semibold px-6 py-2 rounded-lg shadow-xl ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`bg-white text-black font-semibold px-6 py-2 rounded-lg shadow-xl ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}
          >
            {loading ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </form>

      {/* Inspection Table */}
      <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-xl">
        <h2 className="text-black text-lg font-semibold mb-3 ml-2">
          Upcoming Inspections
        </h2>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <div className="min-w-full inline-block overflow-hidden rounded-t-2xl border">
            <table className="min-w-full text-black text-xs sm:text-sm md:text-base table-fixed">
              <thead>
                <tr className="bg-white border-b">
                  {tableHeaders.map((header, i) => (
                    <th
                      key={i}
                      className="text-center font-semibold py-3 px-2 whitespace-nowrap w-[12.5%]"
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fetchLoading ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-8">
                      Loading inspections...
                    </td>
                  </tr>
                ) : upcomingInspections.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-8">
                      No inspections found. Create your first inspection above.
                    </td>
                  </tr>
                ) : (
                  upcomingInspections.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-black/5 transition">
                      {tableHeaders.map((column, cellIndex) => {
                        if (column.key === "actions") {
                          return (
                            <td
                              key={cellIndex}
                              className="text-center px-2 py-3 whitespace-nowrap w-[12.5%]"
                            >
                              <div className="flex justify-center items-center gap-2 sm:gap-3">
                                <Eye
                                  className="w-4 h-4 text-black cursor-pointer hover:text-blue-600"
                                  onClick={() => handleViewDetails(row)}
                                  title="View Details"
                                />
                                <span className="text-gray-400">|</span>
                                <Download
                                  className="w-4 h-4 text-black cursor-pointer hover:text-green-600"
                                  onClick={() => handleDownload(row)}
                                  title="Download Report"
                                />
                              </div>
                            </td>
                          );
                        }

                        if (column.key === "status") {
                          return (
                            <td
                              key={cellIndex}
                              className="text-center px-2 py-3 whitespace-nowrap w-[12.5%]"
                            >
                              <span
                                className={`inline-block w-24 px-3 py-1 text-[10px] sm:text-xs md:text-sm text-center font-medium rounded-lg cursor-pointer transition-colors ${
                                  statusStyles[row.status] ??
                                  "bg-gray-300 text-black"
                                }`}
                                onClick={() => {
                                  const newStatus = row.status === 'Scheduled' ? 'Completed' : 'Scheduled';
                                  handleStatusUpdate(row.id, newStatus);
                                }}
                                title="Click to toggle status"
                              >
                                {row.status}
                              </span>
                            </td>
                          );
                        }

                        if (column.key === "id") {
                          return (
                            <td
                              key={cellIndex}
                              className="text-center px-2 py-3 whitespace-nowrap w-[12.5%]"
                            >
                              <span title={row[column.key]}>
                                {row[column.key]?.substring(0, 8)}...
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={cellIndex}
                            className="text-center px-2 py-3 whitespace-nowrap w-[12.5%]"
                          >
                            {row[column.key]}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedInspection && (
        <InspectionModal
          isOpen={!!selectedInspection}
          onClose={() => setSelectedInspection(null)}
          section="Inspection Details"
          headers={[
            "Inspection ID",
            "Title",
            "Target",
            "Area",
            "Date",
            "Time",
            "Status",
            "Instructions"
          ]}
          row={[
            <span key="id" title={selectedInspection.id}>
              {selectedInspection.id?.substring(0, 8)}...
            </span>,
            selectedInspection.title,
            selectedInspection.target,
            selectedInspection.area || 'N/A',
            selectedInspection.date,
            selectedInspection.time,
            <span
              key="status"
              className={`inline-block px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${
                statusStyles[selectedInspection.status] ??
                "bg-gray-300 text-black"
              }`}
              onClick={() => {
                const newStatus = selectedInspection.status === 'Scheduled' ? 'Completed' : 'Scheduled';
                handleStatusUpdate(selectedInspection.id, newStatus);
                setSelectedInspection(prev => ({ ...prev, status: newStatus }));
              }}
              title="Click to toggle status"
            >
              {selectedInspection.status}
            </span>,
            selectedInspection.instructions || 'No specific instructions'
          ]}
          inspection={selectedInspection}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDeleteInspection}
        />
      )}
    </div>
  );
}