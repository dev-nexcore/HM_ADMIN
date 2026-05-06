// "use client";

// import { useState, useEffect } from "react";
// import {
//   Edit2,
//   Trash2,
//   Clock,
//   Eye,
//   X,
// } from "lucide-react";
// import axios from "axios";

// const StaffAllotment = () => {

//   const [activeTab, setActiveTab] =
//     useState("warden");

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     wardenId: "",
//     contactNumber: "",
//     emailId: "",
//     designation: "",
//     otherDesignation: "",
//     shiftStart: "",
//     shiftEnd: "",
//   });

//   const [wardens, setWardens] =
//     useState([]);

//   const [staffs, setStaffs] =
//     useState([]);

//   const [formErrors, setFormErrors] =
//     useState({});

//   const [successMsg, setSuccessMsg] =
//     useState("");

//   const [showDeleteModal, setShowDeleteModal] =
//     useState(false);

//   const [showEditModal, setShowEditModal] =
//     useState(false);

//   const [showViewModal, setShowViewModal] =
//     useState(false);

//   const [selectedWardenId, setSelectedWardenId] =
//     useState(null);

//   const [selectedWarden, setSelectedWarden] =
//     useState(null);

//   // Fetch Wardens
//   useEffect(() => {
//     fetchWardens();
//     fetchStaffs();
//   }, []);

//   const fetchWardens = async () => {

//     try {

//       const response = await axios.get(
//         "http://localhost:5224/api/wardenauth/all"
//       );

//       const formattedData =
//         response.data.wardens.map(
//           (warden) => ({

//             id: warden.id,

//             name: `${warden.firstName} ${warden.lastName}`,

//             firstName:
//               warden.firstName,

//             lastName:
//               warden.lastName,

//             email:
//               warden.email,

//             contactNumber:
//               warden.contactNumber,

//             wardenId:
//               warden.wardenId,

//             profilePhoto:
//               warden.profilePhoto,

//             attendanceLog:
//               warden.attendanceLog || [],

//             designation:
//               "Warden",

//             currentShift:
//               "N/A",
//           })
//         );

//       setWardens(formattedData);

//     } catch (error) {

//       console.error(
//         "Error fetching wardens:",
//         error
//       );
//     }
//   };

//   const fetchStaffs = async () => {

//   try {

//     const response = await axios.get(
//       "http://localhost:5224/api/staffauth/all"
//     );

//     const formattedData =
//       response.data.staffs.map(
//         (staff) => ({

//           id: staff._id,

//           name: `${staff.firstName} ${staff.lastName}`,

//           firstName:
//             staff.firstName,

//           lastName:
//             staff.lastName,

//           email:
//             staff.email,

//           contactNumber:
//             staff.contactNumber,

//           designation:
//             staff.designation,

//           shift:
//             `${staff.shiftStart} - ${staff.shiftEnd}`,
//         })
//       );

//     setStaffs(formattedData);

//   } catch (error) {

//     console.error(
//       "Error fetching staffs:",
//       error
//     );
//   }
// };


  
//   // Validation
//   const validateForm = () => {

//     const errors = {};

//     if (!formData.firstName) {
//       errors.firstName =
//         "First name is required.";
//     }

//     if (!formData.lastName) {
//       errors.lastName =
//         "Last name is required.";
//     }

//     if (
//       activeTab === "warden" &&
//       !formData.wardenId
//     ) {
//       errors.wardenId =
//         "Warden ID is required.";
//     }

//     if (!formData.contactNumber) {
//       errors.contactNumber =
//         "Contact number is required.";
//     } else if (
//       !/^\d{10}$/.test(
//         formData.contactNumber
//       )
//     ) {
//       errors.contactNumber =
//         "Enter valid 10 digit number.";
//     }

//     if (!formData.emailId) {
//       errors.emailId =
//         "Email is required.";
//     } else if (
//       !/\S+@\S+\.\S+/.test(
//         formData.emailId
//       )
//     ) {
//       errors.emailId =
//         "Enter valid email address.";
//     }

//     if (
//       activeTab === "staff" &&
//       !formData.designation
//     ) {
//       errors.designation =
//         "Designation is required.";
//     }

//     setFormErrors(errors);

//     return (
//       Object.keys(errors).length === 0
//     );
//   };

//   // Input Change
//   const handleInputChange = (e) => {

//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Blur
//   const handleBlur = (fieldName) => {

//     if (
//       formData[fieldName]?.trim()
//     ) {
//       setFormErrors((prev) => ({
//         ...prev,
//         [fieldName]: "",
//       }));
//     }
//   };

//   // Register Warden
//   const handleRegisterWarden =
//     async () => {

//       if (!validateForm()) return;

//       try {

//         const payload = {
//           firstName:
//             formData.firstName,

//           lastName:
//             formData.lastName,

//           email:
//             formData.emailId,

//           contactNumber:
//             formData.contactNumber,

//           wardenId:
//             formData.wardenId,
//         };

//         const response =
//           await axios.post(
//             "http://localhost:5224/api/adminauth/register-warden",
//             payload
//           );

//         setSuccessMsg(
//           response.data.message
//         );

//         await fetchWardens();

