import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Bell, Boxes, LayoutDashboard, LogOut, ScanLine, X } from "lucide-react";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../api/client";
import { logout } from "../store/auth";

export default function AffiliateLayout() {
  const [live, setLive] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const socket = io(BACKEND_URL, { auth: { token } });
    socket.on("qr:scanned", (payload) => setLive(payload));
    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="brand"><span className="logo">H</span> HomeQR Affiliate</div>
        <NavLink to="/affiliate/dashboard"><LayoutDashboard/> Dashboard</NavLink>
        <NavLink to="/affiliate/products"><Boxes/> My Products</NavLink>
        <NavLink to="/affiliate/scans"><ScanLine/> Who Scanned QR Code</NavLink>
        <NavLink to="/affiliate/notifications"><Bell/> Notifications</NavLink>
        <button onClick={() => logout("/affiliate/login")}><LogOut/> Logout</button>
      </aside>

      <section className="dashBody">
        {live && (
          <div className="liveToast">
            <button onClick={() => setLive(null)}><X size={16}/></button>
            <strong>Your QR was scanned</strong>
            <span>{live.item?.title || "Home item"}</span>
            <span>{live.event?.finderName || "Finder"} · {live.event?.finderPhone || "No phone"}</span>
            {live.event?.finderPhone && <a href={`tel:${live.event.finderPhone}`}>Call finder</a>}
            {live.event?.latitude && live.event?.longitude && (
              <a href={`https://maps.google.com/?q=${live.event.latitude},${live.event.longitude}`} target="_blank" rel="noreferrer">View location</a>
            )}
          </div>
        )}
        <Outlet />
      </section>
    </div>
  );
}
