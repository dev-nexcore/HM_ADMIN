
//notices.jsx

"use client";
import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";


const initialFormState = {
  template: "",
  title: "",
  recipient: "",
  individualRecipient: "",
  message: "",
  date: ""
};



const HostelNotices = () => {
  const [form, setForm] = useState({
    template: "",
    title: "",
    recipient: "",
    individualRecipient: "",
    message: "",
    date: "",
  });

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: "All", recipientType: "", page: 1, limit: 50 });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/adminauth/notices", { params: filters });
      if (data.success) setNotices(data.notices);
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, [filters]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState(null);
const[formErrors,setFormErrors] = useState(null);
  
  const handleIssueNotice = async () => {
    try {
      await api.post("/api/adminauth/issue-notice", {
        template: form.template,
        title: form.title,
        message: form.message,
        issueDate: form.date,
        recipientType: form.recipient === "All (Students & Warden)" ? "All" : form.recipient,
        individualRecipient: form.individualRecipient || ""
      });
       toast.success("✅ Notice issued successfully");
      fetchNotices();
      setForm({ template: "", title: "", recipient: "", individualRecipient: "", message: "", date: "" });
    } catch (err) {
      console.error("Failed to issue notice:", err);
      toast.success("✅ Notice issued successfully");
       
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await api.delete(`/api/adminauth/notices/${id}`);
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notice:", err);
    }
  };

  const dateInputRef = useRef(null);
  const editDateInputRef = useRef(null);

  const handleCancel = () => {
    setForm({
      template: "",
      title: "",
      recipient: "",
      individualRecipient: "",
      message: "",
      date: "",
    });
  };

  const handleEdit = (notice) => {
    setEditingNotice({ ...notice });
    setIsPopupOpen(true);
  };

  const handleDelete = (noticeId) => {
    setDeleteNoticeId(noticeId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setNotices(notices.filter((notice) => notice.id !== deleteNoticeId));
    setShowDeleteConfirm(false);
    setDeleteNoticeId(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteNoticeId(null);
  };

  const handleSaveEdit = () => {
    setNotices(
      notices.map((notice) =>
        notice.id === editingNotice.id ? editingNotice : notice
      )
    );
    setIsPopupOpen(false);
    setEditingNotice(null);
  };

  const handleCancelEdit = () => {
    setIsPopupOpen(false);
    setEditingNotice(null);
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handleEditCalendarClick = () => {
    if (editDateInputRef.current) {
      editDateInputRef.current.showPicker();
    }
  };

 return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Poppins" }}>
      {/* Header */}
      <div className="w-full px-4 sm:px-12 py-4 -mb-6 mt-8">
        <h1
          className="text-[25px] leading-[25px] font-extrabold text-[#000000] text-left"
          style={{
            fontFamily: "Inter",
          }}
        >
          <span className="border-l-4 border-[#4F8CCF] pl-2 inline-flex font-bold items-center h-[25px]">
            Hostel Notices
          </span>
        </h1>
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-6 lg:p-10">

      {/* Form Box */}
      <div
        className="p-6 rounded-2xl shadow-inner mb-10 min-h-[500px]"
        style={{
          backgroundColor: "#BEC5AD",
          boxShadow: "0px 4px 20px 0px rgba(0, 0, 0, 0.25) inset",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-[Poppins]">
          {/* Select Template */}
          <div className="w-full">
            <label className="text-black font-medium mb-1 block ml-2">
              Select Template
            </label>
            <div className="relative shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] rounded-lg">
              <select
                className={`w-full appearance-none bg-white text-black px-4 py-3 rounded-lg outline-none border-none text-[12px] ${
                  formErrors?.template ? "border border-red-500" : ""
                }`}
                value={form.template}
                onChange={(e) => {
                  setForm({ ...form, template: e.target.value });
                  if (e.target.value) {
                    setFormErrors(prev => ({ ...prev, template: false }));
                  }
                }}
              >
                <option value=""></option>
                <option value="maintenance">Maintenance</option>
                <option value="announcement">Announcement</option>
                <option value="event">Event</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {formErrors?.template && (
              <p className="text-red-500 text-xs mt-1 ml-2">Please select a template</p>
            )}
          </div>

          {/* Notice Title */}
          <div className="w-full">
            <label className="text-black font-medium mb-1 block ml-2">
              Notice Title
            </label>
            <input
              type="text"
              placeholder="Enter Notice Title"
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                if (e.target.value) {
                  setFormErrors(prev => ({ ...prev, title: false }));
                }
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  setFormErrors(prev => ({ ...prev, title: true }));
                }
              }}
              className={`w-full px-4 py-3 rounded-lg bg-white text-black shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] outline-none border-none placeholder:font-medium placeholder:text-gray-400 text-[12px] ${
                formErrors?.title ? "border border-red-500" : ""
              }`}
            />
            {formErrors?.title && (
              <p className="text-red-500 text-xs mt-1 ml-2">Please enter a title</p>
            )}
          </div>

          {/* Recipient */}
          <div className="w-full">
            <label className="text-black font-medium mb-1 block ml-2">
              Recipient
            </label>
            <div className="relative shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] rounded-lg">
              <select
                className={`w-full appearance-none bg-white text-gray-500 px-4 py-3 rounded-lg outline-none border-none text-[12px] font-medium ${
                  formErrors?.recipient ? "border border-red-500" : ""
                }`}
                value={form.recipient}
                onChange={(e) => {
                  setForm({ ...form, recipient: e.target.value });
                  if (e.target.value) {
                    setFormErrors(prev => ({ ...prev, recipient: false }));
                  }
                }}
              >
                <option value="">Select recipient</option>
                <option value="All (Students & Warden)">All (Students & Warden)</option>
                <option value="Student">Students</option>
                <option value="Warden">Warden</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {formErrors?.recipient && (
              <p className="text-red-500 text-xs mt-1 ml-2">Please select a recipient</p>
            )}
          </div>

          {/* Individual Recipient Input */}
          <div className="w-full">
            <label className="text-black font-medium mb-1 block ml-2 whitespace-nowrap">
              Individual Recipient (ID/ name)
            </label>
            <input
              type="text"
              placeholder="Enter Resident ID or Warden name"
              value={form.individualRecipient}
              onChange={(e) =>
                setForm({ ...form, individualRecipient: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-white text-black shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] outline-none border-none placeholder:font-medium placeholder:text-gray-400 text-[12px]"
            />
          </div>
        </div>

        <div className="w-full font-[Poppins] mt-6">
          <label className="text-black font-medium mb-2 block ml-2">
            Message Content
          </label>
          <textarea
            rows={4}
            placeholder="Type your message here..."
            value={form.message}
            onChange={(e) => {
              setForm({ ...form, message: e.target.value });
              if (e.target.value) {
                setFormErrors(prev => ({ ...prev, message: false }));
              }
            }}
            onBlur={(e) => {
              if (!e.target.value) {
                setFormErrors(prev => ({ ...prev, message: true }));
              }
            }}
            className={`w-full px-4 py-2 rounded-lg bg-white text-black shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] outline-none border-none text-[12px] placeholder:font-medium placeholder:text-gray-400 resize-none ${
              formErrors?.message ? "border border-red-500" : ""
            }`}
          />
          {formErrors?.message && (
            <p className="text-red-500 text-xs mt-1 ml-2">Please enter a message</p>
          )}
        </div>

      <div className="w-full mt-6 font-[Poppins] flex flex-wrap items-center justify-between gap-4">
          {/* Issue Date */}
          <div className="w-full sm:w-auto">
            <label className="block mb-1 text-black ml-2 font-[Poppins] font-medium">
              Issue Date
            </label>
            <div className="relative flex items-center">
              <div className="relative w-full sm:w-[300px] max-w-full">
                <input
                  ref={dateInputRef}
                  type="date"
                  name="issueDate"
                  value={
                    form.date ? form.date.split("-").reverse().join("-") : ""
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
                      setForm((prev) => ({
                        ...prev,
                        date: formattedDate,
                      }));
                      setFormErrors(prev => ({ ...prev, date: false }));
                    } else {
                      setForm((prev) => ({ ...prev, date: "" }));
                    }
                  }}
                  onBlur={(e) => {
                    if (!form.date) {
                      setFormErrors(prev => ({ ...prev, date: true }));
                    }
                  }}
                  className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                  style={{ colorScheme: "light" }}
                />
                <div className={`bg-white rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040] ${
                  formErrors?.date ? "border border-red-500" : ""
                }`}>
                  {form.date || ""}
                </div>
                {!form.date && (
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 z-0 text-gray-400 font-[Poppins] font-medium text-[15px] tracking-[0.em] md:tracking-[0.4em] pointer-events-none select-none">
                    d&nbsp;d&nbsp;-&nbsp;m&nbsp;m&nbsp;-&nbsp;y&nbsp;y&nbsp;y&nbsp;y
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleCalendarClick}
                className="ml-3 p-2 cursor-pointer rounded-lg transition-colors flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
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
                      d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 15.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 21.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 21.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 21.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 21.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z"
                      fill="#1C1B1F"
                    />
                  </g>
                </svg>
              </button>
            </div>
            {formErrors?.date && (
              <p className="text-red-500 text-xs mt-1 ml-2">Please select a date</p>
            )}
          </div>

          {/* Buttons */}
          <div className="w-full flex justify-center mt-6 sm:mt-8">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleCancel?.()}
                className="bg-white cursor-pointer text-black px-6 py-2 rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] font-semibold text-[14px] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={() => {
                  // Validate form before submission
                  const errors = {};
                  if (!form.template) errors.template = true;
                  if (!form.title) errors.title = true;
                  if (!form.recipient) errors.recipient = true;
                  if (!form.message) errors.message = true;
                  if (!form.date) errors.date = true;

                  if (Object.keys(errors).length > 0) {
                    setFormErrors(errors);
                    return;
                  }

                  // If no errors, proceed with submission
                  setFormErrors(null);
                  // Your submit logic here


                  handleIssueNotice();
                }}
                className="bg-white cursor-pointer text-black px-6 py-2 rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] font-semibold text-[14px] hover:bg-gray-100"
              >
                Issue Notice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
  {/* Table */}
  <NoticesTable
    notices={notices}
    handleEdit={handleEdit}
    handleDelete={handleDelete}
  />


      {/* Edit Popup Modal */}
      {/* Edit Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black font-[Poppins]">
                Edit Notice
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-[Poppins]">
              {/* Select Template */}
              <div className="w-full">
                <label className="text-black font-medium mb-1 block ml-2">
                  Select Template
                </label>
                <div className="relative shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] rounded-lg">
                  <select
                    className="w-full appearance-none bg-white text-black px-4 py-3 rounded-lg outline-none border-none text-[12px]"
                    value={editingNotice?.template || ""}
                    onChange={(e) =>
                      setEditingNotice({
                        ...editingNotice,
                        template: e.target.value,
                      })
                    }
                  >
                    <option value=""></option>
                    <option value="maintenance">Maintenance</option>
                    <option value="announcement">Announcement</option>
                    <option value="event">Event</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Notice Title */}
              <div className="w-full">
                <label className="text-black font-medium mb-1 block ml-2">
                  Notice Title
                </label>
                <input
                  type="text"
                  placeholder="Enter Notice Title"
                  value={editingNotice?.title || ""}
                  onChange={(e) =>
                    setEditingNotice({
                      ...editingNotice,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-black shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] outline-none border-none placeholder:font-medium placeholder:text-gray-400 text-[12px]"
                />
              </div>

              {/* Recipient */}
              <div className="w-full">
                <label className="text-black font-medium mb-1 block ml-2">
                  Recipient
                </label>
                <div className="relative shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] rounded-lg">
                  <select
                    className="w-full appearance-none bg-white text-gray-500 px-4 py-3 rounded-lg outline-none border-none text-[12px] font-medium"
                    value={editingNotice?.recipient || ""}
                    onChange={(e) =>
                      setEditingNotice({
                        ...editingNotice,
                        recipient: e.target.value,
                      })
                    }
                  >
                    <option>All (Students & Warden)</option>
                    <option>Students</option>
                    <option>Warden</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Individual Recipient Input */}
              <div className="w-full">
                <label className="text-black font-medium mb-1 block ml-2 whitespace-nowrap">
                  Individual Recipient (ID/ name)
                </label>
                <input
                  type="text"
                  placeholder="Enter Resident ID or Warden name"
                  value={editingNotice?.individualRecipient || ""}
                  onChange={(e) =>
                    setEditingNotice({
                      ...editingNotice,
                      individualRecipient: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-black shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] outline-none border-none placeholder:font-medium placeholder:text-gray-400 text-[12px]"
                />
              </div>

              {/* Status */}
              <div className="w-full">
                <label className="text-black font-medium mb-1 block ml-2">
                  Status
                </label>
                <div className="relative shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] rounded-lg">
                  <select
                    className="w-full appearance-none bg-white text-gray-500 px-4 py-3 rounded-lg outline-none border-none text-[12px] font-medium"
                    value={editingNotice?.status || ""}
                    onChange={(e) =>
                      setEditingNotice({
                        ...editingNotice,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full font-[Poppins] mt-6">
              <label className="text-black font-medium mb-2 block ml-2">
                Message Content
              </label>
              <textarea
                rows={4}
                placeholder="Type your message here..."
                value={editingNotice?.message || ""}
                onChange={(e) =>
                  setEditingNotice({
                    ...editingNotice,
                    message: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg bg-white text-black shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] outline-none border-none text-[12px] placeholder:font-medium placeholder:text-gray-400 resize-none"
              />
            </div>

            <div className="w-full mt-6 font-[Poppins]">
              {/* Issue Date */}
              <div>
                <label className="block mb-1 text-black ml-2 font-[Poppins] font-medium">
                  Issue Date
                </label>
                <div className="flex items-center gap-3 w-full">
                  <div className="relative flex-1">
                    <input 
                      ref={editDateInputRef}
                      type="date"
                      name="editIssueDate"
                      value={
                        editingNotice?.date
                          ? editingNotice.date.split("-").reverse().join("-")
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
                          setEditingNotice((prev) => ({
                            ...prev,
                            date: formattedDate,
                          }));
                        } else {
                          setEditingNotice((prev) => ({ ...prev, date: "" }));
                        }
                      }}
                      className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                      style={{ colorScheme: "light" }}
                    />
                    <div className="bg-white rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040] w-full">
                      {editingNotice?.date || ""}
                    </div>
                    {!editingNotice?.date && (
                      <div className="absolute top-1/2 left-4 -translate-y-1/2 z-0 text-gray-400 font-[Poppins] font-medium text-[15px] tracking-[0.4em] pointer-events-none select-none overflow-hidden text-ellipsis whitespace-nowrap pr-4">
                        d&nbsp;d&nbsp;-&nbsp;m&nbsp;m&nbsp;-&nbsp;y&nbsp;y&nbsp;y&nbsp;y
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleEditCalendarClick}
                    className="p-2 rounded-lg transition-colors flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
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
                        id="mask0_370_4_edit"
                        style={{ maskType: "alpha" }}
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="30"
                        height="30"
                      >
                        <rect width="30" height="30" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_370_4_edit)">
                        <path
                          d="M6.25 27.5C5.5625 27.5 4.97396 27.2552 4.48438 26.7656C3.99479 26.276 3.75 25.6875 3.75 25V7.5C3.75 6.8125 3.99479 6.22396 4.48438 5.73438C4.97396 5.24479 5.5625 5 6.25 5H7.5V2.5H10V5H20V2.5H22.5V5H23.75C24.4375 5 25.026 5.24479 25.5156 5.73438C26.0052 6.22396 26.25 6.8125 26.25 7.5V25C26.25 25.6875 26.0052 26.276 25.5156 26.7656C25.026 27.2552 24.4375 27.5 23.75 27.5H6.25ZM6.25 25H23.75V12.5H6.25V25ZM6.25 10H23.75V7.5H6.25V10ZM15 17.5C14.6458 17.5 14.349 17.3802 14.1094 17.1406C13.8698 16.901 13.75 16.6042 13.75 16.25C13.75 15.8958 13.8698 15.599 14.1094 15.3594C14.349 15.1198 14.6458 15 15 15C15.3542 15 15.651 15.1198 15.8906 15.3594C16.1302 15.599 16.25 15.8958 16.25 16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25C8.75 15.8958 8.86979 15.599 9.10938 15.3594C9.34896 15.1198 9.64583 15 10 15C10.3542 15 10.651 15.1198 10.8906 15.3594C11.1302 15.599 11.25 15.8958 11.25 16.25C11.25 16.6042 11.1302 16.901 10.8906 17.1406C10.651 17.3802 10.3542 17.5 10 17.5ZM20 17.5C19.6458 17.5 19.349 17.3802 19.1094 17.1406C18.8698 16.901 18.75 16.6042 18.75 16.25C18.75 15.8958 18.8698 15.599 19.1094 15.3594C19.349 15.1198 19.6458 15 20 15C20.3542 15 20.651 15.1198 20.8906 15.3594C21.1302 15.599 21.25 15.8958 21.25 16.25C21.25 21.6042 21.1302 16.901 20.8906 17.1406C20.651 17.3802 20.3542 17.5 20 17.5ZM15 22.5C14.6458 22.5 14.349 22.3802 14.1094 22.1406C13.8698 21.901 13.75 21.6042 13.75 21.25C13.75 20.8958 13.8698 20.599 14.1094 20.3594C14.349 20.1198 14.6458 20 15 20C15.3542 20 15.651 20.1198 15.8906 20.3594C16.1302 20.599 16.25 20.8958 16.25 21.25C16.25 21.6042 16.1302 21.901 15.8906 22.1406C15.651 22.3802 15.3542 22.5 15 22.5ZM10 22.5C9.64583 22.5 9.34896 22.3802 9.10938 22.1406C8.86979 21.901 8.75 21.6042 8.75 21.25C8.75 20.8958 8.86979 20.599 9.10938 20.3594C9.34896 20.1198 9.64583 20 10 20C10.3542 20 10.651 20.1198 10.8906 20.3594C11.1302 20.599 11.25 20.8958 11.25 21.25C11.25 21.6042 11.1302 21.901 10.8906 22.1406C10.651 22.3802 10.3542 22.5 10 22.5ZM20 22.5C19.6458 22.5 19.349 22.3802 19.1094 22.1406C18.8698 21.901 18.75 21.6042 18.75 21.25C18.75 20.8958 18.8698 20.599 19.1094 20.3594C19.349 20.1198 19.6458 20 20 20C20.3542 20 20.651 20.1198 20.8906 20.3594C21.1302 20.599 21.25 20.8958 21.25 21.25C21.25 21.6042 21.1302 21.901 20.8906 22.1406C20.651 22.3802 20.3542 22.5 20 22.5Z"
                          fill="#1C1B1F"
                        />
                      </g>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleCancelEdit}
                className="bg-gray-300 text-black px-6 py-2 rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] font-semibold text-[14px] hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-[#BEC5AD] text-black px-6 py-2 rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] font-semibold text-[14px] hover:bg-[#a8b096] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Notice
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this notice? This action cannot
                be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={cancelDelete}
                  className="bg-gray-300 text-black px-6 py-2 rounded-lg font-semibold text-[14px] hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold text-[14px] hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      <>
  {/* existing JSX */}
  <ToastContainer position="top-right" autoClose={3000} />
</>

    </div>
    
  );
};

// export default HostelNotices; (removed duplicate)
function NoticesTable({ notices, handleEdit, handleDelete }) {
  return (
    <div>
      <h3 className="text-2xl text-black font-semibold mb-4 font-[Poppins] ml-4">
        Recent Notices
      </h3>
      <div className="rounded-2xl p-4 overflow-x-auto mb-6" style={{ backgroundColor: "#BEC5AD", boxShadow: "0px 4px 4px 0px #00000040 inset" }}>
        {/* Desktop Table View */}
        <table className="w-full text-left text-black border-separate border-spacing-y-2 font-[Poppins] hidden sm:table">
          <thead>
            <tr className="bg-white font-[Poppins] font-semibold">
              <th className="p-3 pl-15 text-left rounded-tl-3xl">Title</th>
              <th className="p-3 text-left">Recipient</th>
              <th className="p-3 text-left">Date Issued</th>
              <th className="p-3 pl-8 text-left">Status</th>
              <th className="p-3 text-left rounded-tr-3xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((n) => (
              <tr key={n.id} className="font-[Poppins] font-semibold">
                <td className="p-2">{n.title}</td>
                <td className="p-2">{n.recipient}</td>
                <td className="p-2">{n.date}</td>
                <td className="p-2">
                  <span className={`px-5 py-2 w-[130px] flex justify-center items-center rounded-[12px] font-semibold text-white text-base ${n.status === "Active" ? "bg-[#28C404]" : "bg-[#5A5D50]"}`}>{n.status}</span>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-5">
                    <div className="cursor-pointer hover:opacity-70 transition hover:scale-110" onClick={() => handleEdit(n)}>✏️</div>
                    <div className="w-[0.1rem] h-8 bg-black"></div>
                    <div className="cursor-pointer hover:opacity-70 transition hover:scale-110" onClick={() => handleDelete(n.id)}>🗑️</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Mobile Card View */}
        <div className="space-y-4 sm:hidden">
          {notices.map((n) => (
            <div key={n.id} className="bg-white rounded-xl p-4 shadow-md">
              <div className="mb-2"><strong>Title:</strong> {n.title}</div>
              <div className="mb-2"><strong>Recipient:</strong> {n.recipient}</div>
              <div className="mb-2"><strong>Date Issued:</strong> {n.date}</div>
              <div className="mb-2">
                <strong>Status:</strong> <span className={`inline-block px-3 py-1 rounded-[12px] font-semibold text-white text-sm ${n.status === "Active" ? "bg-[#28C404]" : "bg-[#5A5D50]"}`}>{n.status}</span>
              </div>
              <div className="flex gap-5 mt-3">
                <div className="cursor-pointer hover:opacity-70 transition hover:scale-110" onClick={() => handleEdit(n)}>✏️</div>
                <div className="cursor-pointer hover:opacity-70 transition hover:scale-110" onClick={() => handleDelete(n.id)}>🗑️</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HostelNotices;