//         setFormData({
//           firstName: "",
//           lastName: "",
//           wardenId: "",
//           contactNumber: "",
//           emailId: "",
//           designation: "",
//           otherDesignation: "",
//           shiftStart: "",
//           shiftEnd: "",
//         });

//         setTimeout(() => {
//           setSuccessMsg("");
//         }, 3000);

//       } catch (error) {

//         console.error(error);

//         setSuccessMsg(
//           error.response?.data
//             ?.message ||
//             "Error registering warden"
//         );

//         setTimeout(() => {
//           setSuccessMsg("");
//         }, 3000);
//       }
//     };

//   // Register Staff
//   const handleRegisterStaff =
//   async () => {

//     if (!validateForm()) return;

//     try {

//       const payload = {

//         firstName:
//           formData.firstName,

//         lastName:
//           formData.lastName,

//         email:
//           formData.emailId,

//         staffId: `S${Date.now()
//           .toString()
//           .slice(-4)}`,

//         contactNumber:
//           formData.contactNumber,

//         designation:
//           formData.designation ===
//           "Other"
//             ? formData.otherDesignation
//             : formData.designation,

//         shiftStart:
//           formData.shiftStart,

//         shiftEnd:
//           formData.shiftEnd,
//       };

//       const response =
//         await axios.post(
//           "http://localhost:5224/api/staffauth/register-staff",
//           payload
//         );

//       setSuccessMsg(
//         response.data.message
//       );

//       await fetchStaffs();

//       setFormData({
//         firstName: "",
//         lastName: "",
//         wardenId: "",
//         contactNumber: "",
//         emailId: "",
//         designation: "",
//         otherDesignation: "",
//         shiftStart: "",
//         shiftEnd: "",
//       });

//       setTimeout(() => {
//         setSuccessMsg("");
//       }, 3000);

//     } catch (error) {

//       console.error(error);

//       setSuccessMsg(
//         error.response?.data
//           ?.message ||
//           "Error registering staff"
//       );

//       setTimeout(() => {
//         setSuccessMsg("");
//       }, 3000);
//     }
//   };

//   // View
//   const handleViewWarden = (
//     warden
//   ) => {

//     setSelectedWarden(warden);

//     setShowViewModal(true);
//   };

//   // Edit
//   const handleEditWarden = (
//     warden
//   ) => {

//     setFormData({
//       firstName:
//         warden.firstName,

//       lastName:
//         warden.lastName,

//       wardenId:
//         warden.wardenId,

//       contactNumber:
//         warden.contactNumber,

//       emailId:
//         warden.email,
//     });

//     setSelectedWardenId(
//       warden.id
//     );

//     setShowEditModal(true);
//   };

//   // Edit Staff
// const handleEditStaff =
//   (staff) => {

//     setFormData({
//       firstName:
//         staff.firstName,

//       lastName:
//         staff.lastName,

//       contactNumber:
//         staff.contactNumber,

//       emailId:
//         staff.email,

//       designation:
//         staff.designation,

//       shiftStart:
//         staff.shift.split(
//           " - "
//         )[0],

//       shiftEnd:
//         staff.shift.split(
//           " - "
//         )[1],
//     });

//     setSelectedWardenId(
//       staff.id
//     );

//     setShowEditModal(true);
//   };

//   // Update
//   const handleUpdateWarden =
//     async () => {

//       try {

//         const payload = {
//           firstName:
//             formData.firstName,

//           lastName:
//             formData.lastName,

//           email:
//             formData.emailId,

//           contactNumber:
//             formData.contactNumber,

//           wardenId:
//             formData.wardenId,
//         };

//         await axios.put(
//           `http://localhost:5224/api/wardenauth/update/${selectedWardenId}`,
//           payload
//         );

//         setSuccessMsg(
//           "Warden updated successfully"
//         );

//         setShowEditModal(false);

//         await fetchWardens();

//       } catch (error) {

//         console.error(error);

//         setSuccessMsg(
//           "Error updating warden"
//         );
//       }
//     };


//     // Update Staff
// const handleUpdateStaff =
//   async () => {

//     try {

//       const payload = {

//         firstName:
//           formData.firstName,

//         lastName:
//           formData.lastName,

//         email:
//           formData.emailId,

//         contactNumber:
//           formData.contactNumber,

//         designation:
//           formData.designation,

//         shiftStart:
//           formData.shiftStart,

//         shiftEnd:
//           formData.shiftEnd,
//       };

//       await axios.put(
//         `http://localhost:5224/api/staffauth/update/${selectedWardenId}`,
//         payload
//       );

//       setSuccessMsg(
//         "Staff updated successfully"
//       );

//       setShowEditModal(false);

//       await fetchStaffs();

//     } catch (error) {

//       console.error(error);

//       setSuccessMsg(
//         "Error updating staff"
//       );
//     }
//   };
//   // Delete
//   const handleDeleteWarden = (
//     id
//   ) => {

//     setSelectedWardenId(id);

//     setShowDeleteModal(true);
//   };

//   const confirmDeleteWarden =
//     async () => {

//       try {

//         await axios.delete(
//           `http://localhost:5224/api/wardenauth/delete/${selectedWardenId}`
//         );

//         setSuccessMsg(
//           "Warden deleted successfully"
//         );

