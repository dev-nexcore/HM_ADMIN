import LeaveRequestsPage from "@/components/adminleaves/LeaveRequests";
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const page = () => {
  return (
    <div>
      <LeaveRequestsPage />
    </div>
  );
};

export default page;
