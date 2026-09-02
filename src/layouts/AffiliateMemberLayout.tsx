import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Boxes, ChevronDown, LayoutDashboard, LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import { logout } from "../store/auth";
// import "../styles/affiliateMember.css";

export default function AffiliateMemberLayout() {
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const value = sessionStorage.getItem("affiliate_login_toast");
    if (!value) return;
    sessionStorage.removeItem("affiliate_login_toast");
    setToast(value);
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="amShell">
      <aside className="amSidebar">
        <div className="amBrand"><span>H</span><div><strong>HomeQR</strong><small>Affiliate CRM</small></div></div>
        <nav>
          <NavLink to="/affiliate-member/dashboard"><LayoutDashboard size={19} /> Dashboard</NavLink>
          <NavLink to="/affiliate-member/products"><Boxes size={19} /> My Products</NavLink>
          <button className="amSideToggle" onClick={() => setSettingsOpen((v) => !v)}>
            <Settings size={19} /> Settings <ChevronDown size={16} className={settingsOpen ? "rotated" : ""} />
          </button>
          {settingsOpen && <div className="amSubNav">
            <NavLink to="/affiliate-member/settings/profile"><UserRound size={17} /> Profile</NavLink>
            <NavLink to="/affiliate-member/settings/kyc"><ShieldCheck size={17} /> KYC Upload</NavLink>
          </div>}
        </nav>
        <button className="amLogout" onClick={() => logout("/affiliate-member/login")}><LogOut size={18} /> Logout</button>
      </aside>
      <section className="amMain">
        <header className="amTopbar"><div><strong>Affiliate Member Portal</strong><span>Manage your profile, KYC and product referrals</span></div></header>
        <main className="amContent"><Outlet /></main>
      </section>
      {toast && <div className="amToast">{toast}</div>}
    </div>
  );
}