//         await fetchWardens();

//       } catch (error) {

//         console.error(error);

//         setSuccessMsg(
//           "Error deleting warden"
//         );
//       }

//       setShowDeleteModal(false);

//       setSelectedWardenId(null);
//     };


//     // Delete Staff
// const handleDeleteStaff =
//   (id) => {

//     setSelectedWardenId(id);

//     setShowDeleteModal(true);
//   };

// const confirmDeleteStaff =
//   async () => {

//     try {

//       await axios.delete(
//         `http://localhost:5224/api/staffauth/delete/${selectedWardenId}`
//       );

//       setSuccessMsg(
//         "Staff deleted successfully"
//       );

//       await fetchStaffs();

//     } catch (error) {

//       console.error(error);

//       setSuccessMsg(
//         "Error deleting staff"
//       );
//     }

//     setShowDeleteModal(false);

//     setSelectedWardenId(null);
//   };
//   return (
//     <div className="flex-1 bg-white p-4 sm:p-6 mt-5">

//       {/* Header */}
//       <div className="mb-6">

//         <div className="flex items-center mb-4">

//           <div className="w-[4px] h-6 bg-[#4F8CCF] mr-3" />

//           <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
//             Staff Allotment
//           </h1>

//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex mb-4">

//         <button
//           onClick={() =>
//             setActiveTab("warden")
//           }
//           className={`px-6 py-3 rounded-t-[20px] font-semibold ${
//             activeTab === "warden"
//               ? "bg-[#BEC5AD] text-black"
//               : "bg-gray-200 text-gray-600"
//           }`}
//         >
//           Register Warden
//         </button>

//         <button
//           onClick={() =>
//             setActiveTab("staff")
//           }
//           className={`px-6 py-3 rounded-t-[20px] font-semibold ${
//             activeTab === "staff"
//               ? "bg-[#BEC5AD] text-black"
//               : "bg-gray-200 text-gray-600"
//           }`}
//         >
//           Register Staff
//         </button>

//       </div>

//       {/* Warden Section */}
//       {activeTab ===
//         "warden" && (
//         <>

//           {/* Warden Form */}
//           <div
//             className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6 mb-6"
//             style={{
//               boxShadow:
//                 "0px 4px 4px 0px #00000040 inset",
//             }}
//           >

//             <h2 className="text-xl sm:text-2xl font-semibold text-black mb-6">
//               Register New Warden
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:ml-10">

//               <div>
//                 <label className="block font-bold mb-1">
//                   First Name
//                 </label>

//                 <input
//                   type="text"
//                   name="firstName"
//                   value={
//                     formData.firstName
//                   }
//                   onChange={
//                     handleInputChange
//                   }
//                   className="w-full p-3 rounded-md border bg-white"
//                 />
//               </div>

//               <div>
//                 <label className="block font-bold mb-1">
//                   Last Name
//                 </label>

//                 <input
//                   type="text"
//                   name="lastName"
//                   value={
//                     formData.lastName
//                   }
//                   onChange={
//                     handleInputChange
//                   }
//                   className="w-full p-3 rounded-md border bg-white"
//                 />
//               </div>

//               <div>
//                 <label className="block font-bold mb-1">
//                   Contact Number
//                 </label>

//                 <input
//                   type="text"
//                   name="contactNumber"
//                   value={
//                     formData.contactNumber
//                   }
//                   onChange={
//                     handleInputChange
//                   }
//                   className="w-full p-3 rounded-md border bg-white"
//                 />
//               </div>

//               <div>
//                 <label className="block font-bold mb-1">
//                   Warden ID
//                 </label>

//                 <input
//                   type="text"
//                   name="wardenId"
//                   value={
//                     formData.wardenId
//                   }
//                   onChange={
//                     handleInputChange
//                   }
//                   className="w-full p-3 rounded-md border bg-white"
//                 />
//               </div>

//               <div>
//                 <label className="block font-bold mb-1">
//                   Email ID
//                 </label>

//                 <input
//                   type="email"
//                   name="emailId"
//                   value={
//                     formData.emailId
//                   }
//                   onChange={
//                     handleInputChange
//                   }
//                   className="w-full p-3 rounded-md border bg-white"
//                 />
//               </div>
//             </div>

//             <div className="mt-7 text-center">

//               <button
//                 onClick={
//                   handleRegisterWarden
//                 }
//                 className="bg-white border py-3 px-10 rounded-2xl font-bold"
//               >
//                 Register Warden
//               </button>

//             </div>
//           </div>

//           {/* Manage Warden */}
//           <div
//             className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6"
//             style={{
//               boxShadow:
//                 "inset 0px 4px 20px 0px #00000040",
//             }}
//           >

//             <h2 className="text-xl sm:text-2xl font-bold text-black mb-6">
//               Manage Warden
//             </h2>

//             {wardens.length === 0 ? (
//               <p className="text-center py-6">
//                 No warden found.
//               </p>
//             ) : (
//               <div className="space-y-4">

//                 {wardens.map(
//                   (warden) => (

//                     <div
//                       key={warden.id}
//                       className="bg-white rounded-lg p-4"
//                     >

//                       <div className="flex justify-between items-center">

