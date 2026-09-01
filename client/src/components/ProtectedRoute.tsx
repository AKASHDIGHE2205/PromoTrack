import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../hook/store";

const ProtectedRoute = () => {
  const token = useAppSelector((s) => s.auth.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;