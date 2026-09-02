import { useState } from "react";
import { Outlet } from "react-router-dom";

import MasterSidebar from "../components/Master/MasterSidebar";
import MasterHeader from "../components/Master/MasterHeader";

export default function MasterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((current) => !current);
  };

  return (
    <div className="masterDash">
      <MasterSidebar
        open={sidebarOpen}
        onNavigate={closeSidebar}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="masterSidebarBackdrop"
          aria-label="Close sidebar"
          onClick={closeSidebar}
        />
      )}

      <section className="masterMain">
        <MasterHeader
          onMenuClick={toggleSidebar}
        />

        <main className="masterOutlet">
          <Outlet />
        </main>
      </section>
    </div>
  );
}