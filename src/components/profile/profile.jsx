"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Edit2,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  UserCheck,
  MapPin,
  Briefcase,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminProfile() {
  const [adminInfo, setAdminInfo] = useState({
    firstName: "Raheem",
    lastName: "Shaikh",
    email: "admin@example.com",
    contact: "+91 9876543210",
    role: "Admin",
    location: "Mumbai, India",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editInfo, setEditInfo] = useState(adminInfo);
  const [profileImage, setProfileImage] = useState("/photos/profile.jpg");

  // Load from localStorage
  useEffect(() => {
    const storedInfo = localStorage.getItem("adminProfileInfo");
    const storedImage = localStorage.getItem("adminProfileImage");

    if (storedInfo) {
      const parsedInfo = JSON.parse(storedInfo);
      setAdminInfo(parsedInfo);
      setEditInfo(parsedInfo);
    }

    if (storedImage) {
      setProfileImage(storedImage);
    }
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Save edits
  const handleSave = () => {
    setAdminInfo(editInfo);
    setIsEditing(false);
    localStorage.setItem("adminProfileInfo", JSON.stringify(editInfo));
    toast.success("Profile updated");
  };

  // Cancel edit
  const handleCancel = () => {
    setEditInfo(adminInfo);
    setIsEditing(false);
  };

  // Handle profile image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setProfileImage(result);
      localStorage.setItem("adminProfileImage", result);
      toast.success("Profile picture updated");
    };
    reader.readAsDataURL(file);
  };

  // Remove profile image
  const handleRemoveImage = () => {
    setProfileImage("/photos/profile.jpg");
    localStorage.removeItem("adminProfileImage");
    toast.success("Profile picture removed");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#BEC5AD] rounded-2xl shadow-xl mt-10">
      <h2 className="text-2xl text-black font-semibold mb-6 flex items-center gap-2">
        <User className="w-6 h-6" />
        Admin Profile
      </h2>

      <div className="bg-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row gap-6">
        {/* Profile Picture */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <img
            src={profileImage}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border border-gray-300"
          />
          <label className="mt-3 text-sm flex items-center gap-1 cursor-pointer">
            <Camera className="w-4 h-4" />
            Upload
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <button
            onClick={handleRemoveImage}
            className="text-xs text-red-500 mt-1"
          >
            Remove
          </button>
        </div>

        {/* Info Section */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="text-gray-700 text-sm flex items-center gap-1">
                <User className="w-4 h-4" />
                First Name
              </label>
              {isEditing ? (
                <input
                  name="firstName"
                  value={editInfo.firstName}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              ) : (
                <p className="text-black font-medium">{adminInfo.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="text-gray-700 text-sm flex items-center gap-1">
                <UserCheck className="w-4 h-4" />
                Last Name
              </label>
              {isEditing ? (
                <input
                  name="lastName"
                  value={editInfo.lastName}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              ) : (
                <p className="text-black font-medium">{adminInfo.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-700 text-sm flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {isEditing ? (
                <input
                  name="email"
                  value={editInfo.email}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              ) : (
                <p className="text-black font-medium">{adminInfo.email}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="text-gray-700 text-sm flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Contact
              </label>
              {isEditing ? (
                <input
                  name="contact"
                  value={editInfo.contact}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              ) : (
                <p className="text-black font-medium">{adminInfo.contact}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="text-gray-700 text-sm flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                Role
              </label>
              {isEditing ? (
                <input
                  name="role"
                  value={editInfo.role}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              ) : (
                <p className="text-black font-medium">{adminInfo.role}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="text-gray-700 text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              {isEditing ? (
                <input
                  name="location"
                  value={editInfo.location}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              ) : (
                <p className="text-black font-medium">{adminInfo.location}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
