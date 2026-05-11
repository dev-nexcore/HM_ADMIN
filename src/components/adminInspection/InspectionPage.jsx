"use client";

import { useState, useEffect } from "react";
import { Eye, Download, Trash2, Edit2, Calendar, Clock, MapPin, Users, ClipboardList, Clock3, CheckCircle } from "lucide-react";
import Image from "next/image";
import InspectionModal from "./InspectionModal";
import api from "@/lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    cancelled: 0,
    areas: 0
  });
  const [activeFilter, setActiveFilter] = useState("total");

  const displayedInspections = upcomingInspections.filter(inspection => {
    if (activeFilter === "scheduled") return inspection.status === "Scheduled";
    if (activeFilter === "completed") return inspection.status === "Completed";
    return true;
  });

  // API Functions
  const createInspectionAPI = async (inspectionData) => {
    try {
      const response = await api.post(`/api/adminauth/inspections`, inspectionData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create inspection' };
    }
  };

  const fetchInspectionsAPI = async () => {
    try {
      const response = await api.get(`/api/adminauth/inspections`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch inspections' };
    }
  };

  const updateInspectionStatusAPI = async (inspectionId, status) => {
    try {
      const response = await api.patch(`/api/adminauth/inspections/${inspectionId}/status`, 
        { status }, 
        {
          headers: {
            'Content-Type': 'application/json',
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
      const response = await api.delete(`/api/adminauth/inspections/${inspectionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete inspection' };
    }
  };

  // Calculate statistics
  const calculateStats = (inspections) => {
    const total = inspections.length;
    const scheduled = inspections.filter(i => i.status === 'Scheduled').length;
    const completed = inspections.filter(i => i.status === 'Completed').length;
    const cancelled = inspections.filter(i => i.status === 'Cancelled').length;
    const areas = new Set(inspections.map(i => i.area).filter(Boolean)).size;
    
    setStats({ total, scheduled, completed, cancelled, areas });
  };

  // Load inspections on component mount
  useEffect(() => {
    const loadInspections = async () => {
      try {
        setFetchLoading(true);
        const response = await fetchInspectionsAPI();
        const inspections = response.inspections || [];
        setUpcomingInspections(inspections);
        calculateStats(inspections);
      } catch (error) {
        console.error('Error loading inspections:', error);
        toast.error(error.message || 'Failed to load inspections');
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

  // Card data for stats
 const statCards = [
{
id: "total",
label: "Total Inspections",
value: stats.total,
subLabel: "All inspections",
borderColor: "border-blue-200",
bgColor: "bg-blue-50",
textColor: "text-blue-500",
badgeColor: "bg-blue-50 text-blue-600",
icon: <ClipboardList size={18} />,
},

{
id: "scheduled",
label: "Scheduled",
value: stats.scheduled,
subLabel: "Pending",
borderColor: "border-orange-200",
bgColor: "bg-orange-50",
textColor: "text-orange-500",
badgeColor: "bg-orange-50 text-orange-600",
icon: <Clock3 size={18} />,
},

{
id: "completed",
label: "Completed",
value: stats.completed,
subLabel: "Done",
borderColor: "border-green-200",
bgColor: "bg-green-50",
textColor: "text-green-500",
badgeColor: "bg-green-50 text-green-600",
icon: <CheckCircle size={18} />,
},

{
id: "areas",
label: "Areas Covered",
value: stats.areas,
subLabel: "Locations",
borderColor: "border-purple-200",
bgColor: "bg-purple-50",
textColor: "text-purple-500",
badgeColor: "bg-purple-50 text-purple-600",
icon: <MapPin size={18} />,
},
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
      const datetime = new Date(`${formData.date}T${formData.time}`);
      
      const inspectionData = {
        title: formData.title,
        target: formData.target,
        area: formData.area,
        datetime: datetime.toISOString(),
        instructions: formData.instructions || ''
      };

      const response = await createInspectionAPI(inspectionData);
      
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
      
      setUpcomingInspections(prev => [newInspection, ...prev]);
      calculateStats([newInspection, ...upcomingInspections]);
      
      setFormData({
        title: "",
        target: "",
        area: "",
        date: "",
        time: "",
        instructions: "",
      });
      
      setSubmitted(true);
      toast.success("Inspection Scheduled Successfully");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast.error(error.message || 'Error scheduling inspection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (inspection) => {
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
    
    const reportContent = `
INSPECTION REPORT
================

Inspection ID: ${reportData.inspectionId ? `INSP-${reportData.inspectionId.slice(-4).toUpperCase()}` : "N/A"}
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

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection_report_${inspection.id ? `INSP-${inspection.id.slice(-4).toUpperCase()}` : "unknown"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully");
  };

  const handleViewDetails = (inspection) => {
    setSelectedInspection(inspection);
  };

  const handleStatusUpdate = async (inspectionId, newStatus) => {
    try {
      const backendStatus = newStatus === 'Completed' ? 'completed' : 
                           newStatus === 'Cancelled' ? 'cancelled' : 'pending';
      await updateInspectionStatusAPI(inspectionId, backendStatus);
      
      const updatedInspections = upcomingInspections.map(inspection => 
        inspection.id === inspectionId 
          ? { ...inspection, status: newStatus }
          : inspection
      );
      
      setUpcomingInspections(updatedInspections);
      calculateStats(updatedInspections);
      
      toast.info(`Inspection status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update inspection status');
    }
  };

  const handleDeleteInspection = async (inspectionId) => {
    if (!confirm('Are you sure you want to delete this inspection?')) {
      return;
    }

    try {
      await deleteInspectionAPI(inspectionId);
      
      const updatedInspections = upcomingInspections.filter(
        inspection => inspection.id !== inspectionId
      );
      
      setUpcomingInspections(updatedInspections);
      calculateStats(updatedInspections);
      
      toast.success('Inspection deleted successfully');
    } catch (error) {
      console.error('Error deleting inspection:', error);
      toast.error(error.message || 'Failed to delete inspection');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black">
            <span className="border-l-4 border-[#4F8CCF] pl-3 inline-block">
              Hostel Inspections
            </span>
          </h2>
          <p className="text-gray-600 mt-2 ml-3">Schedule and manage hostel inspections</p>
        </div>

        {/* Stats Cards Section */}
       

        {/* Alternative Minimal Cards Design */}
   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
  {statCards.map((card) => (
    <div
      key={card.id}
      onClick={() => setActiveFilter(card.id)}
      className={`bg-white rounded-2xl p-5 border ${card.borderColor} ${activeFilter === card.id ? "ring-2 ring-offset-2 ring-" + card.borderColor.split("-")[1] + "-500" : ""} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
    >
      <div
        className={`w-10 h-10 rounded-full ${card.bgColor} flex items-center justify-center mb-4`}
      >
        <div className={card.textColor}>
          {card.icon}
        </div>
      </div>

  <div className="text-4xl font-bold text-black">
    {card.value}
  </div>

  <div className="text-gray-700 text-sm font-medium mt-1">
    {card.label}
  </div>

  <div
    className={`inline-block mt-4 px-3 py-1 text-xs font-medium rounded-full ${card.badgeColor}`}
  >
    {card.subLabel}
  </div>

</div>
))}
</div>


        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 mb-10"
          style={{
            backgroundColor: "#BEC5AD",
            boxShadow: "0px 4px 20px 0px rgba(0, 0, 0, 0.25) inset",
          }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block font-semibold mb-2 text-black">
                Inspection Title
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={loading}
              >
                <option value="" disabled hidden>Select Title</option>
                <option value="Monthly Room Check">Monthly Room Check</option>
                <option value="Sanitation Check">Sanitation Check</option>
                <option value="Safety Inspection">Safety Inspection</option>
                <option value="Maintenance Check">Maintenance Check</option>
                <option value="Night Roll Call">Night Roll Call</option>
                <option value="Mess Food Inspection">Mess Food Inspection</option>
                <option value="Electrical Safety Check">Electrical Safety Check</option>
                <option value="Asset Verification">Asset Verification</option>
                <option value="Student Discipline Check">Student Discipline Check</option>
                <option value="Furniture Condition Check">Furniture Condition Check</option>
              </select>
              {errors.title && (
                <p className="text-red-600 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="target" className="block font-semibold mb-2 text-black">
                Target Warden/Area
              </label>
              <input
                name="target"
                type="text"
                value={formData.target}
                onChange={handleChange}
                placeholder="Enter Target"
                className="w-full p-3 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={loading}
              />
              {errors.target && (
                <p className="text-red-600 text-xs mt-1">{errors.target}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label htmlFor="area" className="block font-semibold mb-2 text-black">
                Area
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full p-3 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={loading}
              >
                <option value="" disabled hidden>Select Area</option>
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
              <label htmlFor="date" className="block font-semibold mb-2 text-black">
                Date
              </label>
              <div className="flex items-center gap-2">
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  id="dateInput"
                  className="flex-1 p-3 text-gray-800 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={loading}
                />
                <Calendar 
                  size={24}
                  className={`hover:scale-110 transition-transform ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer text-gray-600'}`}
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

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label htmlFor="time" className="block font-semibold mb-2 text-black">
                Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  id="timeInput"
                  className="flex-1 p-3 text-gray-800 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={loading}
                />
                <Clock 
                  size={24}
                  className={`hover:scale-110 transition-transform ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer text-gray-600'}`}
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

          <div className="mt-6">
            <label htmlFor="instructions" className="block font-semibold mb-2 text-black">
              Instructions (optional)
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
              placeholder="Enter specific instructions for the inspection..."
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
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
              className={`bg-white text-black font-semibold px-8 py-2 rounded-lg shadow-md transition-all duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:shadow-lg'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`bg-white text-black font-semibold px-8 py-2 rounded-lg shadow-md transition-all duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:shadow-lg'
              }`}
            >
              {loading ? 'Scheduling...' : 'Schedule Inspection'}
            </button>
          </div>
        </form>

        {/* Inspection Table */}
        <InspectionTable
          upcomingInspections={displayedInspections}
          fetchLoading={fetchLoading}
          handleViewDetails={handleViewDetails}
          handleDownload={handleDownload}
          handleStatusUpdate={handleStatusUpdate}
          statusStyles={statusStyles}
        />
      </div>

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
              {selectedInspection.id ? `INSP-${selectedInspection.id.slice(-4).toUpperCase()}` : "N/A"}
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
}

// InspectionTable Component with modern design
function InspectionTable({ 
  upcomingInspections, 
  fetchLoading, 
  handleViewDetails, 
  handleDownload, 
  handleStatusUpdate, 
  statusStyles 
}) {
  const tableHeaders = [
    { label: "Inspection ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Target", key: "target" },
    { label: "Date", key: "date" },
    { label: "Time", key: "time" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  if (fetchLoading) {
    return (
      <div className="bg-[#BEC5AD] rounded-2xl p-8 shadow-xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#BEC5AD] rounded-2xl p-4 shadow-xl">
      <h2 className="text-black text-lg font-semibold mb-3 ml-2 flex items-center gap-2">
        <ClipboardList size={20} />
        Upcoming Inspections
      </h2>

      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden sm:block">
        <div className="min-w-full inline-block overflow-hidden rounded-t-2xl border border-gray-200">
          <table className="min-w-full text-black text-xs sm:text-sm md:text-base">
            <thead>
              <tr className="bg-white border-b">
                {tableHeaders.map((header, i) => (
                  <th key={i} className="text-center font-semibold py-3 px-2 whitespace-nowrap">
                    {header.label}
                  </th>
                ))}
               </tr>
            </thead>
            <tbody>
              {upcomingInspections.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="text-center py-8 text-gray-600">
                    No inspections found. Create your first inspection above.
                  </td>
                </tr>
              ) : (
                upcomingInspections.map((row, rowIndex) => (
                  <tr key={rowIndex} className="bg-white hover:bg-gray-50 transition-colors border-b">
                    {tableHeaders.map((column, cellIndex) => {
                      if (column.key === "actions") {
                        return (
                          <td key={cellIndex} className="text-center px-2 py-3">
                            <div className="flex justify-center items-center gap-3">
                              <button
                                onClick={() => handleViewDetails(row)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleDownload(row)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Download Report"
                              >
                                <Download size={18} />
                              </button>
                            </div>
                          </td>
                        );
                      }

                      if (column.key === "status") {
                        return (
                          <td key={cellIndex} className="text-center px-2 py-3">
                            <button
                              className={`inline-block w-24 px-3 py-1 text-[10px] sm:text-xs md:text-sm text-center font-medium rounded-lg transition-colors ${
                                statusStyles[row.status] ?? "bg-gray-300 text-black"
                              }`}
                              onClick={() => {
                                const newStatus = row.status === 'Scheduled' ? 'Completed' : 
                                                 row.status === 'Completed' ? 'Cancelled' : 'Scheduled';
                                handleStatusUpdate(row.id, newStatus);
                              }}
                              title="Click to change status"
                            >
                              {row.status}
                            </button>
                          </td>
                        );
                      }

                      if (column.key === "id") {
                        return (
                          <td key={cellIndex} className="text-center px-2 py-3">
                            <span title={row[column.key]} className="font-mono text-xs">
                              {row[column.key] ? `INSP-${row[column.key].slice(-4).toUpperCase()}` : "N/A"}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td key={cellIndex} className="text-center px-2 py-3">
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

      {/* Mobile Card View */}
      <div className="space-y-4 sm:hidden">
        {upcomingInspections.length === 0 ? (
          <div className="text-center py-8 text-gray-600 bg-white rounded-xl">
            No inspections found. Create your first inspection above.
          </div>
        ) : (
          upcomingInspections.map((row, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-md">
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-500">ID:</span>
                <span className="ml-2 text-sm font-mono">{row.id ? `INSP-${row.id.slice(-4).toUpperCase()}` : "N/A"}</span>
              </div>
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-500">Title:</span>
                <span className="ml-2 text-sm">{row.title}</span>
              </div>
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-500">Target:</span>
                <span className="ml-2 text-sm">{row.target}</span>
              </div>
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-500">Date:</span>
                <span className="ml-2 text-sm">{row.date}</span>
              </div>
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-500">Time:</span>
                <span className="ml-2 text-sm">{row.time}</span>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewDetails(row)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDownload(row)}
                    className="text-green-600 hover:text-green-800 transition-colors"
                    title="Download Report"
                  >
                    <Download size={18} />
                  </button>
                </div>
                <button
                  className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    statusStyles[row.status] ?? "bg-gray-300 text-black"
                  }`}
                  onClick={() => {
                    const newStatus = row.status === 'Scheduled' ? 'Completed' : 
                                     row.status === 'Completed' ? 'Cancelled' : 'Scheduled';
                    handleStatusUpdate(row.id, newStatus);
                  }}
                  title="Click to change status"
                >
                  {row.status}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}