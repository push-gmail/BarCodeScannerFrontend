import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Tags,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { clearSession } from "../../store/auth";

type Props = {
  open?: boolean;
  onNavigate?: () => void;
};

export default function MasterSidebar({
  open = false,
  onNavigate,
}: Props) {
  const nav = useNavigate();

  const logout = () => {
    clearSession();

    onNavigate?.();

    nav("/master/login", {
      replace: true,
    });
  };

  return (
    <aside
      className={`sidebar masterSide ${
        open ? "masterSideOpen" : ""
      }`}
    >
      <NavLink
        className="brand masterBrand"
        to="/master/dashboard"
        onClick={onNavigate}
      >
        <span className="logo">M</span>

        <span>Master</span>
      </NavLink>

      <nav className="masterNav">
        <NavLink
          to="/master/dashboard"
          onClick={onNavigate}
        >
          <LayoutDashboard size={18} />

          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/master/categories"
          onClick={onNavigate}
        >
          <Tags size={18} />

          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/master/category-products"
          onClick={onNavigate}
        >
          <Boxes size={18} />

          <span>Products</span>
        </NavLink>
      </nav>

      <button
        type="button"
        className="masterLogout"
        onClick={logout}
      >
        <LogOut size={18} />

        <span>Logout</span>
      </button>
    </aside>
  );
}