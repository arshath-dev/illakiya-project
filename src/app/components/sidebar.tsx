import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Upload, FileText, User, LogOut, Eye, History, Menu, X, Loader
} from "lucide-react";
import { useAuth, type UserRole } from "./AuthContext";
import { useState } from "react";

const doctorMenu = [
  { to: "/doctor", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/doctor/patients", icon: Users, label: "Patients" },
  { to: "/doctor/upload", icon: Upload, label: "Upload Scan" },
  { to: "/doctor/reports", icon: FileText, label: "Reports" },
  { to: "/doctor/profile", icon: User, label: "Profile" },
];

const patientMenu = [
  { to: "/patient", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/patient/upload", icon: Upload, label: "Upload Scan" },
  { to: "/patient/history", icon: History, label: "History" },
  { to: "/patient/profile", icon: User, label: "Profile" },
];

export function Sidebar({ role }: { role: UserRole }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menu = role === "doctor" ? doctorMenu : patientMenu;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-[#1E88E5] flex items-center justify-center">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold">RetinaAI</h3>
          <p className="text-[11px] text-muted-foreground">Medical Platform</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] transition-all ${isActive
                ? "bg-[#1E88E5] text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border space-y-3">
        {user && (
          <div className="px-3 py-2">
            <p className="text-[12px] text-muted-foreground">Logged in as</p>
            <p className="text-[14px] font-medium truncate">{user.name}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 w-full transition-all disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-card shadow-md border border-border"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="w-72 h-full bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 h-screen bg-card border-r border-border flex-col sticky top-0 shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
