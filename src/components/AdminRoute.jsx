import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const AdminRoute = ({ children }) => {
  const { loading, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
