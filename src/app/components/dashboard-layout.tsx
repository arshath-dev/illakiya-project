import { Outlet } from "react-router";
import { Sidebar } from "./sidebar";
import type { UserRole } from "./AuthContext";

export function DashboardLayout({ role }: { role: UserRole }) {
  return (
    <div className="flex min-h-screen bg-background font-[Inter,sans-serif]">
      <Sidebar role={role} />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
