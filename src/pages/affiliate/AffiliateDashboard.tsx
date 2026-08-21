import { useEffect, useState } from "react";
import { getNotifications, getProducts, getScanEvents } from "../../api/userApi";

export default function AffiliateDashboard() {
  const [stats, setStats] = useState({ products: 0, scans: 0, unread: 0 });

  useEffect(() => {
    Promise.all([getProducts(), getScanEvents(), getNotifications()])
      .then(([p, s, n]) => setStats({
        products: p.data.length,
        scans: s.data.length,
        unread: n.data.filter((x: any) => !x.read).length,
      }))
      .catch(() => {});
  }, []);

  return (
    <div>
      <span className="eyebrow">AFFILIATE WEB VERSION</span>
      <h1>Recovery Dashboard</h1>
      <p>This is the web portal that will later be packaged into the Android APK. It uses the same user account and backend data.</p>
      <div className="stats">
        <div><b>{stats.products}</b><span>My Products</span></div>
        <div><b>{stats.scans}</b><span>QR Scan Events</span></div>
        <div><b>{stats.unread}</b><span>Unread Alerts</span></div>
      </div>
    </div>
  );
}
