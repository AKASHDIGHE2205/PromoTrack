import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionGuard from "./components/PermissionGuard";
import PageNotFound from "./components/PageNotFound";
import Unauthorized from "./components/Unauthorized";
import { ADMIN_ROLES, SALES_ROLES, REPORT_ROLES } from "./constants/roles";

const Home = lazy(() => import("./pages/Home"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgottPassword"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/auth/Profile"));
const UserView = lazy(() => import("./pages/global/member/UsersView"));
const ShopView = lazy(() => import("./pages/global/shop/ShopsView"));
const ItemView = lazy(() => import("./pages/global/item/ItemsView"));
const PromoteView = lazy(() => import("./pages/promote/PromoteView"));
const AddAttendance = lazy(() => import("./pages/attendance/AddAttendance"));
const AttendanceReportView = lazy(() => import("./pages/reports/attendance/AttendanceReportView"));
const MonthlySalesReportView = lazy(() => import("./pages/reports/monthly/MonthlySalesReportView"));


function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgott-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/not-found" element={<PageNotFound />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<PermissionGuard allowedRoles={ADMIN_ROLES} />}>
              <Route path="/admin/users" element={<UserView />} />
              <Route path="/admin/shops" element={<ShopView />} />
              <Route path="/admin/products" element={<ItemView />} />
            </Route>

            <Route element={<PermissionGuard allowedRoles={SALES_ROLES} />}>
              <Route path="/sales" element={<PromoteView />} />
              <Route path="/attendance" element={<AddAttendance />} />
            </Route>

            <Route element={<PermissionGuard allowedRoles={REPORT_ROLES} />}>
              <Route path="/reports/attendance-report" element={<AttendanceReportView />} />
              <Route path="/reports/monthly-sales-report" element={<MonthlySalesReportView />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>

  );
}

export default App;

