import HostelNotices from "@/components/notices/notices"
import ProtectedRoute from "@/components/ProtectedRoute"

const page = () => {
  return (
     <ProtectedRoute>
    <div>
      <HostelNotices/>
    </div>
    </ProtectedRoute>
  )
}

export default page
