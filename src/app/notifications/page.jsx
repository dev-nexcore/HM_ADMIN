'use client';
import React, { useState } from 'react';

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState([
    {
      title: 'Hotel fee Deadline',
      date: '23-03-2025',
      description:
        'Students are requested to complete the payment on or before the due date to avoid late fines or cancellation of hostel admission. For payment-related queries, please contact the hostel office during working hours.',
    },
    {
      title: 'Maintenance Schedule',
      date: '23-03-2025',
      description: `Heads up! 🧰 Scheduled maintenance will take place.\n⚠️ Temporary disruption in: [Water / Electricity / Wi-Fi]\nPlease plan accordingly. We appreciate your cooperation!`,
    },
  ]);

  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ title: '', description: '' });

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditData({
      title: notifications[index].title,
      description: notifications[index].description,
    });
  };

  const handleSaveClick = () => {
    const updated = [...notifications];
    updated[editIndex] = {
      ...updated[editIndex],
      title: editData.title,
      description: editData.description,
    };
    setNotifications(updated);
    setEditIndex(null);
  };

  const handleCancel = () => {
    setEditIndex(null);
  };

  return (
    <div className="min-h-screen bg-white px-4 md:px-10 py-8 relative">
      <h1 className="text-2xl font-semibold mb-8 border-l-4 border-[#4F8CCF] pl-4">Notifications</h1>

      <div className="space-y-6">
        {notifications.map((note, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg px-5 py-4 flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold mb-2 text-gray-800">{note.title}</h2>
                <p className="text-sm whitespace-pre-line leading-relaxed text-gray-700">
                  {note.description}
                </p>
              </div>
              <div className="flex flex-col items-end text-sm text-gray-500 gap-2">
                <span>{note.date}</span>
                <button
                  onClick={() => handleEditClick(index)}
                  className="text-blue-800 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Popup with Blur */}
      {editIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md md:max-w-xl p-6 rounded-lg shadow-xl relative">
            <h2 className="text-lg font-semibold mb-4 text-[#4F8CCF]">Edit Notification</h2>

            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm mb-4"
              placeholder="Title"
            />
            <textarea
              rows={5}
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
              placeholder="Description"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-sm px-4 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClick}
                className="bg-[#A4B494] hover:bg-[#8fa582] text-black text-sm px-5 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
