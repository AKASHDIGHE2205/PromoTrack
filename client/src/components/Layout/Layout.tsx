import { useState, useCallback, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import AttendanceReminderModal from "../Modal/AttendanceReminderModal";
import { getTodayAttendance } from "../../services/global/attendanceServices";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAttendanceReminder, setShowAttendanceReminder] = useState(false);
  const location = useLocation();

  const handleMenuToggle = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed((v) => !v);
    } else {
      setSidebarOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    const checkAttendance = async () => {
      try {
        const response = await getTodayAttendance();
        if (response.success) {
          if (!response.marked) {
            setShowAttendanceReminder(true);
          }
        }
      } catch (error) {
        console.error("Error checking today's attendance:", error);
      }
    }
    checkAttendance();
  }, []);

  const attendanceReminderVisible = showAttendanceReminder && !location.pathname.startsWith("/attendance");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuToggle={handleMenuToggle} />

      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onExpand={() => setSidebarCollapsed(false)}
        onMenuToggle={handleMenuToggle}
      />

      <main className={`flex-1 transition-all duration-300 ease-in-out pt-16 min-h-screen bg-[#FAF8F5] ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <div className="p-6 font-normal">
          <Outlet />
        </div>
      </main>

      <Footer sidebarCollapsed={sidebarCollapsed} />

      {attendanceReminderVisible && (<AttendanceReminderModal onDismiss={() => setShowAttendanceReminder(false)} />)}
    </div>
  );
};

export default Layout;