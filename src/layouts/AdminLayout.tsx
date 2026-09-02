import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../pages/admin/AdminSidebar";
import AdminHeader from "../pages/admin/AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((current) => !current);
  };

  return (
    <div className="adminDash">
      <AdminSidebar
        open={sidebarOpen}
        onNavigate={closeSidebar}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="adminSidebarBackdrop"
          aria-label="Close admin sidebar"
          onClick={closeSidebar}
        />
      )}

      <section className="adminMain">
        <AdminHeader onMenuClick={toggleSidebar} />

        <main className="adminOutlet">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
