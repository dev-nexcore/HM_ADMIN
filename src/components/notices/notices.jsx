"use client";

import { useState, useRef } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const HostelNotices = () => {
  const [form, setForm] = useState({
    template: "",
    title: "",
    recipient: "",
    individualRecipient: "",
    message: "",
    date: "",
  });
  const dateInputRef = useRef(null);

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

  const notices = [
    {
      title: "Hostel Maintenance Schedule",
      recipient: "All Residents",
      date: "05-07-2025",
      status: "Active",
    },
    {
      title: "New Warden Onboarding",
      recipient: "All Wardens",
      date: "05-07-2025",
      status: "Active",
    },
    {
      title: "Upcoming Holiday Schedule",
      recipient: "All",
      date: "05-07-2025",
      status: "Archived",
    },
  ];

  // Calendar click handler
  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };
  return (
    <div className="min-h-screen p-10" style={{ fontFamily: "Poppins" }}>
      <div className="w-full max-w-7xl mx-auto mt-4 mb-10 px-4">
        <h1
          className="text-[25px] leading-[25px] font-extrabold text-[#000000] text-left"
          style={{
            fontFamily: "Inter",
          }}
        >
          <span className="border-l-4 border-red-500 pl-4 inline-flex items-center h-[26px]">
            Hostel Notices
          </span>
        </h1>
      </div>

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
                className="w-full appearance-none bg-white text-black px-4 py-3 rounded-lg outline-none border-none text-[12px]"
                value={form.template}
                onChange={(e) => setForm({ ...form, template: e.target.value })}
              >
                <option value=""></option>
                <option value="maintenance"></option>
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
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                value={form.recipient}
                onChange={(e) =>
                  setForm({ ...form, recipient: e.target.value })
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
            <label className="text-black font-medium mb-1 block ml-2">
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
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-white text-black shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] outline-none border-none text-[12px] placeholder:font-medium placeholder:text-gray-400 resize-none"
          />
        </div>

        <div className="w-full mt-6 font-[Poppins] flex flex-wrap items-center justify-between gap-4">
          {/* Issue Date */}
          <div>
            <label className="block mb-1 text-black ml-2 font-[Poppins] font-medium">
              Issue Date
            </label>
            <div className="relative flex items-center">
              <div className="relative w-[300px] max-w-full">
                {/* Hidden native date input */}
                <div className="relative w-[300px] max-w-full">
                  {/* Hidden native date input */}
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
                      } else {
                        setForm((prev) => ({ ...prev, date: "" }));
                      }
                    }}
                    className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer"
                    style={{ colorScheme: "light" }}
                  />

                  {/* Display selected date */}
                  <div className="bg-white rounded-[10px] px-4 h-[38px] flex items-center font-[Poppins] font-semibold text-[15px] tracking-widest text-gray-800 select-none z-10 shadow-[0px_4px_10px_0px_#00000040]">
                    {form.date || ""}
                  </div>

                  {/* Placeholder if no date */}
                  {!form.date && (
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 z-0 text-gray-400 font-[Poppins] font-medium text-[15px] tracking-[0.4em] pointer-events-none select-none">
                      d&nbsp;d&nbsp;-&nbsp;m&nbsp;m&nbsp;-&nbsp;y&nbsp;y&nbsp;y&nbsp;y
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCalendarClick}
                className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
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

          {/* Buttons */}
          <div className="w-full flex justify-center mt-6 sm:mt-8">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleCancel?.()}
                className="bg-white text-black px-6 py-2 rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] font-semibold text-[14px] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-white text-black px-6 py-2 rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] font-semibold text-[14px] hover:bg-gray-100"
              >
                Issue Notice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <h3 className="text-2xl text-black font-semibold mb-4 font-[Poppins] ml-4">
        Recent Notices
      </h3>
      <div
        className="rounded-2xl p-4 overflow-x-auto mb-6"
        style={{
          backgroundColor: "#BEC5AD",
          boxShadow: "0px 4px 4px 0px #00000040 inset",
        }}
      >
        <table className="w-full text-left text-black border-separate border-spacing-y-2 font-[Poppins] ">
          <thead>
            <tr className="bg-white font-[Poppins] font-semibold">
              <th className="p-3 pl-15 text-left rounded-tl-3xl">Title</th>
              <th className="p-3 text-left">Recipient</th>
              <th className="p-3 text-left">Date Issued</th>
              <th className="p-3 pl-8 text-left ">Status</th>
              <th className="p-3 text-left rounded-tr-3xl">Actions</th>
            </tr>
          </thead>

          <tbody>
            {notices.map((n, i) => (
              <tr key={i} className="font-[Poppins] font-semibold">
                <td className="p-2">{n.title}</td>
                <td className="p-2">{n.recipient}</td>
                <td className="p-2">{n.date}</td>
                <td className="p-2">
                  <span
                    className={`px-5 py-2 w-[130px] flex justify-center items-center rounded-[12px] font-semibold text-white text-base ${
                      n.status === "Active" ? "bg-[#28C404]" : "bg-[#5A5D50]"
                    }`}
                  >
                    {n.status}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-5">
                    {/* Custom Edit Icon */}
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 26 26"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cursor-pointer"
                    >
                      <mask
                        id="editMask"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="26"
                        height="26"
                      >
                        <rect width="26" height="26" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#editMask)">
                        <path
                          d="M2.16895 26.0013V21.668H23.8356V26.0013H2.16895ZM6.50228 17.3346H8.01895L16.4689 8.91172L14.9252 7.36797L6.50228 15.818V17.3346ZM4.33561 19.5013V14.8971L16.4689 2.79089C16.6676 2.59227 16.8978 2.4388 17.1596 2.33047C17.4214 2.22214 17.6967 2.16797 17.9856 2.16797C18.2745 2.16797 18.5544 2.22214 18.8252 2.33047C19.096 2.4388 19.3398 2.6013 19.5564 2.81797L21.046 4.33464C21.2627 4.53325 21.4207 4.76797 21.52 5.0388C21.6193 5.30964 21.6689 5.5895 21.6689 5.87839C21.6689 6.14922 21.6193 6.41554 21.52 6.67734C21.4207 6.93915 21.2627 7.17839 21.046 7.39505L8.93978 19.5013H4.33561Z"
                          fill="#000000ff"
                        />
                      </g>
                    </svg>

                    {/* Divider */}
                    <div className="w-[0.1rem] h-8 bg-black"></div>

                    {/* Custom Delete Icon */}
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 26 26"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cursor-pointer"
                    >
                      <mask
                        id="deleteMask"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="26"
                        height="26"
                      >
                        <rect width="26" height="26" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#deleteMask)">
                        <path
                          d="M7.58301 22.75C6.98717 22.75 6.47711 22.5378 6.0528 22.1135C5.62849 21.6892 5.41634 21.1792 5.41634 20.5833V6.5H4.33301V4.33333H9.74967V3.25H16.2497V4.33333H21.6663V6.5H20.583V20.5833C20.583 21.1792 20.3709 21.6892 19.9466 22.1135C19.5222 22.5378 19.0122 22.75 18.4163 22.75H7.58301ZM18.4163 6.5H7.58301V20.5833H18.4163V6.5ZM9.74967 18.4167H11.9163V8.66667H9.74967V18.4167ZM14.083 18.4167H16.2497V8.66667H14.083V18.4167Z"
                          fill="#000000ff"
                        />
                      </g>
                    </svg>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HostelNotices;