//                         <div>

//                           <h3 className="font-bold text-lg">
//                             {
//                               warden.name
//                             }
//                           </h3>

//                           <p>
//                             {
//                               warden.email
//                             }
//                           </p>

//                           <p>
//                             Warden ID:
//                             {" "}
//                             {
//                               warden.wardenId
//                             }
//                           </p>

//                         </div>

//                         <div className="flex items-center space-x-4">

//                           <button
//                             onClick={() =>
//                               handleViewWarden(
//                                 warden
//                               )
//                             }
//                           >
//                             <Eye />
//                           </button>

//                           <button
//                             onClick={() =>
//                               handleEditWarden(
//                                 warden
//                               )
//                             }
//                           >
//                             <Edit2 />
//                           </button>

//                           <button
//                             onClick={() =>
//                               handleDeleteWarden(
//                                 warden.id
//                               )
//                             }
//                           >
//                             <Trash2 />
//                           </button>

//                         </div>
//                       </div>
//                     </div>
//                   )
//                 )}
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {/* Staff Section */}
//       {activeTab ===
//         "staff" && (
//         <>

//           {/* Staff Form */}
//           <div
//             className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6 mb-6"
//             style={{
//               boxShadow:
//                 "0px 4px 4px 0px #00000040 inset",
//             }}
//           >

//             <h2 className="text-xl sm:text-2xl font-semibold text-black mb-6">
//               Register New Staff
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:ml-10">

//               <div>
//                 <label className="block font-bold mb-1">
//                   First Name
//                 </label>

//                 <input
//                   type="text"
//                   name="firstName"
//                   value={
//                     formData.firstName
//                   }
//                   onChange={
//                     handleInputChange
//                   }
//                   className="w-full p-3 rounded-md border bg-white"
//                 />
//               </div>

//               <div>
//                 <label className="block font-bold mb-1">
//                   Last Name
//                 </label>

//                 <input
//                   type="text"
//                   name="lastName"
//                   value={
//                     formData.lastName
//                   }
//                   onChange={
//                     handleInputChange
//                   }
//                   className="w-full p-3 rounded-md border bg-white"
//                 />
//               </div>

//               <div>
//                 <label className="block font-bold mb-1">
//                   Contact Number
//                 </label>

//                 <input
//                   type="text"
//                   name="contactNumber"
//                   value={
//                     formData.contactNumber
//                   }
//                   onChange={
//                     handleInputChange
//                   }
//                   className="w-full p-3 rounded-md border bg-white"
//                 />
//               </div>

//               <div>
//                 <label className="block font-bold mb-1">
//                   Email ID
//                 </label>

//                 <input
//                   type="email"
//                   name="emailId"
//                   value={
//                     formData.emailId
//                   }
//                   onChange={
//                     handleInputChange
//                   }
//                   className="w-full p-3 rounded-md border bg-white"
//                 />
//               </div>

//               <div>
//                 <label className="block font-bold mb-1">
//                   Designation
//                 </label>

//                 <select
//                   name="designation"
//                   value={
//                     formData.designation
//                   }
//                   onChange={
//                     handleInputChange
//                   }
//                   className="w-full p-3 rounded-md border bg-white"
//                 >
//                   <option value="">
//                     Select
//                   </option>

//                   <option value="Watchman">
//                     Watchman
//                   </option>

//                   <option value="Cleaner">
//                     Cleaner
//                   </option>

//                   <option value="Other">
//                     Other
//                   </option>

//                 </select>
//               </div>

//               <div>
//                 <label className="block font-bold mb-1">
//                   Shift Timing
//                 </label>

//                 <div className="flex items-center gap-2">

//                   <input
//                     type="time"
//                     name="shiftStart"
//                     value={
//                       formData.shiftStart
//                     }
//                     onChange={
//                       handleInputChange
//                     }
//                     className="p-2 border rounded-md bg-white"
//                   />

//                   <Clock />

//                   <input
//                     type="time"
//                     name="shiftEnd"
//                     value={
//                       formData.shiftEnd
//                     }
//                     onChange={
//                       handleInputChange
//                     }
//                     className="p-2 border rounded-md bg-white"
//                   />

//                 </div>
//               </div>
//             </div>

//             <div className="mt-7 text-center">

//               <button
//                 onClick={
//                   handleRegisterStaff
//                 }
//                 className="bg-white border py-3 px-10 rounded-2xl font-bold"
//               >
//                 Register Staff
//               </button>

//             </div>
//           </div>

//           {/* Manage Staff */}
//           <div
//             className="bg-[#BEC5AD] rounded-xl p-4 sm:p-6"
//             style={{
//               boxShadow:
//                 "inset 0px 4px 20px 0px #00000040",
//             }}
//           >

//             <h2 className="text-xl sm:text-2xl font-bold text-black mb-6">
//               Manage Staff
//             </h2>

//             {staffs.length === 0 ? (
//               <p className="text-center py-6">
//                 No staff found.
//               </p>
//             ) : (
//               <div className="space-y-4">

//               {staffs.map(
//   (staff) => (

//     <div
//       key={staff.id}
//       className="bg-white rounded-lg p-4"
//     >

//       <div className="flex justify-between items-center">

