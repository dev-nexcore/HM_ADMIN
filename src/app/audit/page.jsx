import AuditLogsSection from "@/components/audit/audit";
import ProtectedRoute from "@/components/ProtectedRoute";

 

export default function page() {
  return (
    <ProtectedRoute>
    <div>
   <AuditLogsSection/>
    </div>
    </ProtectedRoute>
  )
}
