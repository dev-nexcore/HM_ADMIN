// Admin Profile Component with Persistent Profile Image
"use client";

import React, { useState, useEffect } from "react";

export default function AdminProfile() {
  const [profileImage, setProfileImage] = useState("/admin-avatar.png");
  const [adminInfo, setAdminInfo] = useState({
    name: "John Doe",
    email: "admin@example.com",
    phone: "+91 9876543210",
    role: "Super Admin",
    location: "Mumbai, India"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editInfo, setEditInfo] = useState(adminInfo);

  useEffect(() => {
    const storedImage = localStorage.getItem("adminProfileImage");
    if (storedImage) setProfileImage(storedImage);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
        localStorage.setItem("adminProfileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setAdminInfo(editInfo);
    setIsEditing(false);
    localStorage.setItem("adminProfileInfo", JSON.stringify(editInfo));
  };

  useEffect(() => {
    const storedInfo = localStorage.getItem("adminProfileInfo");
    if (storedInfo) {
      const parsedInfo = JSON.parse(storedInfo);
      setAdminInfo(parsedInfo);
      setEditInfo(parsedInfo);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#BEC5AD] rounded-2xl shadow-xl mt-10">
      <h2 className="text-2xl text-black font-semibold mb-6">Admin Profile</h2>
      <div className="bg-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 flex flex-col items-center">
          <img
            src={profileImage}
            alt="Admin Avatar"
            className="w-32 h-32 rounded-full object-cover border border-gray-300"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-3 text-sm"
          />
        </div>
        <div className="flex-grow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black">{adminInfo.name}</h3>
            <p className="text-sm text-gray-600">{adminInfo.role}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm">Email</label>
              <p className="text-black font-medium">{adminInfo.email}</p>
            </div>
            <div>
              <label className="text-gray-700 text-sm">Phone</label>
              <p className="text-black font-medium">{adminInfo.phone}</p>
            </div>
            <div>
              <label className="text-gray-700 text-sm">Location</label>
              <p className="text-black font-medium">{adminInfo.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => setIsEditing(true)}
        >
          Edit Profile
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
          Logout
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="text-gray-700 text-sm">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editInfo.name}
                  onChange={handleEditChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editInfo.email}
                  onChange={handleEditChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editInfo.phone}
                  onChange={handleEditChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editInfo.location}
                  onChange={handleEditChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={handleSave}
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