//         <div>

//           <h3 className="font-bold text-lg">
//             {staff.name}
//           </h3>

//           <p>
//             {staff.email}
//           </p>

//           <p>
//             {staff.designation}
//           </p>

//           <p>
//             Shift:
//             {" "}
//             {staff.shift}
//           </p>

//         </div>

//         <div className="flex items-center space-x-4">

//           <button
//             onClick={() =>
//               handleEditStaff(
//                 staff
//               )
//             }
//             className="text-green-600"
//           >
//             <Edit2 />
//           </button>

//           <button
//             onClick={() =>
//               handleDeleteStaff(
//                 staff.id
//               )
//             }
//             className="text-red-600"
//           >
//             <Trash2 />
//           </button>

//         </div>
//       </div>
//     </div>
//   )
// )}
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {/* Success */}
//       {successMsg && (
//         <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50">
//           {successMsg}
//         </div>
//       )}

//       {/* View Modal */}
//       {showViewModal &&
//         selectedWarden && (

//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

//           <div className="bg-white rounded-xl p-6 w-[90%] max-w-md">

//             <div className="flex justify-between items-center mb-5">

//               <h2 className="text-2xl font-bold">
//                 Warden Details
//               </h2>

//               <button
//                 onClick={() =>
//                   setShowViewModal(
//                     false
//                   )
//                 }
//               >
//                 <X />
//               </button>

//             </div>

//             <div className="space-y-3">

//               <p>
//                 <strong>
//                   First Name:
//                 </strong>{" "}
//                 {
//                   selectedWarden.firstName
//                 }
//               </p>

//               <p>
//                 <strong>
//                   Last Name:
//                 </strong>{" "}
//                 {
//                   selectedWarden.lastName
//                 }
//               </p>

//               <p>
//                 <strong>
//                   Email:
//                 </strong>{" "}
//                 {
//                   selectedWarden.email
//                 }
//               </p>

//               <p>
//                 <strong>
//                   Contact:
//                 </strong>{" "}
//                 {
//                   selectedWarden.contactNumber
//                 }
//               </p>

//               <p>
//                 <strong>
//                   Warden ID:
//                 </strong>{" "}
//                 {
//                   selectedWarden.wardenId
//                 }
//               </p>

//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StaffAllotment;



"use client";

import { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  Clock,
  Eye,
  X,
} from "lucide-react";
import axios from "axios";

