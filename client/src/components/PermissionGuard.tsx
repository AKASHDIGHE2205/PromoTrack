import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../constants/getUser";
import { hasRole, type Role } from "../constants/roles";

interface PermissionGuardProps {
  allowedRoles: Role[];
}

const PermissionGuard = ({ allowedRoles }: PermissionGuardProps) => {
  const user = getUser();

  if (!hasRole(user?.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PermissionGuard;
