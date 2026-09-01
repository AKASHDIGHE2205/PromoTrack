import { useState, useRef, useEffect } from "react";
import logo from "../../assets/PromoTrack.png";
import { useAppDispatch } from "../../hook/store";
import { logout } from "../../feature/auth/authSlice";
import { getUser } from "../../constants/getUser";
import { Link } from "react-router-dom";

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const dispatch = useAppDispatch();
  const user = getUser();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "";
  const initials = displayName ? displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase() : "UU";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shadow-sm">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-justify-icon lucide-text-align-justify">
          <path d="M3 5h18" />
          <path d="M3 12h18" />
          <path d="M3 19h18" />
        </svg>
      </button>

      <div className="flex items-center flex-1">
        <Link to={"/"}>
          <img src={logo} alt="Malpani" className="w-auto h-16 sm:h-20 rounded object-cover" />
        </Link>
        {/* <Link to={"/"} className="text-lg ml-2 scale-y-125 transform leading-tight text-gray-700">Malpani Portals</Link> */}
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div className="w-12 h-12 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {initials}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-800 leading-tight">
              {displayName || "User"}
            </span>
            <span className="text-xs text-gray-400 leading-tight">{user?.role === "SP" ? "Sales Promoter" : user?.role}</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 hidden md:block transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100 md:hidden">
              <p className="text-sm font-medium text-gray-800 truncate">
                {displayName || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email ?? user?.phone ?? ""}</p>
            </div>
            <Link
              to={"/profile"}
              onClick={() => setDropdownOpen(false)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
            <button
              onClick={() => {
                setDropdownOpen(false);
                dispatch(logout());
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;