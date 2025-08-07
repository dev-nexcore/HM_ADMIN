'use client';
import InventoryList from "@/components/admininventary/inventory";
import ProtectedRoute from "@/components/ProtectedRoute";

function AdminInventory() {
  return (
<ProtectedRoute>
    <>
     <InventoryList/>
    </>
    </ProtectedRoute>
  );
}

export default AdminInventory;