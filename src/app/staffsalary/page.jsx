import StaffSalary from "@/components/staffsalary/staffsalary";

import ProtectedRoute from "@/components/ProtectedRoute";
export default function StaffSalaryPage(){
    return(
       <ProtectedRoute>
      <div><StaffSalary/></div>
      </ProtectedRoute>
    );
};