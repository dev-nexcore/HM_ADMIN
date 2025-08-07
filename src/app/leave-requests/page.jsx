import LeaveRequestsPage from "@/components/adminleaves/LeaveRequests";
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const page = () => {
  return (
     <ProtectedRoute>
    <div>
      <LeaveRequestsPage />
    </div>
    </ProtectedRoute>
  );
};

export default page;
