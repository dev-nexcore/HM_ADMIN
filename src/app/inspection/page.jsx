import InspectionPage from "@/components/adminInspection/InspectionPage";
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
const page = () => {
  return (
     <ProtectedRoute>
    <div>
      <InspectionPage />
    </div>
    </ProtectedRoute>
  );
};

export default page;
