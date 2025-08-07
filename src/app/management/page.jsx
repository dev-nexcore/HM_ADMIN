import StudentManagement from "@/components/management/management";
import ProtectedRoute from "@/components/ProtectedRoute";

function Management() {
  return (
 <ProtectedRoute>
    <>
    <StudentManagement/>
    </>
    </ProtectedRoute>
  );
}

export default Management;