const StaffAllotment = () => {

  const [activeTab, setActiveTab] =
    useState("warden");

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      wardenId: "",
      contactNumber: "",
      emailId: "",
      designation: "",
      otherDesignation: "",
      shiftStart: "",
      shiftEnd: "",
    });

  const [wardens, setWardens] =
    useState([]);

  const [staffs, setStaffs] =
    useState([]);

  const [successMsg, setSuccessMsg] =
    useState("");

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState(null);

  const [selectedWarden, setSelectedWarden] =
    useState(null);

  // Fetch Data
  useEffect(() => {

    fetchWardens();

    fetchStaffs();

  }, []);

  // Fetch Wardens
  const fetchWardens = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:5224/api/wardenauth/all"
        );

      const formattedData =
        response.data.wardens.map(
          (warden) => ({

            id: warden.id,

            firstName:
              warden.firstName,

            lastName:
              warden.lastName,

            name: `${warden.firstName} ${warden.lastName}`,

            email:
              warden.email,

            contactNumber:
              warden.contactNumber,

            wardenId:
              warden.wardenId,
          })
        );

      setWardens(formattedData);

    } catch (error) {

      console.error(error);
    }
  };

  // Fetch Staff
  const fetchStaffs = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:5224/api/staffauth/all"
        );

      const formattedData =
        response.data.staffs.map(
          (staff) => ({

            id: staff._id,

            firstName:
              staff.firstName,

            lastName:
              staff.lastName,

            name: `${staff.firstName} ${staff.lastName}`,

            email:
              staff.email,

            contactNumber:
              staff.contactNumber,

            designation:
              staff.designation,

            shiftStart:
              staff.shiftStart,

            shiftEnd:
              staff.shiftEnd,
          })
        );

      setStaffs(formattedData);

    } catch (error) {

      console.error(error);
    }
  };

  // Input Change
  const handleInputChange = (e) => {

    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Register Warden
  const handleRegisterWarden =
    async () => {

      try {

        const payload = {
          firstName:
            formData.firstName,

          lastName:
            formData.lastName,

          email:
            formData.emailId,

          contactNumber:
            formData.contactNumber,

          wardenId:
            formData.wardenId,
        };

        const response =
          await axios.post(
            "http://localhost:5224/api/adminauth/register-warden",
            payload
          );

        setSuccessMsg(
          response.data.message
        );

        fetchWardens();

        setFormData({
          firstName: "",
          lastName: "",
          wardenId: "",
          contactNumber: "",
          emailId: "",
          designation: "",
          otherDesignation: "",
          shiftStart: "",
          shiftEnd: "",
        });

      } catch (error) {

        console.error(error);

        setSuccessMsg(
          "Error registering warden"
        );
      }
    };

  // Register Staff
  const handleRegisterStaff =
    async () => {

      try {

        const payload = {

          firstName:
            formData.firstName,

          lastName:
            formData.lastName,

          email:
            formData.emailId,

          staffId: `S${Date.now()
            .toString()
            .slice(-4)}`,

          contactNumber:
            formData.contactNumber,

          designation:
            formData.designation ===
            "Other"
              ? formData.otherDesignation
              : formData.designation,

          shiftStart:
            formData.shiftStart,

          shiftEnd:
            formData.shiftEnd,
        };

        const response =
          await axios.post(
            "http://localhost:5224/api/staffauth/register-staff",
            payload
          );

        setSuccessMsg(
          response.data.message
        );

        fetchStaffs();

        setFormData({
          firstName: "",
          lastName: "",
          wardenId: "",
          contactNumber: "",
          emailId: "",
          designation: "",
          otherDesignation: "",
          shiftStart: "",
          shiftEnd: "",
        });

      } catch (error) {

        console.error(error);

        setSuccessMsg(
          "Error registering staff"
        );
      }
    };

  // View Warden
  const handleViewWarden =
    (warden) => {

      setSelectedWarden(
        warden
      );

      setShowViewModal(true);
    };

  // Edit Warden
  const handleEditWarden =
    (warden) => {

      setSelectedId(
        warden.id
      );

      setFormData({
        firstName:
          warden.firstName,

        lastName:
          warden.lastName,

        wardenId:
          warden.wardenId,

        contactNumber:
          warden.contactNumber,

        emailId:
          warden.email,
      });

      setShowEditModal(true);
    };

  // Edit Staff
  const handleEditStaff =
    (staff) => {

      setSelectedId(
        staff.id
      );

      setFormData({
        firstName:
          staff.firstName,

        lastName:
          staff.lastName,

        contactNumber:
          staff.contactNumber,

        emailId:
          staff.email,

        designation:
          staff.designation,

        shiftStart:
          staff.shiftStart,

        shiftEnd:
          staff.shiftEnd,
      });

      setShowEditModal(true);
    };

  // Update Warden
  const handleUpdateWarden =
    async () => {

      try {

        const payload = {

          firstName:
            formData.firstName,

          lastName:
            formData.lastName,

          email:
            formData.emailId,

          contactNumber:
            formData.contactNumber,

          wardenId:
            formData.wardenId,
        };

        await axios.put(
          `http://localhost:5224/api/wardenauth/update/${selectedId}`,
          payload
        );

        setSuccessMsg(
          "Warden updated successfully"
        );

        fetchWardens();

        setShowEditModal(false);

      } catch (error) {

        console.error(error);
      }
    };

  // Update Staff
  const handleUpdateStaff =
    async () => {

      try {

        const payload = {

          firstName:
            formData.firstName,

          lastName:
            formData.lastName,

          email:
            formData.emailId,

          contactNumber:
            formData.contactNumber,

          designation:
            formData.designation ===
            "Other"
              ? formData.otherDesignation
              : formData.designation,

          shiftStart:
            formData.shiftStart,

          shiftEnd:
            formData.shiftEnd,
        };

        await axios.put(
          `http://localhost:5224/api/staffauth/update/${selectedId}`,
          payload
        );

        setSuccessMsg(
          "Staff updated successfully"
        );

        fetchStaffs();

        setShowEditModal(false);

      } catch (error) {

        console.error(error);
      }
    };

  // Delete Warden
  const handleDeleteWarden =
    (id) => {

      setSelectedId(id);

      setShowDeleteModal(true);
    };

  const confirmDeleteWarden =
    async () => {

      try {

        await axios.delete(
          `http://localhost:5224/api/wardenauth/delete/${selectedId}`
        );

        fetchWardens();

        setSuccessMsg(
          "Warden deleted successfully"
        );

      } catch (error) {

        console.error(error);
      }

      setShowDeleteModal(false);
    };

  // Delete Staff
  const handleDeleteStaff =
    (id) => {

      setSelectedId(id);

      setShowDeleteModal(true);
    };

  const confirmDeleteStaff =
    async () => {

      try {

        await axios.delete(
          `http://localhost:5224/api/staffauth/delete/${selectedId}`
        );

        fetchStaffs();

        setSuccessMsg(
          "Staff deleted successfully"
        );

      } catch (error) {

        console.error(error);
      }

      setShowDeleteModal(false);
    };

  return (
    <div className="flex-1 bg-white p-4 sm:p-6 mt-5">

      {/* Header */}
      <div className="mb-6">

        <div className="flex items-center mb-4">

          <div className="w-[4px] h-6 bg-[#4F8CCF] mr-3" />

          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Staff Allotment
          </h1>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 gap-2">

        <button
          onClick={() =>
            setActiveTab(
              "warden"
            )
          }
          className={`px-6 py-3 rounded-t-[20px] font-semibold ${
            activeTab ===
            "warden"
              ? "bg-[#BEC5AD] text-black"
              : "bg-gray-200"
          }`}
        >
          Register Warden
        </button>

        <button
          onClick={() =>
            setActiveTab(
              "staff"
            )
          }
          className={`px-6 py-3 rounded-t-[20px] font-semibold ${
            activeTab ===
            "staff"
              ? "bg-[#BEC5AD] text-black"
              : "bg-gray-200"
          }`}
        >
          Register Staff
        </button>

      </div>

      {/* Warden Section */}
      {activeTab ===
        "warden" && (
        <>
          <div className="bg-[#BEC5AD] rounded-xl p-6 mb-6">

            <h2 className="text-2xl font-semibold mb-6">
              Register New Warden
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <input
                type="text"
                name="firstName"
                value={
                  formData.firstName
                }
                onChange={
                  handleInputChange
                }
                placeholder="First Name"
                className="p-3 border rounded-md bg-white"
              />

              <input
                type="text"
                name="lastName"
                value={
                  formData.lastName
                }
                onChange={
                  handleInputChange
                }
                placeholder="Last Name"
                className="p-3 border rounded-md bg-white"
              />

              <input
                type="text"
                name="contactNumber"
                value={
                  formData.contactNumber
                }
                onChange={
                  handleInputChange
                }
                placeholder="Contact Number"
                className="p-3 border rounded-md bg-white"
              />

              <input
                type="text"
                name="wardenId"
                value={
                  formData.wardenId
                }
                onChange={
                  handleInputChange
                }
                placeholder="Warden ID"
                className="p-3 border rounded-md bg-white"
              />

              <input
                type="email"
                name="emailId"
                value={
                  formData.emailId
                }
                onChange={
                  handleInputChange
                }
                placeholder="Email"
                className="p-3 border rounded-md bg-white"
              />

            </div>

            <div className="mt-6 text-center">

              <button
                onClick={
                  handleRegisterWarden
                }
                className="bg-white px-8 py-3 rounded-xl font-bold"
              >
                Register Warden
              </button>

            </div>
          </div>

          {/* Manage Warden */}
          <div className="bg-[#BEC5AD] rounded-xl p-6">

            <h2 className="text-2xl font-bold mb-6">
              Manage Warden
            </h2>

            <div className="space-y-4">

              {wardens.map(
                (warden) => (

                  <div
                    key={warden.id}
                    className="bg-white rounded-lg p-4 flex justify-between items-center"
                  >

                    <div>

                      <h3 className="font-bold text-lg">
                        {
                          warden.name
                        }
                      </h3>

                      <p>
                        {
                          warden.email
                        }
                      </p>

                      <p>
                        Warden ID:
                        {" "}
                        {
                          warden.wardenId
                        }
                      </p>

                    </div>

                    <div className="flex gap-4">

                      <button
                        onClick={() =>
                          handleViewWarden(
                            warden
                          )
                        }
                      >
                        <Eye />
                      </button>

                      <button
                        onClick={() =>
                          handleEditWarden(
                            warden
                          )
                        }
                      >
                        <Edit2 />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteWarden(
                            warden.id
                          )
                        }
                      >
                        <Trash2 />
                      </button>

                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* Staff Section */}
      {activeTab ===
        "staff" && (
        <>
          <div className="bg-[#BEC5AD] rounded-xl p-6 mb-6">

            <h2 className="text-2xl font-semibold mb-6">
              Register New Staff
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <input
                type="text"
                name="firstName"
                value={
                  formData.firstName
                }
                onChange={
                  handleInputChange
                }
                placeholder="First Name"
                className="p-3 border rounded-md bg-white"
              />

              <input
                type="text"
                name="lastName"
                value={
                  formData.lastName
                }
                onChange={
                  handleInputChange
                }
                placeholder="Last Name"
                className="p-3 border rounded-md bg-white"
              />

              <input
                type="text"
                name="contactNumber"
                value={
                  formData.contactNumber
                }
                onChange={
                  handleInputChange
                }
                placeholder="Contact Number"
                className="p-3 border rounded-md bg-white"
              />

              <input
                type="email"
                name="emailId"
                value={
                  formData.emailId
                }
                onChange={
                  handleInputChange
                }
                placeholder="Email"
                className="p-3 border rounded-md bg-white"
              />

              <select
                name="designation"
                value={
                  formData.designation
                }
                onChange={
                  handleInputChange
                }
                className="p-3 border rounded-md bg-white"
              >

                <option value="">
                  Select Designation
                </option>

                <option value="Watchman">
                  Watchman
                </option>

                <option value="Cleaner">
                  Cleaner
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

              {formData.designation ===
                "Other" && (

                <input
                  type="text"
                  name="otherDesignation"
                  value={
                    formData.otherDesignation
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Specify Designation"
                  className="p-3 border rounded-md bg-white"
                />
              )}

              <div className="flex items-center gap-2">

                <input
                  type="time"
                  name="shiftStart"
                  value={
                    formData.shiftStart
                  }
                  onChange={
                    handleInputChange
                  }
                  className="p-3 border rounded-md bg-white"
                />

                <Clock />

                <input
                  type="time"
                  name="shiftEnd"
                  value={
                    formData.shiftEnd
                  }
                  onChange={
                    handleInputChange
                  }
                  className="p-3 border rounded-md bg-white"
                />

              </div>
            </div>

            <div className="mt-6 text-center">

              <button
                onClick={
                  handleRegisterStaff
                }
                className="bg-white px-8 py-3 rounded-xl font-bold"
              >
                Register Staff
              </button>

            </div>
          </div>

          {/* Manage Staff */}
          <div className="bg-[#BEC5AD] rounded-xl p-6">

            <h2 className="text-2xl font-bold mb-6">
              Manage Staff
            </h2>

            <div className="space-y-4">

              {staffs.map(
                (staff) => (

                  <div
                    key={staff.id}
                    className="bg-white rounded-lg p-4 flex justify-between items-center"
                  >

                    <div>

                      <h3 className="font-bold text-lg">
                        {
                          staff.name
                        }
                      </h3>

                      <p>
                        {
                          staff.email
                        }
                      </p>

                      <p>
                        {
                          staff.designation
                        }
                      </p>

                      <p>
                        Shift:
                        {" "}
                        {
                          staff.shiftStart
                        }
                        {" - "}
                        {
                          staff.shiftEnd
                        }
                      </p>

                    </div>

                    <div className="flex gap-4">

                      <button
                        onClick={() =>
                          handleEditStaff(
                            staff
                          )
                        }
                      >
                        <Edit2 />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteStaff(
                            staff.id
                          )
                        }
                      >
                        <Trash2 />
                      </button>

                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* Success */}
      {successMsg && (

        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-3 rounded-lg z-50">

          {successMsg}

        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-[90%] max-w-2xl">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-2xl font-bold">
                Edit {
                  activeTab ===
                  "warden"
                    ? "Warden"
                    : "Staff"
                }
              </h2>

              <button
                onClick={() =>
                  setShowEditModal(
                    false
                  )
                }
              >
                <X />
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <input
                type="text"
                name="firstName"
                value={
                  formData.firstName
                }
                onChange={
                  handleInputChange
                }
                placeholder="First Name"
                className="p-3 border rounded-md"
              />

              <input
                type="text"
                name="lastName"
                value={
                  formData.lastName
                }
                onChange={
                  handleInputChange
                }
                placeholder="Last Name"
                className="p-3 border rounded-md"
              />

              {activeTab ===
                "warden" && (

                <input
                  type="text"
                  name="wardenId"
                  value={
                    formData.wardenId
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Warden ID"
                  className="p-3 border rounded-md"
                />
              )}

              <input
                type="text"
                name="contactNumber"
                value={
                  formData.contactNumber
                }
                onChange={
                  handleInputChange
                }
                placeholder="Contact Number"
                className="p-3 border rounded-md"
              />

              <input
                type="email"
                name="emailId"
                value={
                  formData.emailId
                }
                onChange={
                  handleInputChange
                }
                placeholder="Email"
                className="p-3 border rounded-md"
              />

              {activeTab ===
                "staff" && (
                <>
                  <select
                    name="designation"
                    value={
                      formData.designation
                    }
                    onChange={
                      handleInputChange
                    }
                    className="p-3 border rounded-md"
                  >

                    <option value="">
                      Select
                    </option>

                    <option value="Watchman">
                      Watchman
                    </option>

                    <option value="Cleaner">
                      Cleaner
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                  {formData.designation ===
                    "Other" && (

                    <input
                      type="text"
                      name="otherDesignation"
                      value={
                        formData.otherDesignation
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Specify Designation"
                      className="p-3 border rounded-md"
                    />
                  )}

                  <div className="flex gap-2">

                    <input
                      type="time"
                      name="shiftStart"
                      value={
                        formData.shiftStart
                      }
                      onChange={
                        handleInputChange
                      }
                      className="p-3 border rounded-md w-full"
                    />

                    <input
                      type="time"
                      name="shiftEnd"
                      value={
                        formData.shiftEnd
                      }
                      onChange={
                        handleInputChange
                      }
                      className="p-3 border rounded-md w-full"
                    />

                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end mt-6">

              <button
                onClick={
                  activeTab ===
                  "warden"
                    ? handleUpdateWarden
                    : handleUpdateStaff
                }
                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Update
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm">

            <h2 className="text-xl font-bold text-center mb-5">
              Delete {
                activeTab ===
                "warden"
                  ? "Warden"
                  : "Staff"
              }?
            </h2>

            <div className="flex justify-center gap-4">

              <button
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
                className="px-5 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={
                  activeTab ===
                  "warden"
                    ? confirmDeleteWarden
                    : confirmDeleteStaff
                }
                className="px-5 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>

            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal &&
        selectedWarden && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-2xl font-bold">
                Warden Details
              </h2>

              <button
                onClick={() =>
                  setShowViewModal(
                    false
                  )
                }
              >
                <X />
              </button>

            </div>

            <div className="space-y-3">

              <p>
                <strong>
                  First Name:
                </strong>{" "}
                {
                  selectedWarden.firstName
                }
              </p>

              <p>
                <strong>
                  Last Name:
                </strong>{" "}
                {
                  selectedWarden.lastName
                }
              </p>

              <p>
                <strong>
                  Email:
                </strong>{" "}
                {
                  selectedWarden.email
                }
              </p>

              <p>
                <strong>
                  Contact:
                </strong>{" "}
                {
                  selectedWarden.contactNumber
                }
              </p>

              <p>
                <strong>
                  Warden ID:
                </strong>{" "}
                {
                  selectedWarden.wardenId
                }
              </p>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAllotment;