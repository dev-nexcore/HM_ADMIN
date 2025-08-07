import Refunds from "@/components/refunds/refunds";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RefundsPage(){
    return(
        <ProtectedRoute>
        <div>
            <Refunds/>
        </div>
         </ProtectedRoute>
    )
}