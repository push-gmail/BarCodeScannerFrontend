import {
  BadgeCheck,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  ScanLine,
  UserPlus,
  Users,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { logout } from "../../store/auth";

type Props = {
  open?: boolean;
  onNavigate?: () => void;
};

export default function AdminSidebar({
  open = false,
  onNavigate,
}: Props) {
  const handleLogout = () => {
    onNavigate?.();
    logout("/admin/login");
  };

  return (
    <aside
      className={`sidebar adminSide adminSidebar ${
        open ? "adminSidebarOpen" : ""
      }`}
    >
      <div className="brand adminBrand">
        <span className="logo">A</span>
        <span>Admin</span>
      </div>

      <nav className="adminNav">
        <NavLink
          to="/admin/dashboard"
          onClick={onNavigate}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          onClick={onNavigate}
        >
          <Users size={18} />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          onClick={onNavigate}
        >
          <PackageCheck size={18} />
          <span>Orders</span>
        </NavLink>

        {/* <NavLink
          to="/admin/scans"
          onClick={onNavigate}
        >
          <ScanLine size={18} />
          <span>Scan Events</span>
        </NavLink> */}

        <NavLink
          to="/admin/affiliate-applications"
          onClick={onNavigate}
        >
          <UserPlus size={18} />
          <span>Join As Affiliate</span>
        </NavLink>

        <NavLink
          to="/admin/affiliate-members"
          onClick={onNavigate}
        >
          <BadgeCheck size={18} />
          <span>Affiliate Members</span>
        </NavLink>

        <NavLink
          to="/admin/affiliate-kyc"
          onClick={onNavigate}
        >
          <FileCheck2 size={18} />
          <span>Affiliate KYC</span>
        </NavLink>
      </nav>

      <button
        type="button"
        className="adminLogout"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
