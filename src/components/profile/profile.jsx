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
import api from "../../lib/api";

export default function AdminProfile() {
  const [adminInfo, setAdminInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    role: "Admin",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editInfo, setEditInfo] = useState(adminInfo);
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/api/adminauth/profile");
        const profileData = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          contactNumber: data.contactNumber || "",
          role: data.role || "Admin",
        };
        setAdminInfo(profileData);
        setEditInfo(profileData);
        if (data.profileImage) {
          const imageUrl = data.profileImage.startsWith("http")
            ? data.profileImage
            : `${process.env.NEXT_PUBLIC_PROD_API_URL}${data.profileImage}`;
          setProfileImage(imageUrl);
        } else {
          setProfileImage(null);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Save edits
  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.keys(editInfo).forEach((key) => {
        formData.append(key, editInfo[key]);
      });
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }
      if (removeImageFlag && !selectedFile) {
        formData.append("removeProfileImage", "true");
      }

      const { data } = await api.put("/api/adminauth/profile", formData);

      setAdminInfo(editInfo);
      setIsEditing(false);

      if (data.admin?.profileImage) {
        const imageUrl = data.admin.profileImage.startsWith("http")
          ? data.admin.profileImage
          : `${process.env.NEXT_PUBLIC_PROD_API_URL}${data.admin.profileImage}`;
        setProfileImage(imageUrl);
      }

      toast.success("Profile updated");
      setSelectedFile(null); // Reset after save
      setRemoveImageFlag(false);
    } catch (error) {
      console.error("Save profile error:", error);
      toast.error("Failed to update profile");
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditInfo(adminInfo);
    setIsEditing(false);
    setSelectedFile(null);
    setRemoveImageFlag(false);
    
    // Restore profile image to saved state if cancel is clicked
    if (adminInfo.profileImage) {
       const imageUrl = adminInfo.profileImage.startsWith("http")
         ? adminInfo.profileImage
         : `${process.env.NEXT_PUBLIC_PROD_API_URL}${adminInfo.profileImage}`;
       setProfileImage(imageUrl);
    } else {
       setProfileImage(null);
    }
  };

  // Handle profile image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setRemoveImageFlag(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove profile image
  const handleRemoveImage = () => {
    setProfileImage(null);
    setSelectedFile(null);
    setRemoveImageFlag(true);
    toast.success("Profile picture cleared locally. Don't forget to save.");
  };

  if (loading) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#BEC5AD] rounded-2xl shadow-xl mt-10">
      <h2 className="text-2xl text-black font-semibold mb-6 flex items-center gap-2">
        <User className="w-6 h-6" />
        Admin Profile
      </h2>

      <div className="bg-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row gap-6">
        {/* Profile Picture */}
        <div className="flex-shrink-0 flex flex-col items-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          )}
          {isEditing && (
            <>
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
              {profileImage && (
                <button
                  onClick={handleRemoveImage}
                  className="text-xs text-red-500 mt-1"
                >
                  Remove
                </button>
              )}
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all hover:shadow-sm hover:border-gray-200">
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-1">
                <User className="w-3.5 h-3.5" />
                First Name
              </label>
              {isEditing ? (
                <input
                  name="firstName"
                  value={editInfo.firstName}
                  onChange={handleChange}
                  className="w-full mt-1 border-b-2 border-blue-400 bg-transparent outline-none p-1 text-black font-medium"
                />
              ) : (
                <p className="text-black font-medium text-lg">{adminInfo.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all hover:shadow-sm hover:border-gray-200">
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                Last Name
              </label>
              {isEditing ? (
                <input
                  name="lastName"
                  value={editInfo.lastName}
                  onChange={handleChange}
                  className="w-full mt-1 border-b-2 border-blue-400 bg-transparent outline-none p-1 text-black font-medium"
                />
              ) : (
                <p className="text-black font-medium text-lg">{adminInfo.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all hover:shadow-sm hover:border-gray-200">
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-1">
                <Mail className="w-3.5 h-3.5" />
                Email
              </label>
              {isEditing ? (
                <input
                  name="email"
                  value={editInfo.email}
                  onChange={handleChange}
                  className="w-full mt-1 border-b-2 border-blue-400 bg-transparent outline-none p-1 text-black font-medium"
                />
              ) : (
                <p className="text-black font-medium text-lg">{adminInfo.email}</p>
              )}
            </div>

            {/* Contact Number */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all hover:shadow-sm hover:border-gray-200">
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-1">
                <Phone className="w-3.5 h-3.5" />
                Contact
              </label>
              {isEditing ? (
                <input
                  name="contactNumber"
                  value={editInfo.contactNumber}
                  onChange={handleChange}
                  className="w-full mt-1 border-b-2 border-blue-400 bg-transparent outline-none p-1 text-black font-medium"
                />
              ) : (
                <p className="text-black font-medium text-lg">{adminInfo.contactNumber}</p>
              )}
            </div>

            {/* Role */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all hover:shadow-sm hover:border-gray-200">
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-1">
                <Briefcase className="w-3.5 h-3.5" />
                Role
              </label>
              {isEditing ? (
                <input
                  name="role"
                  value={editInfo.role}
                  onChange={handleChange}
                  className="w-full mt-1 border-b-2 border-blue-400 bg-transparent outline-none p-1 text-black font-medium"
                />
              ) : (
                <p className="text-black font-medium text-lg">{adminInfo.role}</p>
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
