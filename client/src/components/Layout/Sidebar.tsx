import { useState } from "react";
import { NavLink } from "react-router-dom";
import * as icons from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { getUser } from "../../constants/getUser";
import { ADMIN_ROLES, SALES_ROLES, REPORT_ROLES, hasRole, type Role } from "../../constants/roles";

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onExpand: () => void;
  onMenuToggle: () => void;
}

const sidebarMenu: { id: string; name: string; icon: any; roles: Role[]; children: any[] }[] = [
  {
    id: "admin",
    name: "Administration",
    icon: icons.Settings,
    roles: ADMIN_ROLES,
    children: [
      {
        id: "users",
        name: "Users",
        path: "/admin/users",
        icon: icons.UserCog,
      },
      {
        id: "shops",
        name: "Shops",
        path: "/admin/shops",
        icon: icons.Store,
      },
      {
        id: "products",
        name: "Products",
        path: "/admin/products",
        icon: icons.Package,
      },
    ],
  },
  {
    id: "operations",
    name: "Operations",
    icon: icons.Settings,
    roles: SALES_ROLES,
    children: [
      {
        id: "sales",
        name: "Sales",
        path: "/sales",
        icon: icons.TagPlus,
      },
      {
        id: "attendance",
        name: "Attendance",
        path: "/attendance",
        icon: icons.Camera,
      },
    ],
  },
  {
    id: "reports",
    name: "Report",
    icon: icons.File,
    roles: REPORT_ROLES,
    children: [
      {
        id: "attendance",
        name: "Attendance Report",
        path: "/reports/attendance-report",
        icon: icons.Calendar,
      },
      {
        id: "monthly-sales",
        name: "Monthly Sales",
        path: "/reports/monthly-sales-report",
        icon: icons.TrendingUp,
      },
    ],
  },
];

const Sidebar = ({ isOpen, isCollapsed, onClose, onExpand, onMenuToggle }: SidebarProps) => {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const user = getUser();
  const visibleMenu = sidebarMenu.filter((node) => hasRole(user?.role, node.roles));

  const handleNavigate = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const toggleDropdown = (nodeId: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNavItem = (node: any) => {
    const hasChildren = node?.children && node?.children.length > 0;
    const path = node?.path || `/${node?.name.toLowerCase().replace(/\s+/g, '-')}`;
    const isOpen = openDropdowns.has(node.id);
    const IconComponent = node.icon;

    if (hasChildren) {
      return (
        <li key={node.id}>
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                onExpand();
                toggleDropdown(node.id);
              } else {
                toggleDropdown(node.id);
              }
            }}
            title={isCollapsed ? node?.name : undefined}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm  transition-colors hover:bg-gray-50 text-gray-900"
          >
            {IconComponent && <IconComponent className="w-4 h-4 shrink-0 text-blue-600" />}
            <span className={`flex-1 text-left truncate transition-all duration-200 ${isCollapsed ? "lg:hidden" : ""}`}>
              {node?.name}
            </span>
            {!isCollapsed && <ChevronIcon open={isOpen} />}
          </button>

          {isOpen && !isCollapsed && (
            <ul className="space-y-0.5 mt-0.5 ml-4 border-l-2 border-gray-200 pl-2">
              {node?.children?.map((child: any) => renderNavItem(child))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={node.id}>
        <NavLink
          to={path}
          onClick={handleNavigate}
          title={isCollapsed ? node?.name : undefined}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm  transition-colors group 
          ${isActive ? "bg-blue-100 text-blue-700" : "text-slate-800 hover:bg-gray-50"}`}
        >
          {IconComponent && <IconComponent className="w-4 h-4 shrink-0 text-blue-600" />}
          <span className={`truncate transition-all duration-200 ${isCollapsed ? "lg:hidden" : ""}`}>
            {node?.name}
          </span>
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 lg:hidden transition-opacity duration-300
           ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out w-64 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${isCollapsed ? "lg:w-16" : "lg:w-64"}`}
      >
        {/* Toggle button */}
        <div className="flex justify-end p-1">
          <button
            onClick={onMenuToggle}
            className="p-1 rounded-md text-blue-600 hover:bg-gray-100 transition-colors hidden lg:flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <icons.PanelRightOpen className="w-5 h-5" />
            ) : (
              <icons.PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-0.5 px-2">
            {/* Dashboard is pinned at the top */}
            <li>
              <NavLink
                to="/dashboard"
                end
                onClick={handleNavigate}
                title={isCollapsed ? "Dashboard" : undefined}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm  transition-colors group
                ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-slate-800"}`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-blue-600" />
                <span className={`truncate transition-all duration-200 ${isCollapsed ? "lg:hidden" : ""}`}>
                  Dashboard
                </span>
              </NavLink>
            </li>
            {visibleMenu.map((node) => renderNavItem(node))}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className={`p-3 border-t border-gray-100 ${isCollapsed ? "lg:hidden" : ""}`}>
          <p className="text-xs text-gray-400 text-center font-normal">Malpani Portals v1.0</p>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;