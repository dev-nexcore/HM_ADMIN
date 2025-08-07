import ForgotPassword from "@/components/forgetpassword/forgetpassword";
import ProtectedRoute from "@/components/ProtectedRoute";

function ForgetPassword() {
  return (
 <ProtectedRoute>
    <>
     <ForgotPassword/>
    </>
    </ProtectedRoute>
  );
}

export default ForgetPassword;