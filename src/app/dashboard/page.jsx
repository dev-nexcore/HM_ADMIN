import Dashboard from "@/components/admindashboard/dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";

function AdminDashboard() {
  return (
     <ProtectedRoute>
    <>
     <Dashboard/>
    </>
    </ProtectedRoute>
  );
}

export default AdminDashboard;