import InvoicePage from "@/components/adminInvoice/InvoicePage";
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const page = () => {
  return (
    <ProtectedRoute>
    <div>
      <InvoicePage />
    </div>
    </ProtectedRoute>
  );
};

export default page;
